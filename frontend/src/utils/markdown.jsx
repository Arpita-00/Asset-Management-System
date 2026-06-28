import React from 'react';

/**
 * Parses inline markdown tags (bold **, italic *, code `) into React nodes.
 * @param {string} text 
 * @returns {React.ReactNode}
 */
export function parseInlineMarkdown(text) {
  if (!text) return '';
  const inlineRegex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
  const parts = String(text).split(inlineRegex);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-extrabold text-slate-900 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={index} className="italic text-slate-500 dark:text-slate-400">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code 
          key={index} 
          className="px-1.5 py-0.5 rounded font-mono text-[10.5px] bg-slate-100 dark:bg-slate-900 text-amber-600 dark:text-amber-400 border border-slate-200 dark:border-slate-800"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

/**
 * Parses raw markdown blocks (headers, lists, tables, code blocks) into React nodes.
 * @param {string} text 
 * @returns {React.ReactNode}
 */
export function parseMarkdown(text) {
  if (!text) return '';
  
  const lines = String(text).split('\n');
  const parsed = [];
  
  let inCode = false;
  let codeLines = [];
  let inTable = false;
  let tableRows = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code blocks
    if (line.trim().startsWith('```')) {
      if (inCode) {
        inCode = false;
        parsed.push(
          <pre 
            key={`code-${i}`} 
            className="bg-slate-950/70 p-3 rounded-lg border border-slate-850 font-mono text-[11px] overflow-x-auto my-2 text-emerald-400 select-all"
          >
            <code>{codeLines.join('\n')}</code>
          </pre>
        );
        codeLines = [];
      } else {
        inCode = true;
      }
      continue;
    }

    if (inCode) {
      codeLines.push(line);
      continue;
    }

    // Tables
    if (line.trim().startsWith('|')) {
      inTable = true;
      if (line.includes('---')) continue; // Skip dashed separator rows
      
      const cells = line
        .split('|')
        .map(c => c.trim())
        .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      
      tableRows.push(cells);
      continue;
    } else if (inTable) {
      inTable = false;
      const headers = tableRows[0] || [];
      const body = tableRows.slice(1);
      
      parsed.push(
        <div key={`table-${i}`} className="overflow-x-auto my-2">
          <table className="w-full border-collapse border border-slate-200 dark:border-slate-800 text-[11px]">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                {headers.map((cell, cIdx) => (
                  <th 
                    key={cIdx} 
                    className="px-2 py-1.5 border border-slate-200 dark:border-slate-800 text-left font-bold text-slate-800 dark:text-slate-200"
                  >
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((row, rIdx) => (
                <tr 
                  key={rIdx} 
                  className="border-b border-slate-150 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-950/30 text-slate-700 dark:text-slate-300"
                >
                  {row.map((cell, cIdx) => (
                    <td 
                      key={cIdx} 
                      className="px-2 py-1.5 border border-slate-200 dark:border-slate-800 font-medium"
                    >
                      {parseInlineMarkdown(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
    }

    // Unordered lists
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      inList = true;
      const content = line.trim().replace(/^[-*]\s+/, '');
      parsed.push(
        <li key={i} className="list-disc ml-5 my-1 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
          {parseInlineMarkdown(content)}
        </li>
      );
      continue;
    } else if (inList && line.trim() === '') {
      inList = false;
    }

    // Headers (# H1, ## H2, ### H3)
    if (line.trim().startsWith('#')) {
      const headerMatch = line.match(/^(#{1,6})\s+(.*)$/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        const textVal = headerMatch[2];
        const sizeClass = level === 1 
          ? 'text-base font-black mt-3 mb-1.5 text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-1' 
          : level === 2 
          ? 'text-sm font-black mt-2.5 mb-1.5 text-slate-800 dark:text-slate-200' 
          : 'text-xs font-black mt-2 mb-1 text-slate-700 dark:text-slate-300';
          
        parsed.push(
          <div key={i} className={`${sizeClass} uppercase tracking-wide`}>
            {parseInlineMarkdown(textVal)}
          </div>
        );
        continue;
      }
    }

    // Standard paragraphs
    if (line.trim() !== '') {
      parsed.push(
        <p key={i} className="text-xs leading-relaxed my-1.5 font-medium text-slate-700 dark:text-slate-350">
          {parseInlineMarkdown(line)}
        </p>
      );
    }
  }

  return parsed;
}

/**
 * React Component to render parsed Markdown.
 */
export default function Markdown({ content }) {
  return <div className="space-y-0.5">{parseMarkdown(content)}</div>;
}
