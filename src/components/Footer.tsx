import React, { useState } from 'react';
import { Mail, ArrowUp, Send, Check, Heart, Sparkles } from 'lucide-react';
import { InteractiveSticker } from './InteractiveSticker';
import { sounds } from '../utils/soundEffects';

interface FooterProps {
  onNavigateHome: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateHome }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    sounds.playChime();
    setSubmitted(true);
    setTimeout(() => {
      setEmail('');
      setMessage('');
      setSubmitted(false);
    }, 4000);
  };

  const scrollToTop = () => {
    sounds.playBleep(700);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="contact" className="border-t border-white/10 bg-[#06070f] pt-20 pb-12 px-6 relative overflow-hidden">
      {/* Background ambient pool */}
      <div className="absolute bottom-0 right-1/4 w-96 h-96 ambient-glow-purple pointer-events-none opacity-40" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-white/10">
          {/* Brand & Mission (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  sounds.playBleep(800);
                  onNavigateHome();
                }}
                className="text-3xl font-black font-display tracking-widest text-white hover:text-[#a3e635] transition-colors cursor-pointer text-left"
              >
                ARNOB
              </button>
              <InteractiveSticker label="Built with Passion" emoji="❤️" colorScheme="coral" rotation="-rotate-3" />
            </div>

            <p className="text-slate-300 text-sm leading-relaxed max-w-sm">
              My creative playground where software, 3D spatial geometry, algorithms, and design turn into tangible experiments.
            </p>

            <div className="pt-2 flex items-center gap-3">
              <a
                href="https://github.com/Arnobmm"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sounds.playClick()}
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-[#8b5cf6] hover:text-white border border-white/15 flex items-center justify-center text-slate-200 transition-all cursor-pointer shadow-md hover:scale-110"
                aria-label="GitHub Profile"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sounds.playClick()}
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-[#06b6d4] hover:text-black border border-white/15 flex items-center justify-center text-slate-200 transition-all cursor-pointer shadow-md hover:scale-110"
                aria-label="Twitter Profile"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="mailto:arnobjj22@gmail.com"
                onClick={() => sounds.playClick()}
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-[#a3e635] hover:text-black border border-white/15 flex items-center justify-center text-slate-200 transition-all cursor-pointer shadow-md hover:scale-110"
                aria-label="Email Arnob"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Nav (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-mono-code uppercase tracking-wider text-[#06b6d4] font-bold mb-3">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm text-slate-300 font-medium">
              <li>
                <a href="#featured" onClick={() => sounds.playBleep(600)} className="hover:text-white transition-colors">
                  Featured Creation
                </a>
              </li>
              <li>
                <a href="#showcase" onClick={() => sounds.playBleep(600)} className="hover:text-white transition-colors">
                  Things I've Created
                </a>
              </li>
              <li>
                <a href="#exploring" onClick={() => sounds.playBleep(600)} className="hover:text-white transition-colors">
                  Currently Exploring
                </a>
              </li>
              <li>
                <a href="#about" onClick={() => sounds.playBleep(600)} className="hover:text-white transition-colors">
                  About Arnob
                </a>
              </li>
            </ul>
          </div>

          {/* Direct Note Form (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs font-mono-code uppercase tracking-wider text-[#f43f5e] font-bold mb-3">
              Drop a Message
            </h4>
            <form onSubmit={handleSubmit} className="space-y-2.5">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@domain.com"
                className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/15 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#a3e635] transition-all"
              />
              <textarea
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Say hello, share feedback, or propose an idea!"
                className="w-full px-4 py-2 rounded-xl bg-white/10 border border-white/15 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#a3e635] transition-all"
              />
              <button
                type="submit"
                disabled={submitted}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-extrabold text-xs tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] disabled:opacity-50"
              >
                {submitted ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Note Sent! Thanks</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Closing Sub-Footer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono-code text-slate-400">
          <div className="flex items-center gap-2 font-medium">
            <span>Made with curiosity, creativity and code.</span>
          </div>
          <div className="flex items-center gap-6">
            <span>&copy; {new Date().getFullYear()} ARNOB</span>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 hover:text-[#a3e635] transition-colors cursor-pointer font-bold"
            >
              <span>Back to top</span>
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
