'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';

const LoginGate = dynamic(() => import('@/components/LoginGate'));

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const [showTicket, setShowTicket] = useState(false);
  const [loggedInPhone, setLoggedInPhone] = useState('');
  
  // Download state
  const [downloadCooldown, setDownloadCooldown] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const apkUrl = "https://github.com/ansea-wav/Wazle/releases/download/Wazle/Wazle-beta-v0.2.apk";

  // Ticket state
  const [ticketForm, setTicketForm] = useState({ name: '', whatsapp: '', subject: '', message: '' });
  const [ticketStatus, setTicketStatus] = useState<'idle'|'loading'|'success'|'error'>('idle');

  useEffect(() => {
    const saved = localStorage.getItem('yay_user_phone');
    if (saved) setLoggedInPhone(saved);
  }, []);

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
    <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-blue-500/30 font-sans">
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-40 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <img src="/icons.png" alt="Wazle Logo" className="w-10 h-10 rounded-xl border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]" />
            <span className="font-bold text-xl tracking-wide">Wazle</span>
          </div>
          
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-8 text-sm font-medium text-white/60">
            <a href="#home" className="hover:text-white transition-colors">Home</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <button onClick={() => setShowTicket(true)} className="hover:text-white transition-colors">Tickets</button>
            <a href="#download" className="hover:text-white transition-colors">Download</a>
          </div>

          <div className="flex items-center gap-4">
            {loggedInPhone ? (
              <button 
                onClick={handleGoDashboard}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-semibold transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]"
              >
                Dashboard
              </button>
            ) : (
              <button 
                onClick={() => setShowLogin(true)}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-semibold transition-all"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-40 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
              The Ultimate<br/>Infrastructure<br/>For Your Bots.
            </h1>
            <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed">
              Lightning-fast hosting designed for Discord and Telegram bots. Experience professional-grade reliability, secure infrastructure, and instant deployment.
            </p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.8 }}
            className="flex items-center justify-center gap-4 pt-8"
          >
            <button onClick={() => setShowLogin(true)} className="px-8 py-4 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-colors">
              Get Started Now
            </button>
            <a href="#pricing" className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-full font-bold transition-colors">
              View Pricing
            </a>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 border-t border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need</h2>
            <p className="text-white/50">Built for reliability, speed, and simplicity.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: 'memory', title: 'High Performance', desc: 'Powered by latest generation CPUs and NVMe SSDs.' },
              { icon: 'shield', title: 'Cloudflare Protection', desc: 'Enterprise-grade DDoS mitigation filters malicious traffic.' },
              { icon: 'public', title: 'Global Edge Network', desc: 'Deploy your server in optimal regions for lowest latency.' },
            ].map((f, i) => (
              <div key={i} className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                <span className="material-symbols-outlined text-4xl mb-4 text-blue-400">{f.icon}</span>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-white/50 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-white/50">No hidden fees. Cancel anytime.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 items-start">
            {[
              { 
                name: 'Free', price: 'Gratis', period: '', desc: 'Sempurna untuk coba-coba', 
                features: ['1 Auto Responder', 'Tidak ada File Upload', 'Layanan API Terbatas', '1 Grup Terhubung']
              },
              { 
                name: 'Basic', price: 'Rp 2.000', period: '/mo', desc: 'Cocok untuk grup kecil', 
                features: ['5 Auto Responders', '500 KB Maks Upload', '50 MB Penyimpanan', '1 Grup Terhubung', 'Dukungan Dasar'] 
              },
              { 
                name: 'Standard', price: 'Rp 5.000', period: '/mo', desc: 'Sempurna untuk grup aktif', popular: true,
                features: ['25 Auto Responders', '5 MB Maks Upload', '500 MB Penyimpanan', '2 Grup Terhubung', 'Dukungan 24/7'] 
              },
              { 
                name: 'Premium', price: 'Rp 20.000', period: '/mo', desc: 'Untuk bisnis & komunitas besar',
                features: ['100 Auto Responders', '15 MB Maks Upload', '1000 MB Penyimpanan', '5 Grup Terhubung', 'Dukungan Prioritas 24/7'] 
              }
            ].map((p, i) => (
              <div key={i} className={`p-8 rounded-3xl border ${p.popular ? 'border-blue-500 bg-blue-500/5 relative shadow-[0_0_30px_rgba(59,130,246,0.1)]' : 'border-white/10 bg-white/[0.02]'}`}>
                {p.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full uppercase tracking-wider">Most Popular</div>}
                <h3 className="text-2xl font-bold mb-2">{p.name}</h3>
                <p className="text-sm text-white/50 mb-6 h-10">{p.desc}</p>
                <div className="text-4xl font-extrabold mb-8">{p.price}<span className="text-lg text-white/40 font-normal">{p.period}</span></div>
                
                <div className="space-y-3 mb-8">
                  {p.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-[18px] text-blue-400 shrink-0">check_circle</span>
                      <span className="text-sm text-white/80 leading-tight">{feat}</span>
                    </div>
                  ))}
                </div>
                
                <button 
                  onClick={() => setShowLogin(true)}
                  className={`w-full py-3 rounded-xl font-bold transition-colors ${p.popular ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                >
                  Pilih Paket
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section id="download" className="py-24 px-6 border-t border-white/5 bg-white/[0.01] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="md:w-1/2 space-y-6 text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">Unduh Aplikasi <br/><span className="text-blue-500">Wazle App</span></h2>
            <p className="text-white/60 text-lg leading-relaxed max-w-xl">
              Dapatkan pengalaman terbaik mengatur bot Anda langsung dari genggaman. Pantau statistik, atur auto-responder, dan kelola grup melalui aplikasi Android kami yang cepat dan responsif.
            </p>
            
            <div className="pt-4 flex justify-center md:justify-start">
              <button
                onClick={handleDownload}
                disabled={downloadCooldown > 0 || isDownloading}
                className={`px-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                  downloadCooldown > 0 
                  ? 'bg-white/10 text-white/50 cursor-not-allowed'
                  : 'bg-white text-black hover:bg-gray-200 hover:scale-105 shadow-[0_10px_25px_rgba(255,255,255,0.2)]'
                }`}
              >
                {downloadCooldown > 0 ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">refresh</span>
                    Memulai Unduhan ({downloadCooldown}s)
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-2xl">android</span>
                    Download APK
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-64 h-[500px] bg-[#111113] rounded-[40px] border-[8px] border-[#222] shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-[#222] rounded-b-xl z-20"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-purple-900/40 z-0"></div>
              
              <div className="relative z-10 h-full p-4 flex flex-col pt-12">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center"><span className="material-symbols-outlined text-white text-[16px]">public</span></div>
                  <div className="font-bold">Wazle Dashboard</div>
                </div>
                
                <div className="space-y-3">
                  <div className="h-24 bg-white/5 rounded-xl border border-white/10 p-3">
                    <div className="w-1/2 h-3 bg-white/20 rounded-full mb-2"></div>
                    <div className="w-3/4 h-3 bg-white/10 rounded-full"></div>
                  </div>
                  <div className="h-24 bg-white/5 rounded-xl border border-white/10 p-3">
                    <div className="w-2/3 h-3 bg-white/20 rounded-full mb-2"></div>
                    <div className="w-1/2 h-3 bg-white/10 rounded-full"></div>
                  </div>
                  <div className="h-24 bg-white/5 rounded-xl border border-white/10 p-3">
                    <div className="w-1/3 h-3 bg-white/20 rounded-full mb-2"></div>
                    <div className="w-5/6 h-3 bg-white/10 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ticket Modal */}
      <AnimatePresence>
        {showTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[#111113] border border-white/10 rounded-2xl p-6 relative"
            >
              <button onClick={() => setShowTicket(false)} className="absolute top-4 right-4 text-white/40 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
              
              <h3 className="text-2xl font-bold mb-2">Submit Ticket</h3>
              <p className="text-white/50 text-sm mb-6">Need help? Send us a message and we'll get back to you.</p>

              {ticketStatus === 'success' ? (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-center">
                  <span className="material-symbols-outlined text-green-400 text-4xl mb-2">check_circle</span>
                  <p className="text-green-400 font-medium">Ticket submitted successfully!</p>
                  <button onClick={() => {setShowTicket(false); setTicketStatus('idle');}} className="mt-4 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30">Close</button>
                </div>
              ) : (
                <form onSubmit={submitTicket} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-white/50 mb-1 uppercase tracking-wider">Name</label>
                    <input required type="text" value={ticketForm.name} onChange={e => setTicketForm({...ticketForm, name: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="Your name" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/50 mb-1 uppercase tracking-wider">WhatsApp Number</label>
                    <input required type="text" value={ticketForm.whatsapp} onChange={e => setTicketForm({...ticketForm, whatsapp: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="08..." />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/50 mb-1 uppercase tracking-wider">Subject</label>
                    <input required type="text" value={ticketForm.subject} onChange={e => setTicketForm({...ticketForm, subject: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="Issue topic" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/50 mb-1 uppercase tracking-wider">Message</label>
                    <textarea required value={ticketForm.message} onChange={e => setTicketForm({...ticketForm, message: e.target.value})} rows={4} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none" placeholder="Describe your issue..."></textarea>
                  </div>
                  <button type="submit" disabled={ticketStatus === 'loading'} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50">
                    {ticketStatus === 'loading' ? 'Submitting...' : 'Submit Ticket'}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Modal */}
      <AnimatePresence>
        {showLogin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
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

    </div>
  );
}
