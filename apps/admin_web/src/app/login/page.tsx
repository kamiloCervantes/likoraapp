'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Por favor complete su correo electrónico y contraseña.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      router.push('/');
    } else {
      setError(result.error || 'Credenciales inválidas. Verifique su usuario y contraseña.');
    }
  };

  const handleFillDemoCredentials = () => {
    setEmail('admin@likora.app');
    setPassword('LikoraAdmin2026!');
    setError(null);
  };

  return (
    <div className="min-h-screen w-full bg-[#0d0b24] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient lighting effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-amber-500/10 blur-[130px] pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-[#141038]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-indigo-950/60 space-y-7">
          {/* Header & Logo */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 p-[1px] shadow-lg shadow-indigo-600/20 mb-1">
              <div className="w-full h-full bg-[#181347] rounded-[15px] flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-amber-400" />
              </div>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Likora Control Hub
            </h1>
            <p className="text-xs text-[#a29cc8]">
              Acceso administrativo y gestión de operaciones
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#c3beeb] block">
                Correo Electrónico o Usuario
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#7972a9] absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@likora.app"
                  required
                  className="w-full bg-[#1a1548] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-[#5e578f] focus:outline-none focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/40 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#c3beeb] block">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#7972a9] absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-[#1a1548] border border-white/10 rounded-xl pl-10 pr-11 py-2.5 text-sm text-white placeholder:text-[#5e578f] focus:outline-none focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/40 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-[#7972a9] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Options */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-[#a29cc8] hover:text-white transition-colors">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-white/20 bg-[#1a1548] text-amber-500 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5 cursor-pointer"
                />
                <span>Recordar sesión</span>
              </label>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Por favor contacte al soporte de seguridad en soporte@gatewayit.co para restablecer su clave de administrador.');
                }}
                className="text-amber-400/90 hover:text-amber-300 font-medium transition-colors"
              >
                ¿Olvidó su clave?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Validando credenciales...</span>
                </>
              ) : (
                <span>Iniciar Sesión en el Admin</span>
              )}
            </button>
          </form>

          {/* Quick Demo Helper */}
          <div className="pt-2 border-t border-white/5 text-center">
            <button
              type="button"
              onClick={handleFillDemoCredentials}
              className="inline-flex items-center gap-1.5 text-[11px] text-[#9088be] hover:text-amber-400 transition-colors p-1"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Autocompletar credenciales de administrador (Demo)</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-[11px] text-[#6d669b] space-y-1">
          <div>Likora Multi-Store Platform &copy; 2026</div>
          <div className="flex items-center justify-center gap-2 text-[#56507e]">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span>Conexión cifrada TLS 1.3 con API NestJS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
