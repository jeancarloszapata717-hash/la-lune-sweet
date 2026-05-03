import { createContext, useContext, useState, ReactNode } from 'react';

interface CurrencyData {
  mode: 'manual' | 'auto';
  baseCurrency: 'USD' | 'EUR';
  rate: number;
  lastUpdated?: string;
}

interface CurrencyContextType {
  currency: CurrencyData;
  loading: boolean;
  formatPrice: (priceInBase: number) => { base: string, ves: string };
}

const defaultCurrency: CurrencyData = {
  mode: 'manual',
  baseCurrency: 'USD',
  rate: 45.0, // Updated for current context
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency] = useState<CurrencyData>(defaultCurrency);
  const [loading] = useState(false);

  const formatPrice = (priceInBase: number) => {
    const symbol = currency.baseCurrency === 'USD' ? '$' : '€';
    return {
      base: `${symbol}${priceInBase.toFixed(2)}`,
      ves: `Bs ${(priceInBase * currency.rate).toFixed(2)}`
    };
  };

  return (
    <CurrencyContext.Provider value={{ currency, loading, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
