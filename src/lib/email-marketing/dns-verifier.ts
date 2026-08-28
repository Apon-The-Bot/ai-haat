import dns from "dns";
const dnsPromises = dns.promises;

export interface DnsCheckResult {
  domain: string;
  spf: {
    valid: boolean;
    record: string | null;
    recommendation: string;
  };
  dkim: {
    valid: boolean;
    record: string | null;
    recommendation: string;
  };
  dmarc: {
    valid: boolean;
    record: string | null;
    recommendation: string;
  };
  checkedAt: string;
}

/**
 * Performs a live DNS inspection of SPF, DKIM, and DMARC records for deliverability verification.
 */
export async function verifyDomainDns(domain = "aihaat.shop"): Promise<DnsCheckResult> {
  const result: DnsCheckResult = {
    domain,
    spf: {
      valid: false,
      record: null,
      recommendation: "Add TXT record on root (@) with value: v=spf1 include:_spf.mail.hostinger.com ~all",
    },
    dkim: {
      valid: false,
      record: null,
      recommendation: "Enable DKIM in Hostinger Email Manager or add CNAME/TXT records for hostingermail._domainkey",
    },
    dmarc: {
      valid: false,
      record: null,
      recommendation: "Add TXT record on _dmarc with value: v=DMARC1; p=none; sp=none; rua=mailto:dmarc-reports@aihaat.shop",
    },
    checkedAt: new Date().toISOString(),
  };

  try {
    // 1. Check SPF on root domain
    try {
      const txtRecords = await dnsPromises.resolveTxt(domain);
      const flattened = txtRecords.map((r) => r.join(""));
      const spfRecord = flattened.find((r) => r.toLowerCase().startsWith("v=spf1"));
      if (spfRecord) {
        result.spf.record = spfRecord;
        result.spf.valid = true;
      }
    } catch (err) {
      // DNS record might not be reachable from local
    }

    // 2. Check DMARC on _dmarc.domain
    try {
      const dmarcRecords = await dnsPromises.resolveTxt(`_dmarc.${domain}`);
      const flattenedDmarc = dmarcRecords.map((r) => r.join(""));
      const dmarc = flattenedDmarc.find((r) => r.toLowerCase().startsWith("v=dmarc1"));
      if (dmarc) {
        result.dmarc.record = dmarc;
        result.dmarc.valid = true;
      }
    } catch (err) {
      // DMARC might be pending
    }

    // 3. Check common Hostinger DKIM selector
    try {
      const dkimRecords = await dnsPromises.resolveTxt(`hostingermail._domainkey.${domain}`);
      const flattenedDkim = dkimRecords.map((r) => r.join(""));
      const dkim = flattenedDkim.find((r) => r.toLowerCase().startsWith("v=dkim1") || r.includes("p="));
      if (dkim) {
        result.dkim.record = dkim;
        result.dkim.valid = true;
      }
    } catch (err) {
      // Fallback check on default._domainkey
      try {
        const dkimDefault = await dnsPromises.resolveTxt(`default._domainkey.${domain}`);
        const flattenedDef = dkimDefault.map((r) => r.join(""));
        const dkim = flattenedDef.find((r) => r.toLowerCase().startsWith("v=dkim1") || r.includes("p="));
        if (dkim) {
          result.dkim.record = dkim;
          result.dkim.valid = true;
        }
      } catch (e) {}
    }
  } catch (globalErr) {
    console.error("[DNS Verifier Global Error]:", globalErr);
  }

  return result;
}