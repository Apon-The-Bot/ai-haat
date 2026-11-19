const previewPolicy =
  "default-src 'none'; style-src 'unsafe-inline'; img-src data:; base-uri 'none'; form-action 'none'";

export function EmailHtmlPreview({ html, className }: { html: string; className?: string }) {
  const document = `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${previewPolicy}"></head><body>${html}</body></html>`;

  return (
    <iframe
      title="Email content preview"
      className={`block min-h-[160px] w-full border-0 ${className ?? ""}`}
      sandbox=""
      referrerPolicy="no-referrer"
      srcDoc={document}
    />
  );
}
