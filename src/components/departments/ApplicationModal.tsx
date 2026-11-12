import React, { useState } from 'react';
import { DepartmentFaction } from '../../types/index.ts';
import { X, CheckCircle, Send, ShieldAlert } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ApplicationModalProps {
  faction: DepartmentFaction | null;
  onClose: () => void;
}

export const ApplicationModal: React.FC<ApplicationModalProps> = ({ faction, onClose }) => {
  const [characterName, setCharacterName] = useState('');
  const [robloxUser, setRobloxUser] = useState('');
  const [discordTag, setDiscordTag] = useState('');
  const [experience, setExperience] = useState('Intermedia (1-2 años)');
  const [motivation, setMotivation] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!faction) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-[#1A1A1D] max-w-xl w-full rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="relative p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm"
              style={{ backgroundColor: `${faction.color}20`, color: faction.color }}
            >
              {faction.badge}
            </div>
            <div>
              <h3 className="text-lg font-black text-neutral-900 dark:text-white leading-tight">
                Postulación Oficial: {faction.shortName}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Convocatoria Ciudadana Temporada 2026
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {submitted ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-extrabold text-neutral-900 dark:text-white">
                ¡Solicitud Registrada con Éxito!
              </h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-sm mx-auto">
                El Alto Mando de <span className="font-bold">{faction.name}</span> revisará tu expediente. Te contactarán por Discord (<span className="font-semibold">{discordTag || 'tu usuario'}</span>) para programar tu entrevista y prueba de voz.
              </p>
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-xs text-neutral-500 border border-neutral-200 dark:border-neutral-700">
                Código de Expediente: <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">#RP-2026-{Math.floor(100000 + Math.random() * 900000)}</span>
              </div>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2.5 rounded-xl text-xs font-bold bg-[#67F23B] text-[#121212] hover:bg-[#53d928] transition-colors"
              >
                Finalizar y Cerrar
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
                <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                <span>
                  Recuerda que para ingresar a {faction.name} es obligatorio mantener un rol serio y contar con micrófono en Discord.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Nombre del Personaje en Rol (IC)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Alexander Vance"
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#67F23B] dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Usuario de Roblox
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: AlexRoblox_Official"
                    value={robloxUser}
                    onChange={(e) => setRobloxUser(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#67F23B] dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Usuario de Discord
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: alexander#1234"
                    value={discordTag}
                    onChange={(e) => setDiscordTag(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#67F23B] dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Nivel de Experiencia en Roleplay
                </label>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#67F23B] dark:text-white"
                >
                  <option>Principiante (Menos de 6 meses)</option>
                  <option>Intermedia (1-2 años)</option>
                  <option>Avanzada (Servidores de rol estricto / Whitelist)</option>
                  <option>Veterano (Ex-líder o instructor de facción)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                  ¿Por qué deseas unirte a este departamento?
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe brevemente tus intenciones de rol y qué aportarás a la facción..."
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#67F23B] dark:text-white resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-[#67F23B] hover:bg-[#52d726] text-[#121212] transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Enviando Expediente...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Enviar Formulario al Alto Mando</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
