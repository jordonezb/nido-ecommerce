'use client';

import React, { useState, useEffect } from 'react';
import {
  Gift,
  Lock,
  Sparkles,
  Heart,
  CheckCircle2,
  Package,
  RotateCw,
  Tag,
  Copy,
  ArrowRight,
  Smile,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Check,
  ShoppingBag,
} from 'lucide-react';
import { useGiftApp } from '../../context/GiftAppContext';
import { Product, ProductVariant } from '../../types';
import { updateGiftLiveStatus, claimGift } from '../../services/api';
import { triggerCelebrationConfetti } from '../../lib/confetti';
import { GiftBox3D, Coupon3D } from '../common/Zoop3DIllustrations';

const EMOJI_OPTIONS = [
  { emoji: '😍', label: '¡Me enamoré!' },
  { emoji: '🥰', label: '¡Llorando de emoción!' },
  { emoji: '🔥', label: '¡Increíble!' },
  { emoji: '🙌', label: '¡Mil gracias!' },
];

export function ReceiverView() {
  const {
    activeGift,
    giverUser,
    refreshActiveGift,
    updateActiveGiftOptimistic,
    triggerValentinaNotification,
  } = useGiftApp();

  const [isUnboxing, setIsUnboxing] = useState<boolean>(false);
  const [hasStartedUnboxing, setHasStartedUnboxing] = useState<boolean>(false);

  // Selección de producto final: o el principal o una alternativa de la cápsula
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [showCapsuleOptions, setShowCapsuleOptions] = useState<boolean>(false);

  // Reacción
  const [selectedEmoji, setSelectedEmoji] = useState<string>('😍');
  const [thankYouMessage, setThankYouMessage] = useState<string>('¡Mateo, me encantó este detalle!');
  const [isClaiming, setIsClaiming] = useState<boolean>(false);
  const [copiedCoupon, setCopiedCoupon] = useState<boolean>(false);

  // Inicializar producto y variante según el regalo activo
  useEffect(() => {
    if (activeGift?.mainProduct) {
      if (activeGift.status === 'CLAIMED_OR_SWAPPED' && activeGift.selectedProduct) {
        setSelectedProduct(activeGift.selectedProduct);
        setSelectedVariant(activeGift.selectedVariant || '');
        setHasStartedUnboxing(true);
      } else if (!selectedProduct || selectedProduct.id !== activeGift.mainProduct.id) {
        setSelectedProduct(activeGift.mainProduct);
        if (activeGift.selectedVariant) {
          setSelectedVariant(activeGift.selectedVariant);
        } else if (activeGift.mainProduct.variantsJson?.length > 0) {
          setSelectedVariant(activeGift.mainProduct.variantsJson[0].name);
        }
      }
    }

    if (activeGift?.status === 'UNBOXING_LIVE') {
      setHasStartedUnboxing(true);
    }
  }, [activeGift]);

  // Acción: Iniciar Unboxing en Vivo
  const handleStartUnboxing = async () => {
    if (!activeGift?.id) return;
    try {
      setIsUnboxing(true);
      triggerCelebrationConfetti();

      await updateGiftLiveStatus(activeGift.id, {
        status: 'UNBOXING_LIVE',
        action: 'OPENED_BOX',
        message: 'Valentina está abriendo la cápsula de regalo',
      });

      updateActiveGiftOptimistic({ status: 'UNBOXING_LIVE' });
      setHasStartedUnboxing(true);
    } catch (error) {
      console.error('Error al iniciar unboxing:', error);
    } finally {
      setIsUnboxing(false);
    }
  };

  // Cambiar producto elegido (intercambio silencioso de la cápsula)
  const handleSelectCapsuleAlternative = (product: Product) => {
    setSelectedProduct(product);
    if (product.variantsJson?.length > 0) {
      setSelectedVariant(product.variantsJson[0].name);
    }
  };

  // Reclamar / Confirmar Regalo
  const handleClaim = async () => {
    if (!activeGift?.id || !selectedProduct) return;
    try {
      setIsClaiming(true);
      const fullReaction = `${selectedEmoji} ${thankYouMessage}`;

      const updated = await claimGift(activeGift.id, {
        selectedProductId: selectedProduct.id,
        selectedVariant: selectedVariant || 'Estándar',
        reaction: fullReaction,
      });

      triggerCelebrationConfetti();
      triggerValentinaNotification({
        giftOrderId: activeGift.id,
        reaction: fullReaction,
        selectedProductId: selectedProduct.id,
        selectedVariant: selectedVariant || 'Estándar',
        unlockedCouponCode: updated.unlockedCouponCode || 'NIDO-CONEXION-15',
        completedAt: new Date().toISOString(),
      });
      updateActiveGiftOptimistic(updated);
      await refreshActiveGift();
    } catch (error) {
      console.error('Error al reclamar regalo:', error);
    } finally {
      setIsClaiming(false);
    }
  };

  const handleCopyCoupon = (code: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCoupon(true);
      setTimeout(() => setCopiedCoupon(false), 2000);
    }
  };

  // =========================================================================
  // ESTADO 1: ESPERA / VALIDACIÓN DE FONDOS
  // =========================================================================
  if (
    !activeGift ||
    activeGift.status === 'PAYMENT_PENDING' ||
    activeGift.status === 'COLLECTING_FUNDS' ||
    activeGift.status === 'PAYMENT_REJECTED'
  ) {
    const isRejected = activeGift?.status === 'PAYMENT_REJECTED';
    const isVaca = activeGift?.isGroupGift;

    return (
      <div className="space-y-5 text-center py-6 px-2 animate-slide-up">
        {/* Caja de Regalo 3D con candado */}
        <div className="relative mx-auto w-36 h-36 flex items-center justify-center">
          <GiftBox3D className="w-36 h-36 animate-float-slow" isOpen={false} />
          <div className="absolute top-2 right-2 w-9 h-9 rounded-full bg-zinc-900/80 backdrop-blur-md text-white flex items-center justify-center shadow-lg border border-white/20">
            <Lock className="w-4 h-4 text-rose-300" />
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="text-[10px] font-black uppercase tracking-widest text-zoop-600 bg-zoop-50 border border-zoop-200/60 px-3 py-0.5 rounded-full">
            Sorpresa en Preparación
          </span>
          <h3 className="text-base font-black text-zinc-900 tracking-tight">
            {giverUser?.name || 'Mateo'} te está preparando una sorpresa en Nido
          </h3>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
            {isRejected
              ? 'El remitente está actualizando los detalles del envío. Tu sorpresa se habilitará en breve.'
              : isVaca
              ? 'Tus amigos están completando los fondos de La Vaca para tu regalo especial.'
              : 'Estamos validando los últimos detalles de seguridad con la pasarela bancaria.'}
          </p>
        </div>

        {/* Pista Secreta */}
        {activeGift?.secretHint && (
          <div className="bg-gradient-to-r from-zoop-50 to-amber-50 border border-zoop-200/70 rounded-3xl p-4 text-left shadow-card">
            <div className="flex items-center gap-1.5 text-xs font-black text-zoop-700 uppercase tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-zoop-500" />
              <span>Pista Secreta de tu Regalo</span>
            </div>
            <p className="text-xs text-zinc-700 italic mt-2 font-medium leading-relaxed bg-white/70 p-2.5 rounded-2xl border border-white">
              &quot;{activeGift.secretHint}&quot;
            </p>
          </div>
        )}

        {/* Barra de Progreso si es Vaca */}
        {isVaca && (
          <div className="bg-white p-3.5 rounded-3xl text-left border border-zinc-200/80 shadow-xs">
            <div className="flex justify-between text-xs font-bold mb-1.5 text-zinc-700">
              <span>Recaudación de La Vaca</span>
              <span className="font-black text-zoop-600">
                {Math.round((activeGift.paidAmountCop / activeGift.totalAmountCop) * 100)}%
              </span>
            </div>
            <div className="w-full h-2.5 bg-zinc-100 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-zoop-500 to-amber-400 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(
                    100,
                    Math.round((activeGift.paidAmountCop / activeGift.totalAmountCop) * 100),
                  )}%`,
                }}
              />
            </div>
          </div>
        )}

        <div className="text-[11px] text-zinc-400 font-medium flex items-center justify-center gap-1.5 pt-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Sincronización en vivo activa vía WebSockets.</span>
        </div>
      </div>
    );
  }

  // =========================================================================
  // ESTADO 2: LISTO PARA UNBOXING (BOTÓN INICIAL)
  // =========================================================================
  if (activeGift.status === 'READY_TO_UNBOX' && !hasStartedUnboxing) {
    return (
      <div className="space-y-5 text-center py-6 px-2 animate-slide-up">
        {/* Caja de Regalo 3D con Brillo */}
        <div className="relative mx-auto w-40 h-40 flex items-center justify-center">
          <GiftBox3D className="w-40 h-40 animate-wiggle-soft" isOpen={false} />
        </div>

        <div className="space-y-1.5">
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
            ¡Pago Aprobado y Confirmado!
          </span>
          <h3 className="text-xl font-black text-zinc-900 tracking-tight">
            ¡Tienes un regalo esperándote!
          </h3>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
            {giverUser?.name || 'Mateo'} preparó una <strong>Cápsula Anti-Devoluciones</strong> pensada especialmente en ti.
          </p>
        </div>

        {/* Pista Secreta */}
        {activeGift.secretHint && (
          <div className="bg-white border border-zinc-200/80 rounded-3xl p-4 text-left shadow-card">
            <div className="flex items-center gap-1.5 text-xs font-black text-zoop-600 uppercase tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-zoop-500" />
              <span>Pista Secreta</span>
            </div>
            <p className="text-xs text-zinc-700 italic mt-2 leading-relaxed bg-zinc-50 p-2.5 rounded-2xl">
              &quot;{activeGift.secretHint}&quot;
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={handleStartUnboxing}
          disabled={isUnboxing}
          className="w-full py-4 rounded-full bg-zoop-500 hover:bg-zoop-600 text-white font-black text-sm shadow-pill hover:shadow-card-hover active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Gift className="w-5 h-5" />
          <span>{isUnboxing ? 'Abriendo Cápsula...' : '🎁 Iniciar Unboxing en Vivo'}</span>
        </button>

        <p className="text-[10px] text-zinc-400 font-medium">
          * Al hacer clic, Mateo verá en vivo cómo abres su sorpresa en tiempo real.
        </p>
      </div>
    );
  }

  // =========================================================================
  // ESTADO 3 & 4: CAJA ABIERTA, CONFIRMACIÓN/INTERCAMBIO Y REACCIÓN
  // =========================================================================
  const isClaimed = activeGift.status === 'CLAIMED_OR_SWAPPED';
  const mainProduct = activeGift.mainProduct;
  const capsuleOptions = activeGift.capsuleProducts || [];

  return (
    <div className="space-y-4 pb-36 animate-slide-up">
      {/* Caja 3D Abierta como indicador visual superior */}
      <div className="flex items-center justify-center py-1">
        <GiftBox3D className="w-24 h-24" isOpen={true} />
      </div>

      {/* Dedicatoria Emocional */}
      {activeGift.dedication && (
        <div className="bg-gradient-to-br from-zoop-50 via-rose-50 to-amber-50 border border-zoop-200/80 rounded-3xl p-4 shadow-card">
          <div className="flex items-center gap-1.5 text-xs font-black text-zoop-700 uppercase tracking-wide mb-1.5">
            <Heart className="w-3.5 h-3.5 text-zoop-500 fill-zoop-500" />
            <span>Dedicatoria de {giverUser?.name || 'Mateo'}:</span>
          </div>
          <p className="text-xs text-zinc-700 italic leading-relaxed bg-white/80 p-3 rounded-2xl border border-white">
            &quot;{activeGift.dedication}&quot;
          </p>
        </div>
      )}

      {/* Tarjeta del Producto Seleccionado Actualmente */}
      {selectedProduct && (
        <div className="bg-white rounded-3xl border-2 border-zoop-500/40 p-4 shadow-card space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-zoop-600 bg-zoop-50 px-3 py-1 rounded-full border border-zoop-200/60">
              {selectedProduct.id === mainProduct?.id
                ? 'Regalo Elegido por Mateo'
                : 'Opción Canjeada de la Cápsula'}
            </span>
            <div className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Cero Devolución</span>
            </div>
          </div>

          <div className="flex gap-3.5 items-center">
            <img
              src={selectedProduct.image}
              alt={selectedProduct.title}
              className="w-20 h-20 rounded-2xl object-cover shrink-0 shadow-sm border border-zinc-100"
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-black text-zinc-900 leading-snug">
                {selectedProduct.title}
              </h4>
              <p className="text-[11px] text-zinc-400 font-semibold">{selectedProduct.brand}</p>
              <p className="text-[11px] text-zinc-600 line-clamp-2 mt-1">
                {selectedProduct.description}
              </p>
            </div>
          </div>

          {/* Selector de Variante (Talla / Color) */}
          {!isClaimed && selectedProduct.variantsJson?.length > 0 && (
            <div className="pt-2.5 border-t border-zinc-100">
              <label className="text-[10px] font-extrabold text-zinc-400 uppercase block mb-1.5">
                Confirma tu talla o variante exacta:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {selectedProduct.variantsJson.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariant(v.name)}
                    className={`text-[11px] px-3.5 py-1.5 rounded-full border font-black transition-all ${
                      selectedVariant === v.name
                        ? 'border-zoop-500 bg-zoop-50 text-zoop-600 shadow-xs'
                        : 'border-zinc-200 text-zinc-600 bg-zinc-50 hover:bg-zinc-100'
                    }`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Innovación Anti-Devoluciones: Carrusel Horizontal de Alternativas */}
      {!isClaimed && capsuleOptions.length > 0 && (
        <div className="bg-white rounded-3xl border border-zinc-200/80 p-4 shadow-card space-y-3">
          <button
            type="button"
            onClick={() => setShowCapsuleOptions((prev) => !prev)}
            className="w-full flex items-center justify-between text-xs font-black text-zinc-800"
          >
            <div className="flex items-center gap-2">
              <RotateCw className="w-4 h-4 text-zoop-500" />
              <span>¿Prefieres otra opción de tu Cápsula Sorpresa?</span>
            </div>
            {showCapsuleOptions ? (
              <ChevronUp className="w-4 h-4 text-zinc-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-400" />
            )}
          </button>

          {showCapsuleOptions && (
            <div className="space-y-2.5 pt-2 border-t border-zinc-100">
              <p className="text-[11px] text-zinc-500 leading-snug">
                Mateo pre-aprobó estas opciones para ti. Puedes cambiarte a cualquiera sin costo adicional ni trámites de devolución:
              </p>

              {/* Opción para volver al principal si se había cambiado */}
              {mainProduct && selectedProduct?.id !== mainProduct.id && (
                <div
                  onClick={() => handleSelectCapsuleAlternative(mainProduct)}
                  className="cursor-pointer bg-zinc-50 p-2.5 rounded-2xl border border-zinc-200 hover:border-zoop-400 flex items-center gap-3 transition-all"
                >
                  <img
                    src={mainProduct.image}
                    alt={mainProduct.title}
                    className="w-11 h-11 rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-black text-zinc-900 truncate">
                      {mainProduct.title} (Original de Mateo)
                    </p>
                    <p className="text-[10px] text-zinc-400">{mainProduct.brand}</p>
                  </div>
                  <span className="text-[10px] font-extrabold text-zoop-600 bg-zoop-50 px-2.5 py-1 rounded-full border border-zoop-200/60">
                    Volver
                  </span>
                </div>
              )}

              {/* Carrusel de Alternativas */}
              <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                {capsuleOptions.map((alt) => {
                  const isCurrent = selectedProduct?.id === alt.id;
                  return (
                    <div
                      key={alt.id}
                      onClick={() => handleSelectCapsuleAlternative(alt)}
                      className={`min-w-[190px] cursor-pointer bg-zinc-50 p-3 rounded-2xl border flex flex-col justify-between transition-all ${
                        isCurrent
                          ? 'border-zoop-500 bg-zoop-50/40 ring-2 ring-zoop-500/20 shadow-sm'
                          : 'border-zinc-200/80 hover:border-zinc-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <img
                          src={alt.image}
                          alt={alt.title}
                          className="w-10 h-10 rounded-xl object-cover shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-black text-zinc-900 truncate">
                            {alt.title}
                          </p>
                          <p className="text-[9px] text-zinc-400 truncate">{alt.brand}</p>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        {isCurrent ? (
                          <span className="text-[9px] font-black text-zoop-600 bg-zoop-100 px-2 py-0.5 rounded-full">
                            Elegido ✓
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold text-zinc-600 bg-white px-2 py-0.5 rounded-full border border-zinc-200 shadow-xs">
                            Cambiar
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* PASO 4: REACCIÓN EN TIEMPO REAL & MOTOR DE RECOMPRA                       */}
      {/* ========================================================================= */}
      {!isClaimed ? (
        <div className="bg-white rounded-3xl border border-zinc-200/80 p-4 shadow-card space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-zinc-900">
            Envía tu Reacción a Mateo
          </h4>

          {/* Emojis Rápidos Zoop Store */}
          <div className="grid grid-cols-4 gap-2">
            {EMOJI_OPTIONS.map((item) => (
              <button
                key={item.emoji}
                type="button"
                onClick={() => setSelectedEmoji(item.emoji)}
                className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all ${
                  selectedEmoji === item.emoji
                    ? 'border-zoop-500 bg-zoop-50 scale-105 shadow-pill text-zoop-600'
                    : 'border-zinc-200/80 bg-zinc-50 hover:bg-zinc-100 text-zinc-600'
                }`}
              >
                <span className="text-2xl">{item.emoji}</span>
                <span className="text-[9px] font-bold mt-1 text-center truncate w-full">
                  {item.label}
                </span>
              </button>
            ))}
          </div>

          {/* Mensaje de agradecimiento */}
          <div>
            <input
              type="text"
              value={thankYouMessage}
              onChange={(e) => setThankYouMessage(e.target.value)}
              placeholder="Escribe unas palabras para Mateo..."
              className="w-full text-xs p-3 rounded-2xl border border-zinc-200 bg-zinc-50 text-zinc-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-zoop-500/20 focus:border-zoop-500 transition-all"
            />
          </div>

          {/* Botón de Confirmar y Reclamar */}
          <button
            type="button"
            onClick={handleClaim}
            disabled={isClaiming || !selectedProduct}
            className="w-full py-4 rounded-full bg-zoop-500 hover:bg-zoop-600 text-white font-black text-xs shadow-pill hover:shadow-card-hover active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {isClaiming
                ? 'Confirmando Despacho...'
                : 'Confirmar Regalo y Desbloquear Bono'}
            </span>
          </button>
        </div>
      ) : (
        /* Tarjeta de Regalo Reclamado + Cupón 3D Zoop Store */
        <div className="space-y-4 animate-slide-up">
          <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-4 text-center space-y-2 shadow-sm">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-black text-emerald-900">
              ¡Regalo confirmado para despacho!
            </h4>
            <p className="text-xs text-emerald-800 max-w-xs mx-auto leading-relaxed">
              Mateo ya recibió tu confirmación y reacción en vivo. Tu paquete está en camino a tu domicilio sin riesgo de devoluciones.
            </p>
          </div>

          {/* CUPÓN 3D DE RECOMPRA ESTILO ZOOP STORE */}
          <Coupon3D
            code={activeGift.unlockedCouponCode || 'NIDO-WELCOME-15'}
            discount="15% OFF"
          />

          <button
            type="button"
            onClick={() => alert('¡Redirigiendo al catálogo para aplicar tu 15% OFF!')}
            className="w-full py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white font-black text-xs rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>Regalar con 15% OFF Ahora</span>
            <ArrowRight className="w-3.5 h-3.5 text-zoop-400" />
          </button>
        </div>
      )}

      {/* Barra Inferior Flotante Pill en Valentina */}
      <div className="sticky bottom-1 left-0 right-0 z-30 pt-2 pb-1">
        <div className="glass-pill max-w-[280px] mx-auto rounded-full py-2 px-4 shadow-2xl border border-zinc-200/90 flex items-center justify-center gap-2 text-xs font-black text-zinc-700">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Sincronizada con Mateo en Vivo</span>
        </div>
      </div>
    </div>
  );
}
