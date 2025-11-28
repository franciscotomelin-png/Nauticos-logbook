
import React, { useState } from 'react';
import { authService } from '../services/authService';
import { Anchor, Lock, Mail, User, ArrowRight, ChevronLeft } from 'lucide-react';

interface AuthProps {
  onLogin: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [view, setView] = useState<'login' | 'register' | 'forgot'>('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (view === 'login') {
      const res = authService.login(formData.email, formData.password);
      if (res.success) {
        onLogin();
      } else {
        setError(res.message);
      }
    } else if (view === 'register') {
      if (formData.password !== formData.confirmPassword) {
        setError('As senhas não coincidem.');
        return;
      }
      if (formData.password.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres.');
        return;
      }
      const res = authService.register(formData.email, formData.password);
      if (res.success) {
        onLogin();
      } else {
        setError(res.message);
      }
    } else if (view === 'forgot') {
      const exists = authService.resetPassword(formData.email);
      if (exists) {
        setSuccess('Um link de recuperação foi enviado para seu email (Simulação).');
      } else {
        setError('Email não encontrado.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="bg-white/95 backdrop-blur-xl w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="p-8 sm:p-10">
          
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-600/30">
              <Anchor className="text-white w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Nauticos</h1>
            <p className="text-slate-500 mt-2 font-medium">Diário de Bordo Profissional</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Email Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="seu@email.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-700"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Password Inputs */}
            {view !== 'forgot' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Senha</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-700"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            )}

            {view === 'register' && (
              <div className="space-y-1 animate-in slide-in-from-top-2 duration-300">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Confirmar Senha</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  </div>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-700"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            )}

            {/* Messages */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium flex items-center gap-2 animate-in fade-in">
                 <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                 {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-green-50 border border-green-100 rounded-xl text-green-600 text-sm font-medium flex items-center gap-2 animate-in fade-in">
                 <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                 {success}
              </div>
            )}

            {/* Forgot Password Link */}
            {view === 'login' && (
              <div className="flex justify-end">
                <button 
                  type="button" 
                  onClick={() => { setView('forgot'); setError(''); setSuccess(''); }}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Esqueceu a senha?
                </button>
              </div>
            )}

            {/* Action Button */}
            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold text-lg shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2"
            >
              {view === 'login' ? 'Entrar' : view === 'register' ? 'Criar Conta' : 'Recuperar Senha'}
              {view !== 'forgot' && <ArrowRight size={20} />}
            </button>
          </form>

          {/* Footer / Toggle View */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            {view === 'login' ? (
              <p className="text-slate-500">
                Não tem uma conta?{' '}
                <button 
                  onClick={() => { setView('register'); setError(''); setSuccess(''); }}
                  className="font-bold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Cadastre-se
                </button>
              </p>
            ) : (
              <p className="text-slate-500">
                <button 
                  onClick={() => { setView('login'); setError(''); setSuccess(''); }}
                  className="font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center justify-center gap-2 mx-auto"
                >
                  <ChevronLeft size={16} /> Voltar para Login
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
