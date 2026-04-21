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
    <div className="min-h-screen flex items-center justify-center bg-bg-primary p-4">
      <div className="w-full max-w-md space-y-8 bg-bg-secondary p-6 sm:p-8 rounded-2xl border border-border shadow-xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-accent-blue tracking-tight">Criar Conta</h1>
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
