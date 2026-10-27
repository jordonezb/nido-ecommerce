'use client';

import React, { useState } from 'react';
import {
  Gift,
  RotateCcw,
  Columns,
  Radio,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import { useGiftApp } from '../../context/GiftAppContext';
import { ImpactMetricsBanner } from './ImpactMetricsBanner';

export function HeaderDemoBar() {
  const {
    viewMode,
    setViewMode,
    handleResetDemo,
    isResetting,
    isConnected,
    notificationCount,
  } = useGiftApp();

  const [showMetrics, setShowMetrics] = useState<boolean>(false);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-zinc-200/70 shadow-sm mb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Logo y Marca Zoop Store / Nido Live Gift */}
          <div className="flex items-center justify-between w-full md:w-auto gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-zoop-600 via-zoop-500 to-coral-400 flex items-center justify-center text-white shadow-pill shadow-zoop-500/30">
                <Gift className="w-5 h-5 animate-wiggle-soft" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black tracking-tight text-zinc-900 leading-tight">
                    NIDO <span className="text-zoop-500 font-extrabold">Live Gift</span>
                  </h1>
                  <span className="text-[10px] font-black uppercase tracking-widest bg-zoop-50 text-zoop-600 border border-zoop-200/60 px-2.5 py-0.5 rounded-full">
                    NIDO LIVE EDITION
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 font-medium hidden sm:block">
                  Cápsula Anti-Devoluciones & Experiencia Sincrónica
                </p>
              </div>
            </div>

            {/* Estado WebSocket en móvil */}
            <div className="flex items-center gap-2 md:hidden">
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${
                  isConnected
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-emerald-500 animate-ping' : 'bg-zinc-400'
                  }`}
                />
                <span>{isConnected ? 'En Vivo' : 'Desconectado'}</span>
              </div>
            </div>
          </div>

          {/* Selector de Vistas y Conmutador de Roles en Píldora */}
          <div className="flex items-center flex-wrap justify-center gap-2.5 w-full md:w-auto">
            {/* Conmutador de Rol (Mateo vs Valentina) */}
            <div className="inline-flex bg-zinc-100/90 p-1 rounded-full border border-zinc-200/80 shadow-inner">
              <button
                type="button"
                onClick={() => setViewMode('giver')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black transition-all ${
                  viewMode === 'giver'
                    ? 'bg-zoop-500 text-white shadow-pill'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${viewMode === 'giver' ? 'bg-white' : 'bg-zoop-500'}`} />
                Mateo (Regala)
              </button>

              <button
                type="button"
                onClick={() => setViewMode('receiver')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black transition-all relative ${
                  viewMode === 'receiver'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${viewMode === 'receiver' ? 'bg-white' : 'bg-purple-500'}`} />
                Valentina (Recibe)
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-zoop-500 text-[9px] font-black text-white animate-bounce">
                    {notificationCount}
                  </span>
                )}
              </button>
            </div>

            {/* Toggle de Vista Simultánea */}
            <div className="hidden lg:block">
              <button
                type="button"
                onClick={() =>
                  setViewMode(viewMode === 'simultaneous' ? 'giver' : 'simultaneous')
                }
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black border transition-all ${
                  viewMode === 'simultaneous'
                    ? 'bg-zinc-900 text-white border-zinc-900 shadow-md'
                    : 'bg-white text-zinc-700 border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50'
                }`}
                title="Muestra 2 smartphones lado a lado para evaluar interacción sincrónica"
              >
                <Columns className="w-3.5 h-3.5 text-zoop-400" />
                <span>Vista Simultánea (2 Móviles)</span>
              </button>
            </div>

            {/* Indicador WebSocket en Desktop */}
            <div className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-full bg-zinc-50 border border-zinc-200 text-xs font-bold text-zinc-700">
              <Radio
                className={`w-3.5 h-3.5 ${
                  isConnected ? 'text-emerald-500 animate-pulse' : 'text-zinc-400'
                }`}
              />
              <span>
                {isConnected ? 'Socket.io Conectado' : 'Conectando Socket...'}
              </span>
            </div>

            {/* Botón Reiniciar Demo */}
            <button
              type="button"
              onClick={handleResetDemo}
              disabled={isResetting}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-50 hover:border-zinc-400 active:scale-95 transition-all disabled:opacity-50 shadow-sm"
              title="Limpia compras y recarga el regalo demo inicial"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              <span>{isResetting ? 'Reiniciando...' : 'Reiniciar Demo'}</span>
            </button>

            {/* Toggle Banner de Métricas */}
            <button
              type="button"
              onClick={() => setShowMetrics((prev) => !prev)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold text-zoop-700 bg-zoop-50 border border-zoop-200 hover:bg-zoop-100 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-zoop-500" />
              <span className="hidden sm:inline">Métricas Nido</span>
              {showMetrics ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Desplegable de Métricas */}
        {showMetrics && (
          <div className="mt-4 pt-3 border-t border-zinc-200 animate-slide-up">
            <ImpactMetricsBanner />
          </div>
        )}
      </div>
    </header>
  );
}
