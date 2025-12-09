import React, { useState, useRef } from "react";
import { Copy, Check, Terminal, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const SYNTAX_MAP = {
  keyword: /\b(if|else|for|while|do|return|break|continue|switch|case|default|try|catch|finally|throw|new|delete|class|public|private|protected|static|const|this|var|let|function|def|import|export|from|await|async|yield|with|in|typeof|instanceof|void|namespace|using)\b/g,
  type: /\b(int|float|double|char|bool|string|void|size_t|long|short|unsigned|struct|enum|typename|interface)\b/g,
  function: /\b(\w+)\s*(?=\()/g,
  comment: /(\/\/.*|\/\*[\s\S]*?\*\/|#(?!include).*)/g,
  include: /(#include)\s*[<"]([^>"]+)[>"]/g,
  string: /(["'`])(\\?.)*?\1/g,
  number: /\b\d+(\.\d+)?(L|UL|f|F|e\d+)?\b/g,
  symbol: /([(){}[\];.,!+\-*\/%=&|<>^~:])/g,
};


// MARKDOWN RENDERING
function renderMarkdownToHTML(md) {
  if (!md) return "";

  let html = md;

  html = html.replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(
    /`([^`]+)`/g,
    "<code style='background:#2d2b38;padding:2px 5px;border-radius:4px;color:#e5c07b;'>$1</code>"
  );

  html = html.replace(/^### (.*$)/gim, "<h3 class='text-lg font-bold text-white'>$1</h3>");
  html = html.replace(/^## (.*$)/gim, "<h2 class='text-xl font-bold text-white'>$1</h2>");
  html = html.replace(/^# (.*$)/gim, "<h1 class='text-2xl font-bold text-white'>$1</h1>");

  html = html.replace(/^- (.*$)/gim, "<li style='margin-left:20px;list-style:disc;'>$1</li>");
  html = html.replace(/(<li[\s\S]*?<\/li>)/gim, "<ul>$1</ul>");

  html = html.replace(
    /^> (.*$)/gim,
    "<blockquote style='border-left:3px solid #777;padding-left:12px;color:#ccc;'>$1</blockquote>"
  );

  html = html.replace(
    /(https?:\/\/[^\s]+)/g,
    `<a href='$1' target='_blank' style='color:#4fc3f7;text-decoration:underline;'>$1</a>`
  );

  html = html.replace(/\n/g, "<br/>");
  return html;
}


// SYNTAX HIGHLIGHTER

function applySyntaxHighlighting(code) {
  const lines = code.split("\n");

  const highlightLine = (line) => {
    let result = "";
    let i = 0;

    while (i < line.length) {
      if (line.slice(i, i + 2) === "//") {
        const rest = line.slice(i);
        result += `<span style="color:#6A9955;font-style:italic;">${escapeHTML(rest)}</span>`;
        break;
      }

      if (line[i] === '"') {
        let j = i + 1;
        while (j < line.length && (line[j] !== '"' || line[j - 1] === "\\")) j++;
        const str = line.slice(i, j + 1);
        result += `<span style="color:#CE9178;">${escapeHTML(str)}</span>`;
        i = j + 1;
        continue;
      }

      if (line[i] === "'") {
        let j = i + 1;
        while (j < line.length && (line[j] !== "'" || line[j - 1] === "\\")) j++;
        const str = line.slice(i, j + 1);
        result += `<span style="color:#CE9178;">${escapeHTML(str)}</span>`;
        i = j + 1;
        continue;
      }

      if (line.slice(i).match(/^#include/)) {
        const match = line.slice(i).match(/^(#include)\s*([<"][^>"]+[>"])/);
        if (match) {
          result += `<span style="color:#569CD6;font-weight:500;">${match[1]}</span> <span style="color:#CE9178;">${escapeHTML(match[2])}</span>`;
          i += match[0].length;
          continue;
        }
      }

      const word = line.slice(i).match(/^[a-zA-Z_]\w*/)?.[0];
      if (word) {
        const isKeyword = SYNTAX_MAP.keyword.test(word);
        const isType = SYNTAX_MAP.type.test(word);
        const isFunction = line.slice(i + word.length).match(/^\s*\(/);

        if (isKeyword) result += `<span style="color:#C586C0;font-weight:600;">${word}</span>`;
        else if (isType) result += `<span style="color:#4EC9B0;">${word}</span>`;
        else if (isFunction) result += `<span style="color:#DCDCAA;">${word}</span>`;
        else result += escapeHTML(word);

        i += word.length;
        continue;
      }

      const num = line.slice(i).match(/^\d+(\.\d+)?([Ll]|[Uu][Ll]|[Ff])?/);
      if (num) {
        result += `<span style="color:#B5CEA8;">${num[0]}</span>`;
        i += num[0].length;
        continue;
      }

      result += escapeHTML(line[i]);
      i++;
    }

    return result;
  };

  return lines.map(highlightLine).join("\n");
}

function escapeHTML(txt) {
  return txt.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// COMPONENT
export default function CodeWhispererMessage({
  message,
  isUser,
  confidence = "99%",
  toolsUsed = "Code Whisperer",
}) {
  const messageRef = useRef(null);
  const [copiedIndex, setCopiedIndex] = useState(null);

  

  const handleCopy = (code, idx) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Detect code blocks
  const codeRegex = /```(\w+)?\s*([\s\S]*?)```/g;
  const segments = [];
  let cursor = 0;
  let m;

  while ((m = codeRegex.exec(message))) {
    if (m.index > cursor) {
      segments.push({ type: "text", content: message.slice(cursor, m.index).trim() });
    }

    segments.push({ type: "code", lang: m[1] || "code", content: m[2].trim() });
    cursor = m.index + m[0].length;
  }

  if (cursor < message.length) {
    segments.push({ type: "text", content: message.slice(cursor).trim() });
  }

  // USER MESSAGE UI
  if (isUser) {
    return (
      <motion.div
        ref={messageRef}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="ml-auto text-left max-w-[50%] mb-6"
      >
        <div
          className="p-4 rounded-2xl shadow-lg"
          style={{ backgroundColor: "#332F4B" }}
        >
          <p className="text-gray-100 whitespace-pre-wrap">{message}</p>
        </div>
      </motion.div>
    );
  }

  // AI OUTPUT
  return (
    <motion.div
      ref={messageRef}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[85%] mb-6 text-left"
    >
      
      {segments.map((seg, idx) =>
        seg.type === "text" ? (
          <div
            key={idx}
            className="mb-4 p-5 rounded-2xl"
            style={{ backgroundColor: "#231E35" }}
            dangerouslySetInnerHTML={{
              __html: renderMarkdownToHTML(seg.content),
            }}
          />
        ) : (
          <div
            key={idx}
            className="rounded-xl overflow-hidden mb-4"
            style={{
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
            }}
          >
            {/* Header */}
            <div className="px-4 py-3 flex items-center gap-2" style={{ background: "#1B172C" }}>
              <Sparkles className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-300">Code Block</span>
            </div>

            {/* Language Bar */}
            <div
              className="flex justify-between items-center px-4 py-2 text-xs"
              style={{ background: "#151320", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="flex items-center gap-2 text-green-400 font-bold uppercase">
                <Terminal className="w-4 h-4" /> {seg.lang}
              </div>

              <button
                onClick={() => handleCopy(seg.content, idx)}
                className="px-3 py-1 rounded-md text-gray-300 hover:scale-105 transition"
                style={{
                  background: copiedIndex === idx ? "rgba(32,201,151,0.2)" : "rgba(255,255,255,0.05)",
                }}
              >
                {copiedIndex === idx ? "Copied!" : "Copy"}
              </button>
            </div>

            {/* Code */}
            <div className="overflow-x-auto" style={{ background: "#0D0B14" }}>
              <pre
                className="p-5 text-sm leading-relaxed"
                style={{
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
                  fontFamily: "'Fira Code','JetBrains Mono', monospace",
                }}
                dangerouslySetInnerHTML={{
                  __html: applySyntaxHighlighting(seg.content),
                }}
              />
            </div>

            {/* Footer */}
            <div
              className="flex justify-between items-center px-4 py-2 text-xs"
              style={{ background: "#151320", borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              <span className="text-gray-400">{toolsUsed}</span>
              <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-300 font-bold">
                Confidence: {confidence}
              </span>
            </div>
          </div>
        )
      )}
    </motion.div>
  );
}
