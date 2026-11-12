import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, Send, GraduationCap } from 'lucide-react';
import confetti from 'canvas-confetti';

interface EnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AcademyEnrollmentModal: React.FC<EnrollmentModalProps> = ({ isOpen, onClose }) => {
  const [fullName, setFullName] = useState('');
  const [robloxUser, setRobloxUser] = useState('');
  const [discordTag, setDiscordTag] = useState('');
  const [specialization, setSpecialization] = useState('Construcción & Modelado 3D');
  const [experience, setExperience] = useState('Principiante desde cero');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      confetti({
        particleCount: 110,
        spread: 75,
        origin: { y: 0.55 },
      });
    }, 800);
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in">
      <div className="bg-white dark:bg-[#1A1A1D] max-w-xl w-full rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="relative p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#67F23B]/20 text-[#1f7c0f] dark:text-[#67F23B] flex items-center justify-center font-black">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-neutral-900 dark:text-white leading-tight">
                Inscripción Gratuita · Clicmaster Academy
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Aprende Roblox Studio, Lua, Discord y Monetización
              </p>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
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
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-extrabold text-neutral-900 dark:text-white">
                ¡Bienvenido a Clicmaster Academy!
              </h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-md mx-auto">
                Hola <span className="font-bold">{fullName || 'Estudiante'}</span>, tu cupo ha sido reservado. Te hemos asignado el rol de <span className="font-semibold text-[#258712] dark:text-[#67F23B]">Alumno Becado</span> en nuestro Discord (<span className="font-mono text-xs">{discordTag || '@discord'}</span>).
              </p>
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/80 text-xs text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                Matrícula ID: <span className="font-mono font-bold text-neutral-900 dark:text-white">#ACADEMY-2026-{Math.floor(100000 + Math.random() * 900000)}</span>
                <span className="block mt-1 text-emerald-600 dark:text-emerald-400 font-semibold">Acceso de por vida habilitado</span>
              </div>
              <div className="pt-2">
                <button
                  onClick={handleResetAndClose}
                  className="w-full py-3 px-6 rounded-xl text-xs font-bold bg-[#67F23B] text-[#121212] hover:bg-[#52d726] transition-colors"
                >
                  Ir al Campus & Cerrar
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-2.5 text-xs text-emerald-900 dark:text-emerald-200">
                <Sparkles className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                <span>
                  Beca 100% activa. No requiere pagos. Al graduarte podrás participar en la bolsa de empleo de desarrolladores oficiales de CLICMaster.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Mateo Vance"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
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
                    placeholder="Ej: MateoRoblox_Studio"
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
                    placeholder="Ej: mateo#5512"
                    value={discordTag}
                    onChange={(e) => setDiscordTag(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#67F23B] dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Especialización de Interés Principal
                </label>
                <select
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#67F23B] dark:text-white"
                >
                  <option>Construcción & Modelado 3D de Ciudades</option>
                  <option>Programación Lua Scripting & Mecánicas de Rol</option>
                  <option>Gestión de Comunidades en Discord & Bots</option>
                  <option>Streaming, Creación de Contenido & Redes</option>
                  <option>Monetización, VIP & Gamepasses</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Nivel de Experiencia Previo
                </label>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#67F23B] dark:text-white"
                >
                  <option>Principiante desde cero</option>
                  <option>Básico (He abierto Roblox Studio alguna vez)</option>
                  <option>Intermedio (Sé construir o editar scripts)</option>
                  <option>Avanzado (Tengo proyectos propios publicados)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-[#67F23B] hover:bg-[#52d726] text-[#121212] transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Registrando Matrícula...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Confirmar Inscripción a Clicmaster Academy</span>
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
