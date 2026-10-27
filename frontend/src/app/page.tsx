'use client';

import React from 'react';
import { GiftAppProvider, useGiftApp } from '../context/GiftAppContext';
import { HeaderDemoBar } from '../components/common/HeaderDemoBar';
import { PhoneFrame } from '../components/common/PhoneFrame';
import { GiverView } from '../components/giver/GiverView';
import { ReceiverView } from '../components/receiver/ReceiverView';
import { ArrowLeftRight, Radio, Sparkles, ShieldCheck } from 'lucide-react';

function MainAppContent() {
  const { viewMode, giverUser, receiverUser, isLoading } = useGiftApp();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-100 p-4">
        <div className="w-12 h-12 rounded-2xl bg-orange-500 animate-bounce flex items-center justify-center text-white shadow-xl shadow-orange-500/30">
          <Sparkles className="w-6 h-6 animate-spin" />
        </div>
        <p className="text-xs font-bold text-zinc-600 mt-4 tracking-wider uppercase">
          Cargando Experiencia Nido Live Gift...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-[#F5F6F8] via-[#FAFAFC] to-[#EFF0F3] text-zinc-900">
      {/* Barra Superior con Selector de Roles & Métricas */}
      <HeaderDemoBar />

      {/* Contenedor Principal de Visualización */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 w-full py-2">
        {/* MODO VISTA SIMULTÁNEA: 2 Smartphones Lado a Lado (Desktop) */}
        {viewMode === 'simultaneous' ? (
          <div className="space-y-4">
            {/* Banner de Sincronización en Vivo */}
            <div className="hidden lg:flex items-center justify-center gap-3 bg-zinc-900 text-white py-2.5 px-6 rounded-full text-xs font-semibold shadow-xl border border-zinc-700/50 max-w-2xl mx-auto backdrop-blur-md">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-bold text-zinc-100">Sincronización WebSockets en Tiempo Real</span>
              <ArrowLeftRight className="w-4 h-4 text-zoop-400" />
              <span className="text-zinc-300 font-normal">
                Interactúa en Mateo (izquierda) y observa el reflejo inmediato en Valentina (derecha)
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start justify-center max-w-5xl mx-auto">
              {/* Smartphone Mateo (Quien Regala) */}
              <PhoneFrame
                user={giverUser}
                roleBadge="Usuario A • Mateo Gómez (Quien Regala)"
                roleColor="orange"
              >
                <GiverView />
              </PhoneFrame>

              {/* Smartphone Valentina (Quien Recibe) */}
              <PhoneFrame
                user={receiverUser}
                roleBadge="Usuario B • Valentina Ríos (Quien Recibe)"
                roleColor="purple"
              >
                <ReceiverView />
              </PhoneFrame>
            </div>
          </div>
        ) : (
          /* MODO INDIVIDUAL: Móvil Único Seleccionado (Mateo o Valentina) */
          <div className="py-2">
            {viewMode === 'giver' ? (
              <PhoneFrame
                user={giverUser}
                roleBadge="Usuario A • Mateo Gómez (Quien Regala)"
                roleColor="orange"
              >
                <GiverView />
              </PhoneFrame>
            ) : (
              <PhoneFrame
                user={receiverUser}
                roleBadge="Usuario B • Valentina Ríos (Quien Recibe)"
                roleColor="purple"
              >
                <ReceiverView />
              </PhoneFrame>
            )}
          </div>
        )}
      </main>

      {/* Footer Discreto */}
      <footer className="mt-8 py-4 border-t border-zinc-200/80 bg-white/50 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Nido Live Gift & Cápsula Anti-Devoluciones • Prueba Técnica TANKU (SDD)
          </span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-zinc-600 font-medium">
              <Radio className="w-3.5 h-3.5 text-emerald-500" /> WebSockets Activos
            </span>
            <span className="flex items-center gap-1.5 text-zinc-600 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-orange-500" /> Next.js 14 App Router
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function HomePage() {
  return (
    <GiftAppProvider>
      <MainAppContent />
    </GiftAppProvider>
  );
}
