import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LogIn, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function OnboardingPage() {
  const { login, skipLogin } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      login(email);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 flex flex-col items-center justify-center h-full min-h-screen pb-24 bg-zinc-950"
    >
      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(52,211,153,0.3)]">
        <span className="text-4xl font-black text-white">DV</span>
      </div>
      
      <h1 className="text-3xl font-bold text-white mb-2 text-center">DealVerse <span className="text-emerald-400">AI</span></h1>
      <p className="text-zinc-400 text-center mb-10 text-sm max-w-[280px]">
        Sign in to save your wishlist, set price alerts, and get personalized deals.
      </p>
      
      <form 
        onSubmit={handleSubmit}
        className="w-full space-y-4 max-w-[320px]"
      >
        <div className="space-y-3">
          <input 
            type="email" 
            placeholder="Email address" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
            required
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
            required
          />
        </div>

        <button 
          type="submit"
          className="w-full bg-emerald-500 text-black font-bold rounded-xl px-4 py-3.5 flex items-center justify-center gap-2 hover:bg-emerald-400 transition-colors mt-2"
        >
          <LogIn size={18} /> Sign In
        </button>
      </form>

      <div className="mt-8 flex flex-col items-center gap-4 w-full max-w-[320px]">
        <div className="flex items-center gap-4 w-full">
          <div className="h-px bg-white/10 flex-1"></div>
          <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">OR</span>
          <div className="h-px bg-white/10 flex-1"></div>
        </div>

        <button 
          onClick={skipLogin}
          className="w-full bg-zinc-900 border border-white/10 text-white font-medium rounded-xl px-4 py-3.5 flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors"
        >
          Continue without login <ArrowRight size={16} className="text-zinc-500" />
        </button>
      </div>

      <div className="mt-12 flex items-center gap-1.5 text-xs text-zinc-500">
        <ShieldCheck size={14} className="text-emerald-500" />
        <span>Your data is secure and encrypted</span>
      </div>
    </motion.div>
  );
}
