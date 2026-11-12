import React, { useState, useEffect, useRef } from 'react';
import {
  GraduationCap,
  Sparkles,
  ChevronDown,
  ArrowRight,
  Code2,
  Hammer,
  MessageSquare,
  Video,
  Coins,
  CheckCircle2,
  Award,
  BookOpen,
  Layers,
  Rocket,
  ShieldCheck,
  TrendingUp,
  Flame,
  Star,
  Users,
} from 'lucide-react';
import { AcademyEnrollmentModal } from './AcademyEnrollmentModal.tsx';

interface LevelItem {
  level: number;
  title: string;
  subtitle: string;
  desc: string;
  deliverable: string;
  badge: string;
}

const ACADEMY_LEVELS: LevelItem[] = [
  {
    level: 1,
    title: 'Aprende Roblox',
    subtitle: 'Fundamentos del ecosistema',
    desc: 'Comprende el motor, la física, la cámara, el sistema de personajes R6 vs R15 y la cultura de los jugadores en Latinoamérica.',
    deliverable: 'Cuenta Developer y análisis de 3 experiencias top',
    badge: 'Iniciación',
  },
  {
    level: 2,
    title: 'Roblox Studio',
    subtitle: 'Dominio de la herramienta',
    desc: 'Aprende a navegar en el viewport 3D, configurar la barra Explorer, Properties, Toolboxes seguros y gestión de assets locales.',
    deliverable: 'Workspace optimizado y configurado',
    badge: 'Herramientas',
  },
  {
    level: 3,
    title: 'Construcción Profesional',
    subtitle: 'Arquitectura urbana y modular',
    desc: 'Crea edificios cinematográficos, carreteras, avenidas, iluminación PBR con Future Lighting y optimización de polígonos.',
    deliverable: 'Manzana urbana completa estilo metrópolis',
    badge: 'Arquitectura',
  },
  {
    level: 4,
    title: 'Programación Lua',
    subtitle: 'Scripting de mecánicas de rol',
    desc: 'Variables, funciones, RemoteEvents, Client-Server architecture, DataStores para guardar progreso de inventario y sistemas de trabajo.',
    deliverable: 'Sistema de economía bancaria funcional',
    badge: 'Scripting',
  },
  {
    level: 5,
    title: 'Crear tu Juego',
    subtitle: 'Diseño integral de experiencia',
    desc: 'Ensamblaje del ciclo de juego (core loop), HUD en pantalla, inventario, garaje de vehículos y zonas seguras con spawn inteligente.',
    deliverable: 'Build alpha jugable de rol inmersivo',
    badge: 'Producción',
  },
  {
    level: 6,
    title: 'Publicarlo',
    subtitle: 'Despliegue y control de calidad',
    desc: 'Configuración de permisos, ratings por edad, thumbnails cinematográficos, íconos de alta conversión y pruebas de estrés multijugador.',
    deliverable: 'Experiencia pública verificada en Roblox',
    badge: 'Lanzamiento',
  },
  {
    level: 7,
    title: 'Monetizar',
    subtitle: 'Economía sostenible y Robux',
    desc: 'Gamepasses equilibrados, suscripciones VIP, Developer Products (monedas CLIC), pases de batalla y respeto a las normativas de Roblox.',
    deliverable: 'Tienda integrada con catálogo de 6 items',
    badge: 'Monetización',
  },
  {
    level: 8,
    title: 'Crear Eventos',
    subtitle: 'Retención de comunidad masiva',
    desc: 'Cómo orquestar eventos en vivo sincronizados por servidor: la Gran Purga, carreras nocturnas, catástrofes y conciertos con recompensas.',
    deliverable: 'Guión y programación de un evento en vivo',
    badge: 'Operaciones',
  },
  {
    level: 9,
    title: 'Discord Profesional',
    subtitle: 'El cuartel de tu comunidad',
    desc: 'Arquitectura de canales, permisos jerárquicos, roles dinámicos, bots de verificación con Roblox (Bloxlink), auditoría y tickets de soporte.',
    deliverable: 'Servidor de Discord estructurado y blindado',
    badge: 'Comunidad',
  },
  {
    level: 10,
    title: 'Administrador de Comunidad',
    subtitle: 'Liderazgo y moderación ética',
    desc: 'Reclutamiento de moderadores, protocolos ante trolls o exploits, normativas NVHQ/RDM, resolución de conflictos y salud comunitaria.',
    deliverable: 'Manual oficial de convivencia y protocolo de staff',
    badge: 'Liderazgo',
  },
];

const CAREER_PATH = [
  {
    role: 'Alumno',
    desc: 'Comienza desde cero sin conocimientos previos',
    icon: GraduationCap,
    gradient: 'from-neutral-400 to-neutral-600',
  },
  {
    role: 'Constructor',
    desc: 'Modela edificios, autopistas y espacios urbanos',
    icon: Hammer,
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    role: 'Developer',
    desc: 'Escribe código Lua, sistemas de guardado y mecánicas',
    icon: Code2,
    gradient: 'from-emerald-500 to-[#67F23B]',
  },
  {
    role: 'Administrador',
    desc: 'Controla servidores, bases de datos y normativas',
    icon: ShieldCheck,
    gradient: 'from-purple-500 to-indigo-500',
  },
  {
    role: 'Community Manager',
    desc: 'Diseña el Discord, fideliza miembros y maneja redes',
    icon: Users,
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    role: 'Director de Eventos',
    desc: 'Produce espectáculos en vivo y torneos masivos',
    icon: Rocket,
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    role: 'Creador Profesional',
    desc: 'Lidera estudios, monetiza y crea franquicias en Roblox',
    icon: Award,
    gradient: 'from-[#67F23B] via-emerald-400 to-[#2B6BFF]',
  },
];

export const ClicmasterAcademy: React.FC = () => {
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [activeLevel, setActiveLevel] = useState(1);
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef<HTMLElement>(null);

  // Vision Pro inspired dynamic ambient background shift based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const totalHeight = rect.height;
      const progress = Math.min(
        1,
        Math.max(0, (windowHeight - rect.top) / (totalHeight + windowHeight))
      );
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Compute Vision Pro-like subtle atmospheric tint based on scroll
  const getAmbientStyles = () => {
    // Dynamic soft shifts between pristine white/slate/subtle jade/dark deep tones
    const hueA = Math.round(140 + scrollProgress * 70); // 140 (emerald) to 210 (vision pro sapphire/slate)
    const op = (0.04 + scrollProgress * 0.08).toFixed(3);
    return {
      background: `radial-gradient(ellipse 90% 70% at 50% ${Math.round(
        scrollProgress * 100
      )}%, hsla(${hueA}, 75%, 60%, ${op}), transparent 75%)`,
    };
  };

  const scrollToTimeline = () => {
    const el = document.getElementById('academy-levels');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="academy"
      ref={containerRef}
      className="relative py-20 sm:py-28 lg:py-36 transition-colors duration-700 bg-white dark:bg-[#0f0f11] text-[#121212] dark:text-white overflow-hidden border-y border-neutral-200/80 dark:border-neutral-800"
    >
      {/* Apple Vision Pro Ambient Atmosphere Backdrop */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-700"
        style={getAmbientStyles()}
      />
      <div className="absolute inset-0 bg-[radial-gradient(#67F23B_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.035] dark:opacity-[0.06] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* ========================================================= */}
        {/* HERO ACADEMY BLOCK */}
        {/* ========================================================= */}
        <div className="text-center max-w-4xl mx-auto mb-20 sm:mb-28">
          {/* Header kicker */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 mb-6">
            <GraduationCap className="w-4 h-4 text-[#258712] dark:text-[#67F23B]" />
            <span>CLICMASTER ACADEMY · TEMPORADA 2026</span>
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.06] mb-6 text-balance">
            Aprende a crear mundos, comunidades y experiencias{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#218d0d] via-[#32B818] to-[#2B6BFF] dark:from-[#67F23B] dark:via-[#42D425] dark:to-[#60a5fa]">
              profesionales en Roblox.
            </span>
          </h2>

          <p className="text-lg sm:text-2xl text-neutral-600 dark:text-neutral-300 font-medium mb-10 max-w-2xl mx-auto leading-relaxed">
            Desde cero hasta convertirte en creador. El programa formativo oficial de la comunidad de Roleplay #1 de Latinoamérica.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <button
              onClick={() => setEnrollModalOpen(true)}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-base text-[#121212] bg-[#67F23B] hover:bg-[#52d726] active:scale-98 transition-all duration-200 shadow-lg hover:shadow-[0_4px_30px_rgba(103,242,59,0.45)] flex items-center justify-center gap-2.5"
            >
              <Sparkles className="w-5 h-5 fill-current" />
              <span>Comenzar Curso</span>
            </button>

            <button
              onClick={scrollToTimeline}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl font-bold text-sm text-neutral-700 dark:text-neutral-200 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800/80 dark:hover:bg-neutral-800 transition-colors border border-neutral-200/80 dark:border-neutral-700 flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-[#2B6BFF]" />
              <span>Ver Plan de Estudios (10 Niveles)</span>
            </button>
          </div>

          {/* Scroll Indicator */}
          <div className="flex flex-col items-center justify-center gap-2 text-neutral-400 dark:text-neutral-500 animate-bounce">
            <span className="text-[11px] font-bold tracking-widest uppercase">Scroll</span>
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {/* ========================================================= */}
        {/* TIMELINE: NIVEL 1 HASTA NIVEL 10 + PROYECTO FINAL */}
        {/* ========================================================= */}
        <div id="academy-levels" className="mb-24 sm:mb-32">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-black uppercase tracking-wider text-[#258712] dark:text-[#67F23B]">
              Ruta Formativa Paso a Paso
            </span>
            <h3 className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white mt-1">
              De Novato a Director de Servidor
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
              Cada nivel desbloquea habilidades prácticas con entregables reales que podrás usar en tu propio juego o servidor.
            </p>
          </div>

          {/* Timeline Vertical Path */}
          <div className="relative max-w-3xl mx-auto">
            {/* Illuminated Center Line */}
            <div className="absolute top-8 bottom-8 left-6 sm:left-1/2 -translate-x-1/2 w-1 bg-gradient-to-b from-[#67F23B] via-[#42D425] to-[#2B6BFF] rounded-full shadow-[0_0_15px_rgba(103,242,59,0.5)] opacity-80" />

            <div className="space-y-8 sm:space-y-12">
              {ACADEMY_LEVELS.map((item, idx) => {
                const isEven = idx % 2 === 0;
                const isCurrentActive = activeLevel === item.level;

                return (
                  <div
                    key={item.level}
                    onClick={() => setActiveLevel(item.level)}
                    className="relative flex items-center sm:justify-between group cursor-pointer"
                  >
                    {/* Node Pin Marker */}
                    <div className="absolute left-6 sm:left-1/2 -translate-x-1/2 z-20 flex items-center justify-center">
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center font-black text-sm transition-all duration-300 shadow-md ${
                          isCurrentActive
                            ? 'bg-[#67F23B] text-[#121212] scale-110 ring-4 ring-[#67F23B]/30'
                            : 'bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border-2 border-neutral-300 dark:border-neutral-700 group-hover:border-[#67F23B]'
                        }`}
                      >
                        {item.level}
                      </div>
                    </div>

                    {/* Left/Right Responsive Card */}
                    <div
                      className={`w-full sm:w-[44%] pl-16 sm:pl-0 ${
                        isEven ? 'sm:mr-auto sm:text-right' : 'sm:ml-auto sm:text-left'
                      }`}
                    >
                      <div
                        className={`p-6 rounded-3xl border transition-all duration-300 ${
                          isCurrentActive
                            ? 'bg-neutral-50/90 dark:bg-neutral-850 border-[#42D425] shadow-xl ring-1 ring-[#42D425]/30'
                            : 'bg-white/80 dark:bg-[#161618]/90 border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-sm'
                        }`}
                      >
                        <div
                          className={`flex items-center gap-2 mb-2 ${
                            isEven ? 'sm:justify-end' : 'sm:justify-start'
                          }`}
                        >
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#67F23B]/20 text-[#1f7c0f] dark:text-[#67F23B]">
                            {item.badge}
                          </span>
                          <span className="text-xs font-mono font-bold text-neutral-400">
                            NIVEL {item.level}
                          </span>
                        </div>

                        <h4 className="text-lg sm:text-xl font-extrabold text-neutral-900 dark:text-white mb-1">
                          {item.title}
                        </h4>
                        <div className="text-xs font-semibold text-[#2B6BFF] dark:text-blue-400 mb-2">
                          {item.subtitle}
                        </div>
                        <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed mb-3">
                          {item.desc}
                        </p>

                        <div
                          className={`flex items-center gap-1.5 text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 pt-2 border-t border-neutral-100 dark:border-neutral-800 ${
                            isEven ? 'sm:justify-end' : 'sm:justify-start'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#32B818] shrink-0" />
                          <span>Entregable: {item.deliverable}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Proyecto Final Terminal Box */}
              <div className="relative flex items-center justify-center pt-4">
                <div className="relative z-20 max-w-xl w-full p-8 rounded-3xl bg-gradient-to-br from-neutral-900 via-[#18181b] to-black text-white border-2 border-[#67F23B]/60 shadow-[0_10px_40px_rgba(103,242,59,0.25)] text-center">
                  <div className="w-14 h-14 rounded-2xl bg-[#67F23B] text-[#121212] flex items-center justify-center mx-auto mb-4 font-black text-xl shadow-lg">
                    <Award className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-[#67F23B] block mb-1">
                    CUMBRE DEL PROGRAMA
                  </span>
                  <h4 className="text-2xl sm:text-3xl font-black mb-3">
                    Proyecto Final de Graduación
                  </h4>
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-md mx-auto mb-6">
                    Construye y publica tu propia experiencia completa de Roblox con servidor de Discord oficial, economía configurada y evento de inauguración en vivo.
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-xs font-bold text-neutral-200 border border-white/15">
                    <Star className="w-4 h-4 text-amber-400 fill-current" />
                    <span>Certificación Oficial CLICMaster Developer</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* CARDS ENORMES (ROBLOX STUDIO, DISCORD, STREAMING, MONETIZACIÓN) */}
        {/* ========================================================= */}
        <div className="mb-24 sm:mb-32">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-black uppercase tracking-wider text-[#258712] dark:text-[#67F23B]">
              Los Cuatro Pilares del Creador
            </span>
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-neutral-900 dark:text-white mt-1">
              Especializaciones Principales
            </h3>
            <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 mt-2">
              Cards de alta inmersión con el contenido exacto que dominarás en la academia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
            {/* Card 1: Roblox Studio */}
            <div className="p-8 sm:p-10 lg:p-12 rounded-3xl bg-neutral-50 dark:bg-[#161618] border border-neutral-200/90 dark:border-neutral-800 shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-center justify-between mb-6">
                <div className="w-16 h-16 rounded-2xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 flex items-center justify-center text-3xl shadow-md">
                  🎮
                </div>
                <div className="flex items-center gap-1 text-amber-400 text-lg">
                  ★★★★★
                </div>
              </div>

              <h4 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white mb-4">
                Roblox Studio
              </h4>

              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed">
                El motor de creación 3D donde cobran vida los universos más jugados del planeta.
              </p>

              {/* Big List of Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {[
                  'Construye ciudades completas',
                  'Vehículos con física avanzada',
                  'Hospitales y centros de salud',
                  'Comisarías y celdas policiales',
                  'Mapas con iluminación Future',
                  'Edificios modulares sin lag',
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-white dark:bg-neutral-800/80 border border-neutral-200/70 dark:border-neutral-700/70 flex items-center gap-2.5 text-xs sm:text-sm font-bold text-neutral-800 dark:text-neutral-200 shadow-xs"
                  >
                    <div className="w-2 h-2 rounded-full bg-[#67F23B]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-neutral-200/80 dark:border-neutral-800">
                <span className="text-xs font-bold text-neutral-400">Módulo Práctico · 45 Horas</span>
                <span className="text-xs font-black text-[#258712] dark:text-[#67F23B] flex items-center gap-1">
                  <span>Arquitectura 3D</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* Card 2: Discord */}
            <div className="p-8 sm:p-10 lg:p-12 rounded-3xl bg-neutral-50 dark:bg-[#161618] border border-neutral-200/90 dark:border-neutral-800 shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between mb-6">
                <div className="w-16 h-16 rounded-2xl bg-[#5865F2] text-white flex items-center justify-center text-3xl shadow-md">
                  💬
                </div>
                <div className="flex items-center gap-1 text-amber-400 text-lg">
                  ★★★★★
                </div>
              </div>

              <h4 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white mb-4">
                Discord Profesional
              </h4>

              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed">
                El centro neurálgico donde se retienen los jugadores y se forja la comunidad leal.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {[
                  'Canales estratégicos y orden',
                  'Roles jerárquicos automáticos',
                  'Moderación y filtros anti-raid',
                  'Bots personalizados de tickets',
                  'Organización de eventos de voz',
                  'Verificación con cuenta Roblox',
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-white dark:bg-neutral-800/80 border border-neutral-200/70 dark:border-neutral-700/70 flex items-center gap-2.5 text-xs sm:text-sm font-bold text-neutral-800 dark:text-neutral-200 shadow-xs"
                  >
                    <div className="w-2 h-2 rounded-full bg-[#5865F2]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-neutral-200/80 dark:border-neutral-800">
                <span className="text-xs font-bold text-neutral-400">Módulo Comunitario · 30 Horas</span>
                <span className="text-xs font-black text-[#5865F2] flex items-center gap-1">
                  <span>Gestión de Comunidad</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* Card 3: Streaming */}
            <div className="p-8 sm:p-10 lg:p-12 rounded-3xl bg-neutral-50 dark:bg-[#161618] border border-neutral-200/90 dark:border-neutral-800 shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-600 text-white flex items-center justify-center text-3xl shadow-md">
                  🎥
                </div>
                <div className="flex items-center gap-1 text-amber-400 text-lg">
                  ★★★★★
                </div>
              </div>

              <h4 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white mb-4">
                Streaming & Virales
              </h4>

              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed">
                Técnicas probadas para atraer miles de jugadores orgánicos a tu servidor cada semana.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {[
                  'Formatos virales para TikTok',
                  'Miniaturas y títulos de YouTube',
                  'Organización de eventos en vivo',
                  'Cómo atraer miles de jugadores',
                  'Transmisión con OBS optimizado',
                  'Narrativa dramática para directos',
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-white dark:bg-neutral-800/80 border border-neutral-200/70 dark:border-neutral-700/70 flex items-center gap-2.5 text-xs sm:text-sm font-bold text-neutral-800 dark:text-neutral-200 shadow-xs"
                  >
                    <div className="w-2 h-2 rounded-full bg-pink-500" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-neutral-200/80 dark:border-neutral-800">
                <span className="text-xs font-bold text-neutral-400">Módulo Audiovisual · 25 Horas</span>
                <span className="text-xs font-black text-pink-600 dark:text-pink-400 flex items-center gap-1">
                  <span>Tráfico Masivo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* Card 4: Monetización */}
            <div className="p-8 sm:p-10 lg:p-12 rounded-3xl bg-neutral-50 dark:bg-[#161618] border border-neutral-200/90 dark:border-neutral-800 shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between mb-6">
                <div className="w-16 h-16 rounded-2xl bg-amber-500 text-neutral-900 flex items-center justify-center text-3xl shadow-md font-bold">
                  💰
                </div>
                <div className="flex items-center gap-1 text-amber-400 text-lg">
                  ★★★★★
                </div>
              </div>

              <h4 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white mb-4">
                Monetización & Negocios
              </h4>

              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed">
                Transforma tu pasión en un negocio sostenible con ingresos en Robux y moneda real.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {[
                  'Diseño ético de Gamepasses',
                  'Suscripciones y rangos VIP',
                  'Conversión de Robux con DevEx',
                  'Alianzas con marcas y sponsors',
                  'Economía balanceada sin Pay-to-Win',
                  'Patrocinios de eventos especiales',
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-white dark:bg-neutral-800/80 border border-neutral-200/70 dark:border-neutral-700/70 flex items-center gap-2.5 text-xs sm:text-sm font-bold text-neutral-800 dark:text-neutral-200 shadow-xs"
                  >
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-neutral-200/80 dark:border-neutral-800">
                <span className="text-xs font-bold text-neutral-400">Módulo Financiero · 30 Horas</span>
                <span className="text-xs font-black text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <span>DevEx & Revenue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RECORRIDO VISUAL: ALUMNO -> CREADOR PROFESIONAL */}
        {/* ========================================================= */}
        <div className="rounded-3xl p-8 sm:p-12 lg:p-16 bg-neutral-900 text-white relative overflow-hidden border border-neutral-800 shadow-2xl">
          {/* Subtle Cyber Glowing Background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] bg-gradient-to-r from-[#67F23B]/15 via-[#2B6BFF]/15 to-transparent blur-3xl rounded-full pointer-events-none" />

          <div className="relative z-10 text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-black uppercase tracking-widest text-[#67F23B]">
              Tu Transformación Profesional
            </span>
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-black mt-2 leading-tight">
              Recorrido Visual del Egresado
            </h3>
            <p className="text-sm sm:text-base text-neutral-300 mt-3 leading-relaxed">
              Una línea de carrera iluminada que te guía paso a paso desde tu primera línea de código hasta dirigir un estudio valorado en miles de dólares.
            </p>
          </div>

          {/* Stepper with Glowing Connected Line */}
          <div className="relative z-10">
            {/* Glowing connecting horizontal bar on desktop */}
            <div className="hidden lg:block absolute top-12 left-8 right-8 h-1 bg-gradient-to-r from-neutral-600 via-[#67F23B] to-[#2B6BFF] rounded-full shadow-[0_0_20px_rgba(103,242,59,0.6)]" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-6 lg:gap-4 items-stretch">
              {CAREER_PATH.map((step, idx) => {
                const Icon = step.icon;
                const isLast = idx === CAREER_PATH.length - 1;

                return (
                  <div
                    key={step.role}
                    className="relative flex flex-col items-center text-center group"
                  >
                    {/* Glowing Node Button */}
                    <div
                      className={`relative z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 mb-4 bg-gradient-to-tr ${step.gradient} text-white`}
                    >
                      <Icon className="w-8 h-8 drop-shadow" />
                      {isLast && (
                        <span className="absolute -top-2 -right-2 flex h-4 w-4">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#67F23B] opacity-75" />
                          <span className="relative inline-flex rounded-full h-4 w-4 bg-[#67F23B]" />
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-widest mb-1">
                      Paso 0{idx + 1}
                    </div>

                    <h4
                      className={`text-base sm:text-lg font-black leading-tight mb-2 ${
                        isLast ? 'text-[#67F23B]' : 'text-white'
                      }`}
                    >
                      {step.role}
                    </h4>

                    <p className="text-xs text-neutral-300 leading-relaxed">
                      {step.desc}
                    </p>

                    {/* Mobile Down Arrow for visual flow */}
                    {!isLast && (
                      <div className="lg:hidden my-3 text-[#67F23B] font-bold text-lg animate-pulse">
                        ↓
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Callout & Action */}
          <div className="relative z-10 mt-16 pt-10 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <h5 className="text-base font-bold text-white">
                ¿Listo para comenzar tu primera lección hoy mismo?
              </h5>
              <p className="text-xs text-neutral-400 mt-0.5">
                Acceso inmediato a materiales didácticos, plantillas de Roblox Studio y Discord de estudiantes.
              </p>
            </div>

            <button
              onClick={() => setEnrollModalOpen(true)}
              className="px-8 py-4 rounded-2xl font-black text-sm text-[#121212] bg-[#67F23B] hover:bg-[#52d726] active:scale-98 transition-all shadow-lg hover:shadow-[0_0_30px_rgba(103,242,59,0.5)] whitespace-nowrap"
            >
              Comenzar Curso Ahora
            </button>
          </div>
        </div>
      </div>

      {/* Enrollment Modal */}
      <AcademyEnrollmentModal
        isOpen={enrollModalOpen}
        onClose={() => setEnrollModalOpen(false)}
      />
    </section>
  );
};
