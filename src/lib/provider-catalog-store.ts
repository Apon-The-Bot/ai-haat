import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { fetchProviderCatalog, type Provider } from "@/lib/provider-catalog";

type Products = Awaited<ReturnType<typeof fetchProviderCatalog>>;
const leaseMs = 5 * 60 * 1000;

export async function readCatalog(providerId: Provider) {
  const [snapshot, history] = await Promise.all([
    prisma.providerCatalogSnapshot.findUnique({ where: { providerId } }),
    prisma.providerCatalogSync.findMany({
      where: { providerId },
      orderBy: { startedAt: "desc" },
      take: 10,
      select: { id: true, status: true, startedAt: true, productCount: true, error: true },
    }),
  ]);
  return {
    rows: (snapshot?.products ?? []) as Products,
    fetchedAt: snapshot?.fetchedAt,
    history,
  };
}

export async function syncCatalog(providerId: Provider, actorId: string) {
  const now = new Date();
  await prisma.providerCatalogSync.updateMany({
    where: { activeKey: providerId, startedAt: { lt: new Date(now.getTime() - leaseMs) } },
    data: { activeKey: null, status: "FAILED", completedAt: now, error: "Sync timed out." },
  });
  const run = await prisma.providerCatalogSync.create({
    data: { providerId, actorId, activeKey: providerId, status: "RUNNING" },
  }).catch((error: unknown) => {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return null;
    throw error;
  });
  if (!run) return false;

  let products: Products;
  try {
    products = await fetchProviderCatalog(providerId);
    if (!products.length) throw new Error("Provider returned an empty catalog. Previous snapshot was retained.");
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 255) : "Catalog fetch failed.";
    await failSync(run.id, providerId, message);
    return false;
  }

  const fetchedAt = new Date();
  try {
    return await prisma.$transaction(async tx => {
      const result = await tx.providerCatalogSync.updateMany({
        where: { id: run.id, activeKey: providerId },
        data: { activeKey: null, status: "SUCCESS", completedAt: fetchedAt, productCount: products.length },
      });
      if (result.count !== 1) return false;
      await tx.providerCatalogSnapshot.upsert({
        where: { providerId },
        create: { providerId, products, fetchedAt },
        update: { products, fetchedAt },
      });
      return true;
    });
  } catch {
    await failSync(run.id, providerId, "Could not save the catalog snapshot.");
    return false;
  }
}

function failSync(id: string, activeKey: Provider, error: string) {
  return prisma.providerCatalogSync.updateMany({
    where: { id, activeKey },
    data: { activeKey: null, status: "FAILED", completedAt: new Date(), error },
  });
}
