import React, { useState } from 'react';
import { motion } from 'framer-motion';
import CosmicBackground from '@/app-components/CosmicBackground.jsx';
import Header from '@/app-components/Header.jsx';
import Footer from '@/app-components/Footer.jsx';
import { Input } from "@/components/ui/input.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Mail, Send, Check, PhoneCall } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setIsSubmitted(true);
        setFormData({ name: '', email: '', message: '' });
      } else {
        alert("Failed to send feedback. Please try again.");
      }
    } catch (err) {
      console.error("Feedback error:", err);
      alert("Server error. Please try again later.");
    }

    setLoading(false);
  };

  return (
    <CosmicBackground>
      <Header />

      {/* MAIN SECTION */}
      <main className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">

          {/* TITLE */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10 sm:mb-12 px-2"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
              Contact Us
            </h1>
            <p className="text-gray-300 text-base sm:text-lg px-2">
              Have questions or feedback? We'd love to hear from you.
            </p>
          </motion.div>

          {/* CONTACT FORM CARD */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 sm:p-8"
          >
            {isSubmitted ? (
              
              <div className="text-center py-12 px-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-7 h-7 sm:w-8 sm:h-8 text-green-400" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  Your feedback has been sent to Sarthak Jain
                </h2>
                <p className="text-gray-400 text-sm sm:text-base">
                  Thank you for reaching out. We'll get back to you soon.
                </p>
              </div>

            ) : (
              
              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">

                {/* NAME */}
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

                {/* EMAIL */}
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

                {/* MESSAGE */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Message</label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="bg-white/5 border-white/20 text-white placeholder-gray-500 focus:border-purple-500 min-h-[140px] sm:min-h-[160px]"
                    placeholder="Your message..."
                    required
                  />
                </div>

                {/* SUBMIT BUTTON */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 
                  hover:from-purple-600 hover:to-purple-700 text-white py-4 sm:py-6 text-sm sm:text-base"
                >
                  {loading ? "Sending..." : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>

              </form>
            )}
          </motion.div>

          {/* CONTACT INFO */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mt-12 text-center sm:text-left"
          >
            <div className="flex items-center gap-2 text-gray-400 text-sm sm:text-base">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>sarthakjain4452@gmail.com</span>
            </div>

            <div className="flex items-center gap-2 text-gray-400 text-sm sm:text-base">
              <PhoneCall className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>+91 8273909931</span>
            </div>
          </motion.div>

        </div>
      </main>

      <Footer />
    </CosmicBackground>
  );
}
