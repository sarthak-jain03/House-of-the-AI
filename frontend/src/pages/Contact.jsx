import React, { useState } from 'react';
import { motion } from 'framer-motion';
import CosmicBackground from '@/app-components/CosmicBackground.jsx';
import Header from '@/app-components/Header.jsx';
import Footer from '@/app-components/Footer.jsx';
import { Input } from "@/components/ui/input.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Mail, MessageSquare, Send, Check, PhoneCall } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    setIsSubmitted(true);
  };

  return (
    <CosmicBackground>
      <Header />
      
      <main className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Contact Us</h1>
            <p className="text-gray-300 text-lg">
              Have questions or feedback? We'd love to hear from you.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8"
          >
            {isSubmitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Message Sent!</h2>
                <p className="text-gray-400">Thank you for reaching out. We'll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Name</label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-white/5 border-white/20 text-white placeholder-gray-500 focus:border-purple-500"
                    placeholder="Your name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-white/5 border-white/20 text-white placeholder-gray-500 focus:border-purple-500"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Message</label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="bg-white/5 border-white/20 text-white placeholder-gray-500 focus:border-purple-500 min-h-[150px]"
                    placeholder="Your message..."
                    required
                  />
                </div>
                
                <Button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-6"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </form>
            )}
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center gap-8 mt-12"
          >
            <div className="flex items-center gap-3 text-gray-400">
              <Mail className="w-5 h-5" />
              <span>sarthakjain4452@gmail.com</span>
            </div>
            <div className="flex items-center gap-3 text-gray-400">
              <PhoneCall className="w-5 h-5" />
              <span>+91 8273909931</span>
            </div>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </CosmicBackground>
  );
}