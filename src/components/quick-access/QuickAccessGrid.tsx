import React from 'react';
import {
  MapPin,
  CreditCard,
  Briefcase,
  ShoppingBag,
  Calendar,
  Gift,
  Newspaper,
  Shield,
  Car,
  Home,
  FileText,
  Trophy,
} from 'lucide-react';

interface QuickAccessGridProps {
  onOpenRules: () => void;
  onOpenCodes: () => void;
  onOpenDni: () => void;
}

export const QuickAccessGrid: React.FC<QuickAccessGridProps> = ({
  onOpenRules,
  onOpenCodes,
  onOpenDni,
}) => {
  const items = [
    {
      id: 'mapa',
      title: 'Mapa Interactivo',
      desc: 'Localiza hospitales, comisarías, talleres y puntos de interés',
      icon: MapPin,
      color: '#2B6BFF',
      action: () => {
        document.getElementById('mapa')?.scrollIntoView({ behavior: 'smooth' });
      },
    },
    {
      id: 'dni',
      title: 'Crear DNI Virtual',
      desc: 'Genera tu credencial de identificación legal con foto y chip',
      icon: CreditCard,
      color: '#42D425',
      action: onOpenDni,
      featured: true,
    },
    {
      id: 'tienda',
      title: 'CLICMASTER STORE',
      desc: 'Merch oficial urbano, periféricos gamer y pases VIP exclusivos',
      icon: ShoppingBag,
      color: '#7CFF3A',
      action: () => {
        document.getElementById('store')?.scrollIntoView({ behavior: 'smooth' });
      },
      featured: true,
    },
    {
      id: 'codigos',
      title: 'Hub de Códigos',
      desc: 'Canjea promociones, autos de regalo y monedas de bienvenida',
      icon: Gift,
      color: '#EC4899',
      action: onOpenCodes,
      featured: true,
    },
    {
      id: 'empresas',
      title: 'Empresas & Negocios',
      desc: 'Apertura de talleres, concesionarios y sociedades anónimas',
      icon: Briefcase,
      color: '#8B5CF6',
      action: () => {
        document.getElementById('facciones')?.scrollIntoView({ behavior: 'smooth' });
      },
    },
    {
      id: 'eventos',
      title: 'Eventos & Torneos',
      desc: 'Calendario de actividades semanales y premios en efectivo',
      icon: Calendar,
      color: '#06B6D4',
      action: () => {
        document.getElementById('eventos')?.scrollIntoView({ behavior: 'smooth' });
      },
    },
    {
      id: 'noticias',
      title: 'Noticias & Parches',
      desc: 'Registros de cambios v5.2, nuevas normativas y anuncios',
      icon: Newspaper,
      color: '#3B82F6',
      action: () => {
        document.getElementById('noticias')?.scrollIntoView({ behavior: 'smooth' });
      },
    },
    {
      id: 'roles',
      title: 'Roles & Facciones',
      desc: 'Policía Nacional, Médicos SAMUR y Bomberos Oficiales',
      icon: Shield,
      color: '#10B981',
      action: () => {
        document.getElementById('facciones')?.scrollIntoView({ behavior: 'smooth' });
      },
    },
    {
      id: 'vehiculos',
      title: 'Concesionarios',
      desc: 'Catálogo de superdeportivos, todoterrenos y helicópteros',
      icon: Car,
      color: '#EF4444',
      action: () => {
        document.getElementById('tienda')?.scrollIntoView({ behavior: 'smooth' });
      },
    },
    {
      id: 'casas',
      title: 'Casas & Mansiones',
      desc: 'Distrito residencial privado y fincas con helipuerto',
      icon: Home,
      color: '#14B8A6',
      action: () => {
        document.getElementById('tienda')?.scrollIntoView({ behavior: 'smooth' });
      },
    },
    {
      id: 'normativas',
      title: 'Normativas de Rol',
      desc: 'Reglamento de convivencia, RDM, VDM y metagaming',
      icon: FileText,
      color: '#6366F1',
      action: onOpenRules,
    },
    {
      id: 'ranking',
      title: 'Ranking de Jugadores',
      desc: 'Líderes de nivel, horas de rol y magnates económicos',
      icon: Trophy,
      color: '#EAB308',
      action: () => {
        document.getElementById('ranking')?.scrollIntoView({ behavior: 'smooth' });
      },
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-white dark:bg-[#121212]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#248811] dark:text-[#67F23B] mb-2">
              Navegación Rápida
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#121212] dark:text-white tracking-tight">
              Accesos Rápidos al Servidor
            </h2>
          </div>
          <p className="text-sm text-[#7B7B7B] dark:text-neutral-400 max-w-md">
            Todo lo que necesitas para tu vida ciudadana en una sola cuadrícula de alta velocidad.
          </p>
        </div>

        {/* 12-Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={item.action}
                className={`text-left p-5 rounded-2xl border transition-all duration-200 group relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#67F23B] ${
                  item.featured
                    ? 'bg-neutral-50/80 dark:bg-neutral-850 border-[#42D425]/40 hover:border-[#42D425] shadow-sm hover:shadow-md'
                    : 'bg-white dark:bg-[#1A1A1C] border-neutral-200/80 dark:border-neutral-800/80 hover:border-neutral-400 dark:hover:border-neutral-600 shadow-sm hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-xs"
                    style={{
                      backgroundColor: `${item.color}15`,
                      color: item.color,
                    }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  {item.featured && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#67F23B]/20 text-[#1e6f0e] dark:text-[#67F23B] border border-[#67F23B]/30">
                      DESTACADO
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-neutral-900 dark:text-white group-hover:text-[#2B6BFF] dark:group-hover:text-[#67F23B] transition-colors leading-snug mb-1.5">
                  {item.title}
                </h3>
                <p className="text-xs text-[#7B7B7B] dark:text-neutral-400 line-clamp-2 leading-relaxed">
                  {item.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
