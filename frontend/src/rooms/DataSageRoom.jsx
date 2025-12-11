import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  Upload,
  Table,
  PieChart,
  Download,
  X,
  Search
} from 'lucide-react';
import DataSageMessage from '@/app-components/DataSageMessage.jsx';
import DataSageChatInput from '@/app-components/DataSageChatInput.jsx';

const API_BASE_URL = `${import.meta.env.VITE_INFERENCE_API_URL}`;
const SAVE_CHAT_URL = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080'}/api/chats/save`;

const saveChatToDB = async (userMessage, assistantResponse) => {
  try {
    await fetch(SAVE_CHAT_URL, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        aiType: "datasage",
        message: userMessage,
        response: assistantResponse
      })
    });
  } catch (err) {
    console.error("Error saving Data Sage chat:", err);
  }
};

//UTIL: escape html 
const escapeHtml = (str = "") =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

// SIMPLE MARKDOWN -> HTML 
const simpleMarkdownToHtml = (md) => {
  if (!md) return "";

  let html = escapeHtml(md);
  html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>");
  html = html.replace(/^## (.*$)/gim, "<h2>$1</h2>");
  html = html.replace(/^# (.*$)/gim, "<h1>$1</h1>");
  html = html.replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>");
  html = html.replace(/`([^`]+)`/gim, "<code>$1</code>");
  html = html.replace(/(^|\n)(- .+(?:\n- .+)*)/g, (m, p1, group) => {
    const items = group
      .trim()
      .split("\n")
      .map((l) => `<li>${l.replace(/^- /, "")}</li>`)
      .join("");
    return `${p1}<ul>${items}</ul>`;
  });
  html = html.replace(/(^|\n)((?:.*\|.*\n)+)/g, (m, p1, group) => {
    if (group.includes("|")) {
      return `${p1}<pre style="white-space:pre-wrap;">${group.trim()}</pre>`;
    }
    return m;
  });
  html = html.replace(/\n\n+/g, "</p><p>");
  html = `<p>${html}</p>`;
  return html;
};


const formatEdaSummary = (eda, name) => {
  if (!eda) return "No EDA data available.";

  const safeName = name || "Dataset";
  let summary = `## 📊 EDA Summary for **${safeName}**\n\n`;

  try {
    summary += `### 🧮 Dimensions\n- **Rows:** ${eda.rows ?? 'N/A'}\n- **Columns:** ${eda.columns ?? 'N/A'}\n\n`;
  } catch (e) {
    summary += `### 🧮 Dimensions\n- **Rows:** N/A\n- **Columns:** N/A\n\n`;
  }

  const missingValues = eda.missing_values || {};
  const totalMissing = Object.values(missingValues).reduce((s, c) => s + (Number(c) || 0), 0);
  summary += `### 🕳 Missing Values\n${totalMissing > 0 ? `${totalMissing} missing values found:` : "No missing values detected."}\n`;
  Object.entries(missingValues).forEach(([col, count]) => {
    if (count > 0) summary += `- ${col}: ${count}\n`;
  });
  summary += `\n`;

  summary += `### 🏷 Data Types\n`;
  const types = eda.types || {};
  Object.entries(types).forEach(([col, type]) => {
    summary += `- **${col}**: \`${type}\`\n`;
  });
  summary += `\n`;

  const stats = eda.summary || {};
  const numericCols = Object.keys(stats || {}).filter(col => stats[col] && Object.keys(stats[col]).length > 0);
  if (numericCols.length > 0) {
    const showCols = numericCols.slice(0, 3);
    summary += `### 📈 Key Statistics\n`;
    summary += `| Statistic | ${showCols.join(" | ")} |\n`;
    summary += `|---|${"---|".repeat(showCols.length)}\n`;
    const statList = ["count", "mean", "std", "min", "max"];
    statList.forEach(stat => {
      let row = `| **${stat}** |`;
      showCols.forEach(col => {
        const value = stats[col]?.[stat];
        row += ` ${typeof value === "number" ? value.toFixed(2) : (value !== undefined ? value : "N/A")} |`;
      });
      summary += row + "\n";
    });
    summary += `\n`;
  }

  const outliers = eda.outliers_count || {};
  const outlierList = Object.entries(outliers).filter(([, count]) => count > 0);
  if (outlierList.length > 0) {
    summary += `### ⚠ Outliers Detected\n`;
    outlierList.forEach(([col, count]) => {
      summary += `- **${col}**: ${count}\n`;
    });
  }

  return summary;
};
 

export default function DataSageRoom() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [datasetFile, setDatasetFile] = useState(null);
  const [datasetName, setDatasetName] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [charts, setCharts] = useState([]);

  const [edaSummaryClicked, setEdaSummaryClicked] = useState(false);
  const [chartsClicked, setChartsClicked] = useState(false);

  const [selectedChart, setSelectedChart] = useState(null);

 
  const pendingUserForSaveRef = useRef(null);

  
  const chatEndRef = useRef(null);

  
  const pushMessage = useCallback(async (msg) => {
    setMessages((prev) => [...prev, msg]);

    // Auto-save rules:
    // - If message is charts (type === 'charts'), we DO NOT save the chart images.
    // - If msg.role === 'user', we mark it as pending for pairing with the next assistant response.
    // - If msg.role === 'assistant' AND there is a pending user, save pair (pendingUser, assistantContent).
    // - If msg.role === 'assistant' AND no pending user => save with message: "System"
    try {
      if (msg.type === 'charts') {
        return;
      }

      if (msg.role === 'user') {
        
        pendingUserForSaveRef.current = msg.content;
        return;
      }

     
      const pendingUser = pendingUserForSaveRef.current;
      if (pendingUser) {
        await saveChatToDB(pendingUser, typeof msg.content === 'string' ? msg.content : JSON.stringify(msg));
        pendingUserForSaveRef.current = null;
      } else {
        await saveChatToDB("Analyze", typeof msg.content === 'string' ? msg.content : JSON.stringify(msg));
      }
    } catch (err) {
      console.error("pushMessage save error:", err);
    }
  }, []);


  const handleSend = async (message) => {
    
    await pushMessage({ role: 'user', content: message });

    if (!analysisResult) {
   
      await pushMessage({
        role: 'assistant',
        content: "Please run **Analyze Dataset** first."
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/chat-with-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      const data = await response.json();

      if (data.success) {
        const assistantResponse = data.response;
        await pushMessage({
          role: 'assistant',
          content: assistantResponse,
          confidence: data.confidence ?? 95
        });
      } else {
        await pushMessage({
          role: 'assistant',
          content: "Data Sage error: " + (data.error || "Unknown error")
        });
      }
    } catch (err) {
      console.error(err);
      await pushMessage({ role: 'assistant', content: "Server error." });
    } finally {
      setIsLoading(false);
    }
  };

  // FILE UPLOAD 
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setDatasetFile(file);
    setDatasetName(file.name);
    setAnalysisResult(null);
    setCharts([]);
    setEdaSummaryClicked(false);
    setChartsClicked(false);

    
    await pushMessage({ role: 'user', content: `File uploaded: ${file.name}` });


    await pushMessage({
      role: 'assistant',
      content: `Dataset ${file.name} uploaded`
    });
  };

  const handleRemoveFile = async () => {
    setDatasetFile(null);
    setDatasetName(null);
    setAnalysisResult(null);
    setCharts([]);
    setEdaSummaryClicked(false);
    setChartsClicked(false);

    await pushMessage({
      role: 'assistant',
      content: "**Dataset removed. Upload again to restart.**"
    });
  };

  const handleAnalyzeDataset = useCallback(async () => {
    if (!datasetFile) return;

    
    await pushMessage({ role: 'user', content: "Analyze dataset" });

    setIsLoading(true);


    await pushMessage({ role: 'assistant', content: `Analyzing **${datasetName}**...` });

    try {
      const formData = new FormData();
      formData.append('file', datasetFile, datasetName);

      const res = await fetch(`${API_BASE_URL}/analyze`, { method: 'POST', body: formData });
      const data = await res.json();

      if (data.success) {
        setAnalysisResult(data);
        setCharts(data.charts || []);
        setEdaSummaryClicked(false);
        setChartsClicked(false);

        const analysisText =
`# 🔍 Advanced Dataset Analysis: **${datasetName}**

## 🧮 Basic Structure
- **Rows:** ${data.eda?.rows ?? 'N/A'}
- **Columns:** ${data.eda?.columns ?? 'N/A'}

---

## 🕳 Missing Value Summary
${Object.entries(data.eda?.missing_values || {})
  .map(([col, v]) => `- ${col}: ${v}`)
  .join("\n") || "No missing values."}

---

## 🏷 Data Types
${Object.entries(data.eda?.types || {})
  .map(([col, v]) => `- **${col}** → \`${v}\``)
  .join("\n")}

---

## 📊 Summary Statistics
${Object.keys(data.eda?.summary || {})
  .map(col => {
    let s = data.eda.summary[col];
    return `### 🔹 ${col}
- Mean: ${s.mean}
- Std: ${s.std}
- Min: ${s.min}
- Max: ${s.max}`;
  })
  .join("\n\n")}

---

## ⚠ Outliers Detected
${Object.entries(data.eda?.outliers_count || {})
  .filter(([col, v]) => v > 0)
  .map(([col, v]) => `- ${col}: ${v} outliers`)
  .join("\n") || "No outliers detected."}

---

## 🔗 Correlation Insights
${data.eda?.correlation_top
  ?.map(c => `- **${c.pair}** → correlation: ${c.value}`)
  .join("\n") || "No significant correlation findings."}

---

## 🎯 Target Variable Insights
${data.eda?.target_insights || "No target column detected."}

---

## 📈 Distribution Analysis
${data.eda?.distribution_summary
  ?.map(d => `### ${d.column}
- Skewness: ${d.skew}
- Kurtosis: ${d.kurtosis}
- Recommended Fix: ${d.fix}`)
  .join("\n\n") || "No numerical columns analyzed."}

---

## 🏷 Categorical Insights
${data.eda?.categorical_summary
  ?.map(c => `### ${c.column}
- Unique Values: ${c.unique}
- Rare Labels: ${c.rare_labels?.join(", ")}`)
  .join("\n\n") || "No categorical columns found."}

---

## 🚨 Data Quality Flags
${data.eda?.quality_flags?.join("\n") || "No major issues detected."}

---

## 🤖 ML Readiness Recommendation
${data.eda?.ml_recommendations?.join("\n") || "Dataset ready for use."}
`;

        await pushMessage({
          role: 'assistant',
          content: analysisText,
          confidence: 100
        });


      } else {
        await pushMessage({
          role: 'assistant',
          content: `Analysis failed: ${data.error || 'unknown error'}`
        });
      }

    } catch (err) {
      console.error(err);
      await pushMessage({ role: 'assistant', content: "Failed to analyze dataset." });
    } finally {
      setIsLoading(false);
    }
  }, [datasetFile, datasetName, pushMessage]);

  
  const handleEdaSummary = useCallback(async () => {
    if (!analysisResult || edaSummaryClicked) return;

    
    await pushMessage({ role: 'user', content: "Show EDA Summary" });

    const summaryText = formatEdaSummary(
      analysisResult.eda,
      datasetName || analysisResult.dataset_name || "Dataset"
    );

    
    await pushMessage({
      role: 'assistant',
      content: summaryText,
      confidence: 100
    });

    setEdaSummaryClicked(true);
  }, [analysisResult, edaSummaryClicked, datasetName, pushMessage]);

  
  const handleGenerateChart = useCallback(async () => {
    if (!analysisResult || chartsClicked) return;

    
    await pushMessage({ role: 'user', content: "View dataset charts" });

    const responseText = `Displaying ${charts.length} visual charts.`;

    await pushMessage({
      role: 'assistant',
      content: responseText
    });


    await pushMessage({
      role: 'assistant',
      type: 'charts',
      charts: charts || []
    });

    setChartsClicked(true);
  }, [analysisResult, chartsClicked, charts, pushMessage]);

 


  const handleDownloadReport = useCallback(async () => {
    if (!analysisResult) {
      alert("No analysis available to download. Run Analyze Dataset first.");
      return;
    }

    try {
      const md = formatEdaSummary(
        analysisResult.eda,
        datasetName || analysisResult.dataset_name || "Dataset"
      );

      const summaryHtml = simpleMarkdownToHtml(md);

      let chartsHtml = "";
      if (charts && charts.length > 0) {
        chartsHtml = charts
          .map((c, idx) => {
            
            if (c.b64) {
              return `<div style="margin-bottom:18px;">
                        <h4 style="margin-bottom:6px;">${escapeHtml(c.title || `Chart ${idx + 1}`)}</h4>
                        <img src="data:image/png;base64,${c.b64}" style="max-width:100%; border-radius:8px;" />
                      </div>`;
            }
            if (c.url) {
              return `<div style="margin-bottom:18px;">
                        <h4 style="margin-bottom:6px;">${escapeHtml(c.title || `Chart ${idx + 1}`)}</h4>
                        <img src="${escapeHtml(c.url)}" style="max-width:100%; border-radius:8px;" />
                      </div>`;
            }
            return "";
          })
          .join("\n");
      }

      const htmlDoc = `
        <!doctype html>
        <html>
        <head>
          <meta charset="utf-8" />
          <title>${escapeHtml(datasetName || "dataset")}-report</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <style>
            body { font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; background:#0b1020; color:#eceff4; padding:28px; }
            .container { max-width:900px; margin:0 auto; background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); padding:28px; border-radius:12px; box-shadow: 0 10px 40px rgba(2,6,23,0.6); }
            h1,h2,h3 { color:#fff; margin:8px 0 14px; }
            p, li, pre { color:#d6dbe6; line-height:1.5; }
            pre { background: rgba(255,255,255,0.03); padding:12px; border-radius:8px; overflow:auto; }
            img { display:block; margin:10px 0; max-width:100%; }
            .meta { color:#9aa4b2; font-size:0.9rem; margin-bottom:16px; }
            ul { margin-left:1.1rem; }
            table { width:100%; border-collapse:collapse; margin:12px 0; }
            table th, table td { border:1px solid rgba(255,255,255,0.05); padding:8px; text-align:left; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Data Sage Report — ${escapeHtml(datasetName || "Dataset")}</h1>
            <div class="meta">Generated: ${new Date().toLocaleString()}</div>
            <section>
              ${summaryHtml}
            </section>
            ${chartsHtml ? `<hr style="border:none;height:1px;background:rgba(255,255,255,0.04);margin:20px 0;" />` : ""}
            <section>
              ${chartsHtml}
            </section>
          </div>
        </body>
        </html>
      `;

      const blob = new Blob([htmlDoc], { type: "text/html;charset=utf-8" });
      const fileName = `${(datasetName || "dataset").replace(/\s+/g, "_")}_report.html`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download report failed:", err);
      alert("Failed to generate report. See console for details.");
    }
  }, [analysisResult, charts, datasetName]);


  const isAnalysisReady = useMemo(() => datasetFile && !analysisResult, [datasetFile, analysisResult]);
  const isReportReady = useMemo(() => !!analysisResult, [analysisResult]);
  const isChatReady = useMemo(() => !!datasetFile, [datasetFile]);

  
  useEffect(() => {
    const t = setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
    return () => clearTimeout(t);
  }, [messages, chartsClicked, isLoading]);


  return (
    <div className="flex-1 flex flex-col h-screen">
      {/* Hidden File Input */}
      <input
        type="file"
        id="file-input"
        style={{ display: 'none' }}
        onChange={handleFileChange}
        accept=".csv,.txt,.json"
      />

      {/* HEADER */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 flex items-center justify-center">
            <BarChart3 className="w-7 h-7 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">The Data Sage's Room</h1>
            <p className="text-gray-400 text-sm">Transform raw data into insights.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <button className="px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full text-sm font-medium">
            Explore Our AIs
          </button>

          <button
            className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-medium flex items-center gap-2"
            onClick={() => document.getElementById('file-input').click()}
            disabled={isLoading}
          >
            <Upload className="w-4 h-4" />
            Upload Data
          </button>

          {datasetName && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="px-3 py-1 bg-green-500/10 border border-green-500/30 text-green-400 rounded-full text-xs font-medium flex items-center gap-1"
            >
              Loaded: {datasetName}
              <X className="w-3 h-3 cursor-pointer ml-1" onClick={handleRemoveFile} />
            </motion.div>
          )}
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2
              ${isAnalysisReady ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' : 'bg-gray-700/50 text-gray-500 border border-gray-600'}`}
            onClick={handleAnalyzeDataset}
            disabled={!isAnalysisReady}
          >
            <Table className="w-4 h-4" />
            Analyze Dataset
          </button>

          <button
            className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2
              ${isReportReady && !edaSummaryClicked ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' : 'bg-gray-700/50 text-gray-500 border border-gray-600'}`}
            onClick={handleEdaSummary}
            disabled={!isReportReady || edaSummaryClicked}
          >
            <Search className="w-4 h-4" />
            EDA Summary
          </button>

          <button
            className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2
              ${isReportReady && !chartsClicked ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' : 'bg-gray-700/50 text-gray-500 border border-gray-600'}`}
            onClick={handleGenerateChart}
            disabled={!isReportReady || chartsClicked}
          >
            <PieChart className="w-4 h-4" />
            View Charts ({charts.length})
          </button>

          <button
            className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2
              ${isReportReady ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' : 'bg-gray-700/50 text-gray-500 border border-gray-600'}`}
            onClick={handleDownloadReport}
            disabled={!isReportReady}
          >
            <Download className="w-4 h-4" />
            Download Report
          </button>
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <BarChart3 className="w-16 h-16 text-blue-400/50 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">
              Welcome to The Data Sage's Room
            </h2>
            <p className="text-gray-400 max-w-md mx-auto">
              Upload a dataset or ask any data-related question. I can analyze your dataset, summarize insights, generate charts, and answer questions based on your data.
            </p>
          </motion.div>
        ) : (
          messages.map((msg, index) => {
            if (msg.type === 'charts') {
              return (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {msg.charts && msg.charts.length > 0 ? msg.charts.map((chart, idx) => (
                    <div
                      key={chart.id || chart.title || idx}
                      className="bg-white/5 border border-white/10 p-4 rounded-xl shadow-lg hover:shadow-blue-500/20 transition cursor-pointer"
                      onClick={() => setSelectedChart(chart)}
                    >
                      <div className="w-full flex justify-center">
                        <img
                          src={`data:image/png;base64,${chart.b64}`}
                          alt={chart.title}
                          className="rounded-lg max-h-72 w-auto object-contain"
                        />
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const link = document.createElement("a");
                          link.href = `data:image/png;base64,${chart.b64}`;
                          link.download = `${datasetName || "chart"}_${idx + 1}.png`;
                          link.click();
                        }}
                        className="mt-4 w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-sm py-2 rounded-lg font-medium"
                      >
                        Download Chart
                      </button>
                    </div>
                  )) : (
                    <div className="text-gray-400">No charts available.</div>
                  )}
                </div>
              );
            }

            // Normal text messages
            return (
              <DataSageMessage
                key={index}
                message={msg.content}
                isUser={msg.role === 'user'}
                confidence={msg.confidence}
              />
            );
          })
        )}

        {isLoading && (
          <div className="flex items-center gap-2 text-gray-400">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={chatEndRef} />
      </div>

      {/* INPUT */}
      <div className="p-6 border-t border-white/10">
        <DataSageChatInput
          onSend={handleSend}
          placeholder={isChatReady ? "Ask Data Sage…" : "Upload and analyze your data first…"}
          isLoading={isLoading}
        />
      </div>

      {/* CHART MODAL (placeholder) */}
      <AnimatePresence>
        {selectedChart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50"
            onClick={() => setSelectedChart(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative p-6 bg-[#111827] rounded-2xl border border-white/10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                className="absolute top-3 right-3 text-white/70 hover:text-white text-xl"
                onClick={() => setSelectedChart(null)}
              >
                ✕
              </button>

              {/* Large Chart View */}
              <img
                src={`data:image/png;base64,${selectedChart.b64}`}
                className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl"
                alt={selectedChart.title || "chart"}
              />

              {/* Download inside modal */}
              <button
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = `data:image/png;base64,${selectedChart.b64}`;
                  link.download = `${datasetName || "chart"}_fullscreen.png`;
                  link.click();
                }}
                className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg"
              >
                Download This Chart
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
