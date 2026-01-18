'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function LandingPage() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dark = localStorage.getItem('dark') === 'true';
      setIsDark(dark);
      if (dark) {
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  const toggleDark = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dark', String(newDark));
      if (newDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  return (
    <>
      <style>{`
        :root {
          --brand-gold: #FFB800;
          --brand-orange: #FF8A00;
          --brand-dark: #1A1A1A;
          --brand-soft-bg: #FDFCF8;
        }
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .glass-effect {
          backdrop-filter: blur(12px);
          background-color: rgba(255, 255, 255, 0.85);
        }
        .dark .glass-effect {
          background-color: rgba(26, 26, 26, 0.85);
        }
        .gradient-text {
          background: linear-gradient(135deg, var(--brand-gold), var(--brand-orange));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>

      <div className="bg-brand-bg dark:bg-[#0F0F0F] text-slate-900 dark:text-slate-100 transition-colors duration-300">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 glass-effect border-b border-orange-100 dark:border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-20 items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                  <span className="material-symbols-outlined text-secondary text-2xl font-bold">
                    local_florist
                  </span>
                </div>
                <span className="text-2xl font-extrabold tracking-tight text-secondary dark:text-white">
                  Dandelion <span className="text-primary">Kos</span>
                </span>
              </div>
              <div className="hidden md:flex space-x-10 font-semibold text-slate-600 dark:text-slate-300">
                <a className="hover:text-primary transition-colors" href="#features">
                  Features
                </a>
                <a className="hover:text-primary transition-colors" href="#digital-perks">
                  Digital Perks
                </a>
                <a className="hover:text-primary transition-colors" href="#dashboard">
                  Tenant App
                </a>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  className="p-2.5 rounded-xl bg-orange-50 dark:bg-zinc-800 text-primary hover:bg-orange-100 transition-colors"
                  onClick={toggleDark}
                >
                  <span className="material-symbols-outlined block dark:hidden">dark_mode</span>
                  <span className="material-symbols-outlined hidden dark:block">light_mode</span>
                </button>
                <Link
                  className="bg-secondary dark:bg-primary dark:text-secondary text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all transform hover:scale-105 shadow-xl"
                  href="/login"
                >
                  Tenant Login
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <header className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
              <div className="mb-12 lg:mb-0">
                <span className="inline-flex items-center py-1.5 px-4 rounded-full bg-primary/10 text-primary-dark text-xs font-extrabold tracking-wider uppercase mb-6 border border-primary/20">
                  <span className="w-2 h-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                  Modern Living in Tuban
                </span>
                <h1 className="text-5xl lg:text-7xl font-extrabold text-secondary dark:text-white leading-[1.1] mb-8">
                  Digital Living at <br />
                  <span className="gradient-text">Dandelion Kos</span>
                </h1>
                <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed max-w-lg font-medium">
                  Experience the next generation of premium boarding. Seamless management, instant access,
                  and high-tech amenities.
                </p>
                <div className="flex flex-wrap gap-5">
                  <button className="bg-primary hover:bg-primary-dark text-secondary px-10 py-5 rounded-2xl font-bold flex items-center shadow-xl shadow-primary/30 transition-all transform hover:-translate-y-1">
                    Explore Features <span className="material-symbols-outlined ml-2">expand_more</span>
                  </button>
                  <button className="bg-white dark:bg-zinc-800 text-secondary dark:text-white border-2 border-orange-50 dark:border-zinc-700 px-10 py-5 rounded-2xl font-bold hover:bg-orange-50 dark:hover:bg-zinc-700 transition-all">
                    View Gallery
                  </button>
                </div>
              </div>
              <div className="relative">
                <div className="rounded-[2.5rem] overflow-hidden shadow-2xl transform lg:rotate-2 hover:rotate-0 transition-transform duration-700 border-[12px] border-white dark:border-zinc-800 relative z-10">
                  <img
                    alt="Dandelion Kos Building Architecture"
                    className="w-full h-[540px] object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCgLdQOKyI0shehuqARzhmcyLCP_b8cnB-Pqp5ni0pFeFYoGx66WuM_mf0hUmCBIq3z7tej9K0DY_kHyeCbnaKSWHHDZ2ltQce19sfxLU5lBS5mz6aCdnzZi2CpG2o1SXwcYC_1her_YM6AP-c2oQGcirWovbS8c3nNl49HqmI6VFB-NmoNP0Yf7j96VDnWtrEoYGbZjEEoGMOqXWbd6hbpoMk257DQuDWJ9-HWw1WUliAZTLOI5YjVUCDrj7SOoR_UHOcoGVm2NHc"
                  />
                </div>
                <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl -z-0"></div>
                <div className="absolute -bottom-8 -left-8 bg-white dark:bg-zinc-800 p-6 rounded-3xl shadow-2xl border border-orange-50 dark:border-zinc-700 max-w-xs hidden md:block z-20">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary-dark">
                      <span className="material-symbols-outlined font-bold">bolt</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Electricity</p>
                      <p className="text-sm font-bold dark:text-white">Token Refilled</p>
                    </div>
                  </div>
                  <div className="bg-orange-50 dark:bg-zinc-900/50 p-3 rounded-xl text-center font-mono text-primary-dark dark:text-primary font-black text-lg tracking-wider">
                    4521 8892 0012
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -z-0"></div>
        </header>

        {/* Features Section */}
        <section className="py-24 relative" id="features">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-4xl font-extrabold mb-6 dark:text-white">The Three Pillars of Digital Living</h2>
              <p className="text-slate-500 dark:text-slate-400 text-lg font-medium leading-relaxed">
                We&apos;ve reimagined tenant management to be entirely digital, transparent, and built around your comfort.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-10">
              <div className="p-10 rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-orange-50 dark:border-zinc-800 hover:shadow-2xl hover:shadow-primary/10 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                  <span className="material-symbols-outlined text-9xl">payments</span>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-primary text-secondary flex items-center justify-center mb-8 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl font-bold">payments</span>
                </div>
                <h3 className="text-2xl font-bold mb-4 dark:text-white">Seamless Payments</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                  No more paper receipts. Upload payment proof instantly via the portal and access your history 24/7.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-center font-bold text-sm text-secondary dark:text-slate-300">
                    <span className="material-symbols-outlined text-primary mr-3 text-xl">check_circle</span> Instant
                    Receipt Uploads
                  </li>
                  <li className="flex items-center font-bold text-sm text-secondary dark:text-slate-300">
                    <span className="material-symbols-outlined text-primary mr-3 text-xl">check_circle</span> Verified
                    Billing History
                  </li>
                </ul>
              </div>

              <div className="p-10 rounded-[2.5rem] bg-secondary text-white dark:bg-zinc-800 border border-zinc-800 dark:border-zinc-700 hover:shadow-2xl hover:shadow-primary/5 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
                  <span className="material-symbols-outlined text-9xl text-white">campaign</span>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-primary text-secondary flex items-center justify-center mb-8 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl font-bold">campaign</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">Quick Complaints</h3>
                <p className="text-zinc-400 mb-8 leading-relaxed">
                  Report issues in seconds. Our team receives alerts immediately, and you track progress in real-time.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-center font-bold text-sm text-white">
                    <span className="material-symbols-outlined text-primary mr-3 text-xl">check_circle</span>{' '}
                    One-Tap Reporting
                  </li>
                  <li className="flex items-center font-bold text-sm text-white">
                    <span className="material-symbols-outlined text-primary mr-3 text-xl">check_circle</span> Live
                    Status Tracking
                  </li>
                </ul>
              </div>

              <div className="p-10 rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-orange-50 dark:border-zinc-800 hover:shadow-2xl hover:shadow-primary/10 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                  <span className="material-symbols-outlined text-9xl">vpn_key</span>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-primary text-secondary flex items-center justify-center mb-8 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl font-bold">bolt</span>
                </div>
                <h3 className="text-2xl font-bold mb-4 dark:text-white">Room Services</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                  Check electricity tokens, Wi-Fi passwords, or gate codes securely from your personalized dashboard.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-center font-bold text-sm text-secondary dark:text-slate-300">
                    <span className="material-symbols-outlined text-primary mr-3 text-xl">check_circle</span> Token
                    Monitoring
                  </li>
                  <li className="flex items-center font-bold text-sm text-secondary dark:text-slate-300">
                    <span className="material-symbols-outlined text-primary mr-3 text-xl">check_circle</span> Secure
                    Digital Keys
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Digital Perks Section */}
        <section className="py-24 overflow-hidden" id="digital-perks">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-secondary dark:bg-zinc-900 rounded-[3.5rem] p-10 md:p-20 lg:flex items-center text-white relative border-t-4 border-primary">
              <div className="lg:w-1/2 relative z-10 mb-16 lg:mb-0">
                <div className="inline-flex items-center py-1.5 px-4 rounded-full bg-white/10 text-primary text-xs font-black tracking-widest uppercase mb-8 border border-white/10">
                  Exclusive Resident Perk
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold mb-8 leading-tight">
                  High-Speed Entertainment:<br />
                  <span className="text-primary">Jellyfin & Plex</span>
                </h2>
                <p className="text-zinc-400 text-xl mb-12 leading-relaxed">
                  We host local media servers on-site. Enjoy buffer-free streaming of your favorite content across the
                  entire building.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-md">
                    <div className="flex items-center mb-4">
                      <span className="material-symbols-outlined mr-3 text-primary">play_circle</span>
                      <span className="font-bold text-lg">Local Streaming</span>
                    </div>
                    <p className="text-sm text-zinc-500">Zero internet lag. Hosted right in the building for peak speed.</p>
                  </div>
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-md">
                    <div className="flex items-center mb-4">
                      <span className="material-symbols-outlined mr-3 text-primary">devices</span>
                    </div>
                    <span className="font-bold text-lg">Multi-Device</span>
                    <p className="text-sm text-zinc-500 mt-2">Watch on your phone, laptop, or smart TV effortlessly.</p>
                  </div>
                </div>
              </div>
              <div className="lg:w-1/2 lg:pl-16 relative">
                <div className="bg-white dark:bg-[#1A1A1A] rounded-[2.5rem] p-8 shadow-2xl text-secondary dark:text-white transform lg:scale-110 lg:translate-x-12 border-l-[12px] border-primary">
                  <p className="text-xs font-black text-slate-400 mb-6 uppercase tracking-[0.2em]">Local Server Network</p>
                  <div className="space-y-5">
                    <div className="p-5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800/50 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-emerald-100 transition-colors">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-white dark:bg-zinc-800 rounded-xl flex items-center justify-center mr-5 shadow-sm">
                          <span className="material-symbols-outlined text-primary text-2xl">movie</span>
                        </div>
                        <div>
                          <p className="font-bold text-lg">Jellyfin</p>
                          <div className="flex items-center mt-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold tracking-tight">
                              ONLINE • 24ms latency
                            </p>
                          </div>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">
                        arrow_forward
                      </span>
                    </div>
                    <div className="p-5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800/50 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-emerald-100 transition-colors">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-white dark:bg-zinc-800 rounded-xl flex items-center justify-center mr-5 shadow-sm">
                          <span className="material-symbols-outlined text-primary text-2xl">theaters</span>
                        </div>
                        <div>
                          <p className="font-bold text-lg">Plex Media</p>
                          <div className="flex items-center mt-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold tracking-tight">
                              ONLINE • 12ms latency
                            </p>
                          </div>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">
                        arrow_forward
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-10 right-10 opacity-5 pointer-events-none">
                <span className="material-symbols-outlined text-[240px]">rss_feed</span>
              </div>
            </div>
          </div>
        </section>

        {/* Dashboard Preview Section */}
        <section className="py-24" id="dashboard">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-20 items-center">
              <div className="lg:w-2/5">
                <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-8">
                  <span className="material-symbols-outlined text-3xl font-bold">dashboard</span>
                </div>
                <h2 className="text-4xl font-extrabold mb-8 dark:text-white leading-tight">
                  Control Your Space From One Screen
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mb-10 text-xl font-medium leading-relaxed">
                  Our bespoke tenant dashboard provides total visibility. No more guessing when rent is due or what the
                  Wi-Fi password was.
                </p>
                <div className="space-y-8">
                  <div className="flex space-x-6 p-2">
                    <div className="flex-shrink-0 w-14 h-14 bg-white dark:bg-zinc-800 rounded-2xl shadow-md border border-orange-50 dark:border-zinc-700 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined font-bold">content_copy</span>
                    </div>
                    <div>
                      <h4 className="font-extrabold text-lg mb-2 dark:text-white">Smart Copy Features</h4>
                      <p className="text-slate-500 dark:text-slate-400">
                        Copy long tokens or codes instantly with one click. Error-free and fast.
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-6 p-2">
                    <div className="flex-shrink-0 w-14 h-14 bg-white dark:bg-zinc-800 rounded-2xl shadow-md border border-orange-50 dark:border-zinc-700 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined font-bold">shield_lock</span>
                    </div>
                    <div>
                      <h4 className="font-extrabold text-lg mb-2 dark:text-white">Secure Privacy</h4>
                      <p className="text-slate-500 dark:text-slate-400">
                        Sensitive gate and room codes are masked by default. Only visible to you when needed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:w-3/5">
                <div className="bg-white dark:bg-[#1A1A1A] rounded-[3rem] border border-orange-50 dark:border-zinc-800 shadow-[0_32px_64px_-16px_rgba(255,184,0,0.15)] overflow-hidden">
                  <div className="p-8 border-b border-orange-50 dark:border-zinc-800 flex justify-between items-center bg-orange-50/30 dark:bg-zinc-900/50">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-xl bg-secondary text-primary font-black flex items-center justify-center text-xs shadow-lg">
                        DK
                      </div>
                      <span className="font-extrabold text-sm tracking-tight text-secondary dark:text-white">
                        Dandelion Dashboard
                      </span>
                    </div>
                    <div className="hidden sm:flex space-x-6 text-xs font-black text-slate-400 uppercase tracking-widest">
                      <span className="text-primary border-b-2 border-primary pb-1">Overview</span>
                      <span className="hover:text-secondary dark:hover:text-white transition-colors cursor-pointer">
                        Payments
                      </span>
                      <span className="hover:text-secondary dark:hover:text-white transition-colors cursor-pointer">Inbox</span>
                    </div>
                  </div>
                  <div className="p-10 space-y-10">
                    <div>
                      <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mb-3">
                        Residential Portal
                      </p>
                      <h3 className="text-4xl font-extrabold text-secondary dark:text-white tracking-tight">
                        Hello, Resident! 👋
                      </h3>
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                      <div className="p-6 rounded-3xl bg-brand-bg dark:bg-zinc-800/50 border border-orange-100 dark:border-zinc-700">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-3">Room</p>
                        <p className="text-3xl font-black text-secondary dark:text-white">205</p>
                      </div>
                      <div className="p-6 rounded-3xl bg-brand-bg dark:bg-zinc-800/50 border border-orange-100 dark:border-zinc-700">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-3">Payments</p>
                        <p className="text-3xl font-black text-secondary dark:text-white">Active</p>
                      </div>
                      <div className="p-6 rounded-3xl bg-primary/10 border border-primary/20">
                        <p className="text-[10px] text-primary-dark font-black uppercase tracking-widest mb-3">Status</p>
                        <p className="text-3xl font-black text-primary-dark">Verified</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="p-8 rounded-[2rem] bg-secondary text-white flex flex-col justify-between group cursor-pointer hover:bg-zinc-800 transition-colors shadow-xl">
                        <span className="material-symbols-outlined text-primary text-4xl mb-6">upload_file</span>
                        <div>
                          <p className="font-extrabold text-xl mb-1">Upload Receipt</p>
                          <p className="text-xs text-zinc-400 font-bold">Fast verification in 2-4 hours</p>
                        </div>
                      </div>
                      <div className="p-8 rounded-[2rem] bg-primary text-secondary flex flex-col justify-between group cursor-pointer hover:bg-primary-dark transition-colors shadow-xl">
                        <span className="material-symbols-outlined text-secondary text-4xl mb-6">history</span>
                        <div>
                          <p className="font-extrabold text-xl mb-1">Billing Archive</p>
                          <p className="text-xs text-orange-900/60 font-bold">Complete history available</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white dark:bg-zinc-950 py-16 border-t border-orange-50 dark:border-zinc-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-3 mb-8 md:mb-0">
                <div className="w-10 h-10 bg-primary text-secondary rounded-xl flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined">local_florist</span>
                </div>
                <span className="text-2xl font-black tracking-tighter text-secondary dark:text-white uppercase">
                  Dandelion <span className="text-primary">Kos</span>
                </span>
              </div>
              <div className="text-slate-500 dark:text-zinc-500 text-sm text-center md:text-right font-medium">
                <p className="mb-4">© 2024 Dandelion Kos. Modern Residences in Tuban.</p>
                <div className="flex flex-wrap justify-center md:justify-end gap-8">
                  <a
                    className="hover:text-primary transition-colors font-bold uppercase tracking-widest text-[10px]"
                    href="#"
                  >
                    Privacy
                  </a>
                  <a
                    className="hover:text-primary transition-colors font-bold uppercase tracking-widest text-[10px]"
                    href="#"
                  >
                    Terms
                  </a>
                  <a
                    className="hover:text-primary transition-colors font-bold uppercase tracking-widest text-[10px]"
                    href="#"
                  >
                    Support
                  </a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
