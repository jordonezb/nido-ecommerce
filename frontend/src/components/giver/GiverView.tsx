'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  CheckCircle2,
  Users2,
  CreditCard,
  AlertCircle,
  Eye,
  Gift,
  Heart,
  RotateCcw,
  Check,
  Zap,
  ArrowRight,
  Star,
  Layers,
  ChevronRight,
  Receipt,
} from 'lucide-react';
import { useGiftApp } from '../../context/GiftAppContext';
import { Product, ProductVariant, PaymentStatus } from '../../types';
import {
  createGift,
  simulateCheckout,
  getGiftAssistantAdvice,
  getProductAlternatives,
} from '../../services/api';
import { VisaCardMockup } from '../common/Zoop3DIllustrations';
import { ZoopBottomSheet } from '../common/ZoopBottomSheet';

const CATEGORIES = [
  'Todas',
  'Moda',
  'Tecnología',
  'Hogar',
  'Belleza',
  'Experiencias',
];

export function GiverView() {
  const {
    products,
    receiverUser,
    activeGift,
    setActiveGift,
    refreshActiveGift,
    lastLiveActivity,
  } = useGiftApp();

  // Refs para navegación suave entre secciones
  const section1Ref = React.useRef<HTMLDivElement>(null);
  const section2Ref = React.useRef<HTMLDivElement>(null);
  const section3Ref = React.useRef<HTMLDivElement>(null);

  // Control de Pasos Estilo Zoop Store (1: Catálogo, 2: Cápsula e IA, 3: Checkout)
  const [activeStep, setActiveStep] = useState<number>(1);

  const scrollToSection = (step: number) => {
    setActiveStep(step);
    if (step === 1) section1Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (step === 2) section2Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (step === 3) section3Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Paso A: Filtros y Selección
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string>('');

  // Paso B: Cápsula e IA
  const [capsuleProductIds, setCapsuleProductIds] = useState<string[]>([]);
  const [dedication, setDedication] = useState<string>('');
  const [secretHint, setSecretHint] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [isCreatingGift, setIsCreatingGift] = useState<boolean>(false);

  // Paso C: Modalidad de Pago
  const [isGroupGift, setIsGroupGift] = useState<boolean>(false);

  // Paso D: Checkout Simulado
  const [payerName, setPayerName] = useState<string>('Mateo Gómez');
  const [customAmount, setCustomAmount] = useState<number>(0);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);

  // Bottom Sheet de Error / Transacción
  const [showErrorSheet, setShowErrorSheet] = useState<boolean>(false);
  const [errorSheetContent, setErrorSheetContent] = useState<{ title: string; message: string }>({
    title: 'Transacción Rechazada',
    message: 'El banco emisor declinó la operación de pago simulada.',
  });

  // Favoritos locales para feedback visual
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  // Sincronizar estado inicial cuando exista un regalo activo o cargar primer producto
  useEffect(() => {
    if (activeGift?.mainProduct) {
      setSelectedProduct(activeGift.mainProduct);
      setCapsuleProductIds(activeGift.capsuleProductIdsJson || []);
      setDedication(activeGift.dedication || '');
      setSecretHint(activeGift.secretHint || '');
      setIsGroupGift(activeGift.isGroupGift);
      if (activeGift.selectedVariant) {
        setSelectedVariant(activeGift.selectedVariant);
      }
    } else if (products.length > 0 && !selectedProduct) {
      const defaultProd = products[0];
      setSelectedProduct(defaultProd);
      if (defaultProd.variantsJson?.length > 0) {
        setSelectedVariant(defaultProd.variantsJson[0].name);
      }
      // Inicializar automáticamente 2 alternativas pre-aprobadas elegibles
      const defaultAlts = products
        .filter((p) => p.id !== defaultProd.id && p.priceCop <= defaultProd.priceCop)
        .slice(0, 2)
        .map((p) => p.id);
      setCapsuleProductIds(defaultAlts);
    }
  }, [activeGift, products]);

  // Manejo de cambio explícito de producto principal
  const handleSelectMainProduct = async (prod: Product) => {
    setSelectedProduct(prod);
    if (prod.variantsJson?.length > 0) {
      setSelectedVariant(prod.variantsJson[0].name);
    }
    try {
      const alts = await getProductAlternatives(prod.id);
      if (alts && alts.length > 0) {
        setCapsuleProductIds(alts.slice(0, 2).map((a) => a.id));
      } else {
        const localAlts = products
          .filter((p) => p.id !== prod.id && p.priceCop <= prod.priceCop)
          .slice(0, 2)
          .map((p) => p.id);
        setCapsuleProductIds(localAlts);
      }
    } catch {
      const localAlts = products
        .filter((p) => p.id !== prod.id && p.priceCop <= prod.priceCop)
        .slice(0, 2)
        .map((p) => p.id);
      setCapsuleProductIds(localAlts);
    }
  };

  // Botón: Autocompletar con Nido AI (Garantiza exactamente 2 alternativas válidas de inmediato)
  const handleAutocompleteAi = async () => {
    if (!selectedProduct) return;
    try {
      setIsAiLoading(true);
      const advice = await getGiftAssistantAdvice({
        receiverId: receiverUser?.id || 'user-valentina',
        mainProductId: selectedProduct.id,
        occasion: 'Cumpleaños y Agradecimiento',
        tone: 'emocional, detallista y cálido',
        senderName: 'Mateo',
      });

      setDedication(advice.dedication);
      setSecretHint(advice.secretHint);

      // Elegibles locales garantizados
      const eligibleIds = products
        .filter((p) => p.id !== selectedProduct.id && p.priceCop <= selectedProduct.priceCop)
        .map((p) => p.id);

      const validAiIds = (advice.recommendedCapsuleIds || []).filter((id) =>
        eligibleIds.includes(id),
      );

      if (validAiIds.length >= 2) {
        setCapsuleProductIds(validAiIds.slice(0, 2));
      } else {
        const remaining = eligibleIds.filter((id) => !validAiIds.includes(id));
        const combined = [...validAiIds, ...remaining].slice(0, 2);
        setCapsuleProductIds(combined);
      }
    } catch (error) {
      console.error('Error con Asistente IA:', error);
      // Respaldo local de alta fidelidad
      const localAlts = products
        .filter((p) => p.id !== selectedProduct.id && p.priceCop <= selectedProduct.priceCop)
        .slice(0, 2)
        .map((p) => p.id);
      setCapsuleProductIds(localAlts);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Toggle de producto alternativo para la cápsula (respeta límite máximo de 2)
  const toggleCapsuleProduct = (altId: string) => {
    if (capsuleProductIds.includes(altId)) {
      setCapsuleProductIds(capsuleProductIds.filter((id) => id !== altId));
    } else {
      if (capsuleProductIds.length >= 2) {
        setCapsuleProductIds([capsuleProductIds[1], altId]);
      } else {
        setCapsuleProductIds([...capsuleProductIds, altId]);
      }
    }
  };

  // Crear Regalo en Backend
  const handleCreateGift = async () => {
    if (!selectedProduct) return;
    try {
      setIsCreatingGift(true);
      const newGift = await createGift({
        senderId: 'user-mateo',
        receiverId: 'user-valentina',
        mainProductId: selectedProduct.id,
        capsuleProductIds,
        isGroupGift,
        dedication,
        secretHint,
        selectedVariant,
      });

      setActiveGift(newGift);
      setPaymentMessage('✨ Cápsula de regalo creada. Procede al checkout.');
      setActiveStep(3); // Avanzar automáticamente al paso de checkout
    } catch (error) {
      console.error('Error al crear regalo:', error);
      setPaymentMessage(`Error: ${(error as Error).message}`);
    } finally {
      setIsCreatingGift(false);
    }
  };

  // Simulación de Checkout Multi-Estado
  const handleSimulatePayment = async (outcome: PaymentStatus) => {
    if (!activeGift?.id) return;

    try {
      setIsProcessingPayment(true);
      setPaymentMessage(null);

      const pendingAmount = Math.max(
        0,
        activeGift.totalAmountCop - Math.min(activeGift.totalAmountCop, Math.max(0, activeGift.paidAmountCop)),
      );

      if (pendingAmount <= 0 && outcome === 'APPROVED') {
        setPaymentMessage('✨ El regalo ya se encuentra 100% cubierto. ¡Listo para Unboxing!');
        return;
      }

      let amountToPay: number;
      if (isGroupGift) {
        const requested = customAmount > 0 ? customAmount : Math.min(50000, pendingAmount);
        if (outcome === 'APPROVED' && requested > pendingAmount) {
          setPaymentMessage(
            `⚠️ El aporte ($${requested.toLocaleString('es-CO')} COP) no puede ser superior al saldo restante ($${pendingAmount.toLocaleString('es-CO')} COP).`,
          );
          return;
        }
        amountToPay = Math.min(requested, pendingAmount);
      } else {
        amountToPay = pendingAmount > 0 ? pendingAmount : activeGift.totalAmountCop;
      }

      const res = await simulateCheckout({
        giftOrderId: activeGift.id,
        payerName: payerName.trim() || 'Mateo Gómez',
        amountCop: amountToPay,
        simulationOutcome: outcome,
      });

      if (res.success) {
        await refreshActiveGift();
        if (outcome === 'APPROVED') {
          setShowErrorSheet(false);
          setPaymentMessage(`🟢 Pago de $${amountToPay.toLocaleString('es-CO')} COP aprobado exitosamente.`);
          setCustomAmount(0);
        } else if (outcome === 'PENDING') {
          setShowErrorSheet(false);
          setPaymentMessage('🟡 Pago en revisión bancaria (Estado: Pendiente).');
        } else {
          setPaymentMessage('🔴 Transacción rechazada por el banco emisor.');
          setErrorSheetContent({
            title: 'Transacción Rechazada',
            message: 'Fondos insuficientes o bloqueo de seguridad simulado.',
          });
          setShowErrorSheet(true);
          setTimeout(() => setShowErrorSheet(false), 3000);
        }
      }
    } catch (error) {
      setPaymentMessage(`Error al procesar: ${(error as Error).message}`);
      setErrorSheetContent({
        title: 'Error de Red o Pasarela',
        message: (error as Error).message,
      });
      setShowErrorSheet(true);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filtrado de productos por categoría
  const filteredProducts =
    selectedCategory === 'Todas'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  // Productos alternativos elegibles (mismo o menor precio que el principal)
  // Ordenados para que los que estén dentro de capsuleProductIds aparezcan PRIMERO
  const availableAlternatives = useMemo(() => {
    if (!selectedProduct) return [];
    const eligible = products.filter(
      (p) => p.id !== selectedProduct.id && p.priceCop <= selectedProduct.priceCop,
    );
    return [...eligible].sort((a, b) => {
      const aIn = capsuleProductIds.includes(a.id) ? 1 : 0;
      const bIn = capsuleProductIds.includes(b.id) ? 1 : 0;
      if (aIn !== bIn) return bIn - aIn;
      return b.priceCop - a.priceCop;
    });
  }, [products, selectedProduct, capsuleProductIds]);

  // Lista de objetos de productos seleccionados para la cápsula (para desglose en checkout)
  const capsuleProducts = useMemo(() => {
    return products.filter((p) => capsuleProductIds.includes(p.id));
  }, [products, capsuleProductIds]);

  // Cálculos de Vaca / Fondos
  const isIndividual = !isGroupGift;
  const isRejected = activeGift?.status === 'PAYMENT_REJECTED';
  const isPending = activeGift?.status === 'PAYMENT_PENDING';

  const totalAmount = activeGift?.totalAmountCop || selectedProduct?.priceCop || 0;
  const rawPaidAmount = activeGift?.paidAmountCop || 0;
  const effectivePaid = Math.min(totalAmount, Math.max(0, rawPaidAmount));
  const paidAmount = isIndividual && (isRejected || isPending) ? 0 : effectivePaid;
  const pendingAmount = Math.max(0, totalAmount - paidAmount);
  const progressPercent =
    totalAmount > 0 ? Math.min(100, Math.round((paidAmount / totalAmount) * 100)) : 0;
  const isFullyCovered = paidAmount >= totalAmount && totalAmount > 0 && !isRejected && !isPending;

  return (
    <div className="space-y-4 pb-36 relative">
      {/* ========================================================================= */}
      {/* FASE 1: CATÁLOGO Y REGALO PRINCIPAL (PASO 1)                              */}
      {/* ========================================================================= */}
      {activeStep === 1 && (
        <div className="space-y-4 animate-slide-up">
          {/* Saludo Estilo Nido Store */}
          <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
            ¡Hola, Mateo!
          </span>
          <h2 className="text-base font-black text-zinc-900 tracking-tight">
            Sorpresa para Valentina
          </h2>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zoop-50 text-zoop-600 border border-zoop-200/60 text-[10px] font-extrabold uppercase tracking-wide">
          <Heart className="w-3 h-3 fill-zoop-500 text-zoop-500" />
          <span>Valentina Ríos</span>
        </div>
      </div>

      {/* Chips de Preferencias de Valentina */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[10px] font-bold text-zinc-400 uppercase whitespace-nowrap">
          Gustos:
        </span>
        {receiverUser?.preferencesJson?.map((tag) => (
          <span
            key={tag}
            className="text-[10px] font-bold bg-white text-zinc-700 px-2.5 py-0.5 rounded-full border border-zinc-200/80 shadow-xs whitespace-nowrap"
          >
            #{tag}
          </span>
        )) || (
          <>
            <span className="text-[10px] font-bold bg-white text-zinc-700 px-2.5 py-0.5 rounded-full border border-zinc-200/80">#café de especialidad</span>
            <span className="text-[10px] font-bold bg-white text-zinc-700 px-2.5 py-0.5 rounded-full border border-zinc-200/80">#audio hi-fi</span>
          </>
        )}
      </div>

      {/* Banner Informativo Zoop Store */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-zoop-500 to-coral-400 p-4 text-white shadow-pill shadow-zoop-500/25">
        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-rose-100 bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-xs">
              Cápsula Anti-Devolución
            </span>
            <h3 className="text-sm font-black tracking-tight leading-snug">
              0% Devoluciones Garantizado
            </h3>
            <p className="text-[11px] text-rose-50 font-medium max-w-[200px] leading-tight">
              Valentina confirmará su talla o canjeará por una alternativa antes del despacho.
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner">
            🎁
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECCIÓN 1: CATÁLOGO Y REGALO PRINCIPAL (PASO 1)                           */}
      {/* ========================================================================= */}
      <div ref={section1Ref} className="space-y-3 animate-slide-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-zoop-500 text-white text-xs font-black flex items-center justify-center shadow-pill">
              1
            </span>
            <h4 className="text-xs font-black uppercase tracking-wider text-zinc-900">
              Regalo Principal
            </h4>
          </div>
          {selectedProduct && (
            <span className="text-xs font-black text-zoop-600 bg-zoop-50 px-2.5 py-0.5 rounded-full border border-zoop-200/60">
              ${selectedProduct.priceCop.toLocaleString('es-CO')} COP
            </span>
          )}
        </div>

        {/* Selector de Categorías Estilo Zoop Store */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-[11px] font-extrabold whitespace-nowrap transition-all shadow-xs ${
                  isActive
                    ? 'bg-zoop-500 text-white shadow-pill'
                    : 'bg-white text-zinc-600 hover:text-zinc-900 border border-zinc-200/80 hover:bg-zinc-50'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Grid de Productos Zoop Store */}
        <div className="grid grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1 scrollbar-none">
          {filteredProducts.map((prod) => {
            const isSelected = selectedProduct?.id === prod.id;
            const isFav = !!favorites[prod.id];

            return (
              <div
                key={prod.id}
                onClick={() => handleSelectMainProduct(prod)}
                className={`cursor-pointer rounded-3xl p-2.5 border transition-all text-left flex flex-col justify-between relative group ${
                  isSelected
                    ? 'border-zoop-500 bg-zoop-50/30 ring-2 ring-zoop-500/30 shadow-card-hover'
                    : 'border-zinc-200/80 bg-white hover:border-zinc-300 shadow-card hover:shadow-card-hover'
                }`}
              >
                {/* Contenedor de Imagen con Botón de Favorito Flotante */}
                <div className="aspect-square w-full rounded-2xl overflow-hidden bg-zinc-100 relative mb-2">
                  <img
                    src={prod.image}
                    alt={prod.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Botón de Corazón Flotante (Zoop Store style) */}
                  <button
                    type="button"
                    onClick={(e) => toggleFavorite(e, prod.id)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-sm transition-transform active:scale-90 z-10"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 transition-colors ${
                        isFav ? 'fill-zoop-500 text-zoop-500' : 'text-zinc-400'
                      }`}
                    />
                  </button>

                  {/* Badge Destacado de Selección Indiscutible */}
                  {isSelected && (
                    <span className="absolute top-2 left-2 bg-gradient-to-r from-zoop-500 to-coral-500 text-white rounded-full px-2 py-0.5 text-[9px] font-black shadow-pill flex items-center gap-1 z-10 animate-fade-in">
                      <Check className="w-3 h-3 stroke-[3]" /> Regalo Principal Elegido
                    </span>
                  )}
                </div>

                {/* Detalles del Producto */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>4.9</span>
                    <span className="text-zinc-400 font-normal">({prod.brand})</span>
                  </div>

                  <h5 className="text-[11px] font-extrabold text-zinc-900 line-clamp-1">
                    {prod.title}
                  </h5>

                  <div className="flex items-center justify-between pt-0.5">
                    <span className="text-xs font-black text-zoop-600">
                      ${prod.priceCop.toLocaleString('es-CO')} COP
                    </span>
                  </div>

                  {/* Botón Explícito de Elección */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectMainProduct(prod);
                    }}
                    className={`w-full mt-2 py-1.5 px-2 rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-1 ${
                      isSelected
                        ? 'bg-zoop-500 text-white shadow-xs'
                        : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-900 border border-zinc-200'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Regalo Principal Elegido</span>
                      </>
                    ) : (
                      <span>Elegir como Principal</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Variantes del Producto Principal */}
        {selectedProduct?.variantsJson && selectedProduct.variantsJson.length > 0 && (
          <div className="bg-white p-3 rounded-2xl border border-zinc-200/80 shadow-xs">
            <span className="text-[10px] font-extrabold text-zinc-400 uppercase block mb-1.5">
              Variante inicial sugerida:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {selectedProduct.variantsJson.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVariant(v.name)}
                  className={`text-[11px] px-3 py-1 rounded-full border font-bold transition-all ${
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

        {/* Barra Resumen Fija de Selección del Catálogo */}
        {selectedProduct && (
          <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-md p-3 rounded-2xl border-2 border-zoop-500/40 shadow-xl flex items-center justify-between gap-3 animate-slide-up">
            <div className="min-w-0 flex-1">
              <span className="text-[9px] font-extrabold text-zoop-600 uppercase tracking-wider block">
                Producto seleccionado:
              </span>
              <p className="text-xs font-black text-zinc-900 truncate">
                {selectedProduct.title}
              </p>
              <span className="text-xs font-black text-zoop-600">
                ${selectedProduct.priceCop.toLocaleString('es-CO')} COP
              </span>
            </div>
            <button
              type="button"
              onClick={() => scrollToSection(2)}
              className="shrink-0 py-2.5 px-4 rounded-full bg-zoop-500 hover:bg-zoop-600 text-white font-black text-xs shadow-pill transition-all active:scale-95 flex items-center gap-1.5"
            >
              <span>Continuar a Cápsula</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )}

  {/* ========================================================================= */}
  {/* FASE 2: CÁPSULA ANTI-DEVOLUCIONES & ASISTENTE IA (PASO 2)                  */}
  {/* ========================================================================= */}
  {activeStep === 2 && (
    <div className="space-y-4 animate-slide-up">
      {/* Tarjeta Resumen Superior del Regalo Principal Seleccionado */}
      <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 text-white p-3.5 rounded-3xl border border-zinc-700 shadow-md flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-2xl overflow-hidden bg-zinc-700 shrink-0 border border-zinc-600">
            <img
              src={selectedProduct?.image}
              alt={selectedProduct?.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] font-black text-zoop-400 uppercase tracking-wider block">
              🎁 Regalo Principal Seleccionado
            </span>
            <p className="text-xs font-black text-white truncate">
              {selectedProduct?.title}
            </p>
            <span className="text-[10px] font-bold text-zinc-300">
              ${selectedProduct?.priceCop.toLocaleString('es-CO')} COP • {selectedVariant || 'Edición Estándar'}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => scrollToSection(1)}
          className="text-[10px] font-extrabold bg-white/10 hover:bg-white/20 text-white px-2.5 py-1.5 rounded-xl border border-white/20 whitespace-nowrap transition-colors shrink-0"
        >
          Cambiar
        </button>
      </div>

      <div ref={section2Ref} className="space-y-3.5 bg-white p-4 rounded-3xl border border-zinc-200/80 shadow-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-zoop-500 text-white text-xs font-black flex items-center justify-center shadow-pill">
              2
            </span>
            <h4 className="text-xs font-black uppercase tracking-wider text-zinc-900">
              Cápsula Anti-Devoluciones
            </h4>
          </div>

          {/* Botón Autocompletar con Nido AI */}
          <button
            type="button"
            onClick={handleAutocompleteAi}
            disabled={isAiLoading || !selectedProduct}
            className="flex items-center gap-1.5 text-[11px] font-black text-white bg-gradient-to-r from-amber-500 to-zoop-500 px-3 py-1.5 rounded-full shadow-md hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isAiLoading ? 'animate-spin' : ''}`} />
            <span>{isAiLoading ? 'Pensando...' : 'Autocompletar con Nido AI'}</span>
          </button>
        </div>

        {/* Banner de Cero Devolución */}
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3 text-[11px] text-zinc-700 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold text-emerald-900 block">Cero Devolución Activa</span>
            <span>
              Valentina no verá precios. Podrá confirmar su talla o canjear por cualquiera de estas alternativas sin fricción.
            </span>
          </div>
        </div>

        {/* Alternativas pre-aprobadas con contador y consistencia visual garantizada */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-extrabold text-zinc-500 uppercase block">
              Alternativas pre-aprobadas ({capsuleProductIds.length}/2):
            </span>
            <span
              className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                capsuleProductIds.length === 2
                  ? 'text-emerald-700 bg-emerald-100/70 border-emerald-300'
                  : 'text-amber-800 bg-amber-100/70 border-amber-300'
              }`}
            >
              {capsuleProductIds.length === 2
                ? '✓ 2 de 2 elegidas'
                : `Falta ${2 - capsuleProductIds.length} alternativa`}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {availableAlternatives.map((alt) => {
              const isSelected = capsuleProductIds.includes(alt.id);
              return (
                <div
                  key={alt.id}
                  onClick={() => toggleCapsuleProduct(alt.id)}
                  className={`cursor-pointer rounded-2xl p-2.5 border text-left flex items-center gap-2.5 transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/40 shadow-xs'
                      : 'border-zinc-200/80 bg-zinc-50/70 hover:bg-white hover:border-zinc-300'
                  }`}
                >
                  <img
                    src={alt.image}
                    alt={alt.title}
                    className="w-11 h-11 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-black text-zinc-900 truncate">
                      {alt.title}
                    </p>
                    <p className="text-[9px] text-zinc-400 truncate">{alt.brand}</p>
                    <span className="text-[9px] font-black text-zinc-600 block mt-0.5">
                      ${alt.priceCop.toLocaleString('es-CO')} COP
                    </span>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Dedicatoria Emocional */}
        <div>
          <label className="text-[10px] font-extrabold text-zinc-400 uppercase block mb-1">
            Dedicatoria Emocional:
          </label>
          <textarea
            rows={2}
            value={dedication}
            onChange={(e) => setDedication(e.target.value)}
            placeholder="Escribe un mensaje con cariño para Valentina..."
            className="w-full text-xs p-3 rounded-2xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-zoop-500/20 focus:border-zoop-500 text-zinc-800 transition-all"
          />
        </div>

        {/* Pista Secreta */}
        <div>
          <label className="text-[10px] font-extrabold text-zinc-400 uppercase block mb-1">
            Pista Secreta (Lectura previa al unboxing):
          </label>
          <input
            type="text"
            value={secretHint}
            onChange={(e) => setSecretHint(e.target.value)}
            placeholder="Ej: Vibra al compás de tu ritmo favorito..."
            className="w-full text-xs p-3 rounded-2xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-zoop-500/20 focus:border-zoop-500 text-zinc-800 transition-all"
          />
        </div>

        {/* Botón Crear Regalo / Guardar */}
        <button
          type="button"
          onClick={async () => {
            await handleCreateGift();
            scrollToSection(3);
          }}
          disabled={isCreatingGift || !selectedProduct}
          className="w-full flex items-center justify-center gap-2 bg-zinc-900 text-white text-xs font-black py-4 rounded-full hover:bg-zinc-800 active:scale-95 transition-all shadow-md disabled:opacity-50"
        >
          <Gift className="w-4 h-4 text-zoop-400" />
          <span>{isCreatingGift ? 'Creando Cápsula...' : 'Confirmar y Guardar Cápsula'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Botón Volver al Catálogo */}
        <button
          type="button"
          onClick={() => scrollToSection(1)}
          className="w-full py-2.5 rounded-full text-zinc-500 hover:text-zinc-900 text-[11px] font-bold transition-all text-center"
        >
          ← Volver al Catálogo
        </button>
      </div>
    </div>
  )}

  {/* ========================================================================= */}
  {/* FASE 3: CHECKOUT & RADAR EN TIEMPO REAL (PASO 3)                           */}
  {/* ========================================================================= */}
  {activeStep === 3 && (
    <div className="space-y-4 animate-slide-up">
      <div ref={section3Ref} className="space-y-4 bg-white p-4 rounded-3xl border border-zinc-200/80 shadow-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-zoop-500 text-white text-xs font-black flex items-center justify-center shadow-pill">
              3
            </span>
            <h4 className="text-xs font-black uppercase tracking-wider text-zinc-900">
              Checkout & Co-Regalo
            </h4>
          </div>

          {/* Toggle 100% Yo vs La Vaca */}
          <div className="flex bg-zinc-100 p-1 rounded-full border border-zinc-200/80 text-[10px] font-black">
            <button
              type="button"
              onClick={() => setIsGroupGift(false)}
              className={`px-3 py-1 rounded-full transition-all ${
                !isGroupGift ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500'
              }`}
            >
              100% Yo
            </button>
            <button
              type="button"
              onClick={() => setIsGroupGift(true)}
              className={`px-3 py-1 rounded-full transition-all ${
                isGroupGift ? 'bg-zoop-500 text-white shadow-pill' : 'text-zinc-500'
              }`}
            >
              Hacer Vaca 🐮
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* RESUMEN DE COMPRA & DESGLOSE ITEMIZADO                            */}
        {/* ================================================================= */}
        <div className="bg-zinc-50/80 p-3.5 rounded-3xl border border-zinc-200/90 space-y-2.5">
          <div className="flex items-center justify-between border-b border-zinc-200/70 pb-2">
            <h5 className="text-xs font-black uppercase tracking-wider text-zinc-900 flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-zoop-500" />
              <span>Resumen de Compra</span>
            </h5>
            <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full border border-emerald-300">
              0% Devoluciones Activa
            </span>
          </div>

          {/* 1. Fila del Regalo Principal */}
          <div className="flex items-start justify-between gap-3 text-xs">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-black text-zoop-600 bg-zoop-50 px-1.5 py-0.5 rounded-md border border-zoop-200 shrink-0">
                  Principal
                </span>
                <p className="font-extrabold text-zinc-900 truncate">
                  {selectedProduct?.title}
                </p>
              </div>
              <p className="text-[10px] text-zinc-500 mt-0.5 pl-1">
                1 ud. • Variante: {selectedVariant || 'Edición Estándar'}
              </p>
            </div>
            <span className="font-black text-zinc-900 text-xs shrink-0">
              ${(selectedProduct?.priceCop || totalAmount).toLocaleString('es-CO')} COP
            </span>
          </div>

          {/* 2. Fila de la Cápsula Anti-Devoluciones */}
          <div className="bg-white p-2.5 rounded-2xl border border-emerald-200/80 space-y-1.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-black text-emerald-800 uppercase tracking-wide flex items-center gap-1">
                <span>🛡️</span> Cápsula Anti-Devoluciones ({capsuleProducts.length}/2 alternativas)
              </span>
              <span className="font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[9px]">
                $0 COP adicional
              </span>
            </div>

            <div className="space-y-1 pl-1">
              {capsuleProducts.map((cp) => (
                <div key={cp.id} className="flex items-center justify-between text-[11px] text-zinc-600">
                  <span className="truncate pr-2">• {cp.title}</span>
                  <span className="text-[9px] font-extrabold text-emerald-600 shrink-0">Incluida</span>
                </div>
              ))}
              {capsuleProducts.length === 0 && (
                <p className="text-[10px] text-zinc-400 italic">No se han elegido alternativas aún.</p>
              )}
            </div>

            <p className="text-[9px] font-bold text-emerald-700/90 bg-emerald-50/60 p-1.5 rounded-lg border border-emerald-100/80 leading-tight">
              ✓ Incluidas como respaldo de cambio pre-despacho — $0 COP adicional. Valentina puede confirmar su talla o canjear por cualquiera de estas opciones sin costo.
            </p>
          </div>

          {/* 3. Línea Divisoria y Total */}
          <div className="pt-2 border-t border-zinc-200 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-black text-zinc-800 uppercase tracking-wider">
                Total a Pagar:
              </span>
              <span className="text-sm font-black text-zoop-600">
                ${totalAmount.toLocaleString('es-CO')} COP
              </span>
            </div>

            {/* 4. Si es Modo Vaca: Desglose de Co-Regalo */}
            {isGroupGift && (
              <div className="mt-2 bg-amber-50/80 p-2.5 rounded-2xl border border-amber-200 text-xs space-y-1 animate-fade-in">
                <div className="flex justify-between text-[11px] text-amber-900">
                  <span className="font-bold">Monto Total del Regalo:</span>
                  <span className="font-black">${totalAmount.toLocaleString('es-CO')} COP</span>
                </div>
                <div className="flex justify-between text-[11px] text-amber-900">
                  <span className="font-bold">Tu aporte actual:</span>
                  <span className="font-black text-emerald-700">
                    ${(customAmount > 0 ? Math.min(customAmount, pendingAmount) : Math.min(50000, pendingAmount)).toLocaleString('es-CO')} COP
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-amber-900 border-t border-amber-200/60 pt-1">
                  <span className="font-extrabold">Restante por cubrir:</span>
                  <span className="font-black text-rose-600">
                    ${Math.max(0, pendingAmount - (customAmount > 0 ? Math.min(customAmount, pendingAmount) : Math.min(50000, pendingAmount))).toLocaleString('es-CO')} COP
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mockup Realista de Tarjeta VISA Zoop Store */}
        <VisaCardMockup
          cardholder={payerName || 'MATEO GÓMEZ'}
          cardNumber="•••• •••• •••• 0890"
          expiry="08/28"
        />

        {/* Progreso de Pago / La Vaca */}
        <div className="bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200/80">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-extrabold text-zinc-700">
              {isGroupGift ? 'Fondos de La Vaca:' : 'Monto del Regalo:'}
            </span>
            <span className="font-black text-zoop-600">
              ${paidAmount.toLocaleString('es-CO')} / ${totalAmount.toLocaleString('es-CO')} COP
            </span>
          </div>

          {/* Barra de progreso */}
          <div className="w-full h-3 bg-zinc-200/80 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 shadow-sm ${
                isRejected
                  ? 'bg-rose-500'
                  : isPending
                  ? 'bg-amber-400'
                  : 'bg-gradient-to-r from-zoop-500 via-coral-400 to-amber-400'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-bold text-zinc-500 mt-1.5">
            <span>{progressPercent}% cubierto</span>
            <span
              className={
                isFullyCovered
                  ? 'text-emerald-600 font-black'
                  : isPending
                  ? 'text-amber-600 font-black'
                  : isRejected
                  ? 'text-rose-600 font-black'
                  : ''
              }
            >
              {isFullyCovered
                ? '¡Listo para Unboxing!'
                : isPending
                ? 'En revisión bancaria'
                : isRejected
                ? 'Pago rechazado'
                : `Faltan $${Math.max(0, totalAmount - paidAmount).toLocaleString('es-CO')} COP`}
            </span>
          </div>
        </div>

        {/* Si es Vaca: Formulario de Aportante */}
        {isGroupGift && (
          <div className="space-y-2.5 bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200/70">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider flex items-center gap-1">
                <span>🐮</span> Modo Co-Regalo ("La Vaca")
              </span>
              <span className="text-[10px] font-bold text-amber-900 bg-amber-200/70 px-2 py-0.5 rounded-full">
                Faltan: <strong className="font-black">${pendingAmount.toLocaleString('es-CO')} COP</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-extrabold text-zinc-500 uppercase block mb-1">
                  Nombre Aportante:
                </label>
                <input
                  type="text"
                  value={payerName}
                  onChange={(e) => setPayerName(e.target.value)}
                  placeholder="Ej. Mateo, Camila"
                  className="w-full text-xs p-2.5 rounded-2xl border border-zinc-200 bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zoop-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-extrabold text-zinc-500 uppercase block mb-1">
                  Aporte COP (Máx: ${pendingAmount.toLocaleString('es-CO')}):
                </label>
                <input
                  type="number"
                  min="1000"
                  max={pendingAmount}
                  step="10000"
                  value={customAmount || ''}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val > pendingAmount && pendingAmount > 0) {
                      setCustomAmount(pendingAmount);
                      setPaymentMessage(`⚠️ El aporte se ajustó al saldo restante ($${pendingAmount.toLocaleString('es-CO')} COP).`);
                    } else {
                      setCustomAmount(val);
                    }
                  }}
                  placeholder={`Ej. ${Math.min(50000, pendingAmount || 50000)}`}
                  className={`w-full text-xs p-2.5 rounded-2xl border bg-white text-zinc-800 focus:outline-none focus:ring-2 ${
                    customAmount > pendingAmount && pendingAmount > 0
                      ? 'border-rose-400 focus:ring-rose-400'
                      : 'border-zinc-200 focus:ring-zoop-500'
                  }`}
                />
              </div>
            </div>

            {/* Chips Rápidos de Sugerencia de Aporte */}
            {pendingAmount > 0 ? (
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[9px] font-bold text-amber-800 uppercase">Sugerencias:</span>
                <button
                  type="button"
                  onClick={() => {
                    setCustomAmount(pendingAmount);
                    setPaymentMessage(null);
                  }}
                  className="text-[10px] font-extrabold bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-lg shadow-2xs transition-colors"
                >
                  Cubrir 100% (${pendingAmount.toLocaleString('es-CO')})
                </button>
                {pendingAmount > 20000 && (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomAmount(Math.round(pendingAmount / 2));
                      setPaymentMessage(null);
                    }}
                    className="text-[10px] font-extrabold bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-lg shadow-2xs transition-colors"
                  >
                    Mitad (${Math.round(pendingAmount / 2).toLocaleString('es-CO')})
                  </button>
                )}
              </div>
            ) : (
              <div className="p-2 rounded-xl bg-emerald-100/70 border border-emerald-300 text-emerald-800 text-[10px] font-extrabold text-center">
                🎉 ¡La vaca está 100% completada! El regalo está listo para Unboxing.
              </div>
            )}

            {customAmount > pendingAmount && pendingAmount > 0 && (
              <p className="text-[10px] font-bold text-rose-600 bg-rose-50 p-1.5 rounded-lg border border-rose-200">
                ⚠️ El aporte no puede ser superior al saldo pendiente ($${pendingAmount.toLocaleString('es-CO')} COP).
              </p>
            )}
          </div>
        )}

        {/* Botones de Simulación Multi-Estado */}
        <div>
          <span className="text-[10px] font-extrabold text-zinc-400 uppercase block mb-2">
            Simulador de Pasarela (Casos de Transacción):
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleSimulatePayment('APPROVED')}
              disabled={isProcessingPayment || !activeGift}
              className="flex flex-col items-center justify-center py-2.5 px-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] shadow-sm active:scale-95 transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4 mb-0.5" />
              <span>Aprobar</span>
            </button>

            <button
              type="button"
              onClick={() => handleSimulatePayment('PENDING')}
              disabled={isProcessingPayment || !activeGift}
              className="flex flex-col items-center justify-center py-2.5 px-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[11px] shadow-sm active:scale-95 transition-all disabled:opacity-50"
            >
              <AlertCircle className="w-4 h-4 mb-0.5" />
              <span>Pendiente</span>
            </button>

            <button
              type="button"
              onClick={() => handleSimulatePayment('REJECTED')}
              disabled={isProcessingPayment || !activeGift}
              className="flex flex-col items-center justify-center py-2.5 px-2 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[11px] shadow-sm active:scale-95 transition-all disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4 mb-0.5" />
              <span>Rechazar</span>
            </button>
          </div>
        </div>

        {paymentMessage && (
          <p className="text-xs font-bold text-center text-zinc-700 bg-zinc-100 p-2.5 rounded-2xl border border-zinc-200/80">
            {paymentMessage}
          </p>
        )}
      </div>

      {/* ========================================================================= */}
      {/* RADAR EN TIEMPO REAL DE MATEO                                             */}
      {/* ========================================================================= */}
      <section className="space-y-3 bg-gradient-to-br from-zinc-900 to-zinc-950 text-white p-4 rounded-3xl shadow-xl border border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <h4 className="text-xs font-black uppercase tracking-wider text-zinc-300">
              Radar Sincrónico en Tiempo Real
            </h4>
          </div>
          <span className="text-[10px] font-mono text-zinc-400">
            {activeGift?.id ? `ID: ${activeGift.id.slice(0, 8)}` : 'Sin Regalo'}
          </span>
        </div>

        {/* Estado 1: Alerta de Pago Rechazado */}
        {activeGift?.status === 'PAYMENT_REJECTED' && (
          <div className="bg-rose-950/60 border border-rose-500/40 p-3 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-rose-300">Pago rechazado por el banco</p>
              <p className="text-[11px] text-zinc-300">Puedes reintentar el pago en 1 clic.</p>
            </div>
            <button
              type="button"
              onClick={() => handleSimulatePayment('APPROVED')}
              className="text-xs font-bold bg-rose-500 text-white px-3 py-1.5 rounded-full hover:bg-rose-600"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Estado 2: Pago Pendiente */}
        {activeGift?.status === 'PAYMENT_PENDING' && (
          <div className="bg-amber-950/60 border border-amber-500/40 p-3 rounded-2xl">
            <p className="text-xs font-bold text-amber-300">Validación bancaria en progreso</p>
            <p className="text-[11px] text-zinc-300">
              El banco está confirmando la transacción. Valentina aún ve la tarjeta en espera.
            </p>
          </div>
        )}

        {/* Estado 3: Unboxing en Vivo */}
        {activeGift?.status === 'UNBOXING_LIVE' && (
          <div className="bg-zoop-950/80 border-2 border-zoop-500 p-3.5 rounded-2xl animate-pulse space-y-1">
            <div className="flex items-center gap-2 text-zoop-300 font-black text-sm">
              <Eye className="w-4 h-4 animate-bounce" />
              <span>¡Valentina está abriendo tu sorpresa ahora mismo!</span>
            </div>
            <p className="text-[11px] text-zinc-300">
              Está leyendo tu dedicatoria y revisando las opciones de la Cápsula.
            </p>
          </div>
        )}

        {/* Estado 4: Reclamado / Completado */}
        {activeGift?.status === 'CLAIMED_OR_SWAPPED' && (
          <div className="bg-emerald-950/80 border border-emerald-500/60 p-3.5 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-emerald-300 font-black text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Valentina eligió y confirmó su regalo</span>
            </div>
            <div className="text-xs text-zinc-200 bg-white/10 p-3 rounded-2xl space-y-1">
              <p>
                <strong>Opción Confirmada:</strong> {activeGift.selectedProduct?.title || 'Producto de cápsula'}
              </p>
              <p>
                <strong>Variante/Talla:</strong> {activeGift.selectedVariant || 'Talla confirmada'}
              </p>
              <p>
                <strong>Reacción Emocional:</strong> {activeGift.reaction}
              </p>
            </div>
            <div className="text-[10px] text-emerald-300 font-bold bg-emerald-900/40 px-3 py-1 rounded-full inline-block">
              ✅ 0% Devoluciones: Listo para despacho directo a domicilio sin riesgo.
            </div>
          </div>
        )}

        {/* Estado Default si aún no abre */}
        {(!activeGift?.status ||
          activeGift.status === 'READY_TO_UNBOX' ||
          activeGift.status === 'COLLECTING_FUNDS') && (
          <div className="text-xs text-zinc-400 p-2.5 bg-white/5 rounded-2xl text-center">
            {activeGift?.status === 'READY_TO_UNBOX'
              ? '🎁 Sorpresa lista. Esperando que Valentina abra el enlace mágico...'
              : 'Recaudando fondos con La Vaca grupal...'}
          </div>
        )}
      </section>

      {/* Botón Volver a Editar Cápsula */}
      <button
        type="button"
        onClick={() => scrollToSection(2)}
        className="w-full py-2.5 rounded-full text-zinc-500 hover:text-zinc-900 text-[11px] font-bold transition-all text-center"
      >
        ← Volver a Editar Cápsula
      </button>
    </div>
  )}

      {/* ========================================================================= */}
      {/* BARRA INFERIOR FLOTANTE TIPO CÁPSULA (PILL NAV) ZOOP STORE                 */}
      {/* ========================================================================= */}
      <div className="sticky bottom-1 left-0 right-0 z-30 pt-2 pb-1">
        <div className="glass-pill max-w-[340px] mx-auto rounded-full p-1.5 shadow-2xl border border-zinc-200/90 flex items-center justify-between gap-1">
          <button
            type="button"
            onClick={() => scrollToSection(1)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-full text-[11px] font-black transition-all ${
              activeStep === 1
                ? 'bg-zoop-500 text-white shadow-pill'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Catálogo</span>
          </button>

          <button
            type="button"
            onClick={() => scrollToSection(2)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-full text-[11px] font-black transition-all ${
              activeStep === 2
                ? 'bg-zoop-500 text-white shadow-pill'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cápsula</span>
          </button>

          <button
            type="button"
            onClick={() => scrollToSection(3)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-full text-[11px] font-black transition-all ${
              activeStep === 3
                ? 'bg-zoop-500 text-white shadow-pill'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Pagar</span>
          </button>
        </div>
      </div>

      {/* Bottom Sheet de Advertencia o Rechazo */}
      <ZoopBottomSheet
        isOpen={showErrorSheet}
        onClose={() => setShowErrorSheet(false)}
        title={errorSheetContent.title}
        message={errorSheetContent.message}
        primaryActionLabel="Reintentar con otro método / Aprobar"
        onPrimaryAction={() => handleSimulatePayment('APPROVED')}
      />
    </div>
  );
}
