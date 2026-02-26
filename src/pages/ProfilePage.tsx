import { useState } from 'react';
import { motion } from 'motion/react';
import { User, Settings, Heart, Bell, LogOut, ChevronRight, ShieldCheck, Globe, LogIn } from 'lucide-react';
import { useAppContext, Currency } from '../context/AppContext';

export default function ProfilePage() {
  const { user, login, logout, currency, setCurrency } = useAppContext();
  const [email, setEmail] = useState('');

  if (!user) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 flex flex-col items-center justify-center h-full min-h-screen pb-24"
      >
        <div className="w-20 h-20 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center mb-6">
          <User size={32} className="text-zinc-500" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Welcome to DealVerse</h1>
        <p className="text-zinc-400 text-center mb-8 text-sm">Sign in to save your wishlist, set price alerts, and personalize your experience.</p>
        
        <form 
          onSubmit={(e) => { e.preventDefault(); if (email) login(email); }}
          className="w-full space-y-4"
        >
          <input 
            type="email" 
            placeholder="Enter your email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
            required
          />
          <button 
            type="submit"
            className="w-full bg-emerald-500 text-black font-bold rounded-xl px-4 py-3 flex items-center justify-center gap-2 hover:bg-emerald-400 transition-colors"
          >
            <LogIn size={18} /> Continue with Email
          </button>
        </form>

        <div className="text-center pt-16 pb-4">
          <p className="text-xs text-zinc-600 font-medium uppercase tracking-widest">Developed by</p>
          <p className="text-sm text-zinc-400 font-bold mt-1">Adarsh</p>
          <p className="text-xs text-zinc-500 mt-0.5">Ace Applications</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 flex flex-col h-full min-h-screen pb-24 space-y-6"
    >
      <div className="sticky top-0 z-10 pt-4 pb-4 bg-zinc-950/80 backdrop-blur-xl">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <User className="text-purple-400" /> Profile
        </h1>
      </div>

      <div className="bg-zinc-900 border border-white/5 rounded-3xl p-6 flex items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="w-20 h-20 rounded-full bg-zinc-800 border-2 border-purple-500/30 overflow-hidden shrink-0 relative z-10">
          <img src={user.avatar} alt={user.name} referrerPolicy="no-referrer" />
        </div>
        <div className="relative z-10">
          <h2 className="text-xl font-bold text-white capitalize">{user.name}</h2>
          <p className="text-sm text-zinc-400 mb-2">{user.email}</p>
          <div className="bg-purple-500/10 text-purple-400 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 border border-purple-500/20 w-max">
            <ShieldCheck size={14} /> Pro Member
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider px-2 mb-2">Preferences</h3>
        
        <div className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
          <div className="w-full flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center border border-white/5 text-cyan-400">
                <Globe size={16} />
              </div>
              <span className="text-sm font-medium text-zinc-200">Currency</span>
            </div>
            <select 
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              className="bg-zinc-800 border border-white/10 text-white text-sm rounded-lg px-2 py-1 outline-none focus:border-cyan-500/50"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider px-2 mb-2">Account</h3>
        
        <div className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
          {[
            { icon: Heart, label: 'Wishlist', color: 'text-rose-400', count: 12 },
            { icon: Bell, label: 'Price Alerts', color: 'text-amber-400', count: 5 },
            { icon: Settings, label: 'Settings', color: 'text-zinc-400' },
          ].map((item, i) => (
            <button key={i} className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center border border-white/5 ${item.color}`}>
                  <item.icon size={16} />
                </div>
                <span className="text-sm font-medium text-zinc-200">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.count && (
                  <span className="bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-md text-xs font-bold">
                    {item.count}
                  </span>
                )}
                <ChevronRight size={16} className="text-zinc-600" />
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider px-2 mb-2">Support</h3>
        
        <div className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
          <button className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-zinc-200">Help Center</span>
            </div>
            <ChevronRight size={16} className="text-zinc-600" />
          </button>
          <button className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-zinc-200">Privacy Policy</span>
            </div>
            <ChevronRight size={16} className="text-zinc-600" />
          </button>
        </div>
      </div>

      <button 
        onClick={logout}
        className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border border-red-500/20 text-red-400 font-medium hover:bg-red-500/10 transition-colors mt-4"
      >
        <LogOut size={18} /> Log Out
      </button>

      <div className="text-center pt-8 pb-4">
        <p className="text-xs text-zinc-600 font-medium uppercase tracking-widest">Developed by</p>
        <p className="text-sm text-zinc-400 font-bold mt-1">Adarsh</p>
        <p className="text-xs text-zinc-500 mt-0.5">Ace Applications</p>
      </div>
    </motion.div>
  );
}
