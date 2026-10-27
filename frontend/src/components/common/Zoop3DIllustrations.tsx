'use client';

import React from 'react';

/**
 * Ilustración 3D de Caja de Regalo Sorpresa estilo Claymorphism / Zoop Store
 */
export function GiftBox3D({ className = "w-32 h-32", isOpen = false }: { className?: string; isOpen?: boolean }) {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_20px_25px_rgba(255,75,75,0.3)] transition-transform duration-500 ease-out"
      >
        <defs>
          {/* Degradados de la caja coral */}
          <linearGradient id="boxFront" x1="50" y1="90" x2="150" y2="175" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF6B5E" />
            <stop offset="0.6" stopColor="#FF4B4B" />
            <stop offset="1" stopColor="#D92222" />
          </linearGradient>
          <linearGradient id="boxLid" x1="40" y1="65" x2="160" y2="105" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFA194" />
            <stop offset="0.5" stopColor="#FF5A4D" />
            <stop offset="1" stopColor="#E62C2C" />
          </linearGradient>
          <linearGradient id="goldRibbon" x1="90" y1="50" x2="120" y2="180" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFF1B8" />
            <stop offset="0.4" stopColor="#FFD159" />
            <stop offset="1" stopColor="#E69E00" />
          </linearGradient>
          <linearGradient id="ribbonHorizontal" x1="40" y1="120" x2="160" y2="145" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFF1B8" />
            <stop offset="0.5" stopColor="#FFD159" />
            <stop offset="1" stopColor="#D99000" />
          </linearGradient>
          <radialGradient id="shadowFloor" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#27272A" stopOpacity="0.35" />
            <stop offset="70%" stopColor="#27272A" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#27272A" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Sombra de suelo */}
        <ellipse cx="100" cy="180" rx="70" ry="14" fill="url(#shadowFloor)" />

        {/* Cuerpo de la Caja */}
        <rect x="52" y="90" width="96" height="80" rx="14" fill="url(#boxFront)" />
        <path d="M52 100C52 94.4772 56.4772 90 62 90H138C143.523 90 148 94.4772 148 100V105H52V100Z" fill="#FFA194" fillOpacity="0.3" />

        {/* Cinta Vertical Frontal */}
        <rect x="90" y="90" width="20" height="80" fill="url(#goldRibbon)" />
        {/* Cinta Horizontal Frontal */}
        <rect x="52" y="122" width="96" height="16" fill="url(#ribbonHorizontal)" />

        {/* Tapa del regalo (se anima al abrir) */}
        <g className={`transition-all duration-700 origin-top ${isOpen ? '-translate-y-8 -rotate-12 opacity-85' : ''}`}>
          {/* Sombra proyectada por la tapa */}
          <rect x="44" y="91" width="112" height="6" rx="3" fill="#A81414" fillOpacity="0.4" />
          
          {/* Tapa principal */}
          <rect x="44" y="70" width="112" height="24" rx="8" fill="url(#boxLid)" />
          {/* Brillo superior en la tapa */}
          <path d="M48 74C48 72 50 71 52 71H148C150 71 152 72 152 74V76H48V74Z" fill="#FFFFFF" fillOpacity="0.5" />
          {/* Cinta Vertical en la Tapa */}
          <rect x="90" y="70" width="20" height="24" fill="url(#goldRibbon)" />

          {/* Moño / Lazo 3D Superior */}
          {/* Lazo izquierdo */}
          <ellipse cx="80" cy="58" rx="18" ry="12" transform="rotate(-30 80 58)" fill="url(#goldRibbon)" />
          <ellipse cx="80" cy="58" rx="10" ry="6" transform="rotate(-30 80 58)" fill="#D99000" />
          {/* Lazo derecho */}
          <ellipse cx="120" cy="58" rx="18" ry="12" transform="rotate(30 120 58)" fill="url(#goldRibbon)" />
          <ellipse cx="120" cy="58" rx="10" ry="6" transform="rotate(30 120 58)" fill="#D99000" />
          {/* Nudo central */}
          <circle cx="100" cy="62" r="8" fill="#FFF4C4" />
          <circle cx="100" cy="62" r="6" fill="#FFAE00" />
        </g>
      </svg>
    </div>
  );
}

/**
 * Cupón / Boleto 3D con estrella dorada estilo Zoop Store
 */
export function Coupon3D({ code = "NIDO-WELCOME-15", discount = "15% OFF", className = "w-full max-w-sm" }: { code?: string; discount?: string; className?: string }) {
  return (
    <div className={`relative ${className} select-none`}>
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zoop-500 via-coral-500 to-rose-600 p-6 text-white shadow-pill shadow-zoop-500/40">
        {/* Texturas de fondo sutiles */}
        <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-black/15 blur-lg pointer-events-none" />

        {/* Muescas laterales tipo boleto de concierto */}
        <div className="absolute top-1/2 -left-4 w-8 h-8 rounded-full bg-[#f4f4f5] transform -translate-y-1/2 shadow-inner" />
        <div className="absolute top-1/2 -right-4 w-8 h-8 rounded-full bg-[#f4f4f5] transform -translate-y-1/2 shadow-inner" />

        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-extrabold tracking-widest uppercase text-white">
              Bono Exclusivo de Regalo
            </span>
            <div className="text-3xl font-black tracking-tight">{discount}</div>
            <p className="text-xs text-rose-100 font-medium">Válido en tu próxima compra en Nido</p>
          </div>

          {/* Medalla Estrella 3D */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-600 p-1 flex items-center justify-center shadow-lg shadow-black/20 transform rotate-6 hover:rotate-12 transition-transform">
            <div className="w-full h-full rounded-xl bg-amber-400/90 flex items-center justify-center border border-yellow-100/50">
              <span className="text-2xl drop-shadow-md">⭐</span>
            </div>
          </div>
        </div>

        {/* Línea divisoria punteada */}
        <div className="my-4 border-t-2 border-dashed border-white/30" />

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-semibold text-rose-100 tracking-wider">Código de Descuento</span>
            <div className="font-mono font-bold text-sm tracking-widest bg-black/25 px-3 py-1 rounded-xl text-yellow-300 border border-white/15">
              {code}
            </div>
          </div>
          <span className="text-xs font-bold text-white bg-white/20 hover:bg-white/30 transition-colors px-3 py-1.5 rounded-full backdrop-blur-md">
            Listo para Usar ✓
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Mockup Realista de Tarjeta Bancaria VISA estilo Zoop Store
 */
export function VisaCardMockup({
  cardholder = "MATEO GÓMEZ",
  cardNumber = "•••• •••• •••• 0890",
  expiry = "08/28",
  isApproved = true,
}: {
  cardholder?: string;
  cardNumber?: string;
  expiry?: string;
  isApproved?: boolean;
}) {
  return (
    <div className="relative w-full max-w-sm mx-auto h-48 rounded-3xl p-6 text-white shadow-2xl transition-all duration-300 transform hover:scale-[1.02] select-none overflow-hidden bg-gradient-to-tr from-zinc-950 via-zinc-900 to-zinc-800 border border-zinc-700/60">
      {/* Reflejos metálicos */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent transform -skew-x-12 pointer-events-none" />
      <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-zoop-500/15 blur-2xl pointer-events-none" />

      {/* Cabecera Tarjeta */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          {/* Chip EMV Dorado */}
          <div className="w-10 h-7 rounded-md bg-gradient-to-br from-yellow-200 via-amber-400 to-yellow-600 p-[1px] shadow-sm">
            <div className="w-full h-full rounded-[5px] bg-amber-400/80 border border-yellow-100/40 grid grid-cols-2 gap-0.5 p-1">
              <div className="border-r border-b border-amber-600/40" />
              <div className="border-b border-amber-600/40" />
              <div className="border-r border-amber-600/40" />
              <div />
            </div>
          </div>
          {/* Icono Contactless */}
          <svg className="w-5 h-5 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8.5 16.5a5 5 0 0 1 0-7" strokeLinecap="round" />
            <path d="M12 19a8.5 8.5 0 0 0 0-14" strokeLinecap="round" />
            <path d="M15.5 21.5a12 12 0 0 0 0-19" strokeLinecap="round" />
          </svg>
        </div>

        {/* Logo VISA en Blanco */}
        <span className="text-xl font-black italic tracking-wider text-white drop-shadow">
          VISA
        </span>
      </div>

      {/* Número de Tarjeta */}
      <div className="mt-6 mb-3 relative z-10">
        <span className="font-mono text-lg sm:text-xl font-medium tracking-[0.22em] text-zinc-100 drop-shadow-sm">
          {cardNumber}
        </span>
      </div>

      {/* Pie de Tarjeta: Titular & Vencimiento */}
      <div className="flex items-end justify-between relative z-10 text-xs">
        <div className="space-y-0.5">
          <span className="text-[9px] font-bold tracking-widest text-zinc-400 uppercase">Titular</span>
          <div className="font-semibold tracking-wider text-zinc-200 uppercase">{cardholder}</div>
        </div>
        <div className="space-y-0.5 text-right">
          <span className="text-[9px] font-bold tracking-widest text-zinc-400 uppercase">Expira</span>
          <div className="font-mono font-medium text-zinc-200">{expiry}</div>
        </div>
      </div>
    </div>
  );
}

/**
 * Ilustración 3D de Cactus amigable / Estado de Error (inspirado en el 404 de Zoop Store)
 */
export function WarningCactus3D({ className = "w-24 h-24" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-lg">
        <defs>
          <linearGradient id="potGrad" x1="30" y1="70" x2="90" y2="110" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF6B5E" />
            <stop offset="1" stopColor="#D92222" />
          </linearGradient>
          <linearGradient id="cactusGrad" x1="45" y1="20" x2="75" y2="80" gradientUnits="userSpaceOnUse">
            <stop stopColor="#4ADE80" />
            <stop offset="1" stopColor="#15803D" />
          </linearGradient>
        </defs>

        {/* Maceta roja */}
        <path d="M36 74L42 108C42.5 110.5 44.5 112 47 112H73C75.5 112 77.5 110.5 78 108L84 74H36Z" fill="url(#potGrad)" />
        <rect x="32" y="68" width="56" height="8" rx="4" fill="#FFA194" />

        {/* Cruz / Vendita médica en la maceta */}
        <rect x="56" y="86" width="8" height="18" rx="2" fill="#FFFFFF" opacity="0.9" />
        <rect x="51" y="91" width="18" height="8" rx="2" fill="#FFFFFF" opacity="0.9" />

        {/* Tallo central cactus */}
        <rect x="50" y="24" width="20" height="48" rx="10" fill="url(#cactusGrad)" />

        {/* Brazo izquierdo */}
        <path d="M34 40V48C34 52.4 37.6 56 42 56H52V48H44C42.9 48 42 47.1 42 46V40H34Z" fill="url(#cactusGrad)" />
        {/* Brazo derecho */}
        <path d="M86 46V54C86 58.4 82.4 62 78 62H68V54H76C77.1 54 78 53.1 78 52V46H86Z" fill="url(#cactusGrad)" />

        {/* Ojos tristes / preocupados */}
        <circle cx="56" cy="40" r="2.5" fill="#14532D" />
        <circle cx="64" cy="40" r="2.5" fill="#14532D" />
        <ellipse cx="60" cy="46" rx="2.5" ry="1.5" fill="#14532D" />
      </svg>
    </div>
  );
}
