import { useState, useEffect } from 'react';
import api from '../services/api';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);

  return Uint8Array.from(rawData, (char) => char.charCodeAt(0));
};

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSupport = () => {
      const supported = 'serviceWorker' in navigator && 'PushManager' in window;
      setIsSupported(supported);
      if (supported) {
        navigator.serviceWorker.ready
          .then((registration) => registration.pushManager.getSubscription())
          .then((sub) => {
            setSubscription(sub);
            setIsLoading(false);
          })
          .catch((error) => {
            console.error('Push initialization failed:', error);
            setIsLoading(false);
          });
      } else {
        setIsLoading(false);
      }
    };
    checkSupport();
  }, []);

  const subscribe = async () => {
    try {
      if (!VAPID_PUBLIC_KEY) {
        console.error('Missing VAPID public key');
        return false;
      }

      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      await api.post('/notifications/subscribe', { subscription: sub });
      setSubscription(sub);
      return true;
    } catch (error) {
      console.error('Subscription failed:', error);
      return false;
    }
  };

  const unsubscribe = async () => {
    try {
      if (subscription) {
        await subscription.unsubscribe();
        await api.delete('/notifications/unsubscribe');
        setSubscription(null);
      }
      return true;
    } catch (error) {
      console.error('Unsubscription failed:', error);
      return false;
    }
  };

  return { isSupported, subscription, subscribe, unsubscribe, isLoading };
};
