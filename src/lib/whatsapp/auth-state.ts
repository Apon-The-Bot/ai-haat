import { createHash } from "node:crypto";
import { BufferJSON, initAuthCreds, proto, type AuthenticationState } from "@whiskeysockets/baileys";
import { fenced, type Owner } from "./ownership";
import { openSession, sealSession } from "./session-cipher";

function keyId(kind: string, id: string) {
  return createHash("sha256").update(JSON.stringify([kind, id])).digest("hex");
}

export function sessionRecords(owner: Owner) {
  const { accountId } = owner;
  async function read(ids: string[]) {
    const rows = await fenced(owner, tx => tx.whatsappSessionRecord.findMany({
      where: { accountId, recordId: { in: ids } },
    }));
    return new Map(rows.map(row => [row.recordId, JSON.parse(
      openSession(accountId, row.recordId, row.payload).toString(), BufferJSON.reviver,
    )]));
  }
  function write(entries: [string, unknown][]) {
    return fenced(owner, async tx => {
      for (const [recordId, value] of entries) {
        if (value == null) {
          await tx.whatsappSessionRecord.deleteMany({ where: { accountId, recordId } });
        } else {
          const payload = sealSession(accountId, recordId, Buffer.from(JSON.stringify(value, BufferJSON.replacer)));
          await tx.whatsappSessionRecord.upsert({ where: { accountId_recordId: { accountId, recordId } },
            create: { accountId, recordId, payload }, update: { payload } });
        }
      }
    });
  }
  return { read, write };
}

export async function loadAuth(owner: Owner) {
  const records = sessionRecords(owner);
  const creds = (await records.read(["creds"])).get("creds") ?? initAuthCreds();
  const state: AuthenticationState = { creds, keys: {
    async get(kind, ids) {
      const values = await records.read(ids.map(id => keyId(kind, id)));
      return Object.fromEntries(ids.map(id => {
        const value = values.get(keyId(kind, id));
        return [id, kind === "app-state-sync-key" && value ? proto.Message.AppStateSyncKeyData.fromObject(value) : value];
      }));
    },
    async set(data) {
      await records.write(Object.entries(data).flatMap(([kind, items]) =>
        Object.entries(items ?? {}).map(([id, value]): [string, unknown] => [keyId(kind, id), value])));
    },
  }};
  return { state, save: () => records.write([["creds", creds]]) };
}
