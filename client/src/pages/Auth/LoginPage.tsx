import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuthStore } from '../../stores/authStore';
import { useToastStore } from '../../stores/useToastStore';
import { Globe } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { signInWithGoogle } = useAuthStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!supabase) {
      addToast('Supabase nÃ£o configurado', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      addToast('Login efetuado com sucesso!', 'success');
      navigate('/');
    } catch (error: any) {
      addToast(error.message || 'Erro ao fazer login', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      addToast('Erro ao entrar com Google', 'error');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-bg-primary p-4 overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-16 h-72 w-72 rounded-full bg-accent-blue/25 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-success/15 blur-3xl" />
      </div>

      <div className="premium-glass relative z-10 w-full max-w-md space-y-8 p-6 sm:p-8 rounded-3xl shadow-[0_30px_70px_rgba(2,8,23,0.55)]">
        <div className="text-center">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-blue to-[#3d6fe0] text-white font-bold shadow-[0_10px_24px_rgba(92,141,255,0.42)]">
            SF
          </div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">StudyFlow</h1>
          <p className="mt-2 text-text-secondary">Gere o teu percurso académico com fluidez</p>
        </div>

        <form onSubmit={handleEmailLogin} className="mt-8 space-y-6">
          <div className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="exemplo@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Entrar
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/70" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-bg-secondary px-3 text-text-muted rounded-full border border-border/70">Ou continuar com</span>
          </div>
        </div>

        <Button
          type="button"
          variant="secondary"
          className="w-full"
          leftIcon={<Globe size={20} />}
          onClick={handleGoogleLogin}
        >
          Google
        </Button>

        <p className="text-center text-sm text-text-secondary">
          Não tens conta?{' '}
          <Link to="/register" className="text-accent-blue hover:underline font-medium">
            Regista-te aqui
          </Link>
        </p>
      </div>
    </div>
  );
};
