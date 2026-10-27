'use client';

import React from 'react';
import {
  TrendingUp,
  RotateCcw,
  Users2,
  Ticket,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export function ImpactMetricsBanner() {
  return (
    <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 text-white p-4 sm:p-5 rounded-2xl shadow-lg shadow-orange-500/20 mb-6 border border-orange-400/30">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/20">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-amber-200" />
          </div>
          <h3 className="text-sm font-bold tracking-tight">
            Impacto en Métricas de Negocio Nido Colombia (Enfoque SDD)
          </h3>
        </div>
        <span className="text-[11px] font-semibold bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full text-white">
          Arquitectura Orientada a Resultados
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
        {/* Métrica 1: Devoluciones 22% -> 0% */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15">
          <div className="flex items-center justify-between text-xs font-medium text-orange-100">
            <span>Tasa de Devoluciones</span>
            <RotateCcw className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-white">22% ➔ 0%</span>
            <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/40 px-1.5 py-0.5 rounded">
              -100% flete inverso
            </span>
          </div>
          <p className="text-[11px] text-white/90 mt-1 leading-snug">
            Cápsula Anti-Devolución: Valentina confirma talla o intercambia producto antes del despacho físico.
          </p>
        </div>

        {/* Métrica 2: Ticket promedio $95.000 COP */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15">
          <div className="flex items-center justify-between text-xs font-medium text-orange-100">
            <span>Ticket Promedio</span>
            <Users2 className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-white">$95.000 COP</span>
            <span className="text-[10px] font-bold text-amber-200 bg-amber-950/40 px-1.5 py-0.5 rounded">
              +40% con La Vaca
            </span>
          </div>
          <p className="text-[11px] text-white/90 mt-1 leading-snug">
            Co-Regalo Grupal: Múltiples amigos aportan al regalo, eliminando el límite de presupuesto individual.
          </p>
        </div>

        {/* Métrica 3: Recompra 18% + Cupón */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15">
          <div className="flex items-center justify-between text-xs font-medium text-orange-100">
            <span>Recompra 90 Días</span>
            <Ticket className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-white">18% ➔ +32%</span>
            <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/40 px-1.5 py-0.5 rounded">
              Bucle Viral
            </span>
          </div>
          <p className="text-[11px] text-white/90 mt-1 leading-snug">
            Cupón de Reciprocidad NIDO-CONEXION-15 desbloqueado tras la reacción para regalar con 15% OFF.
          </p>
        </div>
      </div>
    </div>
  );
}
