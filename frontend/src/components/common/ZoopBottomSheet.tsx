'use client';

import React from 'react';
import { X } from 'lucide-react';
import { WarningCactus3D } from './Zoop3DIllustrations';

interface ZoopBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  badge?: string;
}

export function ZoopBottomSheet({
  isOpen,
  onClose,
  title,
  message,
  primaryActionLabel = "Entendido / Reintentar",
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction,
  badge = "Aviso de Transacción",
}: ZoopBottomSheetProps) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs transition-opacity duration-300"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full bg-white rounded-t-[2.2rem] shadow-2xl p-5 pt-3 border-t border-zinc-100 animate-slide-up relative"
      >
        {/* Manija de arrastre (Drag Handle) */}
        <div className="w-10 h-1.5 rounded-full bg-zinc-300 mx-auto mb-2" />

        {/* Botón de Cierre */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-4 w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-500 transition-colors"
          aria-label="Cerrar modal"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Ilustración 3D de advertencia */}
        <div className="flex flex-col items-center text-center">
          <WarningCactus3D className="w-14 h-14 mb-1.5" />

          {badge && (
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-rose-50 text-zoop-600 font-extrabold text-[10px] uppercase tracking-wider mb-1.5">
              {badge}
            </span>
          )}

          <h3 className="text-base font-black text-zinc-900 tracking-tight mb-1">
            {title}
          </h3>

          <p className="text-xs text-zinc-500 max-w-[280px] leading-relaxed mb-4">
            {message}
          </p>

          {/* Botones de Acción estilo Pill */}
          <div className="w-full space-y-2">
            <button
              onClick={() => {
                if (onPrimaryAction) onPrimaryAction();
                onClose();
              }}
              className="w-full py-3 px-4 rounded-full bg-zoop-500 hover:bg-zoop-600 text-white font-extrabold text-xs shadow-pill transition-all active:scale-95"
            >
              {primaryActionLabel}
            </button>

            {secondaryActionLabel && (
              <button
                onClick={() => {
                  if (onSecondaryAction) onSecondaryAction();
                  onClose();
                }}
                className="w-full py-2 px-4 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold text-xs transition-all active:scale-95"
              >
                {secondaryActionLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
