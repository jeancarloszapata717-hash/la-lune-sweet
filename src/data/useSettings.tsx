import { useState, useEffect } from 'react';

export interface DeliveryZone {
  id: string;
  name: string;
  price: number;
  active: boolean;
}

export interface PaymentMethod {
  id: string;
  name: string;
  desc: string;
  enabled: boolean;
  cedula?: string;
  telefono?: string;
  banco?: string;
  paypalEmail?: string;
}

export interface StoreSettings {
  whatsappNumber: string;
  primaryColor: string;
  isRounded: boolean;
  paypalRate?: number;
  exchangeRate?: number;
}

export function useSettings() {
  const [deliveryZones] = useState<DeliveryZone[]>([
    { id: '1', name: 'Zona Central', price: 2, active: true },
    { id: '2', name: 'Zona Este', price: 3, active: true },
    { id: '3', name: 'Zona Oeste', price: 4, active: true }
  ]);
  
  const [paymentMethods] = useState<PaymentMethod[]>([
    { id: '1', name: 'Pago Móvil', desc: 'Transferencia inmediata', enabled: true, banco: 'Banesco', telefono: '04141234567', cedula: '12345678' },
    { id: '2', name: 'PayPal', desc: 'Pago en dólares', enabled: true, paypalEmail: 'pagos@lalune.com' },
    { id: '3', name: 'Efectivo', desc: 'Pago al recibir', enabled: true }
  ]);

  const [storeSettings] = useState<StoreSettings>({
    whatsappNumber: '584141234567',
    primaryColor: '#FA8072',
    isRounded: true
  });

  const [loading] = useState(false);

  return {
    deliveryZones,
    paymentMethods,
    storeSettings,
    loading
  };
}
