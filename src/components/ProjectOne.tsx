import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

interface ProjectOneProps {
  onBack: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
}

const particleColors = ['#ff00ff', '#00ffff', '#9d00ff', '#00ff66'];

export const ProjectOne: React.FC<ProjectOneProps> = ({ onBack }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  // Contact form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [formSent, setFormSent] = useState(false);

  // Generate particles on mount
  useEffect(() => {
    const generated: Particle[] = [];
    for (let i = 0; i < 50; i++) {
      generated.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2,
        color: particleColors[Math.floor(Math.random() * particleColors.length)],
        duration: Math.random() * 10 + 5,
        delay: Math.random() * 5,
      });
    }
    setParticles(generated);
  }, []);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSent(true);
    setTimeout(() => {
      setName('');
      setEmail('');
      setMessage('');
      setFormSent(false);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-[#070a15] text-white font-['Quicksand'] relative overflow-x-hidden selection:bg-pink-500 selection:text-white">
      {/* Floating Back to Portfolio Button */}
      <button
        onClick={onBack}
        className="fixed bottom-6 left-6 z-50 flex items-center space-x-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-medium text-sm transition-all duration-300 hover:-translate-y-1 shadow-[0_0_15px_rgba(0,255,255,0.3)] cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        <span>Back to Portfolio</span>
      </button>

      {/* Side Menu & Hamburger Toggle */}
      <nav className="fixed top-0 right-0 z-50 p-5">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          className={`w-12 h-12 rounded-full border border-white/20 flex flex-col items-center justify-center space-y-1.5 transition-all duration-300 cursor-pointer ${
            menuOpen
              ? 'bg-pink-500/20 border-white/40 shadow-[0_0_15px_rgba(255,0,255,0.4)]'
              : 'bg-white/10 hover:bg-white/20 hover:scale-110'
          }`}
        >
          <span
            className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
              menuOpen ? 'rotate-45 translate-y-2' : ''
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
              menuOpen ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
              menuOpen ? '-rotate-45 -translate-y-2' : ''
            }`}
          />
        </button>

        {/* Drawer backdrop */}
        {menuOpen && (
          <div
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40"
          />
        )}

        {/* Side Menu Panel */}
        <div
          className={`fixed top-0 right-0 h-screen w-72 bg-black/85 backdrop-blur-xl border-l border-white/10 p-8 pt-24 z-40 transition-transform duration-500 ease-in-out ${
            menuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <ul className="space-y-6 text-xl font-bold font-['Orbitron']">
            <li>
              <a
                href="#about"
                onClick={() => setMenuOpen(false)}
                className="neon-purple neon-text hover:tracking-wider transition-all block"
              >
                About Project
              </a>
            </li>
            <li>
              <a
                href="#features"
                onClick={() => setMenuOpen(false)}
                className="neon-green neon-text hover:tracking-wider transition-all block"
              >
                Key Features
              </a>
            </li>
            <li>
              <a
                href="https://github.com/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
                className="neon-pink neon-text hover:tracking-wider transition-all block"
              >
                View Code
              </a>
            </li>
            <li>
              <a
                href="#contact"
                onClick={() => setMenuOpen(false)}
                className="neon-blue neon-text hover:tracking-wider transition-all block"
              >
                Contact Us
              </a>
            </li>
          </ul>
        </div>
      </nav>

      {/* Hero Header */}
      <header className="h-screen relative flex flex-col items-center justify-center px-4 overflow-hidden">
        {/* Radial background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(157,0,255,0.15)_0%,_rgba(7,10,21,1)_75%)] pointer-events-none" />

        {/* 3D Perspective Grid */}
        <div className="neon-grid" />

        {/* Particles Layer */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute rounded-full animate-particle"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                backgroundColor: p.color,
                boxShadow: `0 0 10px ${p.color}`,
                animationDuration: `${p.duration}s`,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
        </div>

        {/* Title Container */}
        <div className="text-center z-10 select-none">
          <h1 className="font-['Orbitron'] text-5xl sm:text-7xl md:text-8xl font-black tracking-tight mb-2">
            <span className="neon-pink neon-text mr-3">Neon</span>
            <span className="neon-blue neon-text">Dreams</span>
          </h1>
          <p className="font-['Major_Mono_Display'] text-base sm:text-2xl text-neutral-200 tracking-widest mt-4 opacity-90">
            a futuristic experience
          </p>
        </div>
      </header>

      {/* About Section */}
      <section id="about" className="py-24 px-6 sm:px-16 max-w-5xl mx-auto relative z-10">
        <h2 className="font-['Orbitron'] text-3xl sm:text-5xl font-black mb-8 relative inline-block">
          About This Project
          <span className="block h-1 w-full bg-gradient-to-r from-pink-500 to-cyan-400 mt-2" />
        </h2>
        <div className="space-y-6 text-lg sm:text-xl text-neutral-300 leading-relaxed max-w-3xl">
          <p>
            Welcome to Neon Dreams, a futuristic digital experience inspired by cyberpunk aesthetics and
            retro-futurism. This project explores the intersection of neon lighting, digital landscapes, and
            immersive user experiences.
          </p>
          <p>
            By combining modern web technologies with nostalgic visuals from the 80s and 90s, we have created
            an environment that feels both familiar and forward-looking. The neon grid, floating particles, and
            glowing text elements all contribute to a cohesive cyberpunk atmosphere.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 sm:px-16 max-w-6xl mx-auto relative z-10">
        <h2 className="font-['Orbitron'] text-3xl sm:text-5xl font-black mb-12 relative inline-block">
          Key Features
          <span className="block h-1 w-full bg-gradient-to-r from-purple-500 to-green-400 mt-2" />
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-400/50 hover:-translate-y-2 transition-all duration-300 relative group overflow-hidden shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <h3 className="font-['Orbitron'] text-2xl font-bold mb-4 neon-purple neon-text">
              Animated Grid
            </h3>
            <p className="text-neutral-300 leading-relaxed text-base">
              Our perspective-transformed grid creates the illusion of infinite space, drawing inspiration from
              classic sci-fi and synthwave aesthetics.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-green-400/50 hover:-translate-y-2 transition-all duration-300 relative group overflow-hidden shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <h3 className="font-['Orbitron'] text-2xl font-bold mb-4 neon-green neon-text">
              Reactive Elements
            </h3>
            <p className="text-neutral-300 leading-relaxed text-base">
              Interactive components respond to user actions with subtle animations, enhancing engagement and
              creating a more immersive experience.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-pink-400/50 hover:-translate-y-2 transition-all duration-300 relative group overflow-hidden shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <h3 className="font-['Orbitron'] text-2xl font-bold mb-4 neon-pink neon-text">
              Neon Typography
            </h3>
            <p className="text-neutral-300 leading-relaxed text-base">
              Custom glowing text effects mimic real neon signs, with carefully crafted shadows and pulsing
              animations for authentic luminosity.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 px-6 sm:px-16 max-w-4xl mx-auto relative z-10">
        <h2 className="font-['Orbitron'] text-3xl sm:text-5xl font-black mb-6 relative inline-block">
          Contact Us
          <span className="block h-1 w-full bg-gradient-to-r from-cyan-400 to-blue-500 mt-2" />
        </h2>
        <p className="text-neutral-300 text-lg mb-8">
          Interested in learning more about Neon Dreams or discussing a similar project? Get in touch with our team.
        </p>

        <form onSubmit={handleContactSubmit} className="space-y-6 max-w-xl">
          <div>
            <input
              type="text"
              placeholder="Your Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-5 py-3.5 bg-white/5 border border-white/20 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,255,255,0.4)] transition-all"
            />
          </div>
          <div>
            <input
              type="email"
              placeholder="Your Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-3.5 bg-white/5 border border-white/20 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,255,255,0.4)] transition-all"
            />
          </div>
          <div>
            <textarea
              placeholder="Your Message"
              rows={5}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-5 py-3.5 bg-white/5 border border-white/20 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,255,255,0.4)] transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-8 py-3.5 rounded-xl border border-cyan-400 bg-cyan-400/10 hover:bg-cyan-400/20 font-['Orbitron'] font-bold text-lg neon-blue neon-text transition-all duration-300 cursor-pointer shadow-[0_0_20px_rgba(0,255,255,0.2)] hover:shadow-[0_0_30px_rgba(0,255,255,0.5)]"
          >
            {formSent ? 'Message Sent!' : 'Send Message'}
          </button>
        </form>

        {formSent && (
          <p className="mt-4 text-green-400 font-semibold font-['Orbitron']">
            Thank you! Your message has been sent into the neon realm.
          </p>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10 text-center text-neutral-500 text-sm">
        Neon Dreams &copy; {new Date().getFullYear()} — Cyberpunk Experience
      </footer>
    </div>
  );
};
