import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const gradients = {
  poet: 'from-purple-600/80 to-purple-800/80',
  code_whisperer: 'from-teal-600/80 to-teal-800/80',
  data_sage: 'from-blue-600/80 to-blue-800/80',
  story_weaver: 'from-orange-600/80 to-orange-800/80',
  doctor: 'from-rose-600/80 to-rose-800/80'
};

const icons = {
  poet: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 19l7-7 3 3-7 7-3-3z" />
      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
      <path d="M2 2l7.586 7.586" />
    </svg>
  ),
  code_whisperer: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
    </svg>
  ),
  data_sage: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 3v18h18" />
      <path d="M18 17V9M13 17V5M8 17v-3" />
    </svg>
  ),
  story_weaver: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </svg>
  ),
  doctor: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2v20M2 12h20" />
      <rect x="5" y="5" width="14" height="14" rx="2" />
    </svg>
  )
};

export default function AICard({ type, title, description, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      
      <Link to={`/ai?ai=${type}`}>
        <div className={`relative group rounded-2xl p-6 bg-gradient-to-br ${gradients[type]} backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer`}>
          
         
          <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center text-white mb-4 group-hover:bg-white/20 transition-colors">
            {icons[type]}
          </div>

         
          <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
          <p className="text-white/70 text-sm leading-relaxed mb-4">{description}</p>

         
          <div className="flex items-center gap-2 text-white/80 text-sm font-medium group-hover:text-white transition-colors">
            <span>Enter Room</span>
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>

        </div>
      </Link>
    </motion.div>
  );
}
