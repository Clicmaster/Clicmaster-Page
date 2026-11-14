import React, { useEffect, useState } from 'react';
import { Save, CheckCircle2, XCircle, Info } from 'lucide-react';
import { useClicCoins, PaymentSettings } from '../../context/ClicCoinsContext.tsx';
import { DEFAULT_PAYMENT_SETTINGS } from '../../data/paymentSettings.ts';

/** Sección "Configuración de pagos": aquí el administrador escribe los datos reales de Yappy y PayPal. */
export const AdminPaymentSettingsPanel: React.FC = () => {
  const { getAdminPaymentSettings, saveAdminPaymentSettings } = useClicCoins();
  const [settings, setSettings] = useState<PaymentSettings>(DEFAULT_PAYMENT_SETTINGS);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    getAdminPaymentSettings().then((s) => {
      if (s) setSettings(s);
      setLoaded(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setYappy = (patch: Partial<PaymentSettings['yappy']>) =>
    setSettings((prev) => ({ ...prev, yappy: { ...prev.yappy, ...patch } }));
  const setPayPal = (patch: Partial<PaymentSettings['paypal']>) =>
    setSettings((prev) => ({ ...prev, paypal: { ...prev.paypal, ...patch } }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    const res = await saveAdminPaymentSettings(settings);
    setSaving(false);
    setFeedback({ type: res.success ? 'success' : 'error', message: res.message });
  };

  const input =
    'w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#67F23B]';
  const label = 'block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1';

  const toggle = (enabled: boolean, onChange: (v: boolean) => void, color: string) => (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className="relative w-12 h-7 rounded-full transition-colors shrink-0"
      style={{ background: enabled ? color : '#a3a3a3' }}
    >
      <span
        className="absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all"
        style={{ left: enabled ? '1.5rem' : '0.25rem' }}
      />
    </button>
  );

  if (!loaded) {
    return <div className="p-10 text-center text-sm text-neutral-500">Cargando configuración...</div>;
  }

  return (
    <form onSubmit={handleSave} className="p-6 overflow-y-auto flex-1 space-y-5">
      <div className="p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-600 dark:text-neutral-300 flex gap-2.5">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <p>
          Estos datos los ven los clientes en su billetera al recargar ClicCoins. Un método solo aparece disponible si está{' '}
          <strong>activado</strong> y tiene sus datos completos. Cada pago se verifica a mano en la sección "Recargas".
        </p>
      </div>

      {/* YAPPY */}
      <div className="p-5 rounded-2xl border border-[#00B4D8]/40 bg-[#00B4D8]/5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-black text-neutral-900 dark:text-white">Yappy</h4>
            <p className="text-[11px] text-neutral-500">Pago móvil en Panamá</p>
          </div>
          {toggle(settings.yappy.enabled, (v) => setYappy({ enabled: v }), '#00B4D8')}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={label}>Teléfono Yappy que recibe los pagos</label>
            <input className={input} value={settings.yappy.phone} maxLength={25} placeholder="+507 6000-0000" onChange={(e) => setYappy({ phone: e.target.value })} />
          </div>
          <div>
            <label className={label}>Nombre del titular o comercio</label>
            <input className={input} value={settings.yappy.holder} maxLength={80} placeholder="Ej: CLICMASTER" onChange={(e) => setYappy({ holder: e.target.value })} />
          </div>
        </div>
        <div>
          <label className={label}>Indicaciones extra (opcional)</label>
          <input
            className={input}
            value={settings.yappy.instructions}
            maxLength={300}
            placeholder="Ej: Escribe tu usuario de la página en la descripción del Yappy"
            onChange={(e) => setYappy({ instructions: e.target.value })}
          />
        </div>
      </div>

      {/* PAYPAL */}
      <div className="p-5 rounded-2xl border border-[#0070BA]/40 bg-[#0070BA]/5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-black text-neutral-900 dark:text-white">PayPal</h4>
            <p className="text-[11px] text-neutral-500">Pago internacional (verificación manual por ahora)</p>
          </div>
          {toggle(settings.paypal.enabled, (v) => setPayPal({ enabled: v }), '#0070BA')}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={label}>Correo de PayPal que recibe los pagos</label>
            <input className={input} type="email" value={settings.paypal.email} maxLength={120} placeholder="pagos@tucorreo.com" onChange={(e) => setPayPal({ email: e.target.value })} />
          </div>
          <div>
            <label className={label}>Enlace PayPal.me (opcional)</label>
            <input className={input} value={settings.paypal.link} maxLength={200} placeholder="https://paypal.me/tuusuario" onChange={(e) => setPayPal({ link: e.target.value })} />
          </div>
        </div>
        <div>
          <label className={label}>Indicaciones extra (opcional)</label>
          <input
            className={input}
            value={settings.paypal.instructions}
            maxLength={300}
            placeholder="Ej: Envía como 'Amigos y familiares' y pon tu usuario en la nota"
            onChange={(e) => setPayPal({ instructions: e.target.value })}
          />
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-2xl flex items-center gap-2 text-xs font-bold ${
            feedback.type === 'success'
              ? 'bg-[#67F23B]/15 text-[#135708] dark:text-[#67F23B] border border-[#67F23B]/30'
              : 'bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/30'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-[11px] text-neutral-400">
          {settings.updated_at
            ? `Última actualización: ${new Date(settings.updated_at).toLocaleString('es-PA')} por ${settings.updated_by}`
            : 'Aún no se ha guardado ninguna configuración.'}
        </p>
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-[#67F23B] hover:bg-[#52db28] text-[#121212] font-black text-sm flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Guardando...' : 'Guardar configuración'}</span>
        </button>
      </div>
    </form>
  );
};
