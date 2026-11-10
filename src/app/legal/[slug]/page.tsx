import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getLegalDocument, legalDocuments } from "@/lib/legal/documents";
import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";

export function generateStaticParams() { return legalDocuments.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const document = getLegalDocument((await params).slug); return { title: document ? `${document.titleEn} | AI Haat` : "Legal document | AI Haat" }; }
export default async function LegalDocumentRoute({ params }: { params: Promise<{ slug: string }> }) { const document = getLegalDocument((await params).slug); if (!document) notFound(); return <LegalDocumentPage document={document} />; }
