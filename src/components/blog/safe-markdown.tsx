import React from "react";

/**
 * Parses markdown inline syntax (bold, plain text) into safe React elements without dangerouslySetInnerHTML
 */
export function renderSafeMarkdownInline(text: string): React.ReactNode[] {
  if (!text) return [];
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      return (
        <strong key={i} className="text-slate-900 font-bold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}
