import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const DEFAULT_SETTINGS = {
  nomeLoja: 'JAPA Intermediações',
  razaoSocial: 'Japa Intermediações de Veículos Ltda',
  cnpj: '48.650.390/0001-71',
  telefone: '(43) 99643-7966',
  whatsapp: '43996437966',
  email: 'contato@japaintermediacoes.com.br',
  endereco: 'Avenida Avelino Vieira, 68',
  bairro: 'Centro',
  cidade: 'Wenceslau Braz',
  uf: 'PR',
  cep: '84950-000',
  horarioSemana: '08:00 às 18:00',
  horarioSabado: '08:00 às 12:30',
  instagram: 'https://instagram.com/japaintermediacoes',
  facebook: 'https://facebook.com/japaintermediacoes',
  taxaFinanciamento: '1.39',
  notificacoesWhatsapp: true,
  notificacoesEmail: true,
  ocultarVendidos: false,
  garantiaPadrao: '3 meses (motor e câmbio)',
  mensagemPadraoWhatsapp: 'Olá! Gostaria de mais informações sobre o veículo que vi no site JAPA Intermediações.'
};

const STORAGE_KEY = 'brenza_store_settings';

const SettingsContext = createContext({
  settings: DEFAULT_SETTINGS,
  loading: false,
  saveSettings: async () => {},
  getWhatsAppUrl: () => '',
  getCleanWhatsAppDigits: () => '',
  getPhoneDisplay: () => ''
});

/**
 * Normaliza qualquer formato de telefone/WhatsApp para envio via wa.me:
 * - Remove caracteres não numéricos
 * - Se tiver 10 ou 11 dígitos (DDD + número), adiciona o DDI 55 do Brasil
 * - Codifica a mensagem de texto
 */
export function formatWhatsAppUrl(rawNumber, message = '') {
  if (!rawNumber) return '#';
  let digits = String(rawNumber).replace(/\D/g, '');
  if (!digits) return '#';

  // Se tem 10 ou 11 dígitos (ex: 43996437966), adiciona o código do Brasil 55
  if (digits.length === 10 || digits.length === 11) {
    digits = '55' + digits;
  }

  const base = `https://wa.me/${digits}`;
  if (message && message.trim()) {
    return `${base}?text=${encodeURIComponent(message.trim())}`;
  }
  return base;
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(cached) };
      }
    } catch (e) {
      // Ignora erro no localStorage
    }
    return DEFAULT_SETTINGS;
  });

  const [loading, setLoading] = useState(true);

  // Busca configurações atualizadas no backend
  const fetchSettings = useCallback(async () => {
    try {
      let res = await fetch('/api/settings');
      if (!res.ok) {
        // Fallback para arquivo direto caso /api/settings não responda
        res = await fetch('/data/settings.json');
      }

      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === 'object') {
          const merged = { ...DEFAULT_SETTINGS, ...data };
          setSettings(merged);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          } catch (e) {}
        }
      }
    } catch (err) {
      console.warn('Usando configurações em cache local:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Salva configurações na API e atualiza estado em todo o site
  const saveSettings = useCallback(async (newSettingsData) => {
    const merged = { ...settings, ...newSettingsData };
    
    // Atualização otimista no estado e no cache imediato
    setSettings(merged);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    } catch (e) {}

    // Envio para o backend
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(merged)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Falha ao salvar configurações no servidor.');
    }

    const data = await res.json().catch(() => ({}));
    const saved = data.settings || merged;
    setSettings(saved);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    } catch (e) {}

    return saved;
  }, [settings]);

  // Helper para gerar URL do WhatsApp com o número atual da loja
  const getWhatsAppUrl = useCallback((message = '') => {
    return formatWhatsAppUrl(settings.whatsapp || settings.telefone, message);
  }, [settings.whatsapp, settings.telefone]);

  // Helper para dígitos limpos
  const getCleanWhatsAppDigits = useCallback(() => {
    let digits = String(settings.whatsapp || settings.telefone || '').replace(/\D/g, '');
    if (digits.length === 10 || digits.length === 11) {
      digits = '55' + digits;
    }
    return digits;
  }, [settings.whatsapp, settings.telefone]);

  // Helper para exibição formatada do telefone
  const getPhoneDisplay = useCallback(() => {
    return settings.telefone || '(43) 99643-7966';
  }, [settings.telefone]);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        saveSettings,
        fetchSettings,
        getWhatsAppUrl,
        getCleanWhatsAppDigits,
        getPhoneDisplay
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings deve ser utilizado dentro de um SettingsProvider');
  }
  return context;
}
