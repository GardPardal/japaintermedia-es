import React, { useState, useEffect } from 'react';
import {
  Settings, Save, KeyRound, ShieldCheck, Download, Store, MapPin, Phone,
  Mail, Clock, Share2, Bell, Check, Loader2, AlertCircle
} from 'lucide-react';

export default function SettingsView({ settings, onSaveSettings, vehicles, leads, sales }) {
  const [form, setForm] = useState(() => ({
    nomeLoja: settings?.nomeLoja || 'JAPA Intermediações',
    razaoSocial: settings?.razaoSocial || 'Japa Intermediações de Veículos Ltda',
    cnpj: settings?.cnpj || '48.650.390/0001-71',
    telefone: settings?.telefone || '(43) 99643-7966',
    whatsapp: settings?.whatsapp || '43996437966',
    email: settings?.email || 'contato@japaintermediacoes.com.br',
    endereco: settings?.endereco || 'Avenida Avelino Vieira, 68',
    bairro: settings?.bairro || 'Centro',
    cidade: settings?.cidade || 'Wenceslau Braz',
    uf: settings?.uf || 'PR',
    cep: settings?.cep || '84950-000',
    horarioSemana: settings?.horarioSemana || '08:00 às 18:00',
    horarioSabado: settings?.horarioSabado || '08:00 às 12:30',
    instagram: settings?.instagram || 'https://instagram.com/japaintermediacoes',
    facebook: settings?.facebook || 'https://facebook.com/japaintermediacoes',
    taxaFinanciamento: settings?.taxaFinanciamento || '1.39',
    notificacoesWhatsapp: Boolean(settings?.notificacoesWhatsapp ?? true),
    notificacoesEmail: Boolean(settings?.notificacoesEmail ?? true),
    ocultarVendidos: Boolean(settings?.ocultarVendidos ?? false),
    garantiaPadrao: settings?.garantiaPadrao || '3 meses (motor e câmbio)'
  }));

  useEffect(() => {
    if (settings && typeof settings === 'object') {
      setForm(prev => ({
        ...prev,
        ...settings,
        notificacoesWhatsapp: Boolean(settings.notificacoesWhatsapp ?? prev.notificacoesWhatsapp),
        notificacoesEmail: Boolean(settings.notificacoesEmail ?? prev.notificacoesEmail),
        ocultarVendidos: Boolean(settings.ocultarVendidos ?? prev.ocultarVendidos)
      }));
    }
  }, [settings]);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Alteração de senha
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      await onSaveSettings(form);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordError('');

    if (newPassword.length < 4) {
      setPasswordError('A nova senha deve ter pelo menos 4 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('A confirmação de senha não confere com a nova senha.');
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Falha ao alterar senha.');
      setPasswordMsg('Senha de acesso atualizada com sucesso!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.message || 'Erro ao alterar senha.');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleDownloadBackup = () => {
    const backupData = {
      backupDate: new Date().toISOString(),
      loja: 'JAPA Intermediações - Wenceslau Braz PR',
      veiculos: vehicles,
      leads: leads,
      vendas: sales,
      configuracoes: form
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-japa-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* CABEÇALHO COM BOTÃO SALVAR FIXO/DESTAQUE */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div>
            <h2 className="text-lg font-black text-slate-900">Configurações Gerais da Loja</h2>
            <p className="text-xs text-slate-500 mt-0.5">Gerencie os dados institucionais, regras de negócio e preferências.</p>
          </div>
          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
                <Check className="h-4 w-4" /> Salvo com sucesso!
              </span>
            )}
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-[#e50914] px-5 py-2.5 text-xs font-black text-white hover:bg-[#bd0710] shadow-md shadow-red-200 transition disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Salvar Alterações
            </button>
          </div>
        </div>

        {/* 1. DADOS CADASTRAIS DA LOJA */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Store className="h-5 w-5 text-[#e50914]" />
            <h3 className="font-black text-base text-slate-900">Dados da Loja (Informações Públicas)</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Nome Fantasia</label>
              <input
                required
                value={form.nomeLoja}
                onChange={e => set('nomeLoja', e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-[#e50914]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Razão Social</label>
              <input
                value={form.razaoSocial}
                onChange={e => set('razaoSocial', e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-[#e50914]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">CNPJ</label>
              <input
                value={form.cnpj}
                onChange={e => set('cnpj', e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-[#e50914]"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Telefone Comercial</label>
              <input
                value={form.telefone}
                onChange={e => set('telefone', e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-[#e50914]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">WhatsApp de Atendimento</label>
              <input
                value={form.whatsapp}
                onChange={e => set('whatsapp', e.target.value)}
                placeholder="43996437966"
                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-[#e50914]"
              />
              <p className="mt-1 text-[10px] text-slate-400">
                Recebe as mensagens e propostas do site todo (ex: 43996437966).
              </p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">E-mail de Contato</label>
              <input
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-[#e50914]"
              />
            </div>
          </div>
        </section>

        {/* 2. LOCALIZAÇÃO E HORÁRIOS */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <MapPin className="h-5 w-5 text-[#e50914]" />
            <h3 className="font-black text-base text-slate-900">Endereço Físico & Horários de Atendimento</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-600 mb-1">Logradouro / Avenida</label>
              <input
                value={form.endereco}
                onChange={e => set('endereco', e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-[#e50914]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Bairro</label>
              <input
                value={form.bairro}
                onChange={e => set('bairro', e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-[#e50914]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">CEP</label>
              <input
                value={form.cep}
                onChange={e => set('cep', e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-[#e50914]"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-600 mb-1">Cidade / UF</label>
              <div className="flex gap-2">
                <input
                  value={form.cidade}
                  onChange={e => set('cidade', e.target.value)}
                  className="h-10 flex-1 rounded-xl border border-slate-200 px-3 text-xs outline-none"
                />
                <input
                  value={form.uf}
                  onChange={e => set('uf', e.target.value)}
                  className="h-10 w-16 text-center rounded-xl border border-slate-200 px-3 text-xs font-bold outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Segunda a Sexta</label>
              <input
                value={form.horarioSemana}
                onChange={e => set('horarioSemana', e.target.value)}
                placeholder="08:00 às 18:00"
                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Sábados</label>
              <input
                value={form.horarioSabado}
                onChange={e => set('horarioSabado', e.target.value)}
                placeholder="08:00 às 12:30"
                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs outline-none"
              />
            </div>
          </div>
        </section>

        {/* 3. PARÂMETROS COMERCIAIS & REDES */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Share2 className="h-5 w-5 text-[#e50914]" />
            <h3 className="font-black text-base text-slate-900">Redes Sociais & Parâmetros Comerciais</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Link do Instagram</label>
              <input
                value={form.instagram}
                onChange={e => set('instagram', e.target.value)}
                placeholder="https://instagram.com/japaintermediacoes"
                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Link do Facebook</label>
              <input
                value={form.facebook}
                onChange={e => set('facebook', e.target.value)}
                placeholder="https://facebook.com/..."
                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Taxa Financiamento Base (% a.m.)</label>
              <input
                type="number"
                step="0.01"
                value={form.taxaFinanciamento}
                onChange={e => set('taxaFinanciamento', e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs font-bold outline-none"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 pt-2">
            <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={form.notificacoesWhatsapp}
                onChange={e => set('notificacoesWhatsapp', e.target.checked)}
                className="h-4 w-4 rounded accent-[#e50914]"
              />
              <div>
                <strong className="block text-xs font-bold">Alertas no WhatsApp</strong>
                <span className="text-[11px] text-slate-500">Receber notificações de novos leads no WhatsApp comercial.</span>
              </div>
            </label>

            <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={form.ocultarVendidos}
                onChange={e => set('ocultarVendidos', e.target.checked)}
                className="h-4 w-4 rounded accent-[#e50914]"
              />
              <div>
                <strong className="block text-xs font-bold">Ocultar Veículos Vendidos</strong>
                <span className="text-[11px] text-slate-500">Não exibir carros com status 'Vendido' na listagem pública do site.</span>
              </div>
            </label>
          </div>
        </section>
      </form>

      {/* 4. SEGURANÇA E TROCA DE SENHA */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <KeyRound className="h-5 w-5 text-[#e50914]" />
          <h3 className="font-black text-base text-slate-900">Segurança de Acesso (Alterar Senha do Admin)</h3>
        </div>

        {passwordMsg && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800 flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-600" />
            {passwordMsg}
          </div>
        )}

        {passwordError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-800 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            {passwordError}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="grid gap-3 sm:grid-cols-3 sm:items-end">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Nova Senha</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Mínimo 4 caracteres"
              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-[#e50914]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Confirmar Nova Senha</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Digite novamente"
              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-[#e50914]"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={passwordSaving}
              className="h-10 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-xs font-black text-white hover:bg-black transition disabled:opacity-60"
            >
              {passwordSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              Atualizar Senha
            </button>
          </div>
        </form>
      </section>

      {/* 5. BACKUP E DADOS */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="font-black text-base text-slate-900">Backup Completo da Loja</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Faça download de todos os seus veículos, propostas, vendas e configurações em formato JSON seguro.
          </p>
        </div>
        <button
          type="button"
          onClick={handleDownloadBackup}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-xs font-black text-slate-700 hover:bg-slate-100 transition whitespace-nowrap shadow-sm"
        >
          <Download className="h-4 w-4 text-[#e50914]" />
          Baixar Backup Geral (.JSON)
        </button>
      </section>
    </div>
  );
}
