import { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

export default function LatexRenderer({ math, display = false, className = '' }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math || '', {
        displayMode: display,
        throwOnError: false,
        trust: true,
      });
    } catch {
      return `<span style="color:#ef4444">${math}</span>`;
    }
  }, [math, display]);

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
