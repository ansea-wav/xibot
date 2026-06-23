'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { UserMasterData } from '@/lib/api';

interface LoginGateProps {
  onLoginSuccess: (data: UserMasterData, userId: string) => void;
  isMobile?: boolean;
}

export default function LoginGate({ onLoginSuccess, isMobile }: LoginGateProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleRequestOTP = async () => {
    if (!phone) {
      setError('Nomor WhatsApp wajib diisi.');
      triggerShake();
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { apiOTPRequest } = await import('@/lib/api');
      const result = await apiOTPRequest(phone);
      
      if (result.status === 'error') {
        setError(result.message || 'Gagal mengirim OTP.');
        triggerShake();
      } else {
        setStep(2);
      }
    } catch (err: any) {
      setError('Server API terputus.');
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      setError('Kode OTP wajib diisi.');
      triggerShake();
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { apiOTPVerify } = await import('@/lib/api');
      const result = await apiOTPVerify(phone, otp);
      
      if (result.status === 'error') {
        setError(result.message || 'OTP salah atau kedaluwarsa.');
        triggerShake();
      } else {
        const masterData = result.data || result;
        if (masterData && masterData.registry) {
          localStorage.setItem('yay_user_phone', phone);
          onLoginSuccess(masterData as UserMasterData, masterData.registry.User_ID);
        } else {
          setError('Data user tidak valid.');
          triggerShake();
        }
      }
    } catch (err: any) {
      setError('Server API terputus.');
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#050505] flex items-center justify-center z-[9999]">
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[80%] bg-blue-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[80%] bg-emerald-500/10 rounded-full blur-[100px]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={`relative z-10 w-full max-w-md ${isMobile ? 'h-full flex flex-col justify-end' : ''}`}
      >
        <div className={`${isMobile ? 'bg-[#111113] min-h-[75vh] rounded-t-[2.5rem] p-8 pb-12 flex flex-col border-t border-white/5' : 'bg-[#111113]/80 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-2xl'} overflow-hidden`}>
          
          {isMobile && <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-8"></div>}

          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-white tracking-tight mb-2 drop-shadow-lg">Wazle Dash</h1>
            <p className="text-white/60 text-sm font-medium">Control panel automation</p>
          </div>

          <div className={`flex flex-col gap-5 flex-1 ${shake ? 'animate-shake' : ''}`}>
            
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col gap-4"
                >
                  <div>
                    <label className="text-[11px] text-white/50 uppercase tracking-widest font-semibold mb-2 block ml-1">WhatsApp Number</label>
                    <input 
                      type="tel"
                      placeholder="e.g. 6281234..."
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleRequestOTP()}
                      className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-white text-base outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-white/20"
                    />
                  </div>
                  
                  {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm text-center font-medium">
                      {error}
                    </motion.div>
                  )}

                  <button
                    onClick={handleRequestOTP}
                    disabled={loading || !phone}
                    className="w-full bg-white text-black font-bold text-base py-4 rounded-full mt-2 active:scale-[0.98] transition-transform disabled:opacity-50 disabled:active:scale-100"
                  >
                    {loading ? 'Sending OTP...' : 'Continue'}
                  </button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex flex-col gap-4"
                >
                  <div>
                    <label className="text-[11px] text-white/50 uppercase tracking-widest font-semibold mb-2 block ml-1">Enter 6-Digit OTP</label>
                    <input 
                      type="text"
                      placeholder="XXXXXX"
                      maxLength={6}
                      value={otp}
                      onChange={e => setOtp(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleVerifyOTP()}
                      className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-white text-center text-2xl tracking-[0.5em] font-mono outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-white/10"
                    />
                  </div>

                  {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm text-center font-medium">
                      {error}
                    </motion.div>
                  )}

                  <div className="flex gap-3 mt-2">
                    <button
                      onClick={() => { setStep(1); setError(''); setOtp(''); }}
                      disabled={loading}
                      className="px-6 py-4 rounded-full border border-white/10 text-white font-medium hover:bg-white/5 transition-colors disabled:opacity-50"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleVerifyOTP}
                      disabled={loading || otp.length < 4}
                      className="flex-1 bg-blue-600 text-white font-bold text-base py-4 rounded-full active:scale-[0.98] transition-transform disabled:opacity-50 disabled:active:scale-100 hover:bg-blue-500"
                    >
                      {loading ? 'Verifying...' : 'Login'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <p className="text-white/30 text-xs text-center mt-6 leading-relaxed px-4">
              Protected by Wazle Secure Auth.<br/>By continuing you agree to our Terms.
            </p>
          </div>
        </div>
      </motion.div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(-5px); }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }
      `}} />
    </div>
  );
}
