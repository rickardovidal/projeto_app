import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToastStore } from '../../stores/useToastStore';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { addToast } = useToastStore();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!supabase) {
      addToast('Supabase nÃ£o configurado', 'error');
      return;
    }
    
    if (password !== confirmPassword) {
      addToast('As passwords não coincidem', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) throw error;
      
      addToast('Registo efetuado! Verifica o teu email.', 'success');
      navigate('/login');
    } catch (error: any) {
      addToast(error.message || 'Erro ao criar conta', 'error');
    } finally {
      setIsLoading(false);
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
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Criar Conta</h1>
          <p className="mt-2 text-text-secondary">Junta-te ao StudyFlow hoje</p>
        </div>

        <form onSubmit={handleRegister} className="mt-8 space-y-4">
          <Input
            label="Nome Completo"
            placeholder="O teu nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
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
          <Input
            label="Confirmar Password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <Button type="submit" className="w-full mt-6" isLoading={isLoading}>
            Registar
          </Button>
        </form>

        <p className="text-center text-sm text-text-secondary">
          Já tens conta?{' '}
          <Link to="/login" className="text-accent-blue hover:underline font-medium">
            Entra aqui
          </Link>
        </p>
      </div>
    </div>
  );
};
