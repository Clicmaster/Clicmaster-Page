import React, { useState, useRef } from 'react';
import {
  Download,
  Sparkles,
  RefreshCw,
  Check,
  QrCode,
  Upload,
  Camera,
  Trash2,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { OFFICIAL_ICON_GREEN } from '../common/ClicMasterLogo.tsx';
import { exportDniToPng, formatMrzLine } from './dniCanvasExporter.ts';

interface DniGeneratorProps {
  onClose?: () => void;
}

const ROBLOX_AVATAR_PRESETS = [
  {
    id: 'officer',
    label: 'Oficial RPD',
    img: '/src/assets/images/roblox_police_tactical_1794365859519.jpg',
  },
  {
    id: 'doctor',
    label: 'Médico SAMUR',
    img: '/src/assets/images/roblox_doctor_scrubs_1794365860261.jpg',
  },
  {
    id: 'vip',
    label: 'Ejecutivo VIP',
    img: '/src/assets/images/roblox_vip_pass_1794365858806.jpg',
  },
  {
    id: 'fire',
    label: 'Bombero #12',
    img: '/src/assets/images/roblox_firefighter_gear_1794365861409.jpg',
  },
];

export const DniGenerator: React.FC<DniGeneratorProps> = () => {
  const [characterName, setCharacterName] = useState('Mateo Vance Silva');
  const [robloxUser, setRobloxUser] = useState('MateoVance_RP');
  const [birthDate, setBirthDate] = useState('2001-08-14');
  const [gender, setGender] = useState('M');
  const [bloodType, setBloodType] = useState('O+');
  const [occupation, setOccupation] = useState('Oficial II de Policía (RPD)');
  const [address, setAddress] = useState('Boulevard Central #102, Brookhaven');
  const [avatarPreset, setAvatarPreset] = useState<string>('officer');
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string | null>(null);
  const [customFileName, setCustomFileName] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [dniNumber, setDniNumber] = useState('CM-2026-78491');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadedFileName, setDownloadedFileName] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const issueDate = new Date().toISOString().slice(0, 10);

  const currentAvatar =
    customAvatarUrl ||
    ROBLOX_AVATAR_PRESETS.find((a) => a.id === avatarPreset)?.img ||
    ROBLOX_AVATAR_PRESETS[0].img;

  const handleFileSelection = (file: File | undefined) => {
    if (!file) return;
    setUploadError(null);

    if (!file.type.startsWith('image/')) {
      setUploadError('Selecciona un archivo de imagen válido (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('La imagen no debe superar los 10 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCustomAvatarUrl(reader.result);
        setCustomFileName(file.name);
      }
    };
    reader.onerror = () => {
      setUploadError('No pudimos leer la imagen desde tu dispositivo.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelection(e.target.files?.[0]);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelection(e.dataTransfer.files?.[0]);
  };

  const handleClearCustomAvatar = () => {
    setCustomAvatarUrl(null);
    setCustomFileName('');
    setUploadError(null);
  };

  const handleGenerateNewId = () => {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    setDniNumber(`CM-2026-${randomNum}`);
    confetti({
      particleCount: 45,
      spread: 50,
      origin: { y: 0.7 },
      colors: ['#7CFF3A', '#42D425', '#FFFFFF'],
    });
  };

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    setDownloadError(null);

    try {
      const savedFileName = await exportDniToPng({
        characterName,
        robloxUser,
        birthDate,
        gender,
        bloodType,
        occupation,
        address,
        dniNumber,
        issueDate,
        avatarSrc: currentAvatar,
        logoSrc: OFFICIAL_ICON_GREEN,
      });

      setDownloadedFileName(savedFileName);
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#7CFF3A', '#42D425', '#FFFFFF'],
      });
      setTimeout(() => setDownloadedFileName(null), 4500);
    } catch {
      setDownloadError('Ocurrió un problema al generar la imagen. Inténtalo de nuevo.');
    } finally {
      setIsDownloading(false);
    }
  };

  const mrzString = formatMrzLine(dniNumber, characterName);

  return (
    <section
      id="dni"
      className="py-16 sm:py-24 bg-[#F5F7FA] dark:bg-[#151517] border-y border-neutral-200/80 dark:border-neutral-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#248811] dark:text-[#67F23B] mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Registro Civil Virtual de Brookhaven</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#121212] dark:text-white tracking-tight">
              Crear DNI Ciudadano Oficial
            </h2>
          </div>
          <p className="text-sm text-[#7B7B7B] dark:text-neutral-400 max-w-md">
            Personaliza tu documento oficial con los colores de CLICMASTER, sube la foto de tu avatar de Roblox y descárgalo en alta resolución.
          </p>
        </div>

        {/* 2-Column Split: Form Inputs & Live CLICMASTER Card Render */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Column 1: Input Form */}
          <div className="lg:col-span-6 bg-white dark:bg-[#1A1A1D] rounded-3xl p-6 sm:p-8 border border-neutral-200/90 dark:border-neutral-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="text-base font-extrabold text-neutral-900 dark:text-white">
                Datos Legales del Personaje (In Character)
              </h3>
              <span className="text-[11px] font-black uppercase px-2.5 py-1 rounded-md bg-[#7CFF3A]/15 text-[#1e7c0c] dark:text-[#7CFF3A] border border-[#7CFF3A]/30">
                Edición CLICMASTER
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                Nombre y Apellidos de Rol
              </label>
              <input
                type="text"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#7CFF3A] dark:text-white"
                placeholder="Ej: Mateo Vance Silva"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                  Usuario de Roblox
                </label>
                <input
                  type="text"
                  value={robloxUser}
                  onChange={(e) => setRobloxUser(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#7CFF3A] dark:text-white"
                  placeholder="Ej: MateoVance_RP"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                  Fecha de Nacimiento
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#7CFF3A] dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                  Sexo
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#7CFF3A] dark:text-white"
                >
                  <option value="M">Masculino (M)</option>
                  <option value="F">Femenino (F)</option>
                  <option value="X">No Binario (X)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                  Grupo Sanguíneo
                </label>
                <select
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#7CFF3A] dark:text-white"
                >
                  <option>O+</option>
                  <option>O-</option>
                  <option>A+</option>
                  <option>A-</option>
                  <option>B+</option>
                  <option>AB+</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                Profesión u Ocupación
              </label>
              <input
                type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#7CFF3A] dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                Domicilio en la Metrópolis
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#7CFF3A] dark:text-white"
              />
            </div>

            {/* Interactive Roblox Avatar Upload + Presets */}
            <div className="pt-1">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                  Foto de tu Avatar de Roblox
                </label>
                {customAvatarUrl && (
                  <button
                    type="button"
                    onClick={handleClearCustomAvatar}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-red-500 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Quitar foto</span>
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={handleFileInputChange}
                className="hidden"
              />

              {/* Drag & Drop + Click Upload Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                className={`cursor-pointer rounded-2xl border-2 border-dashed p-3.5 mb-3 transition-all flex items-center gap-3.5 ${
                  isDragging
                    ? 'border-[#7CFF3A] bg-[#7CFF3A]/15'
                    : customAvatarUrl
                    ? 'border-[#42D425] bg-[#7CFF3A]/10'
                    : 'border-neutral-300 dark:border-neutral-700 hover:border-[#7CFF3A] bg-neutral-50 dark:bg-neutral-800/60'
                }`}
              >
                <div className="w-11 h-11 rounded-xl bg-[#12161C] border border-[#7CFF3A]/50 flex items-center justify-center shrink-0 overflow-hidden">
                  {customAvatarUrl ? (
                    <img
                      src={customAvatarUrl}
                      alt="Avatar subido"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Upload className="w-5 h-5 text-[#7CFF3A]" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-extrabold text-neutral-900 dark:text-white truncate">
                    {customAvatarUrl
                      ? `Avatar cargado: ${customFileName || 'Imagen personalizada'}`
                      : 'Sube una foto de tu avatar desde tu dispositivo'}
                  </p>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    {customAvatarUrl
                      ? 'Haz clic aquí o arrastra otra imagen para reemplazarla'
                      : 'Toca aquí o arrastra una captura PNG, JPG o WEBP'}
                  </p>
                </div>
                <span className="px-3 py-1.5 rounded-lg bg-[#7CFF3A] text-[#121212] text-[11px] font-black shrink-0">
                  {customAvatarUrl ? 'Cambiar' : 'Subir'}
                </span>
              </div>

              {uploadError && (
                <p className="text-xs font-semibold text-red-500 mb-2">{uploadError}</p>
              )}

              {/* Quick Roblox Avatar Presets */}
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
                  O elige un avatar Roblox predefinido:
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {ROBLOX_AVATAR_PRESETS.map((opt) => {
                  const isActive = !customAvatarUrl && avatarPreset === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setCustomAvatarUrl(null);
                        setCustomFileName('');
                        setUploadError(null);
                        setAvatarPreset(opt.id);
                      }}
                      className={`p-1.5 rounded-xl border text-center transition-all ${
                        isActive
                          ? 'border-[#42D425] ring-2 ring-[#7CFF3A]/40 bg-[#7CFF3A]/10'
                          : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                      }`}
                    >
                      <img
                        src={opt.img}
                        alt={opt.label}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-lg object-cover mx-auto mb-1"
                      />
                      <span className="text-[10px] font-semibold text-neutral-700 dark:text-neutral-300 block truncate">
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={handleGenerateNewId}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:text-[#248811] dark:hover:text-[#7CFF3A] transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Generar Nuevo Número de Serie</span>
              </button>
            </div>
          </div>

          {/* Column 2: Personalized CLICMASTER Holographic DNI Card Render */}
          <div className="lg:col-span-6 flex flex-col items-center">
            {/* The Live Physical Card - Official CLICMASTER Colors (#0B0D10 + #7CFF3A + White) */}
            <div className="w-full max-w-md aspect-[1.58/1] rounded-3xl p-5 sm:p-6 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.45)] border-2 border-[#7CFF3A]/55 bg-gradient-to-br from-[#0B0D10] via-[#12161C] to-[#080A0C] text-white select-none">
              {/* Top CLICMASTER Neon Accent Strip */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#7CFF3A] via-[#42D425] to-[#7CFF3A]" />

              {/* Security Hologram Ambient Glows */}
              <div className="absolute -top-10 -right-10 w-44 h-44 bg-[#7CFF3A]/20 blur-2xl rounded-full pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-[#42D425]/15 blur-2xl rounded-full pointer-events-none" />

              {/* Subtle Cyber Grid Overlay */}
              <div
                className="absolute inset-0 opacity-[0.06] pointer-events-none"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, #7CFF3A 1px, transparent 1px), linear-gradient(to bottom, #7CFF3A 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              />

              {/* Subtle CLICMASTER Background Watermark */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 -rotate-12 text-3xl sm:text-4xl font-black tracking-widest text-[#7CFF3A]/[0.04] pointer-events-none">
                CLICMASTER
              </div>

              {/* Top Banner */}
              <div className="relative z-10 flex items-center justify-between pb-2.5 border-b border-[#7CFF3A]/45 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl overflow-hidden bg-[#0F1318] border border-[#7CFF3A]/70 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(124,255,58,0.25)]">
                    <img
                      src={OFFICIAL_ICON_GREEN}
                      alt="Emblema Oficial CLICMaster"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <div className="text-[9px] font-black tracking-[0.14em] uppercase text-[#7CFF3A]">
                      REPÚBLICA DE ROLEPLAY LATAM · CLICMASTER
                    </div>
                    <div className="text-xs font-extrabold text-white leading-tight">
                      DOCUMENTO NACIONAL DE IDENTIDAD
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 pl-2">
                  <span className="text-[8px] font-bold text-neutral-400 block uppercase tracking-wider">
                    N° REGISTRO
                  </span>
                  <span className="text-xs font-mono font-black text-[#7CFF3A]">{dniNumber}</span>
                </div>
              </div>

              {/* Card Body Grid */}
              <div className="relative z-10 grid grid-cols-12 gap-3.5 items-center">
                {/* Interactive Clickable Photo Frame + EMV Chip */}
                <div className="col-span-4 flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Haz clic para subir foto de tu avatar de Roblox"
                    className="group relative w-24 h-28 rounded-xl overflow-hidden border-2 border-[#7CFF3A] shadow-[0_0_18px_rgba(124,255,58,0.25)] bg-[#181C22] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#7CFF3A]"
                  >
                    <img
                      src={currentAvatar}
                      alt={characterName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    {/* Hover upload overlay */}
                    <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-1">
                      <Camera className="w-5 h-5 text-[#7CFF3A] mb-0.5" />
                      <span className="text-[8px] font-bold uppercase leading-tight text-center">
                        Subir Avatar
                      </span>
                    </div>
                    <div className="absolute bottom-0 inset-x-0 bg-[#0A0C10]/90 py-0.5 text-[7.5px] font-black tracking-wider text-center text-[#7CFF3A] border-t border-[#7CFF3A]/40">
                      AVATAR ROBLOX
                    </div>
                  </button>

                  {/* Gold EMV Chip + Verified Label */}
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="w-8 h-5 rounded bg-gradient-to-br from-yellow-300 via-amber-400 to-amber-600 border border-amber-700 flex items-center justify-center shadow-inner">
                      <div className="w-4 h-3 border border-amber-900/50 rounded-[2px]" />
                    </div>
                    <span className="text-[7px] font-black uppercase text-[#7CFF3A] tracking-wider flex items-center gap-0.5">
                      <ShieldCheck className="w-2.5 h-2.5" />
                      VERIF.
                    </span>
                  </div>
                </div>

                {/* Legal Details */}
                <div className="col-span-8 space-y-1 text-xs">
                  <div>
                    <span className="text-[8px] font-bold uppercase tracking-wider text-neutral-400 block leading-none">
                      Apellidos y Nombres
                    </span>
                    <span className="font-black text-sm text-white block truncate uppercase tracking-tight">
                      {characterName || 'CIUDADANO ANÓNIMO'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[8px] font-bold uppercase tracking-wider text-neutral-400 block leading-none">
                        Usuario Roblox
                      </span>
                      <span className="font-bold text-[#7CFF3A] truncate block text-[11px]">
                        @{robloxUser || 'UsuarioRP'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[8px] font-bold uppercase tracking-wider text-neutral-400 block leading-none">
                        Nacimiento
                      </span>
                      <span className="font-semibold text-neutral-100 text-[11px]">
                        {birthDate}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[8px] font-bold uppercase tracking-wider text-neutral-400 block leading-none">
                        Sexo / Sangre
                      </span>
                      <span className="font-semibold text-neutral-100 text-[11px]">
                        {gender} / {bloodType}
                      </span>
                    </div>
                    <div>
                      <span className="text-[8px] font-bold uppercase tracking-wider text-neutral-400 block leading-none">
                        Emisión
                      </span>
                      <span className="font-semibold text-neutral-100 text-[11px]">
                        {issueDate}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[8px] font-bold uppercase tracking-wider text-neutral-400 block leading-none">
                      Ocupación / Rango
                    </span>
                    <span className="font-semibold text-white truncate block text-[11px]">
                      {occupation}
                    </span>
                  </div>

                  <div>
                    <span className="text-[8px] font-bold uppercase tracking-wider text-neutral-400 block leading-none">
                      Domicilio Legal
                    </span>
                    <span className="font-medium text-neutral-300 truncate block text-[10px]">
                      {address}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Security Barcode & QR Code */}
              <div className="relative z-10 mt-3 pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[8px] font-mono font-bold text-[#7CFF3A]/90 block truncate">
                    {mrzString}
                  </span>
                  <span className="text-[7px] text-neutral-500 uppercase tracking-wider block">
                    PORTAL CLICMASTER ROLEPLAY · CREDENCIAL DIGITAL OFICIAL
                  </span>
                </div>
                <div className="p-1 rounded-md bg-white shrink-0">
                  <QrCode className="w-5 h-5 text-[#0B0D10]" />
                </div>
              </div>
            </div>

            {/* Download CTA */}
            <div className="w-full max-w-md mt-6 space-y-3">
              <button
                type="button"
                onClick={handleDownload}
                disabled={isDownloading}
                className="w-full py-3.5 px-6 rounded-2xl font-black text-sm bg-[#7CFF3A] hover:bg-[#66e629] disabled:opacity-70 text-[#121212] transition-all flex items-center justify-center gap-2 shadow-[0_8px_28px_rgba(124,255,58,0.3)] active:scale-[0.99]"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generando DNI en Alta Resolución...</span>
                  </>
                ) : downloadedFileName ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>¡Guardado en tu dispositivo ({downloadedFileName})!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Descargar DNI como Imagen (PNG)</span>
                  </>
                )}
              </button>

              {downloadError && (
                <p className="text-center text-xs font-semibold text-red-500">{downloadError}</p>
              )}

              <p className="text-center text-xs text-neutral-500 dark:text-neutral-400">
                Puedes hacer clic directo sobre la foto del DNI o arrastrar tu captura de avatar para actualizarla al instante.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
