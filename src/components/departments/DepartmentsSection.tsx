import React, { useState } from 'react';
import { DEPARTMENTS_DATA } from '../../data/serverData.ts';
import { DepartmentFaction } from '../../types/index.ts';
import { ApplicationModal } from './ApplicationModal.tsx';
import { Users, Shield, ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';

export const DepartmentsSection: React.FC = () => {
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentFaction | null>(null);
  const [activeTab, setActiveTab] = useState<string>('policia');

  const currentDept = DEPARTMENTS_DATA.find((d) => d.id === activeTab) || DEPARTMENTS_DATA[0];

  return (
    <section id="facciones" className="py-16 sm:py-24 bg-white dark:bg-[#121212]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#248811] dark:text-[#67F23B] mb-2">
              Estructura Institucional
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#121212] dark:text-white tracking-tight">
              Facciones & Departamentos Oficiales
            </h2>
          </div>
          <p className="text-sm text-[#7B7B7B] dark:text-neutral-400 max-w-md">
            Elige tu vocación y escala en la jerarquía: desde cadete de patrulla o paramédico hasta fiscal supremo o magnate comercial.
          </p>
        </div>

        {/* Department Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar">
          {DEPARTMENTS_DATA.map((dept) => (
            <button
              key={dept.id}
              onClick={() => setActiveTab(dept.id)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${
                activeTab === dept.id
                  ? 'bg-neutral-900 text-white dark:bg-[#67F23B] dark:text-[#121212] border-neutral-900 dark:border-[#67F23B] shadow-sm'
                  : 'bg-neutral-50 dark:bg-neutral-850 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: dept.color }}
              />
              <span>{dept.shortName}</span>
            </button>
          ))}
        </div>

        {/* Selected Department Spotlight Card */}
        <div className="bg-white dark:bg-[#1A1A1D] rounded-3xl border border-neutral-200/90 dark:border-neutral-800 shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            {/* Visual Column */}
            <div className="lg:col-span-5 relative min-h-[300px] sm:min-h-[380px] lg:min-h-full bg-neutral-900">
              <img
                src={currentDept.image}
                alt={currentDept.name}
                referrerPolicy="no-referrer"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

              {/* Badges on image */}
              <div className="absolute top-5 left-5">
                <span
                  className="px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider text-white shadow-md"
                  style={{ backgroundColor: currentDept.color }}
                >
                  {currentDept.badge}
                </span>
              </div>

              <div className="absolute bottom-5 left-5 right-5 text-white">
                <div className="text-xs font-semibold text-neutral-300">
                  Líder de Facción:
                </div>
                <div className="text-sm font-bold text-white mb-2">
                  {currentDept.headOfDepartment}
                </div>
                <div className="flex items-center gap-3 text-xs text-neutral-300 pt-2 border-t border-white/20">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span>{currentDept.membersCount} Miembros en Servicio</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Column */}
            <div className="lg:col-span-7 p-6 sm:p-8 md:p-10 flex flex-col justify-between">
              <div>
                <div className="text-xs font-extrabold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                  {currentDept.shortName}
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white leading-tight mb-2">
                  {currentDept.name}
                </h3>
                <p className="text-sm font-medium text-[#2B6BFF] dark:text-[#67F23B] italic mb-4">
                  "{currentDept.tagline}"
                </p>

                <p className="text-sm text-[#7B7B7B] dark:text-neutral-300 leading-relaxed mb-6">
                  {currentDept.description}
                </p>

                {/* 2-Column Split: Requirements & Rank Ladder */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                  {/* Requirements */}
                  <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/80 dark:border-neutral-800">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 mb-3 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-[#258712] dark:text-[#67F23B]" />
                      <span>Requisitos de Ingreso</span>
                    </h4>
                    <ul className="space-y-2">
                      {currentDept.requirements.map((req, idx) => (
                        <li key={idx} className="text-xs text-neutral-600 dark:text-neutral-300 flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#32B818] shrink-0 mt-0.5" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Rank Hierarchy */}
                  <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/80 dark:border-neutral-800">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 mb-3">
                      Escalafón de Rangos
                    </h4>
                    <div className="space-y-1.5">
                      {currentDept.ranks.map((rank, idx) => (
                        <div
                          key={idx}
                          className="text-xs font-medium text-neutral-700 dark:text-neutral-300 flex items-center justify-between py-1 px-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-750"
                        >
                          <span className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-neutral-400 tabular-nums">0{idx + 1}.</span>
                            <span>{rank}</span>
                          </span>
                          {idx === currentDept.ranks.length - 1 && (
                            <span className="text-[9px] font-extrabold text-amber-500 uppercase">Cúpula</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  {currentDept.isOpenForApplications ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Convocatoria Ciudadana Abierta
                    </span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      Postulaciones por Concurso Interno
                    </span>
                  )}
                </div>

                <button
                  onClick={() => setSelectedDepartment(currentDept)}
                  disabled={!currentDept.isOpenForApplications}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs sm:text-sm bg-[#67F23B] hover:bg-[#52d726] text-[#121212] transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span>Postular a {currentDept.shortName}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Grid of other 5 departments */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mt-6">
          {DEPARTMENTS_DATA.map((dept) => (
            <button
              key={dept.id}
              onClick={() => setActiveTab(dept.id)}
              className={`p-3.5 rounded-2xl text-left border transition-all ${
                activeTab === dept.id
                  ? 'border-[#42D425] bg-[#67F23B]/10 dark:bg-[#67F23B]/15 shadow-xs'
                  : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#171719] hover:border-neutral-300'
              }`}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs mb-2"
                style={{ backgroundColor: `${dept.color}20`, color: dept.color }}
              >
                {dept.badge}
              </div>
              <div className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                {dept.shortName}
              </div>
              <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                {dept.membersCount} agentes
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Application Modal */}
      {selectedDepartment && (
        <ApplicationModal
          faction={selectedDepartment}
          onClose={() => setSelectedDepartment(null)}
        />
      )}
    </section>
  );
};
