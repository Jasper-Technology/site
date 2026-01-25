import { Link } from 'react-router-dom';
import { ArrowRight, LineChart, Cpu, Shield, Moon, Sun, Sparkles, Github, Send, Clock, Cloud, Check } from 'lucide-react';
import { useState, useEffect } from 'react';

// Minimalist Jasper Logo
export const JasperLogo = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 32 32" fill="none" className={className}>
    <path
      d="M8 6 L8 20 Q8 26 14 26 L24 26"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <circle cx="24" cy="26" r="3" fill="currentColor" />
    <circle cx="8" cy="6" r="3" fill="currentColor" />
    <path
      d="M14 6 L24 6 L24 14"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      opacity="0.4"
    />
  </svg>
);

// Static PFD Diagram for Hero
const HeroDiagram = () => (
  <div className="relative w-full h-full min-h-[400px] lg:min-h-[480px]">
    {/* Background card */}
    <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Grid dots */}
      <div className="absolute inset-0 opacity-30 dark:opacity-20" style={{
        backgroundImage: 'radial-gradient(circle, rgb(148 163 184) 1px, transparent 1px)',
        backgroundSize: '24px 24px'
      }} />

      {/* PFD Diagram */}
      <svg className="absolute inset-0 w-full h-full p-6" viewBox="0 0 500 320" preserveAspectRatio="xMidYMid meet">
        {/* Feed */}
        <g transform="translate(60, 160)">
          <circle r="24" className="fill-white dark:fill-slate-700 stroke-slate-400 dark:stroke-slate-500" strokeWidth="2"/>
          <line x1="-14" y1="0" x2="14" y2="0" className="stroke-slate-400 dark:stroke-slate-500" strokeWidth="2"/>
          <line x1="0" y1="-14" x2="0" y2="14" className="stroke-slate-400 dark:stroke-slate-500" strokeWidth="2"/>
          <text y="42" textAnchor="middle" className="fill-slate-600 dark:fill-slate-400 text-[11px] font-medium">Flue Gas</text>
        </g>

        {/* Stream 1 */}
        <path d="M 84 160 L 120 160" className="stroke-teal-500" strokeWidth="2.5" markerEnd="url(#heroArrow)"/>

        {/* Absorber */}
        <g transform="translate(160, 160)">
          <rect x="-22" y="-50" width="44" height="100" rx="6" className="fill-white dark:fill-slate-700 stroke-slate-400 dark:stroke-slate-500" strokeWidth="2"/>
          {[-28, -10, 8, 26].map((y, i) => (
            <line key={i} x1="-14" y1={y} x2="14" y2={y} className="stroke-slate-300 dark:stroke-slate-600" strokeWidth="1.5" strokeDasharray="4,3"/>
          ))}
          <text y="68" textAnchor="middle" className="fill-slate-600 dark:fill-slate-400 text-[11px] font-medium">Absorber</text>
        </g>

        {/* Stream 2 - to HX */}
        <path d="M 182 160 L 218 160" className="stroke-teal-500" strokeWidth="2.5" markerEnd="url(#heroArrow)"/>

        {/* Heat Exchanger */}
        <g transform="translate(270, 160)">
          <ellipse cx="-28" cy="0" rx="10" ry="26" className="fill-white dark:fill-slate-700 stroke-slate-400 dark:stroke-slate-500" strokeWidth="2"/>
          <ellipse cx="28" cy="0" rx="10" ry="26" className="fill-white dark:fill-slate-700 stroke-slate-400 dark:stroke-slate-500" strokeWidth="2"/>
          <line x1="-18" y1="-26" x2="18" y2="-26" className="stroke-slate-400 dark:stroke-slate-500" strokeWidth="2"/>
          <line x1="-18" y1="26" x2="18" y2="26" className="stroke-slate-400 dark:stroke-slate-500" strokeWidth="2"/>
          <line x1="-18" y1="-8" x2="18" y2="-8" className="stroke-slate-300 dark:stroke-slate-600" strokeWidth="1" opacity="0.5"/>
          <line x1="-18" y1="8" x2="18" y2="8" className="stroke-slate-300 dark:stroke-slate-600" strokeWidth="1" opacity="0.5"/>
          <text y="48" textAnchor="middle" className="fill-slate-600 dark:fill-slate-400 text-[11px] font-medium">Heat Exchanger</text>
        </g>

        {/* Stream 3 - to Stripper */}
        <path d="M 298 160 L 338 160" className="stroke-teal-500" strokeWidth="2.5" markerEnd="url(#heroArrow)"/>

        {/* Stripper */}
        <g transform="translate(380, 160)">
          <rect x="-22" y="-50" width="44" height="100" rx="6" className="fill-white dark:fill-slate-700 stroke-slate-400 dark:stroke-slate-500" strokeWidth="2"/>
          {[-28, -10, 8, 26].map((y, i) => (
            <line key={i} x1="-14" y1={y} x2="14" y2={y} className="stroke-slate-300 dark:stroke-slate-600" strokeWidth="1.5" strokeDasharray="4,3"/>
          ))}
          <circle cx="0" cy="40" r="5" className="fill-none stroke-orange-400" strokeWidth="2"/>
          <text y="68" textAnchor="middle" className="fill-slate-600 dark:fill-slate-400 text-[11px] font-medium">Stripper</text>
        </g>

        {/* Stream 4 - CO2 out top */}
        <path d="M 380 110 L 380 65" className="stroke-teal-500" strokeWidth="2.5" markerEnd="url(#heroArrow)"/>

        {/* CO2 Product */}
        <g transform="translate(380, 42)">
          <circle r="16" className="fill-emerald-100 dark:fill-emerald-900/30 stroke-emerald-500" strokeWidth="2"/>
          <text y="4" textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400 text-[9px] font-bold">CO₂</text>
        </g>

        {/* Recycle stream - bottom path */}
        <path d="M 380 210 L 380 265 L 110 265 L 110 210" className="stroke-blue-400 dark:stroke-blue-500" strokeWidth="2" strokeDasharray="6,4" fill="none"/>
        <path d="M 110 210 L 110 184" className="stroke-blue-400 dark:stroke-blue-500" strokeWidth="2" markerEnd="url(#heroArrowBlue)"/>
        <text x="245" y="285" textAnchor="middle" className="fill-blue-500 dark:fill-blue-400 text-[10px]">Lean Solvent Recycle</text>

        {/* Arrow markers */}
        <defs>
          <marker id="heroArrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" className="fill-teal-500"/>
          </marker>
          <marker id="heroArrowBlue" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" className="fill-blue-400 dark:fill-blue-500"/>
          </marker>
        </defs>
      </svg>

      {/* Status badge */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 px-3 py-1.5 rounded-full text-xs font-medium">
        <span className="w-2 h-2 bg-teal-500 rounded-full" />
        Simulation Ready
      </div>
    </div>
  </div>
);

// Theme toggle hook
function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('jasper-theme');
      // Default to light mode if no preference is saved
      return savedTheme === 'dark';
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('jasper-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('jasper-theme', 'light');
    }
  }, [isDark]);

  return { isDark, toggle: () => setIsDark(!isDark) };
}

export { useTheme };

export default function Landing() {
  const { isDark, toggle } = useTheme();

  return (
    <div className="bg-white dark:bg-slate-900">
      {/* Navbar */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-3xl">
        <div className="flex items-center justify-between bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-full px-2 py-2 border border-slate-200 dark:border-slate-700">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 pl-3 pr-4">
            <JasperLogo className="w-6 h-6 text-slate-800 dark:text-white" />
            <span className="font-semibold text-slate-800 dark:text-white tracking-tight">Jasper</span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center">
            <a href="#features" className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
              Features
            </a>
            <a
              href="https://docs.jaspertech.org"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Docs
            </a>
            <a href="#contact" className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
              Contact
            </a>
            <a
              href="https://github.com/Jasper-Technology/opensource"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              GitHub
            </a>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link
              to="/signin"
              className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/dashboard"
              className="px-5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-medium rounded-full hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Split Layout */}
      <section className="pt-28 pb-16 lg:pt-32 lg:pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left - Text */}
            <div>
              {/* Headline */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-slate-800 dark:text-white tracking-tight leading-[1.1] mb-6">
                The modern IDE for{' '}
                <span className="text-teal-600 dark:text-teal-400 font-normal">chemical process</span>{' '}
                design
              </h1>

              {/* Subheadline */}
              <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed mb-10 max-w-lg">
                Design, simulate, and optimize process flowsheets with an intuitive visual interface.
                Built for chemical engineers who value precision and speed.
              </p>

              {/* CTA Button */}
              <Link
                to="/dashboard"
                className="group inline-flex items-center gap-2 px-7 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium rounded-full hover:bg-slate-800 dark:hover:bg-slate-100 transition-all"
              >
                Start designing
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Right - Diagram */}
            <div id="demo" className="lg:pl-8">
              <HeroDiagram />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-slate-50 dark:bg-slate-800/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-slate-800 dark:text-white tracking-tight mb-4">
              Everything you need to design better processes
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
              Jasper combines powerful simulation with an intuitive interface, so you can focus on engineering, not software.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center mb-6">
                <Cpu className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-2">Visual PFD Editor</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Drag-and-drop interface with industry-standard P&ID symbols. Build complex flowsheets in minutes.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
              <div className="w-12 h-12 rounded-2xl bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center mb-6">
                <LineChart className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-2">Real-time Simulation</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Instant feedback on process performance. See KPIs, spec results, and constraint violations.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
              <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-violet-600 dark:text-violet-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-2">Version Control</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Every change is tracked, every version is saved. Compare runs and rollback anytime.
              </p>
            </div>

            {/* Feature 4 - AI Agents (Coming Soon) */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 relative overflow-hidden">
              <div className="absolute top-3 right-3">
                <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-semibold rounded-full">
                  Coming Soon
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-2">AI Agents</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                AI-powered agents that design and optimize processes automatically based on your constraints.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-light text-slate-800 dark:text-white tracking-tight mb-4">
              Simple pricing
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg">
              Start for free, upgrade when you need more.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Free Plan */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 border-2 border-teal-500 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-teal-500 text-white text-xs font-semibold rounded-full">
                Current
              </div>
              <div className="flex items-center gap-3 mb-4 mt-1">
                <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-white">Free</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">For individuals</p>
                </div>
              </div>
              <div className="mb-4">
                <span className="text-3xl font-light text-slate-800 dark:text-white">$0</span>
                <span className="text-slate-500 dark:text-slate-400">/month</span>
              </div>
              <ul className="space-y-2 mb-6">
                {['Unlimited projects', 'Full simulation engine', 'Local storage', 'All unit operations'].map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Check className="w-4 h-4 text-teal-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                to="/dashboard"
                className="block w-full py-2.5 text-center bg-teal-500 text-white font-medium rounded-full hover:bg-teal-600 transition-colors"
              >
                Start designing
              </Link>
            </div>

            {/* Pro Plan - Coming Soon */}
            <div className="bg-gradient-to-br from-slate-400 to-slate-500 dark:from-slate-600 dark:to-slate-700 rounded-3xl p-6 relative overflow-hidden opacity-75">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Cloud className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Pro</h3>
                    <p className="text-sm text-slate-200">For teams</p>
                  </div>
                </div>
                <div className="mb-4">
                  <span className="text-3xl font-light text-white">$10</span>
                  <span className="text-slate-200">/month</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {['Cloud sync', 'Team collaboration', 'Priority support', 'Version history'].map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-white/80">
                      <Check className="w-4 h-4 text-white/60" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-center gap-2 w-full py-2.5 bg-white/20 text-white font-medium rounded-full">
                  <Clock className="w-4 h-4" />
                  Coming Soon
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-slate-50 dark:bg-slate-800/30">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-light text-slate-800 dark:text-white tracking-tight mb-6">
            Ready to try Jasper?
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg mb-10">
            Start designing your process flowsheets today. No sign-up required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 bg-teal-600 text-white font-medium rounded-full hover:bg-teal-700 transition-colors"
            >
              Open Jasper
              <ArrowRight className="w-5 h-5" />
            </Link>

            <a
              href="https://github.com/Jasper-Technology/opensource"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium rounded-full hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
            >
              <Github className="w-5 h-5" />
              Contribute on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-6 bg-slate-50 dark:bg-slate-800/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Heading */}
            <div>
              <h2 className="text-3xl md:text-4xl font-light text-slate-800 dark:text-white tracking-tight mb-4">
                Send us a message
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-lg">
                Have questions, feedback, or want to collaborate? We'd love to hear from you.
              </p>
            </div>

            {/* Right - Form */}
            <form
              name="contact"
              method="POST"
              data-netlify="true"
              data-netlify-honeypot="bot-field"
              className="bg-white dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-200 dark:border-slate-700"
            >
              <input type="hidden" name="form-name" value="contact" />
              <p className="hidden">
                <label>
                  Don't fill this out: <input name="bot-field" />
                </label>
              </p>
              <div className="space-y-4">
                {/* Name & Email - side by side */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-transparent transition-all"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-transparent transition-all"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={4}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-transparent transition-all resize-none"
                    placeholder="Tell us what's on your mind..."
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 text-white font-medium rounded-xl hover:bg-teal-700 transition-colors"
                >
                  Send Message
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <JasperLogo className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                <span className="text-sm text-slate-400 dark:text-slate-500">© 2026 JasperTech</span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <a
                href="https://github.com/Jasper-Technology/opensource"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <Github className="w-4 h-4" />
                Open Source
              </a>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-400 dark:text-slate-500">
              <Link to="/privacy" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Terms</Link>
              <Link to="/signin" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Sign In</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
