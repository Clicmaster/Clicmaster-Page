import React, { useState, useEffect } from 'react';
import { FEATURED_EVENTS } from '../../data/serverData.ts';
import { ServerEvent } from '../../types/index.ts';
import { Calendar, MapPin, Award, Users, ChevronLeft, ChevronRight, Check } from 'lucide-react';

export const FeaturedEvent: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [registeredEvents, setRegisteredEvents] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number }>({
    d: 0,
    h: 0,
    m: 0,
    s: 0,
  });

  const currentEvent: ServerEvent = FEATURED_EVENTS[currentIndex];

  // Auto-slide every 9 seconds
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % FEATURED_EVENTS.length);
    }, 9000);
    return () => clearInterval(slideTimer);
  }, []);

  // Live countdown timer calculation
  useEffect(() => {
    const calculateTime = () => {
      const now = Date.now();
      const diff = Math.max(0, currentEvent.targetTimestamp - now);

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / 1000 / 60) % 60);
      const s = Math.floor((diff / 1000) % 60);

      setTimeLeft({ d, h, m, s });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [currentEvent]);

  const handleRegister = (eventId: string) => {
    if (!registeredEvents.includes(eventId)) {
      setRegisteredEvents((prev) => [...prev, eventId]);
    }
  };

  const isRegistered = registeredEvents.includes(currentEvent.id);

  return (
    <section id="eventos" className="py-16 sm:py-20 bg-[#F5F7FA] dark:bg-[#151517] border-y border-neutral-200/80 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#248811] dark:text-[#67F23B] mb-2">
              Calendario Oficial
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#121212] dark:text-white tracking-tight">
              Evento Destacado de la Semana
            </h2>
          </div>

          {/* Slider controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setCurrentIndex((prev) => (prev === 0 ? FEATURED_EVENTS.length - 1 : prev - 1))
              }
              className="p-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              aria-label="Evento anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-xs font-bold text-neutral-500 tabular-nums px-2">
              0{currentIndex + 1} / 0{FEATURED_EVENTS.length}
            </div>
            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % FEATURED_EVENTS.length)}
              className="p-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              aria-label="Siguiente evento"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Big Featured Card */}
        <div className="bg-white dark:bg-[#1A1A1D] rounded-3xl border border-neutral-200/90 dark:border-neutral-800 shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            {/* Visual media banner */}
            <div className="lg:col-span-6 relative min-h-[360px] sm:min-h-[440px] lg:min-h-[520px] flex items-center justify-center overflow-hidden bg-neutral-950">
              {/* Ambient atmospheric backdrop */}
              <img
                src={currentEvent.image}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover blur-2xl scale-125 opacity-40 select-none pointer-events-none"
              />
              {/* Crisp Poster Image */}
              <img
                src={currentEvent.image}
                alt={currentEvent.title}
                referrerPolicy="no-referrer"
                loading="lazy"
                decoding="async"
                className="relative z-10 w-full h-full max-h-[560px] object-contain"
              />
              <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

              {/* Badges on image */}
              <div className="absolute top-5 left-5 z-20 flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#67F23B] text-[#121212] shadow-md">
                  {currentEvent.category}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-black/70 backdrop-blur-md text-white border border-white/20">
                  {currentEvent.date}
                </span>
              </div>

              {/* Location pin on image */}
              <div className="absolute bottom-5 left-5 right-5 z-20 text-white flex items-center gap-2 text-xs sm:text-sm drop-shadow">
                <MapPin className="w-4 h-4 text-[#67F23B] shrink-0" />
                <span className="font-semibold">{currentEvent.location}</span>
              </div>
            </div>

            {/* Event Details & Countdown Content */}
            <div className="lg:col-span-6 p-6 sm:p-8 md:p-10 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 dark:text-neutral-400 mb-2">
                  <Calendar className="w-4 h-4 text-[#2B6BFF]" />
                  <span>{currentEvent.time}</span>
                  <span aria-hidden="true">·</span>
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-neutral-400" />
                    <span>
                      {(currentEvent.registeredCount + (isRegistered ? 1 : 0)).toLocaleString()} Ciudadanos Inscritos
                    </span>
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-neutral-900 dark:text-white leading-tight mb-4">
                  {currentEvent.title}
                </h3>

                <p className="text-sm sm:text-base text-[#7B7B7B] dark:text-neutral-300 leading-relaxed mb-6">
                  {currentEvent.description}
                </p>

                {/* Reward Callout */}
                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700/80 mb-6 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
                      Bolsa de Premios Oficial
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100">
                      {currentEvent.rewards}
                    </span>
                  </div>
                </div>
              </div>

              {/* Countdown Grid & Action Button */}
              <div>
                <div className="mb-4">
                  <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block mb-2">
                    Tiempo Restante para el Inicio
                  </span>
                  <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center">
                    <div className="p-2.5 sm:p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                      <div className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tabular-nums">
                        {String(timeLeft.d).padStart(2, '0')}
                      </div>
                      <div className="text-[10px] font-bold text-neutral-500 uppercase">Días</div>
                    </div>
                    <div className="p-2.5 sm:p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                      <div className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tabular-nums">
                        {String(timeLeft.h).padStart(2, '0')}
                      </div>
                      <div className="text-[10px] font-bold text-neutral-500 uppercase">Horas</div>
                    </div>
                    <div className="p-2.5 sm:p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                      <div className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tabular-nums">
                        {String(timeLeft.m).padStart(2, '0')}
                      </div>
                      <div className="text-[10px] font-bold text-neutral-500 uppercase">Minutos</div>
                    </div>
                    <div className="p-2.5 sm:p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                      <div className="text-xl sm:text-2xl font-black text-[#228410] dark:text-[#67F23B] tabular-nums">
                        {String(timeLeft.s).padStart(2, '0')}
                      </div>
                      <div className="text-[10px] font-bold text-neutral-500 uppercase">Segundos</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={() => handleRegister(currentEvent.id)}
                    className={`w-full sm:flex-1 py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                      isRegistered
                        ? 'bg-[#42D425] text-[#121212]'
                        : 'bg-[#67F23B] hover:bg-[#54d728] text-[#121212] shadow-md hover:shadow-lg'
                    }`}
                  >
                    {isRegistered ? (
                      <>
                        <Check className="w-4 h-4 text-[#121212]" />
                        <span>¡Inscripción Confirmada!</span>
                      </>
                    ) : (
                      <span>Inscribirme en el Evento</span>
                    )}
                  </button>

                  <a
                    href="https://discord.gg/clicmaster"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto py-3.5 px-5 rounded-xl text-xs sm:text-sm font-bold text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-center"
                  >
                    Aviso en Discord
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
