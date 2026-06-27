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
      
      {/* Background Ambience / Blur */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-zinc-800/30 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-zinc-700/20 rounded-full blur-[120px]"></div>
      </div>

      {/* Floating Main Sheet Container with explicit viewport height constraint */}
      <div className="relative z-10 w-full h-full max-h-[calc(100vh-1.5rem)] sm:max-h-[calc(100vh-3rem)] md:max-h-[calc(100vh-4rem)] max-w-7xl rounded-[2.5rem] bg-[#fdfcf7] border border-white/20 shadow-2xl flex flex-col justify-between overflow-hidden">
        
        {/* Navigation Bar inside Sheet */}
        <nav className="px-6 sm:px-8 py-4 border-b border-zinc-200/50 flex items-center justify-between shrink-0 bg-[#fdfcf7]/80 backdrop-blur-md z-20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-950 flex items-center justify-center text-white font-bold text-lg">W</div>
            <span className="font-bold text-lg tracking-tight text-zinc-950">Wazle</span>
          </div>
          
          {/* Tabs Menu */}
          <div className="hidden md:flex items-center gap-1 bg-zinc-200/50 p-1 rounded-full border border-zinc-300/30 text-[11px] font-semibold text-zinc-650">
            {(['home', 'features', 'pricing', 'tickets', 'download'] as Tab[]).map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-full transition-all capitalize ${activeTab === tab ? 'bg-zinc-950 text-white shadow-sm' : 'hover:text-zinc-950'}`}
              >
                {tab === 'tickets' ? 'support tickets' : tab}
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

        {/* Scrollable Main Content inside Sheet (Hidden scrollbar for pure sheet feel) */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-6 sm:px-12 py-4 md:py-6 flex flex-col justify-center">
          
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

        {/* Premium Monochrome Footer inside Sheet (Reduced padding & height) */}
        <footer className="bg-[#121214] text-white rounded-t-[2.5rem] p-5 sm:p-6 md:px-10 py-4.5 flex flex-col gap-4 shrink-0 relative z-10 shadow-[0_-8px_30px_rgba(0,0,0,0.15)]">
          {/* Logo element sitting on top split line */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
            {/* Left Col: Contact Info */}
            <div className="space-y-2 text-left">
              <h4 className="text-zinc-400 font-bold text-[10px] uppercase tracking-wider">Contact</h4>
              <div className="text-[10px] text-zinc-355 space-y-0.5">
                <p>Support WA: +62 882-0086-77172</p>
                <p>Email: support@wazle.my.id</p>
              </div>
              <div className="flex gap-3 text-[9px] text-zinc-400">
                <a href="https://facebook.com" className="hover:text-white transition-colors flex items-center gap-0.5">Facebook <span className="material-symbols-outlined text-[8px]">arrow_outward</span></a>
                <a href="https://instagram.com" className="hover:text-white transition-colors flex items-center gap-0.5">Instagram <span className="material-symbols-outlined text-[8px]">arrow_outward</span></a>
                <a href="https://linkedin.com" className="hover:text-white transition-colors flex items-center gap-0.5">LinkedIn <span className="material-symbols-outlined text-[8px]">arrow_outward</span></a>
              </div>
            </div>

            {/* Center Col: Organic White Logo & Slogan */}
            <div className="flex flex-col items-center text-center space-y-1.5 md:absolute md:left-1/2 md:-translate-x-1/2">
              <svg className="w-8 h-8 text-white" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 15C52 35 65 48 85 50C65 52 52 65 50 85C48 65 35 52 15 50C35 48 48 35 50 15Z" fill="currentColor"/>
                <circle cx="50" cy="50" r="8" fill="#121214"/>
              </svg>
              <div className="font-extrabold text-xs tracking-widest uppercase">Wazle</div>
              <div className="text-[9px] text-zinc-400 font-medium tracking-wide">The Ultimate Bot Infrastructure</div>
              
              <div className="flex items-center gap-2 pt-1">
                <button onClick={() => setShowLogin(true)} className="px-3.5 py-1 bg-white text-zinc-950 font-bold rounded-full text-[9px] hover:bg-zinc-100 transition-colors">Start Free</button>
                <button onClick={() => setActiveTab('download')} className="px-3.5 py-1 bg-transparent border border-zinc-700 text-white font-bold rounded-full text-[9px] hover:bg-zinc-800 transition-colors">Download App</button>
              </div>
            </div>

            {/* Right Col: Quick Links */}
            <div className="space-y-2 text-left md:text-right">
              <h4 className="text-zinc-400 font-bold text-[10px] uppercase tracking-wider">Quick Links</h4>
              <div className="grid grid-cols-2 md:grid-cols-1 gap-x-4 gap-y-0.5 text-[10px] text-zinc-300">
                <button onClick={() => setActiveTab('home')} className="hover:text-white text-left md:text-right transition-colors">Home</button>
                <button onClick={() => setActiveTab('features')} className="hover:text-white text-left md:text-right transition-colors">Features</button>
                <button onClick={() => setActiveTab('pricing')} className="hover:text-white text-left md:text-right transition-colors">Pricing</button>
                <button onClick={() => setActiveTab('tickets')} className="hover:text-white text-left md:text-right transition-colors">Support Tickets</button>
              </div>
            </div>
          </div>

          {/* Bottom row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[9px] text-zinc-500">
            <p>© 2026 Wazle. All rights reserved.</p>
            <div className="flex gap-3">
              <a href="#" className="hover:text-zinc-300 transition-colors">Cookies policy</a>
              <a href="#" className="hover:text-zinc-300 transition-colors">Privacy policy</a>
            </div>
          </div>
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
      `}} />

    </div>
  );
}
