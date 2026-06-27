'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { getSharedCookie, setSharedCookie } from '@/lib/cookies';

const LoginGate = dynamic(() => import('@/components/LoginGate'));

type Tab = 'home' | 'features' | 'pricing' | 'tickets' | 'download';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [showLogin, setShowLogin] = useState(false);
  const [loggedInPhone, setLoggedInPhone] = useState('');
  
  // Download state
  const [downloadCooldown, setDownloadCooldown] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const apkUrl = "https://github.com/ansea-wav/Wazle/releases/download/Wazle/Wazle-beta-v0.2.apk";

  // Ticket state
  const [ticketForm, setTicketForm] = useState({ name: '', whatsapp: '', subject: '', message: '' });
  const [ticketStatus, setTicketStatus] = useState<'idle'|'loading'|'success'|'error'>('idle');

  // Collapsible Footer States & Animations
  const [isExpanded, setIsExpanded] = useState(false);
  const [animationClass, setAnimationClass] = useState('');

  const triggerExpand = () => {
    if (isExpanded) return;
    setIsExpanded(true);
    setAnimationClass('animate-anticipation');
    const timer = setTimeout(() => {
      setAnimationClass('animate-squash-drop');
    }, 500);
    return () => clearTimeout(timer);
  };

  const triggerCollapse = () => {
    setIsExpanded(false);
    setAnimationClass('');
  };

  // Trigger after 2 seconds on mount, auto-collapsing after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      triggerExpand();
      const collapseTimer = setTimeout(() => {
        triggerCollapse();
      }, 4000);
      return () => clearTimeout(collapseTimer);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Handle scroll trigger inside the sheet
  const handleContentScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollTop > 15) {
      triggerExpand();
    } else if (target.scrollTop <= 5) {
      triggerCollapse();
    }
  };

  // Check login state (localStorage + Shared Cookie)
  useEffect(() => {
    let saved = localStorage.getItem('yay_user_phone');
    if (!saved) {
      const cookiePhone = getSharedCookie('yay_user_phone');
      if (cookiePhone) {
        localStorage.setItem('yay_user_phone', cookiePhone);
        saved = cookiePhone;
      }
    }
    if (saved) setLoggedInPhone(saved);
  }, []);

  // Title rotator
  useEffect(() => {
    const titles = ["Wazle", "Wazle Forever", "Everything clear with us", "Wazle Indonesia"];
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % titles.length;
      document.title = titles[index];
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleLoginSuccess = (data: any, phone: string) => {
    localStorage.setItem('yay_user_phone', phone);
    setSharedCookie('yay_user_phone', phone);
    setLoggedInPhone(phone);
    setShowLogin(false);
  };

  const handleGoDashboard = () => {
    window.location.href = `https://dash.wazle.my.id/?authPhone=${loggedInPhone}`;
  };

  const submitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setTicketStatus('loading');
    try {
      const res = await fetch('/api/proxy/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketForm)
      });
      const data = await res.json();
      if (data.status === 'success') {
        setTicketStatus('success');
        setTicketForm({ name: '', whatsapp: '', subject: '', message: '' });
      } else {
        setTicketStatus('error');
      }
    } catch {
      setTicketStatus('error');
    }
  };

  const handleDownload = () => {
    if (downloadCooldown > 0 || isDownloading) return;
    setIsDownloading(true);
    setDownloadCooldown(2);
    const interval = setInterval(() => {
      setDownloadCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          window.location.href = apkUrl;
          setTimeout(() => setIsDownloading(false), 1000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0d0d11] text-zinc-900 selection:bg-zinc-800/10 font-sans flex items-center justify-center p-3 sm:p-6 md:p-8 relative">
      
      {/* Hidden SVG Gooey Filter Definition */}
      <svg className="absolute w-0 h-0 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Background Ambience / Blur */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-zinc-800/30 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-zinc-700/20 rounded-full blur-[120px]"></div>
      </div>

      {/* Floating Main Sheet Container with viewport constraint */}
      <div className="relative z-10 w-full h-full max-h-[calc(100vh-1.5rem)] sm:max-h-[calc(100vh-3rem)] md:max-h-[calc(100vh-4rem)] max-w-7xl rounded-[2.5rem] bg-[#fdfcf7] border border-white/20 shadow-2xl flex flex-col justify-between overflow-hidden">
        
        {/* Navigation Bar inside Sheet */}
        <nav className="px-6 sm:px-8 py-4 border-b border-zinc-200/50 flex items-center justify-between shrink-0 bg-[#fdfcf7]/80 backdrop-blur-md z-20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-950 flex items-center justify-center text-white font-bold text-lg">W</div>
            <span className="font-bold text-lg tracking-tight text-zinc-950">Wazle</span>
          </div>
          
          {/* Tabs Menu with Gooey Distortion Slide */}
          <div className="hidden md:flex relative items-center bg-zinc-200/50 p-1 rounded-full border border-zinc-300/30 text-[11px] font-semibold text-zinc-650 w-[520px]">
            
            {/* Gooey background layer */}
            <div className="absolute inset-0 flex items-center p-1 pointer-events-none" style={{ filter: 'url(#goo)' }}>
              {(['home', 'features', 'pricing', 'tickets', 'download'] as Tab[]).map((tab) => (
                <div key={`bg-${tab}`} className="flex-1 h-full relative flex items-center justify-center">
                  {activeTab === tab && (
                    <motion.div
                      layoutId="gooey-pill"
                      className="absolute inset-0 bg-zinc-950 rounded-full w-full h-full"
                      transition={{ type: 'spring', stiffness: 140, damping: 14 }}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Foreground text buttons */}
            {(['home', 'features', 'pricing', 'tickets', 'download'] as Tab[]).map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative z-10 flex-1 text-center py-1.5 rounded-full transition-colors duration-300 capitalize ${
                  activeTab === tab ? 'text-white' : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                {tab === 'tickets' ? 'support' : tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {loggedInPhone ? (
              <button 
                onClick={handleGoDashboard}
                className="px-5 py-2 bg-zinc-950 hover:bg-zinc-900 text-white rounded-full text-xs font-bold transition-all shadow-md active:scale-95"
              >
                Dashboard
              </button>
            ) : (
              <button 
                onClick={() => setShowLogin(true)}
                className="px-5 py-2 bg-zinc-200/60 hover:bg-zinc-200 text-zinc-900 rounded-full text-xs font-bold transition-all active:scale-95"
              >
                Login
              </button>
            )}
          </div>
        </nav>

        {/* Scrollable Main Content inside Sheet */}
        <div 
          onScroll={handleContentScroll}
          className="flex-1 overflow-y-auto no-scrollbar px-6 sm:px-12 py-4 md:py-6 flex flex-col justify-center"
        >
          
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-4xl mx-auto text-center space-y-4 my-auto py-2"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-900"></span>
                  Next-Gen Hosting for Bots
                </div>
                <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-950 leading-tight">
                  The Ultimate<br/>Infrastructure<br/>For Your Bots.
                </h1>
                <p className="text-xs sm:text-sm text-zinc-500 max-w-lg mx-auto leading-relaxed">
                  Lightning-fast hosting designed for Discord and Telegram bots. Experience professional-grade reliability, secure infrastructure, and instant deployment.
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button onClick={() => setShowLogin(true)} className="px-5 py-2.5 bg-zinc-950 text-white rounded-full text-xs font-bold hover:bg-zinc-900 transition-all active:scale-95">
                    Get Started Now
                  </button>
                  <button onClick={() => setActiveTab('pricing')} className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 border border-zinc-200 rounded-full text-xs font-bold transition-all active:scale-95">
                    View Pricing
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'features' && (
              <motion.div
                key="features"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="w-full max-w-5xl mx-auto py-2"
              >
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-extrabold text-zinc-950">Everything you need</h2>
                  <p className="text-zinc-500 text-[11px] mt-0.5">Built for reliability, speed, and simplicity.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { icon: 'bolt', title: 'High Performance', desc: 'Powered by latest generation CPUs and NVMe SSDs for instant responses.' },
                    { icon: 'shield', title: 'Cloudflare Protection', desc: 'Enterprise-grade DDoS mitigation filters malicious traffic automatically.' },
                    { icon: 'public', title: 'Global Edge Network', desc: 'Deploy your server in optimal regions for lowest latency and maximum uptime.' },
                  ].map((f, i) => (
                    <div key={i} className="p-5 rounded-2xl bg-white border border-zinc-200/60 shadow-sm hover:border-zinc-300 hover:shadow-md transition-all flex flex-col items-start text-left">
                      <span className="material-symbols-outlined text-2xl mb-3 text-zinc-900">{f.icon}</span>
                      <h3 className="text-sm font-bold text-zinc-950 mb-1">{f.title}</h3>
                      <p className="text-zinc-500 text-[11px] leading-relaxed">{f.desc}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'pricing' && (
              <motion.div
                key="pricing"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="w-full max-w-5xl mx-auto py-1"
              >
                <div className="text-center mb-4">
                  <h2 className="text-2xl font-extrabold text-zinc-950">Simple, transparent pricing</h2>
                  <p className="text-zinc-500 text-[11px] mt-0.5">No hidden fees. Cancel anytime.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-start">
                  {[
                    { name: 'Free', price: 'Gratis', desc: 'Sempurna untuk coba-coba', features: ['1 Auto Responder', 'No File Upload', 'Limited API', '1 Linked Group'] },
                    { name: 'Basic', price: 'Rp 2.000', desc: 'Cocok untuk grup kecil', features: ['5 Auto Responders', '500 KB Max Upload', '50 MB Storage', '1 Linked Group'] },
                    { name: 'Standard', price: 'Rp 5.000', desc: 'Sempurna untuk grup aktif', popular: true, features: ['25 Auto Responders', '5 MB Max Upload', '500 MB Storage', '2 Linked Groups'] },
                    { name: 'Premium', price: 'Rp 20.000', desc: 'Bisnis & komunitas besar', features: ['100 Auto Responders', '15 MB Max Upload', '1000 MB Storage', '5 Linked Groups'] }
                  ].map((p, i) => (
                    <div key={i} className={`p-4 rounded-2xl border ${p.popular ? 'border-zinc-950 bg-zinc-950 text-white shadow-lg relative' : 'border-zinc-200 bg-white text-zinc-950 shadow-sm'}`}>
                      {p.popular && <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-white text-zinc-950 text-[8px] font-black rounded-full uppercase tracking-wider border border-zinc-200">Popular</div>}
                      <h3 className="text-sm font-bold mb-0.5">{p.name}</h3>
                      <p className={`text-[9px] mb-2.5 h-5 overflow-hidden ${p.popular ? 'text-zinc-400' : 'text-zinc-500'}`}>{p.desc}</p>
                      <div className="text-xl font-black mb-3">{p.price}</div>
                      
                      <div className="space-y-1.5 mb-4">
                        {p.features.map((feat, idx) => (
                          <div key={idx} className="flex items-start gap-1.5">
                            <span className={`material-symbols-outlined text-[12px] shrink-0 ${p.popular ? 'text-white' : 'text-zinc-900'}`}>check_circle</span>
                            <span className={`text-[9px] leading-tight ${p.popular ? 'text-zinc-300' : 'text-zinc-650'}`}>{feat}</span>
                          </div>
                        ))}
                      </div>
                      
                      <button 
                        onClick={() => setShowLogin(true)}
                        className={`w-full py-2 rounded-xl text-[10px] font-bold transition-all active:scale-95 ${p.popular ? 'bg-white text-zinc-950 hover:bg-zinc-100' : 'bg-zinc-950 text-white hover:bg-zinc-900'}`}
                      >
                        Pilih Paket
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'tickets' && (
              <motion.div
                key="tickets"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="w-full max-w-sm mx-auto py-2"
              >
                <div className="text-center mb-4">
                  <h2 className="text-2xl font-extrabold text-zinc-950">Submit Ticket</h2>
                  <p className="text-zinc-500 text-[11px] mt-0.5">Need help? Send us a message and we'll get back to you.</p>
                </div>

                {ticketStatus === 'success' ? (
                  <div className="p-5 bg-zinc-100 border border-zinc-200 rounded-2xl text-center">
                    <span className="material-symbols-outlined text-zinc-900 text-3xl mb-2">check_circle</span>
                    <p className="text-zinc-900 font-bold text-xs">Ticket submitted successfully!</p>
                    <button onClick={() => setTicketStatus('idle')} className="mt-3 px-3 py-1.5 bg-zinc-950 text-white text-[10px] font-bold rounded-lg hover:bg-zinc-900">Submit Another</button>
                  </div>
                ) : (
                  <form onSubmit={submitTicket} className="space-y-2.5 bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm text-left">
                    <div>
                      <label className="block text-[9px] font-bold text-zinc-400 mb-0.5 uppercase tracking-wider">Name</label>
                      <input required type="text" value={ticketForm.name} onChange={e => setTicketForm({...ticketForm, name: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-500 transition-colors" placeholder="Your name" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] font-bold text-zinc-400 mb-0.5 uppercase tracking-wider">WhatsApp Number</label>
                        <input required type="text" value={ticketForm.whatsapp} onChange={e => setTicketForm({...ticketForm, whatsapp: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-500 transition-colors" placeholder="08..." />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-zinc-400 mb-0.5 uppercase tracking-wider">Subject</label>
                        <input required type="text" value={ticketForm.subject} onChange={e => setTicketForm({...ticketForm, subject: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-500 transition-colors" placeholder="Topic" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-zinc-400 mb-0.5 uppercase tracking-wider">Message</label>
                      <textarea required value={ticketForm.message} onChange={e => setTicketForm({...ticketForm, message: e.target.value})} rows={2} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-500 transition-colors resize-none" placeholder="Describe your issue..."></textarea>
                    </div>
                    <button type="submit" disabled={ticketStatus === 'loading'} className="w-full py-2 bg-zinc-950 hover:bg-zinc-900 text-white text-[11px] font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50 mt-1">
                      {ticketStatus === 'loading' ? 'Submitting...' : 'Submit Ticket'}
                    </button>
                  </form>
                )}
              </motion.div>
            )}

            {activeTab === 'download' && (
              <motion.div
                key="download"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="w-full max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-6 py-2 text-left"
              >
                <div className="md:w-1/2 space-y-3">
                  <h2 className="text-2xl font-black text-zinc-950 leading-tight">Unduh Aplikasi <br/><span className="text-zinc-650">Wazle App</span></h2>
                  <p className="text-zinc-550 text-xs leading-relaxed">
                    Dapatkan pengalaman terbaik mengatur bot Anda langsung dari genggaman. Pantau statistik, atur auto-responder, dan kelola grup melalui aplikasi Android kami yang cepat, responsif, dan elegan.
                  </p>
                  
                  <div className="pt-1">
                    <button
                      onClick={handleDownload}
                      disabled={downloadCooldown > 0 || isDownloading}
                      className={`px-5 py-2.5 rounded-full font-bold text-[10px] flex items-center justify-center gap-1.5 transition-all ${
                        downloadCooldown > 0 
                        ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200'
                        : 'bg-zinc-950 text-white hover:bg-zinc-900 hover:scale-102 active:scale-95 shadow-md shadow-zinc-950/10'
                      }`}
                    >
                      {downloadCooldown > 0 ? (
                        <>
                          <span className="material-symbols-outlined animate-spin text-[14px]">refresh</span>
                          Memulai Unduhan ({downloadCooldown}s)
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[14px]">android</span>
                          Download APK
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="md:w-1/2 flex justify-center">
                  <div className="relative w-40 h-[190px] bg-zinc-950 rounded-[1.8rem] border-[4px] border-zinc-800 shadow-lg overflow-hidden flex flex-col justify-between p-3 text-white">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-2.5 bg-zinc-800 rounded-b-md"></div>
                    <div className="flex items-center gap-1 mt-1.5">
                      <div className="w-4 h-4 rounded-full bg-zinc-800 flex items-center justify-center"><span className="material-symbols-outlined text-[8px] text-white">public</span></div>
                      <div className="font-bold text-[8px]">Wazle Dashboard</div>
                    </div>
                    <div className="space-y-1 my-auto">
                      <div className="h-8 bg-zinc-900 rounded-md border border-zinc-800 p-1.5 flex flex-col justify-center">
                        <div className="w-1/3 h-1 bg-zinc-700 rounded-full mb-0.5"></div>
                        <div className="w-2/3 h-0.5 bg-zinc-800 rounded-full"></div>
                      </div>
                      <div className="h-8 bg-zinc-900 rounded-md border border-zinc-800 p-1.5 flex flex-col justify-center">
                        <div className="w-1/2 h-1 bg-zinc-700 rounded-full mb-0.5"></div>
                        <div className="w-1/3 h-0.5 bg-zinc-800 rounded-full"></div>
                      </div>
                    </div>
                    <div className="h-1 w-10 bg-zinc-800 rounded-full mx-auto"></div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
        </div>

        {/* Responsive Collapsible Monochrome Footer */}
        <footer 
          onMouseEnter={triggerExpand}
          onMouseLeave={triggerCollapse}
          className={`bg-[#121214] text-white rounded-t-[2rem] w-full shrink-0 relative z-10 shadow-[0_-8px_30px_rgba(0,0,0,0.25)] transition-all duration-500 overflow-hidden flex flex-col justify-between ${
            isExpanded 
              ? `h-[155px] sm:h-[180px] md:h-[180px] p-4.5 sm:p-5 md:px-10 py-4.5 ${animationClass}`
              : 'h-[40px] py-2.5 flex items-center justify-center cursor-pointer p-0 select-none'
          }`}
        >
          {!isExpanded ? (
            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
              <span>Wazle @2026</span>
              <span className="material-symbols-outlined text-[12px] animate-bounce">keyboard_arrow_up</span>
            </div>
          ) : (
            <div className="w-full flex flex-col justify-between h-full text-center md:text-left gap-3">
              
              {/* Upper Section */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-zinc-850">
                
                {/* Desktop/Tablet Left: Contact Info */}
                <div className="hidden md:block space-y-1.5 text-left">
                  <h4 className="text-zinc-400 font-bold text-[9px] uppercase tracking-wider">Contact</h4>
                  <div className="text-[9px] text-zinc-355 space-y-0.5">
                    <p>Support WA: +62 882-0086-77172</p>
                    <p>Email: support@wazle.my.id</p>
                  </div>
                  <div className="flex gap-2.5 text-[8px] text-zinc-450">
                    <a href="https://facebook.com" className="hover:text-white transition-colors">Facebook</a>
                    <a href="https://instagram.com" className="hover:text-white transition-colors">Instagram</a>
                    <a href="https://linkedin.com" className="hover:text-white transition-colors">LinkedIn</a>
                  </div>
                </div>

                {/* Center: Logo & Slogan (Always centered) */}
                <div className="flex flex-col items-center text-center space-y-1 md:absolute md:left-1/2 md:-translate-x-1/2">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M50 15C52 35 65 48 85 50C65 52 52 65 50 85C48 65 35 52 15 50C35 48 48 35 50 15Z" fill="currentColor"/>
                    <circle cx="50" cy="50" r="8" fill="#121214"/>
                  </svg>
                  <div className="font-extrabold text-[11px] tracking-widest uppercase">Wazle</div>
                  <div className="text-[8px] text-zinc-400 font-medium tracking-wide">The Ultimate Bot Infrastructure</div>
                  
                  {/* Action buttons shown on tablet/desktop */}
                  <div className="hidden sm:flex items-center gap-1.5 pt-0.5">
                    <button onClick={() => setShowLogin(true)} className="px-2.5 py-0.5 bg-white text-zinc-950 font-bold rounded-full text-[8px] hover:bg-zinc-100 transition-colors">Start Free</button>
                    <button onClick={() => setActiveTab('download')} className="px-2.5 py-0.5 bg-transparent border border-zinc-700 text-white font-bold rounded-full text-[8px] hover:bg-zinc-800 transition-colors">Download App</button>
                  </div>
                </div>

                {/* Desktop/Tablet Right: Quick Links */}
                <div className="hidden md:block space-y-1.5 text-right">
                  <h4 className="text-zinc-400 font-bold text-[9px] uppercase tracking-wider">Quick Links</h4>
                  <div className="space-y-0.5 text-[9px] text-zinc-300">
                    <button onClick={() => setActiveTab('home')} className="block hover:text-white ml-auto transition-colors">Home</button>
                    <button onClick={() => setActiveTab('features')} className="block hover:text-white ml-auto transition-colors">Features</button>
                    <button onClick={() => setActiveTab('pricing')} className="block hover:text-white ml-auto transition-colors">Pricing</button>
                    <button onClick={() => setActiveTab('tickets')} className="block hover:text-white ml-auto transition-colors">Support Tickets</button>
                  </div>
                </div>

                {/* Mobile-Only Row (Contact & Links combined inline) */}
                <div className="md:hidden flex flex-col items-center gap-2.5 w-full pt-1.5">
                  <div className="flex flex-wrap justify-center gap-x-3 text-[8px] text-zinc-400">
                    <span>WA: +62 882-0086-77172</span>
                    <span>•</span>
                    <span>Email: support@wazle.my.id</span>
                  </div>
                  <div className="flex justify-center gap-3.5 text-[8px] font-semibold text-zinc-355">
                    <button onClick={() => setActiveTab('home')} className="hover:text-white transition-colors">Home</button>
                    <button onClick={() => setActiveTab('features')} className="hover:text-white transition-colors">Features</button>
                    <button onClick={() => setActiveTab('pricing')} className="hover:text-white transition-colors">Pricing</button>
                    <button onClick={() => setActiveTab('tickets')} className="hover:text-white transition-colors">Support</button>
                  </div>
                </div>

              </div>

              {/* Bottom Row (Copyright & Policy) */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-1.5 text-[8px] text-zinc-500">
                <p>© 2026 Wazle. All rights reserved.</p>
                <div className="flex gap-2.5">
                  <a href="#" className="hover:text-zinc-300 transition-colors">Cookies policy</a>
                  <a href="#" className="hover:text-zinc-300 transition-colors">Privacy policy</a>
                </div>
              </div>
            </div>
          )}
        </footer>

      </div>

      {/* Login Modal */}
      <AnimatePresence>
        {showLogin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          >
            <div className="relative w-full max-w-md">
              <button 
                onClick={() => setShowLogin(false)} 
                className="absolute -top-12 right-0 md:-right-12 md:-top-0 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white/80 hover:text-white transition-all border border-white/10"
                title="Close"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
              <LoginGate onLoginSuccess={handleLoginSuccess} isMobile={false} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none !important; }
        .no-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }

        @keyframes anticipation-up {
          0% { transform: translateY(0); }
          30% { transform: translateY(12px); }
          75% { transform: translateY(-6px); }
          100% { transform: translateY(0); }
        }

        @keyframes squash-stretch-drop {
          0% {
            transform: translateY(-22px) scaleY(1.18) scaleX(0.82);
            transform-origin: bottom;
          }
          40% {
            transform: translateY(0) scaleY(0.68) scaleX(1.32);
            transform-origin: bottom;
          }
          65% {
            transform: translateY(-8px) scaleY(1.12) scaleX(0.88);
            transform-origin: bottom;
          }
          85% {
            transform: translateY(0) scaleY(0.96) scaleX(1.04);
            transform-origin: bottom;
          }
          100% {
            transform: translateY(0) scaleY(1) scaleX(1);
            transform-origin: bottom;
          }
        }

        .animate-anticipation {
          animation: anticipation-up 0.5s ease-in-out forwards;
        }

        .animate-squash-drop {
          animation: squash-stretch-drop 0.7s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
      `}} />

    </div>
  );
}
