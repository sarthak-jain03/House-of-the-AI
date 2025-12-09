import React from 'react';
import { motion } from 'framer-motion';
import CosmicBackground from '@/app-components/CosmicBackground.jsx';
import Header from '@/app-components/Header.jsx';
import Footer from '@/app-components/Footer.jsx';
import { Brain, Sparkles, Shield, Zap, Code2, Rocket, User } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'Specialized AI Agents',
    description: 'Each AI in our house is expertly trained for its specific domain, ensuring the best possible assistance.'
  },
  {
    icon: Sparkles,
    title: 'Creative Intelligence',
    description: 'From poetry to code, our AIs combine technical precision with creative flair.'
  },
  {
    icon: Shield,
    title: 'Safe & Reliable',
    description: 'Built with safety in mind, our AIs provide accurate information with appropriate disclaimers.'
  },
  {
    icon: Zap,
    title: 'Instant Responses',
    description: 'Get immediate, high-quality responses powered by cutting-edge AI technology.'
  }
];

export default function About() {
  return (
    <CosmicBackground>
      <Header />

      <main className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">About House of the AI</h1>
            <p className="text-gray-300 text-lg leading-relaxed">
              House of the AI is a platform where specialized AI assistants come together to solve your toughest challenges.
              Each "room" in our house hosts a unique AI expert, trained to excel in its specific domain.
            </p>
          </motion.div>

          
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>

         
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-10 text-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-purple-500/20 flex items-center justify-center">
              <User className="w-8 h-8 text-purple-400" />
            </div>

            <h2 className="text-3xl font-bold text-white mb-4">About the Developer</h2>

            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              Hi, I’m <span className="text-purple-400 font-bold">Sarthak Jain</span>, a passionate 
Software Developer from IIIT Bhopal. 
I love building intelligent, end-to-end systems that combine beautiful front-end 
experiences with powerful AI capabilities.

            </p>

           
            <p className="text-gray-300 text-lg leading-relaxed mb-10 italic">
              “I believe that AI should be accessible, specialized, and helpful.
              <strong>"The House of the AI"</strong> is my vision to create a collaborative space
              where humans and AI work together to solve problems, create art,
              write code, and explore new possibilities.”
            </p>


          </motion.div>

        </div>
      </main>

      <Footer />
    </CosmicBackground>
  );
}
