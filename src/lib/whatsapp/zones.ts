export const zones = {"Asia/Dhaka":"+06:00","UTC":"+00:00","Asia/Kolkata":"+05:30","Asia/Singapore":"+08:00"} as const;
export function isZone(zone:unknown):zone is keyof typeof zones {
  return typeof zone==="string" && Object.hasOwn(zones,zone);
}
export function zoneOffset(zone:string) {
  if (!isZone(zone)) throw new Error("Unsupported schedule timezone");
  const [hours,minutes]=zones[zone].split(":").map(Number);
  return (hours*60+minutes)*60000;
}
