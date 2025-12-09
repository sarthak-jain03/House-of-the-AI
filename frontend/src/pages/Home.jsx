import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import CosmicBackground from '../app-components/CosmicBackground.jsx';
import Header from '../app-components/Header.jsx';
import Footer from '../app-components/Footer.jsx';
import AICard from '../app-components/AICard.jsx';
import HowItWorks from '../app-components/HowItWorks.jsx';

const aiAssistants = [
  { type: 'poet', title: 'The Poet', description: 'Crafts imaginative stories and verses.' },
  { type: 'code_whisperer', title: 'The Code Whisperer', description: 'Assists in writing and reviewing code.' },
  { type: 'data_sage', title: 'The Data Sage', description: 'Analyzes data and generates insights.' },
  { type: 'story_weaver', title: 'The Story Weaver', description: 'Develops narratives and scripts.' }
];

export default function Home() {
  return (
    <CosmicBackground>
      <Header />

      {/* Hero Section */}
      <section className="py-20 md:py-32 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Welcome to the House of the AI
          </h1>
          <p className="text-gray-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            Where Specialized Intelligences Solve Your Toughest Challenges.
          </p>

          <Link
            to="/ai"
            className="inline-flex items-center gap-2 px-8 py-4 
            bg-gradient-to-r from-orange-500 to-orange-600 
            hover:from-orange-600 hover:to-orange-700 
            text-white rounded-full text-lg font-semibold transition-all 
            shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105"
          >
            Explore Our AIs
          </Link>
        </motion.div>
      </section>

      {/* AI Cards Section */}
      <section className="py-20 px-6">
        <div className="w-full max-w-[1400px] mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
          >
            <h2 className="text-white text-3xl font-bold mb-3">
              Discover the Residents of Our House
            </h2>
            <p className="text-gray-400 mb-10">
              Meet specialized AIs that excel in their unique domains.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {aiAssistants.map((ai, index) => (
              <AICard
                key={ai.type}
                type={ai.type}
                title={ai.title}
                description={ai.description}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <HowItWorks />

      {/* Footer */}
      <Footer />
    </CosmicBackground>
  );
}
