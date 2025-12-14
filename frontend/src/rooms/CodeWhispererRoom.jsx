import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Code2, Sparkles, Eye, MessageSquare, TestTube, Bug, RefreshCw, Download, Send, Wrench, X } from 'lucide-react';
import CodeWhispererMessage from '@/app-components/CodeWhispererMessage.jsx';


const API_URL = `${import.meta.env.VITE_INFERENCE_API_URL}/code_chat`;
// const API_URL = "http://127.0.0.1:5000/code_chat"; 
// const SAVE_CHAT_URL =  "http://localhost:8080/api/chats/save";
const SAVE_CHAT_URL =  `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080'}/api/chats/save`;

const tools = [
  { icon: Eye, label: 'Review Code', color: 'bg-teal-500/20 text-teal-400 border-teal-500/30', action: 'review' },
  { icon: MessageSquare, label: 'Explain Code', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', action: 'explain' },
  { icon: TestTube, label: 'Generate Tests', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', action: 'test' },
  { icon: Bug, label: 'Fix Bugs', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', action: 'fix' },
  { icon: RefreshCw, label: 'Refactor', color: 'bg-pink-500/20 text-pink-400 border-pink-500/30', action: 'refactor' },
  
];



// Save chat to MongoDB
const saveChatToDB = async (userMessage, assistantResponse) => {
  try {
    await fetch(SAVE_CHAT_URL, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        aiType: "coder",
        message: userMessage,
        response: assistantResponse
      })
    });
  } catch (err) {
    console.error("Error saving coder chat:", err);
  }
};


// Wrap code 
const wrapCode = (code, lang = 'cpp') => {
  const safe = String(code || '').replace(/\r\n/g, '\n').replace(/\u200B/g, '');
  return `\`\`\`${lang}\n${safe.trim()}\n\`\`\``;
};

// Tool prompt templates
const toolPrompts = {
  review: (code) => `
You are a senior code reviewer. Provide a complete, structured review with the following sections:
1) High-level summary
2) Code quality issues
3) Potential bugs and edge cases
4) Performance concerns
5) Security vulnerabilities
6) Best practices violations
Keep explanations short but precise.
Don't provide code changes, only the review.

Code to review:
${wrapCode(code, 'cpp')}
`,

  explain: (code) => `
You are an expert programming instructor. Explain the code in easy way, short and precise:
Povide the explanation in a simple way.
Don't display the code again, just explain it.

Code:
${wrapCode(code, 'cpp')}
`,

  test: (code) => `
You are an experienced test engineer. Generate comprehensive tests for the provided code in the same language asked by the user:
- Unit tests for each function
- Edge and boundary cases
- Negative/error cases
- Integration scenarios if applicable

Code to test:
${wrapCode(code, 'cpp')}
`,

  fix: (code) => `
You are a debugging expert. Find and fix all bugs in the code:
- List each bug with location and explanation
- Show the corrected code with fixes applied
- Explain why the fixes solve the issue

Code to fix:
${wrapCode(code, 'cpp')}
`,

  refactor: (code) => `
You are an expert refactoring engineer. Refactor the code to improve:
- Readability
- Naming and structure
- Modularity and maintainability

Return a short summary of changes.

Code to refactor:
${wrapCode(code, 'cpp')}
`
};


const setupCopyFunction = () => {
  if (typeof window.copyCode === 'function') return;
  window.copyCode = function(buttonElement) {
    try {
      const container = buttonElement.closest('.code-response') || buttonElement.closest('[data-code-response]');
      if (!container) return;
      let codeNode = container.querySelector('pre, code, .code-output');
      if (!codeNode) codeNode = container;
      const text = codeNode.textContent || codeNode.innerText || '';
      if (!text) return;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
          const original = buttonElement.innerHTML;
          buttonElement.innerHTML = '✓ Copied';
          setTimeout(() => (buttonElement.innerHTML = original), 1400);
        }).catch(() => {
          buttonElement.innerHTML = 'Copy failed';
          setTimeout(() => (buttonElement.innerHTML = original), 1400);
        });
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand('copy');
          const original = buttonElement.innerHTML;
          buttonElement.innerHTML = '✓ Copied';
          setTimeout(() => (buttonElement.innerHTML = original), 1400);
        } catch {
          buttonElement.innerHTML = 'Copy failed';
          setTimeout(() => (buttonElement.innerHTML = original), 1400);
        }
        document.body.removeChild(ta);
      }
    } catch (err) {
      console.error('copyCode error', err);
    }
  };
};

export default function CodeWhispererRoom() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Welcome! I'm the Code Whisperer. I can analyze your code, generate new functions, and help you debug. Ask a question to start."
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  const chatEndRef = useRef(null);

  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);

  useEffect(() => {
    setupCopyFunction();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const callModel = async (prompt) => {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => 'No details');
        throw new Error(`Model call failed: ${res.status} ${txt}`);
      }
      const data = await res.json();
      return data.response;
    } catch (err) {
      console.error('callModel error', err);
      return `Error calling model: ${err.message || err}`;
    }
  };

  const handleToolAction = async (action) => {
    if (action === 'export') {
      handleExport();
      return;
    }

    if (!codeSnippet.trim()) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: " Please paste some code in the Code Editor first before using this tool.",
        confidence: 0
      }]);
      return;
    }

    const toolLabel = tools.find(t => t.action === action)?.label || action;
    const prompt = toolPrompts[action](codeSnippet);

    setMessages(prev => [...prev, { role: 'user', content: `[${toolLabel}] on current code snippet` }]);
    setIsLoading(true);
    setMobileToolsOpen(false);

    try {
      const modelOutput = await callModel(prompt);

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: modelOutput,
        confidence: 97
      }]);

      // SAVE CHAT
      await saveChatToDB(`[${toolLabel}] on code`, modelOutput);

    } catch (err) {
      console.error('Tool action error', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Error: Could not process your request. Please try again.",
        confidence: 0
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    let codeToExport = codeSnippet || '';
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg.role === 'assistant' && typeof msg.content === 'string') {
        const codeMatch = msg.content.match(/```[\w]*\n?([\s\S]*?)```/);
        if (codeMatch) {
          codeToExport = codeMatch[1].trim();
          break;
        }
      }
    }

    if (!codeToExport) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "No code available to export. Generate or paste some code first.",
        confidence: 0
      }]);
      return;
    }

    const blob = new Blob([codeToExport], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'code_whisperer_export.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setMessages(prev => [...prev, {
      role: 'assistant',
      content: "Code exported successfully! Check your downloads folder.",
      confidence: 100
    }]);
  };

  const handleSend = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage;
    setInputMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const prompt = userMessage;
      const modelOutput = await callModel(prompt);

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: modelOutput,
        confidence: 95
      }]);

      // SAVE CHAT
      await saveChatToDB(userMessage, modelOutput);

    } catch (err) {
      console.error('handleSend error', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Error: Could not reach the Code Whisperer backend.",
        confidence: 0
      }]);
    } finally {
      setIsLoading(false);
      setMobileToolsOpen(false);
    }
  };

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#110E1C' }}>
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(32, 201, 151, 0.2), rgba(32, 201, 151, 0.1))',
                border: '1px solid rgba(32, 201, 151, 0.3)'
              }}
            >
              <Code2 className="w-7 h-7" style={{ color: '#20C997' }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white hidden sm:block">The Code Whisperer Room</h1>
              <h1 className="text-xl font-bold text-white sm:hidden">The Code Whisperer Room</h1>
              <p className="text-gray-400 text-sm sm:block hidden md:block">
                Your expert partner for static analysis, code generation, and debugging.
              </p>
              <p className="text-gray-400 text-sm md:hidden">
    Your AI coding partner.
  </p>

            </div>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <button
              className="px-5 py-2 text-white rounded-full text-sm font-medium flex items-center gap-2"
              style={{ background: 'linear-gradient(to right, #20C997, #1BA87C)' }}
            >
              
              Explore Our AIs
            </button>
            <button
              className="px-5 py-2 text-white rounded-full text-sm font-medium transition-colors flex items-center gap-2"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              onClick={() => setMessages([{
                role: 'assistant',
                content: "Welcome! I'm the Code Whisperer. I can analyze your code, generate new functions, and help you debug. Paste your code in the editor on the right, then use the tools or send me a message!"
              }])}
            >
              <Sparkles className="w-4 h-4" />
              New 
            </button>

            <button
              onClick={() => setMobileToolsOpen(true)}
              className="ml-auto lg:hidden px-3 py-2 text-white rounded-lg bg-white/10 hover:bg-white/20"
            >
              <Wrench className="w-5 h-5" />
            </button>
          </div>
        </div>

        

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, index) => (
            <CodeWhispererMessage
              key={index}
              message={msg.content}
              isUser={msg.role === 'user'}
              confidence={msg.confidence || "95%"}
              toolsUsed="Code Whisperer"
            />
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-gray-400 p-4">
              <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#20C997' }} />
              <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#20C997', animationDelay: '0.1s' }} />
              <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#20C997', animationDelay: '0.2s' }} />
              <span className="ml-2 text-sm">Code Whisperer is thinking...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <div className="flex gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Ask The Code Whisperer anything about code or ask for a program..."
              className="flex-1 px-4 py-3 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2"
              style={{
                backgroundColor: '#1B172C',
                border: '1px solid rgba(255,255,255,0.1)',
                focusRing: '#20C997'
              }}
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !inputMessage.trim()}
              className="px-5 py-3 rounded-xl text-white font-medium flex items-center gap-2 transition-all disabled:opacity-50"
              style={{
                background: 'linear-gradient(to right, #8A4DC4, #A072D4)',
                boxShadow: '0 4px 15px rgba(138, 77, 196, 0.4)'
              }}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Code Editor Sidebar */}
      <div
        className="w-96 border-l p-6 hidden lg:flex flex-col"
        style={{
          borderColor: 'rgba(255,255,255,0.1)',
          backgroundColor: '#0f0f1a'
        }}
      >
        <h2 className="text-white font-semibold mb-4">Code Editor & Tools</h2>

        <div className="mb-6 flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-gray-400 text-sm">Paste Your Code</span>
            <span
              className="px-2 py-0.5 rounded text-xs"
              style={{ backgroundColor: 'rgba(138, 77, 196, 0.2)', color: '#A072D4' }}
            >
              {codeSnippet ? 'Has Code' : 'Empty'}
            </span>
          </div>
          <textarea
            value={codeSnippet}
            onChange={(e) => setCodeSnippet(e.target.value)}
            placeholder={`// Paste your code here...`}
            className="w-full h-64 p-4 rounded-lg font-mono text-sm text-gray-300 placeholder-gray-600 resize-none focus:outline-none focus:ring-2"
            style={{
              backgroundColor: '#1a1a2e',
              border: '1px solid rgba(255,255,255,0.1)',
              focusRing: '#20C997'
            }}
          />
        </div>

        <div>
          <h3 className="text-gray-400 text-sm mb-3">Analysis Tools</h3>
          <div className="grid grid-cols-2 gap-3">
            {tools.map((tool, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleToolAction(tool.action)}
                disabled={isLoading}
                className={`p-4 rounded-xl border ${tool.color} flex flex-col items-center gap-2 transition-all hover:bg-opacity-30 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <tool.icon className="w-6 h-6" />
                <span className="text-xs font-medium">{tool.label}</span>
              </motion.button>
            ))}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleToolAction('export')}
              disabled={isLoading}
              className="p-4 rounded-xl border bg-green-500/10 text-green-300 flex flex-col items-center gap-2 transition-all hover:bg-opacity-30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-6 h-6" />
              <span className="text-xs font-medium">Export Code</span>
            </motion.button>
          </div>
        </div>


      </div>


      {mobileToolsOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
          
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25 }}
            className="absolute bottom-0 left-0 right-0 bg-[#0f0f1a] rounded-t-2xl p-6 border-t border-white/10 max-h-[80vh] overflow-y-auto"
          >
            {/* Close Button */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white text-lg font-semibold">Tools & Code Editor</h2>
              <button onClick={() => setMobileToolsOpen(false)}>
                <X className="w-6 h-6 text-gray-300" />
              </button>
            </div>

            {/* Code Input */}
            <textarea
              value={codeSnippet}
              onChange={(e) => setCodeSnippet(e.target.value)}
              className="w-full h-40 p-3 bg-[#1a1a2e] text-gray-100 rounded-lg border border-white/10 mb-5"
              placeholder="// Paste code here..."
            />

            {/* Tools */}
            <div className="grid grid-cols-2 gap-3 pb-4">
              {tools.map((tool, i) => (
                <motion.button
                  key={i}
                  onClick={() => handleToolAction(tool.action)}
                  whileTap={{ scale: 0.97 }}
                  className={`p-4 rounded-xl border ${tool.color} flex flex-col items-center`}
                >
                  <tool.icon className="w-6 h-6" />
                  <span className="text-xs mt-1">{tool.label}</span>
                </motion.button>
              ))}

              <motion.button
                onClick={() => handleToolAction("export")}
                whileTap={{ scale: 0.97 }}
                className="p-4 rounded-xl border bg-green-500/10 text-green-300 flex flex-col items-center"
              >
                <Download className="w-6 h-6" />
                <span className="text-xs mt-1">Export Code</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}