'use client';

import React from 'react';
import { Wifi, Battery, Signal, Bell } from 'lucide-react';
import { User } from '../../types';

interface PhoneFrameProps {
  user: User | null;
  roleBadge: string;
  roleColor: 'orange' | 'purple';
  children: React.ReactNode;
}

export function PhoneFrame({
  user,
  roleBadge,
  roleColor,
  children,
}: PhoneFrameProps) {
  const isOrange = roleColor === 'orange';
  const accentColor = isOrange ? 'zoop-500' : 'purple-600';

  return (
    <div className="flex flex-col items-center w-full max-w-[420px] mx-auto select-none transition-all duration-300">
      {/* Badge Superior de Rol & Usuario */}
      <div className="flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-white/90 shadow-sm border border-zinc-200/80 backdrop-blur-md">
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            isOrange ? 'bg-zoop-500 ring-4 ring-rose-100' : 'bg-purple-600 ring-4 ring-purple-100'
          }`}
        />
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-800">
          {roleBadge}
        </span>
      </div>

      {/* Chasis Exterior Estilo iPhone Pro (Titanio / Grafito) con Altura Fija Idéntica */}
      <div className="relative w-full h-[780px] rounded-[50px] p-3 sm:p-3.5 bg-gradient-to-b from-zinc-800 via-zinc-900 to-black shadow-phone border-[3px] border-zinc-700/70 ring-1 ring-white/10 flex flex-col">
        {/* Botones Físicos Laterales (Volumen / Botón de Acción) */}
        <div className="absolute -left-[5px] top-24 w-[3px] h-8 bg-zinc-600 rounded-l-sm" />
        <div className="absolute -left-[5px] top-36 w-[3px] h-11 bg-zinc-600 rounded-l-sm" />
        <div className="absolute -left-[5px] top-50 w-[3px] h-11 bg-zinc-600 rounded-l-sm" />
        <div className="absolute -right-[5px] top-32 w-[3px] h-16 bg-zinc-600 rounded-r-sm" />

        {/* Dynamic Island Interactiva Superior */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-30 flex items-center justify-between px-3.5 shadow-md">
          {/* Lente Sensor */}
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-950 ring-1 ring-zinc-800/80 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-blue-950/80" />
          </div>
          {/* Micro Indicador de Enlace en Vivo (Luz Verde) */}
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>

        {/* Pantalla Interna Super Retina con Altura Completa */}
        <div className="relative bg-[#FAFAFC] rounded-[40px] overflow-hidden h-full flex flex-col border border-zinc-200/90 shadow-inner [transform:translateZ(0)]">
          {/* Barra de Estado del Sistema */}
          <div className="flex items-center justify-between px-7 pt-3.5 pb-2 text-[11px] font-bold text-zinc-900 select-none z-20 bg-[#FAFAFC]/95 backdrop-blur-md">
            <span>9:41</span>
            <div className="flex items-center gap-2 text-zinc-800">
              <Signal className="w-3.5 h-3.5" />
              <Wifi className="w-3.5 h-3.5" />
              <Battery className="w-4 h-4 fill-zinc-900" />
            </div>
          </div>

          {/* Barra Superior de la Aplicación Nido Store */}
          <div className="flex items-center justify-between px-4 py-2 bg-white/80 border-b border-zinc-100 backdrop-blur-md z-10">
            <div className="flex items-center gap-2.5">
              <div
                className={`relative w-9 h-9 rounded-full overflow-hidden ring-2 ${
                  isOrange ? 'ring-zoop-500/50' : 'ring-purple-600/50'
                } shadow-sm`}
              >
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                  alt={user?.name || 'Usuario'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-xs font-black text-zinc-900 leading-tight">
                  {user?.name || (isOrange ? 'Mateo Gómez' : 'Valentina Ríos')}
                </p>
                <p className="text-[10px] text-zinc-400 font-medium">
                  {isOrange ? 'Quien Regala (Giver)' : 'Quien Recibe (Receiver)'}
                </p>
              </div>
            </div>

            {/* Logo de Tienda e Icono Notificación */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black tracking-tight text-zinc-900">
                Nido <span className="text-zoop-500 font-black">Store</span>
              </span>
              <div className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 relative" title="Notificaciones Nido Store">
                <Bell className="w-3.5 h-3.5" />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-zoop-500" />
              </div>
            </div>
          </div>

          {/* Contenido Dinámico de la Pantalla */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 scrollbar-none relative">
            {children}
          </div>

          {/* Barra Inferior del Sistema (Home Indicator) */}
          <div className="pt-2 pb-1.5 flex justify-center bg-white/90 border-t border-zinc-100 backdrop-blur-md">
            <div className="w-32 h-1 bg-zinc-300 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
