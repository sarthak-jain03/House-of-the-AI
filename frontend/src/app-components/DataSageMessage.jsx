// DataSageMessage.jsx
import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { User, Bot, Copy, Maximize2, Image } from "lucide-react";

/**
 * DataSageMessage — upgraded renderer
 *
 * Features:
 * - Parses markdown and extracts table blocks and inline images (base64 or urls)
 * - Renders tables as React components with:
 *    * syntax highlighting in cells (inline `code`)
 *    * numeric heatmap (auto scaled)
 *    * "Copy table" button (copies markdown + HTML)
 *    * Expand button -> modal (fullscreen table)
 *    * Collapsible wrapper (using <details>)
 * - Renders image thumbnails (detects data:image/png;base64,...)
 *    * click to open modal / enlarge
 * - Renders remaining markdown using a safe-ish converter (headings, bold, lists, code)
 * - Keeps original layout: avatar, confidence pill, user vs assistant styling
 */

/* ---------------------------
   Utility: Markdown utilities
   ---------------------------*/

// Extracts table blocks and image blocks, returning segments
function extractSegments(markdown) {
  const segments = [];
  if (!markdown) return segments;

  let rest = String(markdown);

  // regex: table block (lines starting and ending with | and containing at least one \n)
  const tableRegex = /(\|[^\n]*\|\n(?:\|[^\n]*\|\n)+)/gm;
  const imgRegex = /!\[.*?\]\((data:image\/[a-zA-Z]+;base64,[^)]+|https?:\/\/[^\s)]+)\)/g;

  // We will first split by table blocks, then within non-table parts detect images.
  let lastIndex = 0;
  let match;

  while ((match = tableRegex.exec(rest)) !== null) {
    const start = match.index;
    const end = tableRegex.lastIndex;
    const before = rest.slice(lastIndex, start);
    if (before) pushNonTableSegments(before, segments, imgRegex);
    segments.push({ type: "table", content: match[1] });
    lastIndex = end;
  }
  const tail = rest.slice(lastIndex);
  if (tail) pushNonTableSegments(tail, segments, imgRegex);

  return segments;
}

// For non-table text, split into image and text segments
function pushNonTableSegments(text, segments, imgRegex) {
  let last = 0;
  let m;
  while ((m = imgRegex.exec(text)) !== null) {
    const s = m.index;
    const e = imgRegex.lastIndex;
    const before = text.slice(last, s);
    if (before) segments.push({ type: "text", content: before });
    segments.push({ type: "image", content: m[1] }); // m[1] is URL or data:image...
    last = e;
  }
  const tail = text.slice(last);
  if (tail) segments.push({ type: "text", content: tail });
}

// Convert a markdown table string into header array + rows array
function parseMarkdownTable(tbl) {
  const lines = tbl.trim().split("\n").map((l) => l.trim());
  if (lines.length < 2) return null;

  // header is first line, separator is second line (we ignore validation)
  const headerCells = lines[0].split("|").slice(1, -1).map((h) => h.trim());
  const bodyLines = lines.slice(2);
  const rows = bodyLines.map((r) => r.split("|").slice(1, -1).map((c) => c.trim()));
  return { headers: headerCells, rows };
}

// Simple inline Markdown -> React nodes for small pieces (bold, italic, inline code, links)
function inlineMarkdownToNodes(text) {
  if (!text) return null;
  // escape & simple replacements
  // We'll process inline code first, then bold/italic, links
  const parts = [];
  let rest = text;
  const codeRegex = /`([^`]+)`/;
  while (true) {
    const m = rest.match(codeRegex);
    if (!m) {
      parts.push(escapeHtml(rest));
      break;
    }
    const idx = m.index;
    parts.push(escapeHtml(rest.slice(0, idx)));
    parts.push(React.createElement("code", { key: Math.random(), style: codeStyle }, m[1]));
    rest = rest.slice(idx + m[0].length);
  }
  // join parts (strings and code elements), then process bold/italic & links in strings
  const final = [];
  parts.forEach((p, i) => {
    if (typeof p === "string") {
      let s = p;
      // replace **bold**
      const boldRegex = /\*\*(.*?)\*\*/g;
      let last = 0;
      let m2;
      while ((m2 = boldRegex.exec(s)) !== null) {
        const before = s.slice(last, m2.index);
        if (before) final.push(escapeHtml(before));
        final.push(React.createElement("strong", { key: `b${i}${m2.index}` }, m2[1]));
        last = boldRegex.lastIndex;
      }
      const after = s.slice(last);
      if (after) final.push(escapeHtml(after));
    } else {
      final.push(p);
    }
  });
  return final;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "\n");
}

/* ---------------------------
   Styles
   ---------------------------*/
const tableWrapperStyle = {
  background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
  border: "1px solid rgba(255,255,255,0.06)",
  padding: "10px",
  borderRadius: 12,
  marginBottom: 12,
};

const thStyle = {
  textAlign: "left",
  padding: "8px 10px",
  color: "#fff",
  fontSize: 13,
  background: "#2e2b40",
  borderBottom: "1px solid rgba(255,255,255,0.04)",
};

const tdStyle = {
  padding: "8px 10px",
  color: "#e6eef8",
  fontSize: 13,
  borderTop: "1px solid rgba(255,255,255,0.03)",
};

const codeStyle = {
  background: "#2d2b38",
  padding: "2px 6px",
  borderRadius: 6,
  color: "#e5c07b",
  fontSize: "0.95em",
  fontFamily: "monospace",
};

/* ---------------------------
   Table Component
   ---------------------------*/
function TableBlock({
  markdown,
  initiallyCollapsed = false,
  onOpenModal = () => {},
}) {
  const parsed = parseMarkdownTable(markdown);
  if (!parsed) return <div style={{ color: "#ddd" }}>Invalid table</div>;

  const { headers, rows } = parsed;

  // compute numeric heatmap scale across all numeric cells
  const numericValues = [];
  const numericMask = rows.map((r) =>
    r.map((cell) => {
      const n = parseFloat(String(cell).replace(/,/g, ""));
      if (!Number.isFinite(n)) return null;
      numericValues.push(n);
      return n;
    })
  );

  const min = numericValues.length ? Math.min(...numericValues) : 0;
  const max = numericValues.length ? Math.max(...numericValues) : 0;

  // heat color function (from light-blue -> deep-blue)
  const heatColor = (val) => {
    if (val == null || max === min) return "transparent";
    const ratio = (val - min) / (max - min);
    // simple gradient between two hues
    const from = [18, 56, 100]; // rgb for lightish
    const to = [7, 61, 130]; // rgb for deep
    const r = Math.round(from[0] + (to[0] - from[0]) * ratio);
    const g = Math.round(from[1] + (to[1] - from[1]) * ratio);
    const b = Math.round(from[2] + (to[2] - from[2]) * ratio);
    return `linear-gradient(90deg, rgba(${r},${g},${b},0.12), rgba(${r},${g},${b},0.04))`;
  };

  // copy helpers
  const copyMarkdownToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      toast("Table markdown copied to clipboard");
    } catch {
      toast("Copy failed");
    }
  };

  const copyHtmlToClipboard = async () => {
    try {
      // build HTML table string
      const html = buildHtmlFromTable(headers, rows);
      await navigator.clipboard.writeText(html);
      toast("Table HTML copied to clipboard");
    } catch {
      toast("Copy failed");
    }
  };

  // minimal toast (ephemeral)
  function toast(msg) {
    // create a small floating element
    const el = document.createElement("div");
    el.innerText = msg;
    el.style.position = "fixed";
    el.style.right = "18px";
    el.style.bottom = "18px";
    el.style.background = "rgba(0,0,0,0.7)";
    el.style.color = "#fff";
    el.style.padding = "8px 12px";
    el.style.borderRadius = "8px";
    el.style.zIndex = 99999;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1800);
  }

  return (
    <details open={!initiallyCollapsed} style={{ marginBottom: 10 }}>
      <summary style={{ cursor: "pointer", padding: "6px 8px", color: "#cbd5e1", fontWeight: 600 }}>
        Table — click to {initiallyCollapsed ? "expand" : "collapse"}
      </summary>

      <div style={tableWrapperStyle}>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 8 }}>
          <button
            onClick={() => onOpenModal({ headers, rows })}
            title="Expand table"
            className="flex items-center gap-2 px-3 py-1 rounded-md"
            style={{ background: "rgba(255,255,255,0.03)", color: "#fff", border: "1px solid rgba(255,255,255,0.04)" }}
          >
            <Maximize2 className="w-4 h-4" /> Expand
          </button>

          <button
            onClick={copyMarkdownToClipboard}
            title="Copy markdown"
            className="flex items-center gap-2 px-3 py-1 rounded-md"
            style={{ background: "rgba(255,255,255,0.03)", color: "#fff", border: "1px solid rgba(255,255,255,0.04)" }}
          >
            <Copy className="w-4 h-4" /> Copy MD
          </button>

          <button
            onClick={copyHtmlToClipboard}
            title="Copy HTML"
            className="flex items-center gap-2 px-3 py-1 rounded-md"
            style={{ background: "rgba(255,255,255,0.03)", color: "#fff", border: "1px solid rgba(255,255,255,0.04)" }}
          >
            <Copy className="w-4 h-4" /> Copy HTML
          </button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {headers.map((h, i) => (
                  <th key={i} style={thStyle}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((r, ri) => (
                <tr key={ri}>
                  {r.map((cell, ci) => {
                    const numeric = numericMask[ri][ci];
                    const bg = numeric != null ? heatColor(numeric) : "transparent";

                    // syntax highlight inside cell: detect inline `code` and multiline ``` blocks (we keep it simple)
                    // For inline `code`, we render <code> elements (handled in inlineMarkdownToNodes)
                    const nodes = inlineMarkdownToNodes(cell);

                    return (
                      <td
                        key={ci}
                        style={{
                          ...tdStyle,
                          background: bg,
                          whiteSpace: "pre-wrap",
                          verticalAlign: "top",
                        }}
                      >
                        <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ flex: 1 }}>{nodes}</div>
                          {/* small value badge for numeric cells */}
                          {numeric != null && (
                            <div style={{ marginLeft: 8, fontSize: 12, color: "#9ca3af" }}>
                              {String(numeric)}
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </details>
  );
}

function buildHtmlFromTable(headers, rows) {
  let html = "<table style='width:100%; border-collapse:collapse;'>";
  html += "<thead><tr>";
  headers.forEach((h) => {
    html += `<th style="text-align:left;padding:6px;background:#2e2b40;color:#fff;">${escapeHtml(h)}</th>`;
  });
  html += "</tr></thead><tbody>";
  rows.forEach((r) => {
    html += "<tr>";
    r.forEach((c) => {
      html += `<td style="padding:6px;color:#ddd;border-top:1px solid rgba(255,255,255,0.04)">${escapeHtml(c)}</td>`;
    });
    html += "</tr>";
  });
  html += "</tbody></table>";
  return html;
}

/* ---------------------------
   Image thumbnail component
   ---------------------------*/
function ImageThumb({ src, onOpen }) {
  // render small thumbnail, click to open
  const isData = src.startsWith("data:image");
  return (
    <div style={{ display: "inline-block", margin: 6 }}>
      <div
        style={{
          width: 160,
          height: 100,
          borderRadius: 10,
          overflow: "hidden",
          background: "#0b1220",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid rgba(255,255,255,0.04)",
          cursor: "pointer",
        }}
        onClick={() => onOpen(src)}
        title="Click to enlarge"
      >
        <img src={src} alt="chart" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
      </div>
      <div style={{ textAlign: "center", marginTop: 6 }}>
        <button
          onClick={() => {
            // download
            const a = document.createElement("a");
            a.href = src;
            a.download = `chart_${Date.now()}.png`;
            a.click();
          }}
          className="px-2 py-1 rounded-md"
          style={{ background: "rgba(255,255,255,0.03)", color: "#fff", border: "1px solid rgba(255,255,255,0.04)" }}
        >
          Download
        </button>
      </div>
    </div>
  );
}

/* ---------------------------
   Main Component
   ---------------------------*/
export default function DataSageMessage({ message, isUser, confidence }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  const segments = useMemo(() => extractSegments(message), [message]);

  const openModal = (content) => {
    setModalContent(content);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalContent(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}
    >
      {/* Avatar */}
      <div
        className={
          "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 " +
          (isUser
            ? "bg-gradient-to-br from-purple-500 to-purple-600"
            : "bg-gradient-to-br from-teal-500/20 to-teal-600/20 border border-teal-500/30")
        }
      >
        {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-teal-400" />}
      </div>

      {/* Message body */}
      <div className={`max-w-[75%] ${isUser ? "text-right" : ""}`}>
        <div
          className={
            "rounded-2xl px-4 py-3 leading-tight " +
            (isUser
              ? "bg-purple-500/30 border border-purple-500/30 text-white"
              : "bg-[#1e1e2f] border border-white/10 text-gray-200")
          }
        >
          {isUser ? (
            <p className="whitespace-pre-wrap text-left">{message}</p>
          ) : (
            <div className="text-left">
              {/* Render segments */}
              {segments.map((seg, idx) => {
                if (seg.type === "table") {
                  return (
                    <div key={idx}>
                      <TableBlock
                        markdown={seg.content}
                        initiallyCollapsed={false}
                        onOpenModal={(t) =>
                          openModal({ type: "table", payload: t, title: "Table preview" })
                        }
                      />
                    </div>
                  );
                }
                if (seg.type === "image") {
                  return (
                    <div key={idx} style={{ marginBottom: 8 }}>
                      <ImageThumb src={seg.content} onOpen={(src) => openModal({ type: "image", payload: src })} />
                    </div>
                  );
                }
                // plain text -> convert basic markdown (headings, lists) to HTML and render via dangerouslySetInnerHTML
                // We use a simple converter: headings, bold, italic, inline code, blockquote, lists
                return (
                  <div
                    key={idx}
                    style={{ marginBottom: 8 }}
                    dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(seg.content) }}
                  />
                );
              })}
            </div>
          )}
        </div>

        {!isUser && confidence && (
          <div className="mt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-full text-xs text-orange-400 font-medium">
              Expert Confidence: {confidence}%
            </span>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.7)", padding: 20 }}
          onClick={closeModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "95vw",
              maxHeight: "95vh",
              overflow: "auto",
              background: "#0f1724",
              padding: 20,
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 12 }}>
              <button onClick={closeModal} style={{ padding: "6px 10px", borderRadius: 8, background: "rgba(255,255,255,0.03)" }}>
                Close
              </button>
            </div>

            {modalContent?.type === "image" && (
              <div style={{ textAlign: "center" }}>
                <img src={modalContent.payload} alt="expanded" style={{ maxWidth: "100%", maxHeight: "80vh" }} />
              </div>
            )}

            {modalContent?.type === "table" && (
              <div>
                {/* Render expanded table using the same TableBlock but not collapsible and without action buttons (or keep them) */}
                <div style={{ marginBottom: 6, color: "#cbd5e1", fontWeight: 700 }}>
                  {modalContent.title || "Table"}
                </div>
                <div style={{ marginTop: 8 }}>
                  <div style={{ ...tableWrapperStyle }}>
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr>
                            {modalContent.payload.headers.map((h, i) => (
                              <th key={i} style={thStyle}>
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {modalContent.payload.rows.map((r, ri) => (
                            <tr key={ri}>
                              {r.map((cell, ci) => (
                                <td key={ci} style={{ ...tdStyle, whiteSpace: "pre-wrap" }}>
                                  <span dangerouslySetInnerHTML={{ __html: inlineHtml(cell) }} />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}

/* ---------------------------
   Simple markdown -> HTML converter for non-table segments
   (keeps headings, lists, code, blockquote, basic tables removed earlier)
   ---------------------------*/
function simpleMarkdownToHtml(md) {
  if (!md) return "";

  let html = md;

  // escape raw HTML first
  html = html.replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // Headings
  html = html.replace(/^### (.*)$/gm, `<h3 style="color:#fff;margin:8px 0 6px;">$1</h3>`);
  html = html.replace(/^## (.*)$/gm, `<h2 style="color:#fff;margin:10px 0 8px;">$1</h2>`);
  html = html.replace(/^# (.*)$/gm, `<h1 style="color:#fff;margin:12px 0 10px;">$1</h1>`);

  // Blockquote
  html = html.replace(/^> (.*)$/gm, `<blockquote style="border-left:4px solid #666;padding-left:12px;color:#cbd5e1;">$1</blockquote>`);

  // Inline code
  html = html.replace(/`([^`]+)`/g, `<code style="background:#2d2b38;padding:2px 6px;border-radius:6px;color:#e5c07b;">$1</code>`);

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, `<strong style="color:#fff;">$1</strong>`);

  // Lists (simple)
  html = html.replace(/^\s*[-*]\s+(.*)$/gm, `<li style="color:#d1d5db;margin:4px 0;">$1</li>`);
  html = html.replace(/(<li[\s\S]*?<\/li>)/gm, `<ul style="margin:6px 0 6px 20px;">$1</ul>`);

  // Paragraph breaks
  html = html.replace(/\n{2,}/g, "</p><p>");
  html = `<p style="color:#d1d5db;line-height:1.5;margin:6px 0;">${html}</p>`;

  // links (basic)
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, `<a href="$2" target="_blank" rel="noreferrer" style="color:#7dd3fc;">$1</a>`);

  return html;
}

/* ---------------------------
   Helpers for inline HTML in modal table cells
   ---------------------------*/
function inlineHtml(text) {
  if (!text) return "";
  // convert inline `code` to HTML code element
  return escapeHtml(text).replace(/`([^`]+)`/g, `<code style="background:#2d2b38;padding:2px 6px;border-radius:6px;color:#e5c07b;">$1</code>`);
}
