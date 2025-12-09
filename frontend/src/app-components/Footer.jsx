import React from 'react';
import { Twitter, Linkedin, Instagram, Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="z-10 border-t border-white/10 py-6 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-gray-400 text-sm">Copyright © 2025 House of the AI</p>
        
        <nav className="flex items-center gap-6">
          <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
          <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a>
        </nav>
        
        <div className="flex items-center gap-4">
          <a href="https://x.com/Sarthak__jain_" target='_blank' className="text-gray-400 hover:text-white transition-colors">
            <Twitter className="w-5 h-5" />
          </a>
          <a href="https://www.linkedin.com/in/sarthak-jain-3a2b38276/" target='_blank' className="text-gray-400 hover:text-white transition-colors">
            <Linkedin className="w-5 h-5" />
          </a>
          <a href="https://github.com/sarthak-jain03/" target='_blank' className="text-gray-400 hover:text-white transition-colors">
            <Github className="w-5 h-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}