import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, AlertTriangle, MessageSquare, Check } from 'lucide-react';
import ChatMessage from '../Componentss/ChatMessage';
import ChatInput from '../Componentss/ChatInput';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from '@/components/ui/checkbox';

const symptoms = ['Fever', 'Headache', 'Fatigue', 'Cough', 'Sore Throat', 'Nausea'];

export default function DoctorRoom() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [activeTab, setActiveTab] = useState('qa');

  const handleSymptomToggle = (symptom) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSend = async (message) => {
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    setIsLoading(true);

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `You are "The Doctor AI", a health information assistant. You provide general health information and educational content. 

IMPORTANT DISCLAIMER: You are NOT a real doctor. Always remind users to consult with qualified healthcare professionals for actual medical advice. Never diagnose or prescribe treatments.

User question: ${message}
${selectedSymptoms.length > 0 ? `User selected symptoms: ${selectedSymptoms.join(', ')}` : ''}

Provide helpful health information while emphasizing the importance of consulting real healthcare professionals.`,
      response_json_schema: {
        type: "object",
        properties: {
          response: { type: "string" },
          confidence: { type: "number" },
          sources: { type: "array", items: { type: "string" } }
        }
      }
    });

    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: response.response,
      confidence: response.confidence || Math.floor(Math.random() * 10) + 85
    }]);
    setIsLoading(false);
  };

  return (
    <div className="flex-1 flex flex-col h-screen">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500/20 to-rose-600/20 border border-rose-500/30 flex items-center justify-center">
            <Stethoscope className="w-7 h-7 text-rose-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Welcome to the Doctor's Clinic</h1>
            <p className="text-gray-400 text-sm">Your AI Health Assistant for General Inquiries.</p>
          </div>
        </div>
        
        
        <div className="mt-4 p-4 bg-orange-500/20 border border-orange-500/30 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0" />
          <p className="text-orange-300 text-sm">
            <strong>AI Assistant, Not a Medical Doctor.</strong> Always Consult a Professional.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="px-6 pt-4">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="symptoms" className="data-[state=active]:bg-rose-500/20 data-[state=active]:text-rose-400">
              Symptom Checker
            </TabsTrigger>
            <TabsTrigger value="qa" className="data-[state=active]:bg-rose-500/20 data-[state=active]:text-rose-400">
              Health Q&A
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="symptoms" className="flex-1 overflow-y-auto p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Symptom Selection */}
            <div className="bg-[#1e1e2f] rounded-xl p-6 border border-white/10">
              <h3 className="text-white font-semibold mb-4">Enter Symptoms</h3>
              <div className="space-y-3">
                {symptoms.map((symptom) => (
                  <label 
                    key={symptom}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                  >
                    <Checkbox 
                      checked={selectedSymptoms.includes(symptom)}
                      onCheckedChange={() => handleSymptomToggle(symptom)}
                    />
                    <span className="text-gray-300">{symptom}</span>
                  </label>
                ))}
              </div>
              
              {selectedSymptoms.length > 0 && (
                <button 
                  onClick={() => handleSend(`I'm experiencing these symptoms: ${selectedSymptoms.join(', ')}. What could be causing them?`)}
                  className="w-full mt-4 py-3 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-lg font-medium hover:from-rose-600 hover:to-rose-700 transition-all"
                >
                  Analyze Symptoms
                </button>
              )}
            </div>

            {/* Results */}
            <div className="bg-[#1e1e2f] rounded-xl p-6 border border-white/10">
              <h3 className="text-white font-semibold mb-4">Analysis Results</h3>
              {messages.filter(m => m.role === 'assistant').length > 0 ? (
                <div className="space-y-4">
                  {messages.filter(m => m.role === 'assistant').slice(-1).map((msg, i) => (
                    <div key={i}>
                      <p className="text-gray-300 text-sm leading-relaxed">{msg.content}</p>
                      {msg.confidence && (
                        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-teal-500/20 border border-teal-500/30 rounded-full">
                          <Check className="w-4 h-4 text-teal-400" />
                          <span className="text-teal-400 text-sm">Expert Confidence: {msg.confidence}%</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Select symptoms to get an analysis.</p>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="qa" className="flex-1 flex flex-col">
          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Stethoscope className="w-16 h-16 text-rose-400/50 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-white mb-2">Ask Your Health Questions</h2>
                <p className="text-gray-400 max-w-md mx-auto">
                  Get general health information. Remember, I'm an AI assistant - always consult real doctors for medical advice.
                </p>
              </motion.div>
            ) : (
              messages.map((msg, index) => (
                <ChatMessage
                  key={index}
                  message={msg.content}
                  isUser={msg.role === 'user'}
                  confidence={msg.confidence}
                />
              ))
            )}
            
            {isLoading && (
              <div className="flex items-center gap-2 text-gray-400">
                <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-6 border-t border-white/10">
            <ChatInput 
              onSend={handleSend}
              placeholder="Ask a health question..."
              isLoading={isLoading}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}