import React, { useState, useEffect } from 'react';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import { Button } from '../../components/ui/Button';
import { useToastStore } from '../../stores/useToastStore';
import api from '../../services/api';
import { Bell, Shield, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

export const SettingsPage: React.FC = () => {
  const { isSupported, subscription, subscribe, unsubscribe } = usePushNotifications();
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isCalendarConnected, setIsCalendarConnected] = useState(false);
  const [isCalendarLoading, setIsCalendarLoading] = useState(true);
  const { addToast } = useToastStore();

  useEffect(() => {
    const checkCalendarStatus = async () => {
      try {
        const { data } = await api.get('/calendar/status');
        setIsCalendarConnected(data.connected);
      } catch (e) { 
        console.error('Erro ao verificar calendário:', e); 
      } finally { 
        setIsCalendarLoading(false); 
      }
    };
    checkCalendarStatus();
  }, []);

  const handleConnectCalendar = async () => {
    try {
      const { data } = await api.get('/calendar/auth');
      const width = 600, height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      const popup = window.open(data.url, 'google-auth', `width=${width},height=${height},left=${left},top=${top}`);
      
      const timer = setInterval(() => {
        if (popup?.closed) {
          clearInterval(timer);
          api.get('/calendar/status').then(({ data }) => setIsCalendarConnected(data.connected));
          addToast('Conta Google ligada!', 'success');
        }
      }, 1000);
    } catch (e) { 
      addToast('Erro ao ligar ao Google', 'error'); 
    }
  };

  const handleDisconnectCalendar = async () => {
    if (!window.confirm('Desligar do Google Calendar?')) return;
    try {
      await api.delete('/calendar/disconnect');
      setIsCalendarConnected(false);
      addToast('Desligado do Google Calendar', 'info');
    } catch (e) { 
      addToast('Erro ao desligar', 'error'); 
    }
  };

  const handleTogglePush = async () => {
    setIsActionLoading(true);
    if (subscription) {
      const success = await unsubscribe();
      if (success) addToast('Notificações desativadas', 'info');
    } else {
      const success = await subscribe();
      if (success) addToast('Notificações ativadas!', 'success');
      else addToast('Falha ao ativar notificações.', 'error');
    }
    setIsActionLoading(false);
  };

  const handleTestNotification = async () => {
    try {
      await api.post('/notifications/test');
      addToast('Notificação de teste enviada!', 'info');
    } catch (error) {
      addToast('Erro ao testar notificação', 'error');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Definições</h1>
        <p className="text-text-secondary mt-1">Gere as tuas preferências e conta.</p>
      </header>

      <div className="space-y-6">
        <section className="bg-bg-secondary border border-border rounded-2xl overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-border">
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <Bell size={20} className="text-accent-blue" /> Notificações
            </h2>
          </div>
          <div className="p-4 sm:p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="font-medium text-text-primary">Notificações Push</p>
                <p className="text-sm text-text-muted">Recebe avisos no desktop sobre entregas.</p>
              </div>
              <button
                disabled={!isSupported || isActionLoading}
                onClick={handleTogglePush}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                  subscription ? "bg-accent-blue" : "bg-bg-tertiary",
                  (!isSupported || isActionLoading) && "opacity-50 cursor-not-allowed"
                )}
              >
                <span className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out",
                  subscription ? "translate-x-5" : "translate-x-0"
                )} />
              </button>
            </div>

            {subscription && (
              <div className="pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-sm text-text-secondary">Testar funcionamento:</p>
                <Button variant="secondary" size="sm" onClick={handleTestNotification}>
                  Enviar Teste
                </Button>
              </div>
            )}
          </div>
        </section>

        <section className="bg-bg-secondary border border-border rounded-2xl overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-border">
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <CalendarIcon size={20} className="text-orange-500" /> Google Calendar
            </h2>
          </div>
          <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="font-medium text-text-primary">Sincronização de Prazos</p>
              <p className="text-sm text-text-muted">Liga os teus trabalhos ao teu calendário.</p>
            </div>
            {isCalendarLoading ? <Loader2 className="animate-spin text-text-muted" /> : (
              isCalendarConnected ? (
                <Button variant="danger" size="sm" className="w-full sm:w-auto" onClick={handleDisconnectCalendar}>Desligar</Button>
              ) : (
                <Button variant="secondary" size="sm" className="w-full sm:w-auto" onClick={handleConnectCalendar}>
                  Ligar Google
                </Button>
              )
            )}
          </div>
        </section>

        <section className="bg-bg-secondary border border-border rounded-2xl overflow-hidden opacity-50">
          <div className="p-4 sm:p-6 border-b border-border">
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <Shield size={20} /> Segurança
            </h2>
          </div>
          <div className="p-4 sm:p-6">
            <p className="text-sm text-text-muted italic">Opções de segurança avançada disponíveis em breve.</p>
          </div>
        </section>
      </div>
    </div>
  );
};
