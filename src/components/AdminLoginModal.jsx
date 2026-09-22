import React, { useState } from 'react';
import { Lock, User, Key, X, ArrowRight, ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function AdminLoginModal({ onClose, onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem('brenza_auth_token', data.token);
        localStorage.setItem('brenza_user', JSON.stringify(data.user));
        onLoginSuccess();
      } else {
        setError(data.error || 'Usuário ou senha incorretos.');
      }
    } catch (err) {
      setError('Erro ao conectar ao servidor de autenticação. Tente novamente em instantes.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-4 flex items-center justify-center min-h-screen"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md bg-[#131821] border border-brenza-border rounded-2xl shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo & Header */}
        <div className="text-center mb-6">
          <div className="h-16 w-16 mx-auto rounded-xl overflow-hidden border border-white/10 bg-black p-1 shadow-lg shadow-brenza-red/20 mb-3">
            <img src="/logo.jpg" alt="Brenza" className="h-full w-full object-contain" />
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-wider">
            Painel Administrativo
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Japa Intermediações • Gestão de Estoque & Integrações
          </p>
        </div>

        {/* Error notice */}
        {error && (
          <div className="mb-4 bg-rose-950/60 border border-rose-500/40 p-3 rounded-xl flex items-center gap-2 text-xs text-rose-200">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Usuário ou E-mail
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full bg-[#1A222C] border border-white/10 text-white text-sm rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-brenza-red"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Senha de Acesso
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#1A222C] border border-white/10 text-white text-sm rounded-xl pl-9 pr-10 py-2.5 focus:outline-none focus:border-brenza-red"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brenza-red hover:bg-brenza-redHover text-white py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-brenza-red/30 flex items-center justify-center gap-2 mt-2"
          >
            <span>{loading ? 'Validando acesso...' : 'Entrar no Sistema'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
