'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { getSharedCookie, setSharedCookie } from '@/lib/cookies';

const LoginGate = dynamic(() => import('@/components/LoginGate'));

type Tab = 'home' | 'features' | 'pricing' | 'tickets' | 'download';
type Lang = 'en' | 'id';

const translations = {
  en: {
    heroBadge: "Next-Gen Hosting for Bots",
    heroTitle: "The Ultimate\nInfrastructure\nFor Your Bots.",
    heroDesc: "Lightning-fast hosting designed for Discord and Telegram bots. Experience professional-grade reliability, secure infrastructure, and instant deployment.",
    ctaStart: "Get Started Now",
    ctaPricing: "View Pricing",
    featuresTitle: "Everything you need",
    featuresDesc: "Built for reliability, speed, and simplicity.",
    pricingTitle: "Simple, transparent pricing",
    pricingDesc: "No hidden fees. Cancel anytime.",
    supportTitle: "Submit Ticket",
    supportDesc: "Need help? Send us a message and we'll get back to you.",
    downloadTitle: "Download Wazle App",
    downloadDesc: "Get the best experience managing your bots directly from your palm. Monitor statistics, configure auto-responders, and manage groups through our fast, responsive, and elegant Android application.",
    contact: "Contact",
    quickLinks: "Quick Links",
    allRights: "© 2026 Wazle. All rights reserved.",
    cookiesPolicy: "Cookies policy",
    privacyPolicy: "Privacy policy",
    startFree: "Start Free",
    downloadApp: "Download App",
    selectPlan: "Choose Plan",
    ticketName: "Name",
    ticketPhone: "WhatsApp Number",
    ticketSubject: "Subject",
    ticketMessage: "Message",
    ticketSubmit: "Submit Ticket",
    ticketSubmitting: "Submitting...",
    ticketSuccess: "Ticket submitted successfully!",
    ticketAnother: "Submit Another",
    freeDesc: "Perfect for testing",
    basicDesc: "Great for small groups",
    standardDesc: "Perfect for active groups",
    premiumDesc: "For large business & communities",
    popular: "Popular",
    downloadBtn: "Download APK",
    downloadingBtn: "Starting Download",
    gratis: "Free",
    bulan: "month",
    supportLabel: "support"
  },
  id: {
    heroBadge: "Next-Gen Hosting untuk Bot",
    heroTitle: "Infrastruktur\nTerbaik Untuk\nBot Anda.",
    heroDesc: "Hosting super cepat yang dirancang untuk bot Discord dan Telegram. Nikmati keandalan kelas profesional, infrastruktur aman, dan peluncuran instan.",
    ctaStart: "Mulai Sekarang",
    ctaPricing: "Lihat Harga",
    featuresTitle: "Semua yang Anda butuhkan",
    featuresDesc: "Dibuat untuk keandalan, kecepatan, dan kesederhanaan.",
    pricingTitle: "Harga sederhana & transparan",
    pricingDesc: "Tanpa biaya tersembunyi. Batalkan kapan saja.",
    supportTitle: "Kirim Tiket",
    supportDesc: "Butuh bantuan? Kirim pesan dan kami akan segera membalas Anda.",
    downloadTitle: "Unduh Aplikasi Wazle App",
    downloadDesc: "Dapatkan pengalaman terbaik mengatur bot Anda langsung dari genggaman. Pantau statistik, atur auto-responder, dan kelola grup melalui aplikasi Android kami yang cepat, responsif, dan elegan.",
    contact: "Kontak",
    quickLinks: "Tautan Langsung",
    allRights: "© 2026 Wazle. Hak cipta dilindungi undang-undang.",
    cookiesPolicy: "Kebijakan cookies",
    privacyPolicy: "Kebijakan privasi",
    startFree: "Mulai Gratis",
    downloadApp: "Unduh Aplikasi",
    selectPlan: "Pilih Paket",
    ticketName: "Nama",
    ticketPhone: "Nomor WhatsApp",
    ticketSubject: "Subjek",
    ticketMessage: "Pesan",
    ticketSubmit: "Kirim Tiket",
    ticketSubmitting: "Mengirim...",
    ticketSuccess: "Tiket berhasil dikirim!",
    ticketAnother: "Kirim Lainnya",
    freeDesc: "Sempurna untuk coba-coba",
    basicDesc: "Cocok untuk grup kecil",
    standardDesc: "Sempurna untuk grup aktif",
    premiumDesc: "Bisnis & komunitas besar",
    popular: "Populer",
    downloadBtn: "Download APK",
    downloadingBtn: "Memulai Unduhan",
    gratis: "Gratis",
    bulan: "bulan",
    supportLabel: "bantuan"
  }
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [showLogin, setShowLogin] = useState(false);
  const [loggedInPhone, setLoggedInPhone] = useState('');
  
  // Language Switch States
  const [lang, setLang] = useState<Lang>('id');
  const [langHovered, setLangHovered] = useState(false);
  const [langAutoHide, setLangAutoHide] = useState(false);

  // Download state
  const [downloadCooldown, setDownloadCooldown] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const apkUrl = "https://github.com/ansea-wav/Wazle/releases/download/Wazle/Wazle-beta-v0.2.apk";

  // Ticket state
  const [ticketForm, setTicketForm] = useState({ name: '', whatsapp: '', subject: '', message: '' });
  const [ticketStatus, setTicketStatus] = useState<'idle'|'loading'|'success'|'error'>('idle');

  // Collapsible Footer States & Animations
  const [isExpanded, setIsExpanded] = useState(false);
  const [windowWidth, setWindowWidth] = useState(1200);

  // DevTools / Security Lock States
  const [isLocked, setIsLocked] = useState(false);
  const [isDOMCleared, setIsDOMCleared] = useState(false);

  // Translations shortcut
  const t = translations[lang];

  // Language auto-hide logic: collapse after 1.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setLangAutoHide(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Sync saved language preference
  useEffect(() => {
    const saved = localStorage.getItem('yay_lang') as Lang;
    if (saved === 'en' || saved === 'id') {
      setLang(saved);
    }
  }, []);

  const handleLangChange = (newLang: Lang) => {
    setLang(newLang);
    localStorage.setItem('yay_lang', newLang);
  };

  // Security Lock logic (inspect elements blocker)
  useEffect(() => {
    const handleLock = () => {
      if (isLocked) return;
      setIsLocked(true);
      setTimeout(() => {
        setIsDOMCleared(true);
      }, 700);
    };

    // 1. Block right click context menu on desktop, but allow on mobile touch hold-press
    const preventRightClick = (e: MouseEvent) => {
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      if (isTouch) return;
      e.preventDefault(); // Prevent native right-click menu on desktop, but do NOT lock yet
    };
    window.addEventListener('contextmenu', preventRightClick);

    // 2. Block keyboard inspector hotkeys (F12, Ctrl+Shift+I, Ctrl+Shift+C, Ctrl+Shift+J, Ctrl+U)
    const handleKeydown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      
      if (e.key === 'F12') {
        e.preventDefault();
        handleLock();
      }
      
      if ((e.ctrlKey && e.shiftKey && e.key === 'I') || (isMac && e.metaKey && e.altKey && e.key === 'i')) {
        e.preventDefault();
        handleLock();
      }

      if ((e.ctrlKey && e.shiftKey && e.key === 'C') || (isMac && e.metaKey && e.altKey && e.key === 'c')) {
        e.preventDefault();
        handleLock();
      }

      if ((e.ctrlKey && e.shiftKey && e.key === 'J') || (isMac && e.metaKey && e.altKey && e.key === 'j')) {
        e.preventDefault();
        handleLock();
      }

      if ((e.ctrlKey && e.key === 'u') || (isMac && e.metaKey && e.key === 'u')) {
        e.preventDefault();
        handleLock();
      }
    };
    window.addEventListener('keydown', handleKeydown);

    // 3. Detect DevTools size thresholds (e.g. docked inspectors)
    const checkDevTools = () => {
      const threshold = 160;
      const widthDev = window.outerWidth - window.innerWidth > threshold;
      const heightDev = window.outerHeight - window.innerHeight > threshold;
      
      if (widthDev || heightDev) {
        handleLock();
      }
    };
    const devToolsInterval = setInterval(checkDevTools, 1000);
    window.addEventListener('resize', checkDevTools);

    return () => {
      window.removeEventListener('contextmenu', preventRightClick);
      window.removeEventListener('keydown', handleKeydown);
      clearInterval(devToolsInterval);
      window.removeEventListener('resize', checkDevTools);
    };
  }, [isLocked]);

  // Mobile Fullscreen on first user gesture
  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (!isTouch) return;

    const enterFullscreen = () => {
      const doc = document.documentElement;
      if (doc.requestFullscreen) {
        doc.requestFullscreen().catch((err) => {
          console.log("Fullscreen request rejected:", err);
        });
      } else if ((doc as any).webkitRequestFullscreen) {
        (doc as any).webkitRequestFullscreen();
      } else if ((doc as any).msRequestFullscreen) {
        (doc as any).msRequestFullscreen();
      }
      
      // Clean up listeners immediately after first tap
      window.removeEventListener('click', enterFullscreen);
      window.removeEventListener('touchend', enterFullscreen);
    };

    window.addEventListener('click', enterFullscreen);
    window.addEventListener('touchend', enterFullscreen);

    return () => {
      window.removeEventListener('click', enterFullscreen);
      window.removeEventListener('touchend', enterFullscreen);
    };
  }, []);

  // Monitor window size for responsive spring heights
  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const triggerExpand = () => {
    setIsExpanded(true);
  };

  const triggerCollapse = () => {
    setIsExpanded(false);
  };

  // Trigger after 2 seconds on mount, auto-collapsing after 4 seconds
  useEffect(() => {
    let collapseTimer: NodeJS.Timeout;
    const timer = setTimeout(() => {
      triggerExpand();
      collapseTimer = setTimeout(() => {
        triggerCollapse();
      }, 4000);
    }, 2000);
    return () => {
      clearTimeout(timer);
      if (collapseTimer) clearTimeout(collapseTimer);
    };
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

  // Completely empty DOM if cleared by security lock
  if (isDOMCleared) {
    return <div className="h-screen h-[100dvh] w-screen bg-[#0d0d11]" />;
  }

  // Determine current height based on active breakpoint
  const targetExpandedHeight = windowWidth < 768 ? 155 : 180;
  const currentFooterHeight = isExpanded ? targetExpandedHeight : 40;

  // Pricing Plan Packages list (dynamically translated)
  const packages = [
    { 
      name: 'Free', 
      price: t.gratis, 
      originalPrice: null, 
      discountTag: null, 
      desc: t.freeDesc, 
      features: lang === 'id' 
        ? ['1 Auto Responder', 'Tanpa Unggah Berkas', 'API Terbatas', '1 Grup Terhubung'] 
        : ['1 Auto Responder', 'No File Upload', 'Limited API', '1 Linked Group'] 
    },
    { 
      name: 'Basic', 
      price: 'Rp 500', 
      originalPrice: 'Rp 2.000', 
      discountTag: '75% OFF', 
      desc: t.basicDesc, 
      features: lang === 'id'
        ? ['5 Auto Responder', 'Maks 500 KB Unggah', 'Penyimpanan 50 MB', '1 Grup Terhubung']
        : ['5 Auto Responders', '500 KB Max Upload', '50 MB Storage', '1 Linked Group']
    },
    { 
      name: 'Standard', 
      price: 'Rp 1.000', 
      originalPrice: 'Rp 5.000', 
      discountTag: '80% OFF', 
      desc: t.standardDesc, 
      popular: true, 
      features: lang === 'id'
        ? ['25 Auto Responder', 'Maks 5 MB Unggah', 'Penyimpanan 500 MB', '2 Grup Terhubung']
        : ['25 Auto Responders', '5 MB Max Upload', '500 MB Storage', '2 Linked Groups']
    },
    { 
      name: 'Premium', 
      price: 'Rp 8.000', 
      originalPrice: 'Rp 20.000', 
      discountTag: '50% + 20% OFF', 
      desc: t.premiumDesc, 
      features: lang === 'id'
        ? ['100 Auto Responder', 'Maks 15 MB Unggah', 'Penyimpanan 1000 MB', '5 Grup Terhubung']
        : ['100 Auto Responders', '15 MB Max Upload', '1000 MB Storage', '5 Linked Groups']
    }
  ];

  // Features list (dynamically translated)
  const featuresList = [
    { icon: 'bolt', title: lang === 'id' ? 'Kinerja Tinggi' : 'High Performance', desc: lang === 'id' ? 'Didukung CPU & SSD NVMe generasi terbaru untuk respon instan.' : 'Powered by latest generation CPUs and NVMe SSDs for instant responses.' },
    { icon: 'shield', title: lang === 'id' ? 'Perlindungan Cloudflare' : 'Cloudflare Protection', desc: lang === 'id' ? 'Mitigasi DDoS tingkat korporat menyaring lalu lintas berbahaya secara otomatis.' : 'Enterprise-grade DDoS mitigation filters malicious traffic automatically.' },
    { icon: 'public', title: lang === 'id' ? 'Jaringan Global Edge' : 'Global Edge Network', desc: lang === 'id' ? 'Luncurkan server Anda di wilayah optimal untuk latensi terendah.' : 'Deploy your server in optimal regions for lowest latency and maximum uptime.' },
  ];

  const isLangCollapsed = langAutoHide && !langHovered;

  return (
    <div className="h-screen h-[100dvh] w-screen overflow-hidden bg-[#0d0d11] text-zinc-900 selection:bg-zinc-800/10 font-sans flex items-center justify-center p-3 sm:p-6 md:p-8 relative">
      
      {/* Dynamic Island Style Language Switcher Notch on the Left Edge */}
      <motion.div
        onMouseEnter={() => setLangHovered(true)}
        onMouseLeave={() => setLangHovered(false)}
        animate={{
          x: isLangCollapsed ? -30 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 220,
          damping: 18
        }}
        className="fixed left-0 top-1/2 -translate-y-1/2 z-[99] bg-[#121214] text-white w-[42px] h-[110px] rounded-r-[1.5rem] border border-zinc-800 border-l-0 shadow-2xl flex flex-col items-center justify-center py-2.5 cursor-pointer select-none"
      >
        <div className="relative flex flex-col items-center gap-2 w-full h-full justify-center">
          {/* Sliding Pill Indicator */}
          <div 
            className="absolute w-[30px] h-[34px] rounded-xl bg-zinc-800 transition-all duration-300 pointer-events-none"
            style={{
              transform: lang === 'en' ? 'translateY(-21px)' : 'translateY(21px)'
            }}
          />
          <button 
            onClick={(e) => { e.stopPropagation(); handleLangChange('en'); }}
            className={`relative z-10 w-[30px] h-[34px] flex items-center justify-center rounded-xl text-[9px] font-black tracking-widest ${lang === 'en' ? 'text-white' : 'text-zinc-500 hover:text-white'}`}
          >
            EN
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); handleLangChange('id'); }}
            className={`relative z-10 w-[30px] h-[34px] flex items-center justify-center rounded-xl text-[9px] font-black tracking-widest ${lang === 'id' ? 'text-white' : 'text-zinc-500 hover:text-white'}`}
          >
            ID
          </button>
        </div>
      </motion.div>

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

      {/* Floating Main Sheet Container with viewport and security scaleY constraints */}
      <motion.div 
        animate={{
          scaleY: isLocked ? 0 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 150,
          damping: 18,
          mass: 0.8
        }}
        style={{ transformOrigin: 'center' }}
        className="relative z-10 w-full h-full max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100vh-3rem)] md:max-h-[calc(100vh-4rem)] max-w-7xl rounded-[2.5rem] bg-[#fdfcf7] border border-white/20 shadow-2xl flex flex-col justify-between overflow-hidden"
      >
        
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
                {tab === 'tickets' ? t.supportLabel : tab}
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
                  {t.heroBadge}
                </div>
                <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-950 leading-tight whitespace-pre-line">
                  {t.heroTitle}
                </h1>
                <p className="text-xs sm:text-sm text-zinc-550 max-w-lg mx-auto leading-relaxed">
                  {t.heroDesc}
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button onClick={() => setShowLogin(true)} className="px-5 py-2.5 bg-zinc-950 text-white rounded-full text-xs font-bold hover:bg-zinc-900 transition-all active:scale-95">
                    {t.ctaStart}
                  </button>
                  <button onClick={() => setActiveTab('pricing')} className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 border border-zinc-200 rounded-full text-xs font-bold transition-all active:scale-95">
                    {t.ctaPricing}
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
                  <h2 className="text-2xl font-extrabold text-zinc-950">{t.featuresTitle}</h2>
                  <p className="text-zinc-500 text-[11px] mt-0.5">{t.featuresDesc}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {featuresList.map((f, i) => (
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
                  <h2 className="text-2xl font-extrabold text-zinc-950">{t.pricingTitle}</h2>
                  <p className="text-zinc-500 text-[11px] mt-0.5">{t.pricingDesc}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-start">
                  {packages.map((p, i) => (
                    <div key={i} className={`p-4 rounded-2xl border ${p.popular ? 'border-zinc-950 bg-zinc-950 text-white shadow-lg relative' : 'border-zinc-200 bg-white text-zinc-950 shadow-sm'}`}>
                      {p.popular && <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-white text-zinc-950 text-[8px] font-black rounded-full uppercase tracking-wider border border-zinc-200">{t.popular}</div>}
                      <div className="flex items-center justify-between mb-0.5">
                        <h3 className="text-sm font-bold">{p.name}</h3>
                        {p.discountTag && (
                          <span className={`text-[7px] font-black px-1.5 py-0.5 rounded-full ${p.popular ? 'bg-white text-zinc-950' : 'bg-zinc-950 text-white'}`}>
                            {p.discountTag}
                          </span>
                        )}
                      </div>
                      <p className={`text-[9px] mb-2.5 h-5 overflow-hidden ${p.popular ? 'text-zinc-400' : 'text-zinc-500'}`}>{p.desc}</p>
                      
                      <div className="flex items-baseline gap-1.5 mb-3">
                        <div className="text-xl font-black">{p.price}</div>
                        {p.originalPrice && (
                          <div className={`text-[10px] line-through ${p.popular ? 'text-zinc-500' : 'text-zinc-400'}`}>{p.originalPrice}</div>
                        )}
                        <span className={`text-[8px] ${p.popular ? 'text-zinc-500' : 'text-zinc-400'}`}>/{lang === 'id' ? 'bln' : 'mo'}</span>
                      </div>
                      
                      <div className="space-y-1.5 mb-4">
                        {p.features.map((feat, idx) => (
                          <div key={idx} className="flex items-start gap-1.5">
                            <span className={`material-symbols-outlined text-[12px] shrink-0 ${p.popular ? 'text-white' : 'text-zinc-900'}`}>check_circle</span>
                            <span className={`text-[9px] leading-tight ${p.popular ? 'text-zinc-300' : 'text-zinc-655'}`}>{feat}</span>
                          </div>
                        ))}
                      </div>
                      
                      <button 
                        onClick={() => setShowLogin(true)}
                        className={`w-full py-2 rounded-xl text-[10px] font-bold transition-all active:scale-95 ${p.popular ? 'bg-white text-zinc-950 hover:bg-zinc-100' : 'bg-zinc-950 text-white hover:bg-zinc-900'}`}
                      >
                        {t.selectPlan}
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
                  <h2 className="text-2xl font-extrabold text-zinc-950">{t.supportTitle}</h2>
                  <p className="text-zinc-550 text-[11px] mt-0.5">{t.supportDesc}</p>
                </div>

                {ticketStatus === 'success' ? (
                  <div className="p-5 bg-zinc-100 border border-zinc-200 rounded-2xl text-center">
                    <span className="material-symbols-outlined text-zinc-900 text-3xl mb-2">check_circle</span>
                    <p className="text-zinc-900 font-bold text-xs">{t.ticketSuccess}</p>
                    <button onClick={() => setTicketStatus('idle')} className="mt-3 px-3 py-1.5 bg-zinc-950 text-white text-[10px] font-bold rounded-lg hover:bg-zinc-900">{t.ticketAnother}</button>
                  </div>
                ) : (
                  <form onSubmit={submitTicket} className="space-y-2.5 bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm text-left">
                    <div>
                      <label className="block text-[9px] font-bold text-zinc-400 mb-0.5 uppercase tracking-wider">{t.ticketName}</label>
                      <input required type="text" value={ticketForm.name} onChange={e => setTicketForm({...ticketForm, name: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-500 transition-colors" placeholder="Your name" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] font-bold text-zinc-400 mb-0.5 uppercase tracking-wider">{t.ticketPhone}</label>
                        <input required type="text" value={ticketForm.whatsapp} onChange={e => setTicketForm({...ticketForm, whatsapp: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-500 transition-colors" placeholder="08..." />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-zinc-400 mb-0.5 uppercase tracking-wider">{t.ticketSubject}</label>
                        <input required type="text" value={ticketForm.subject} onChange={e => setTicketForm({...ticketForm, subject: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-500 transition-colors" placeholder="Topic" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-zinc-400 mb-0.5 uppercase tracking-wider">{t.ticketMessage}</label>
                      <textarea required value={ticketForm.message} onChange={e => setTicketForm({...ticketForm, message: e.target.value})} rows={2} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-500 transition-colors resize-none" placeholder="Describe your issue..."></textarea>
                    </div>
                    <button type="submit" disabled={ticketStatus === 'loading'} className="w-full py-2 bg-zinc-950 hover:bg-zinc-900 text-white text-[11px] font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50 mt-1">
                      {ticketStatus === 'loading' ? t.ticketSubmitting : t.ticketSubmit}
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
                  <h2 className="text-2xl font-black text-zinc-950 leading-tight whitespace-pre-line">{t.downloadTitle}</h2>
                  <p className="text-zinc-550 text-xs leading-relaxed">
                    {t.downloadDesc}
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
                          {t.downloadingBtn} ({downloadCooldown}s)
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[14px]">android</span>
                          {t.downloadBtn}
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

        {/* Responsive Collapsible Monochrome Footer with pure Spring Physics */}
        <motion.footer 
          onMouseEnter={triggerExpand}
          onMouseLeave={triggerCollapse}
          animate={{
            height: currentFooterHeight,
          }}
          transition={{
            type: "spring",
            stiffness: 180, // Spring peer stiffness
            damping: 10,    // Low damping for 3-4 natural bounces
            mass: 0.8,
          }}
          className="bg-[#121214] text-white rounded-t-[2rem] w-full shrink-0 relative z-10 shadow-[0_-8px_30px_rgba(0,0,0,0.25)] overflow-hidden flex flex-col justify-start px-5 sm:px-6 md:px-10"
        >
          {/* Collapsed Bar: Absolute at the top 40px height area */}
          <motion.div
            animate={{
              opacity: isExpanded ? 0 : 1,
              pointerEvents: isExpanded ? 'none' : 'auto',
              y: isExpanded ? -10 : 0
            }}
            transition={{ duration: 0.2 }}
            className="absolute top-0 left-0 right-0 h-[40px] flex items-center justify-center cursor-pointer select-none"
          >
            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
              <span>Wazle @2026</span>
              <span className="material-symbols-outlined text-[12px] animate-bounce">keyboard_arrow_up</span>
            </div>
          </motion.div>

          {/* Expanded Content: Absolute and stays stable during parent spring bounce */}
          <motion.div
            animate={{
              opacity: isExpanded ? 1 : 0,
              pointerEvents: isExpanded ? 'auto' : 'none',
              y: isExpanded ? 0 : 15,
            }}
            transition={{
              type: "spring",
              stiffness: 180,
              damping: 12,
              delay: isExpanded ? 0.05 : 0
            }}
            className="absolute left-0 right-0 px-5 sm:px-6 md:px-10 py-4.5 flex flex-col justify-between text-center md:text-left gap-3 pointer-events-none"
            style={{
              height: targetExpandedHeight,
            }}
          >
            {/* Upper Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-zinc-850 pointer-events-auto">
              
              {/* Desktop/Tablet Left: Contact Info */}
              <div className="hidden md:block space-y-1.5 text-left">
                <h4 className="text-zinc-400 font-bold text-[9px] uppercase tracking-wider">{t.contact}</h4>
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

              {/* Center: Logo & Slogan */}
              <div className="flex flex-col items-center text-center space-y-1 md:absolute md:left-1/2 md:-translate-x-1/2">
                <svg className="w-6 h-6 text-white" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 15C52 35 65 48 85 50C65 52 52 65 50 85C48 65 35 52 15 50C35 48 48 35 50 15Z" fill="currentColor"/>
                  <circle cx="50" cy="50" r="8" fill="#121214"/>
                </svg>
                <div className="font-extrabold text-[11px] tracking-widest uppercase">Wazle</div>
                <div className="text-[8px] text-zinc-400 font-medium tracking-wide">The Ultimate Bot Infrastructure</div>
                
                {/* Action buttons shown on tablet/desktop */}
                <div className="hidden sm:flex items-center gap-1.5 pt-0.5">
                  <button onClick={() => setShowLogin(true)} className="px-2.5 py-0.5 bg-white text-zinc-950 font-bold rounded-full text-[8px] hover:bg-zinc-100 transition-colors">{t.startFree}</button>
                  <button onClick={() => setActiveTab('download')} className="px-2.5 py-0.5 bg-transparent border border-zinc-700 text-white font-bold rounded-full text-[8px] hover:bg-zinc-800 transition-colors">{t.downloadApp}</button>
                </div>
              </div>

              {/* Desktop/Tablet Right: Quick Links */}
              <div className="hidden md:block space-y-1.5 text-right">
                <h4 className="text-zinc-400 font-bold text-[9px] uppercase tracking-wider">{t.quickLinks}</h4>
                <div className="space-y-0.5 text-[9px] text-zinc-300">
                  <button onClick={() => setActiveTab('home')} className="block hover:text-white ml-auto transition-colors">Home</button>
                  <button onClick={() => setActiveTab('features')} className="block hover:text-white ml-auto transition-colors">Features</button>
                  <button onClick={() => setActiveTab('pricing')} className="block hover:text-white ml-auto transition-colors">Pricing</button>
                  <button onClick={() => setActiveTab('tickets')} className="block hover:text-white ml-auto transition-colors">{t.supportTitle}</button>
                </div>
              </div>

              {/* Mobile-Only Row */}
              <div className="md:hidden flex flex-col items-center gap-2.5 w-full pt-1.5">
                <div className="flex flex-wrap justify-center gap-x-3 text-[8px] text-zinc-400">
                  <span>WA: +62 882-0086-77172</span>
                  <span>•</span>
                  <span>Email: support@wazle.my.id</span>
                </div>
                <div className="flex justify-center gap-3.5 text-[8px] font-semibold text-zinc-350">
                  <button onClick={() => setActiveTab('home')} className="hover:text-white transition-colors">Home</button>
                  <button onClick={() => setActiveTab('features')} className="hover:text-white transition-colors">Features</button>
                  <button onClick={() => setActiveTab('pricing')} className="hover:text-white transition-colors">Pricing</button>
                  <button onClick={() => setActiveTab('tickets')} className="hover:text-white transition-colors">{t.supportLabel}</button>
                </div>
              </div>

            </div>

            {/* Bottom Row (Copyright & Policy) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-1.5 text-[8px] text-zinc-550 pointer-events-auto">
              <p>{t.allRights}</p>
              <div className="flex gap-2.5">
                <a href="#" className="hover:text-zinc-300 transition-colors">{t.cookiesPolicy}</a>
                <a href="#" className="hover:text-zinc-300 transition-colors">{t.privacyPolicy}</a>
              </div>
            </div>
          </motion.div>
        </motion.footer>

      </motion.div>

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
