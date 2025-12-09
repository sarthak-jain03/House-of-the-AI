import React from 'react';
import { motion } from 'framer-motion';
import { MousePointer2, MessageSquare, Lightbulb } from 'lucide-react';

const steps = [
  {
    icon: MousePointer2,
    title: '1. Choose Your AI',
    description: 'Select from our specialized AI assistants'
  },
  {
    icon: MessageSquare,
    title: '2. Ask Your Question',
    description: 'Type your query or upload files'
  },
  {
    icon: Lightbulb,
    title: '3. Get Expert Insights',
    description: 'Receive intelligent, tailored responses'
  }
];

export default function HowItWorks() {
  return (
    <section className="py-20 w-full px-6 bg-[#1a1a2e]/80">
      <div className="max-w-5xl mx-auto">
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-white text-2xl font-bold mb-12"
        >
          How It Works
        </motion.h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-4">
                <step.icon className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-400 text-sm">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}