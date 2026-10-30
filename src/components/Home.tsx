import React, { useState, useEffect } from 'react';

interface HomeProps {
  onNavigate: (view: 'home' | 'project-one' | 'project-two') => void;
}

const phrases = [
  { text: 'Welcome to My', colorText: 'Website!' },
  { text: 'Explore amazing', colorText: 'content!' },
  { text: 'Stay tuned for', colorText: 'more!' },
];

const playfulPhrases = [
  "Let's get started! 🚀",
  'Ready to explore some cool ideas? 💡',
];

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  // Main rainbow typing effect state
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Playful typing effect state
  const [playfulIndex, setPlayfulIndex] = useState(0);
  const [playfulCharIndex, setPlayfulCharIndex] = useState(0);
  const [playfulIsDeleting, setPlayfulIsDeleting] = useState(false);

  // Parallax mouse position
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  // Contact form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formMsg, setFormMsg] = useState('');
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [formFeedback, setFormFeedback] = useState('');

  // Main typing animation loop
  useEffect(() => {
    const current = phrases[phraseIndex];
    const fullText = `${current.text} ${current.colorText}`;

    let timer: ReturnType<typeof setTimeout>;

    if (!isDeleting && charIndex <= fullText.length) {
      timer = setTimeout(() => {
        setCharIndex((prev) => prev + 1);
      }, 70);
    } else if (!isDeleting && charIndex > fullText.length) {
      timer = setTimeout(() => {
        setIsDeleting(true);
      }, 1500);
    } else if (isDeleting && charIndex > 0) {
      timer = setTimeout(() => {
        setCharIndex((prev) => prev - 1);
      }, 30);
    } else if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setPhraseIndex((prev) => (prev + 1) % phrases.length);
      timer = setTimeout(() => {}, 300);
    }

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, phraseIndex]);

  // Playful typing animation loop
  useEffect(() => {
    const currentPlayful = playfulPhrases[playfulIndex];

    let timer: ReturnType<typeof setTimeout>;

    if (!playfulIsDeleting && playfulCharIndex <= currentPlayful.length) {
      const speed = Math.max(30, 60 - Math.random() * 30);
      timer = setTimeout(() => {
        setPlayfulCharIndex((prev) => prev + 1);
      }, speed);
    } else if (!playfulIsDeleting && playfulCharIndex > currentPlayful.length) {
      timer = setTimeout(() => {
        setPlayfulIsDeleting(true);
      }, 2000);
    } else if (playfulIsDeleting && playfulCharIndex > 0) {
      timer = setTimeout(() => {
        setPlayfulCharIndex((prev) => prev - 1);
      }, 25);
    } else if (playfulIsDeleting && playfulCharIndex === 0) {
      setPlayfulIsDeleting(false);
      setPlayfulIndex((prev) => (prev + 1) % playfulPhrases.length);
      timer = setTimeout(() => {}, 500);
    }

    return () => clearTimeout(timer);
  }, [playfulCharIndex, playfulIsDeleting, playfulIndex]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const x = (e.clientX / window.innerWidth) * 10;
    const y = (e.clientY / window.innerHeight) * 10;
    setMousePos({ x: 50 + x, y: 50 + y });
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('sending');
    setTimeout(() => {
      setFormStatus('sent');
      setFormFeedback("Thanks for your message! We'll get back to you soon.");
      setTimeout(() => {
        setFormName('');
        setFormEmail('');
        setFormMsg('');
        setFormStatus('idle');
      }, 3500);
    }, 1200);
  };

  // Render current typed text with rainbow highlighting
  const currentPhrase = phrases[phraseIndex];
  const fullText = `${currentPhrase.text} ${currentPhrase.colorText}`;
  const regularLength = currentPhrase.text.length;

  let renderedTyping;
  if (isDeleting) {
    renderedTyping = <span>{fullText.substring(0, charIndex)}</span>;
  } else if (charIndex <= regularLength) {
    renderedTyping = <span>{fullText.substring(0, charIndex)}</span>;
  } else {
    const normalPart = currentPhrase.text;
    const colorfulPart = fullText.substring(regularLength + 1, charIndex);
    renderedTyping = (
      <span>
        {normalPart} <span className="rainbow-text">{colorfulPart}</span>
      </span>
    );
  }

  const currentPlayful = playfulPhrases[playfulIndex];
  const renderedPlayful = currentPlayful.substring(0, playfulCharIndex);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-yellow-400 selection:text-black">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/10 py-4 px-6 flex flex-col sm:flex-row items-center justify-between transition-all">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wide hover:tracking-wider hover:text-yellow-300 transition-all duration-300 cursor-pointer">
          Glowing Insights
        </h1>
        <nav className="mt-3 sm:mt-0">
          <ul className="flex items-center space-x-3 sm:space-x-6">
            <li>
              <a
                href="#about"
                className="px-5 py-2 rounded-full border border-white/30 text-base sm:text-lg hover:border-yellow-400 hover:text-yellow-300 hover:shadow-[0_0_20px_rgba(255,255,0,0.4)] transition-all duration-300 inline-block"
              >
                About
              </a>
            </li>
            <li>
              <a
                href="#portfolio"
                className="px-5 py-2 rounded-full border border-white/30 text-base sm:text-lg hover:border-yellow-400 hover:text-yellow-300 hover:shadow-[0_0_20px_rgba(255,255,0,0.4)] transition-all duration-300 inline-block"
              >
                Portfolio
              </a>
            </li>
            <li>
              <a
                href="#contact"
                className="px-5 py-2 rounded-full border border-white/30 text-base sm:text-lg hover:border-yellow-400 hover:text-yellow-300 hover:shadow-[0_0_20px_rgba(255,255,0,0.4)] transition-all duration-300 inline-block"
              >
                Contact
              </a>
            </li>
          </ul>
        </nav>
      </header>

      {/* Hero Section */}
      <section
        onMouseMove={handleMouseMove}
        style={{
          backgroundImage: `url('https://media1.tenor.com/m/HB6Ku4skoP8AAAAC/anime-goodnight.gif')`,
          backgroundPosition: `${mousePos.x}% ${mousePos.y}%`,
          backgroundSize: 'cover',
        }}
        className="relative py-28 px-4 flex flex-col items-center justify-center text-center overflow-hidden min-h-[85vh]"
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/65 z-0" />

        {/* Typing Container */}
        <div className="relative z-10 px-6 py-4 mb-6 min-h-[70px] flex items-center justify-center">
          <span className="font-['Rajdhani'] text-3xl sm:text-5xl font-bold tracking-wide drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">
            {renderedTyping}
          </span>
          <span className="font-['Rajdhani'] text-3xl sm:text-5xl font-bold text-cyan-300 ml-1 animate-blink">
            |
          </span>
        </div>

        {/* Text Box */}
        <div className="relative z-10 mb-8 max-w-2xl mx-auto px-4">
          <h2 className="text-3xl sm:text-5xl font-black mb-4 rainbow-text leading-tight">
            Check Out Our Latest Stories
          </h2>
          <p className="text-lg sm:text-2xl font-semibold rainbow-text">
            Explore exciting stories, new ideas, and interesting perspectives.
          </p>
        </div>

        {/* Button */}
        <div className="relative z-10 mb-8">
          <a
            href="https://arnobmm.github.io/lemon.github.io/index.html"
            target="_blank"
            rel="noopener noreferrer"
            className="glow-button font-bold text-lg"
          >
            Go to Chatbox
          </a>
        </div>

        {/* Playful Typing */}
        <div className="relative z-10 px-4 py-2 mt-4 min-h-[50px] flex items-center justify-center transition-transform hover:scale-105 duration-300">
          <span className="font-['Quicksand'] text-xl sm:text-3xl font-semibold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">
            {renderedPlayful}
          </span>
          <span className="font-['Quicksand'] text-2xl sm:text-3xl font-bold text-yellow-300 ml-1 animate-blink">
            |
          </span>
        </div>
      </section>

      {/* About Section */}
      <section
        id="about"
        style={{
          backgroundImage: `url('https://media1.tenor.com/m/tWjJ3yo7gjsAAAAd/anime-lake.gif')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        className="relative py-20 px-6 text-center"
      >
        <div className="absolute inset-0 bg-black/75 z-0" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-6 inline-block relative group cursor-default">
            About Me
            <span className="block h-1 w-0 group-hover:w-full transition-all duration-300 bg-gradient-to-r from-red-500 to-cyan-400 mx-auto mt-2" />
          </h2>
          <p className="text-lg sm:text-xl text-neutral-200 leading-relaxed p-4 transition-transform hover:scale-105 duration-300">
            I am a creative web developer specializing in web design, branding, and interactive 3D web experiences.
          </p>
        </div>
      </section>

      {/* Portfolio Section */}
      <section id="portfolio" className="py-24 px-6 text-center bg-black">
        <h2 className="text-3xl sm:text-4xl font-extrabold mb-12 inline-block relative group cursor-default">
          Portfolio
          <span className="block h-1 w-0 group-hover:w-full transition-all duration-300 bg-gradient-to-r from-orange-400 to-blue-500 mx-auto mt-2" />
        </h2>

        <div className="flex flex-wrap justify-center gap-8 max-w-5xl mx-auto">
          {/* Project One */}
          <div
            onClick={() => onNavigate('project-one')}
            className="group cursor-pointer bg-white/5 border border-white/10 hover:border-pink-500/50 p-6 rounded-2xl transition-all duration-500 hover:-translate-y-3 hover:scale-105 hover:shadow-[0_15px_30px_rgba(255,0,255,0.25)] w-80 relative overflow-hidden"
          >
            <div className="overflow-hidden rounded-xl mb-4">
              <img
                src="https://images.stockcake.com/public/c/6/0/c607b218-e444-42e3-bbf5-b9aa74d149d4_large/sunset-mountain-highway-stockcake.jpg"
                alt="Sunset Mountain Highway"
                className="w-full h-48 object-cover rounded-xl group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <h3 className="text-2xl font-bold group-hover:text-yellow-300 transition-colors">
              Project One
            </h3>
            <p className="text-sm text-neutral-400 mt-2 font-['Quicksand']">
              Neon Dreams — Cyberpunk futuristic experience with 3D perspective neon grid and glowing particles.
            </p>
            <div className="mt-4 inline-flex items-center text-xs font-bold uppercase tracking-wider text-pink-400 group-hover:text-pink-300">
              Launch Experience &rarr;
            </div>
          </div>

          {/* Project Two */}
          <div
            onClick={() => onNavigate('project-two')}
            className="group cursor-pointer bg-white/5 border border-white/10 hover:border-purple-500/50 p-6 rounded-2xl transition-all duration-500 hover:-translate-y-3 hover:scale-105 hover:shadow-[0_15px_30px_rgba(157,0,255,0.25)] w-80 relative overflow-hidden"
          >
            <div className="overflow-hidden rounded-xl mb-4">
              <img
                src="https://static.vecteezy.com/system/resources/thumbnails/043/410/047/small_2x/car-traffic-light-at-night-city-photo.jpg"
                alt="Night City Traffic Light"
                className="w-full h-48 object-cover rounded-xl group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <h3 className="text-2xl font-bold group-hover:text-yellow-300 transition-colors">
              Project Two
            </h3>
            <p className="text-sm text-neutral-400 mt-2 font-['Quicksand']">
              3D Lemon Games — 3D procedural maze and sky, lava & Minecraft parkour adventures with Three.js.
            </p>
            <div className="mt-4 inline-flex items-center text-xs font-bold uppercase tracking-wider text-purple-400 group-hover:text-purple-300">
              Play Games &rarr;
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="max-w-2xl mx-auto my-16 p-8 sm:p-12 bg-black border-2 border-yellow-400/40 hover:border-yellow-400/70 rounded-3xl shadow-[0_4px_15px_rgba(255,255,0,0.15)] hover:shadow-[0_8px_30px_rgba(255,255,0,0.3)] transition-all duration-500 text-center relative"
      >
        <h2 className="text-3xl sm:text-4xl font-extrabold mb-8 inline-block relative group cursor-default">
          Contact Us
          <span className="block h-1 w-0 group-hover:w-full transition-all duration-300 bg-gradient-to-r from-yellow-400 to-white mx-auto mt-2" />
        </h2>

        <form onSubmit={handleContactSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Your Name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
            className="w-full max-w-md mx-auto block px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/50 transition-all text-base"
          />
          <input
            type="email"
            placeholder="Your Email"
            value={formEmail}
            onChange={(e) => setFormEmail(e.target.value)}
            required
            className="w-full max-w-md mx-auto block px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/50 transition-all text-base"
          />
          <textarea
            placeholder="Your Message"
            rows={4}
            value={formMsg}
            onChange={(e) => setFormMsg(e.target.value)}
            className="w-full max-w-md mx-auto block px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/50 transition-all text-base"
          />
          <button
            type="submit"
            disabled={formStatus === 'sending'}
            className="px-8 py-3 bg-white/10 hover:bg-yellow-400 hover:text-black border border-white/20 hover:border-yellow-400 rounded-lg font-bold text-lg transition-all duration-300 cursor-pointer shadow-md disabled:opacity-50"
          >
            {formStatus === 'sending' ? 'Sending...' : formStatus === 'sent' ? 'Message Sent!' : 'Send'}
          </button>
        </form>

        {formFeedback && (
          <p className="mt-6 text-green-400 font-semibold text-lg transition-all duration-500">
            {formFeedback}
          </p>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-neutral-500 text-sm">
        Glowing Insights &copy; {new Date().getFullYear()} — Built with React & Three.js
      </footer>
    </div>
  );
};
