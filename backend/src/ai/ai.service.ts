import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GiftAssistantDto, GiftAssistantResponse } from './dto/gift-assistant.dto';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Genera dedicatoria emocional, pista secreta y recomendación algorítmica de Cápsula Anti-Devoluciones
   */
  async generateGiftAdvice(dto: GiftAssistantDto): Promise<GiftAssistantResponse> {
    const { receiverId, mainProductId, occasion, tone, senderName } = dto;

    // 1. Obtener información de contexto (Receptor y Producto Principal)
    const [receiver, mainProduct, allProducts] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: receiverId } }),
      this.prisma.product.findUnique({ where: { id: mainProductId } }),
      this.prisma.product.findMany(),
    ]);

    const receiverName = receiver?.name || 'Valentina';
    const preferences: string[] = Array.isArray(receiver?.preferencesJson)
      ? (receiver?.preferencesJson as string[])
      : ['cafe de especialidad', 'audio hi-fi', 'minimalismo', 'bienestar'];

    const productTitle = mainProduct?.title || 'este detalle especial';
    const productCategory = mainProduct?.category || 'General';
    const maxPriceCop = mainProduct?.priceCop ?? 200000;

    // 2. Selección Algorítmica de Cápsula Anti-Devoluciones (Garantiza precio <= y match de gustos)
    const recommendedCapsuleIds = this.calculateCapsuleRecommendations(
      allProducts,
      mainProductId,
      maxPriceCop,
      preferences,
    );

    // 3. Fallback Determinista Colombiano de Alta Fidelidad
    const deterministicResult = this.buildDeterministicAdvice({
      senderName,
      receiverName,
      occasion,
      tone,
      productTitle,
      productCategory,
      recommendedCapsuleIds,
    });

    // 4. Si existe GEMINI_API_KEY, intentar enriquecer dedicatoria y pista con timeout estricto
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (apiKey) {
      try {
        const geminiResult = await this.tryGeminiGeneration(
          apiKey,
          senderName,
          receiverName,
          occasion,
          tone,
          productTitle,
          productCategory,
        );

        if (geminiResult) {
          return {
            dedication: geminiResult.dedication,
            secretHint: geminiResult.secretHint,
            recommendedCapsuleIds,
            provider: 'gemini',
          };
        }
      } catch (err) {
        this.logger.warn(
          `⚠️ Gemini API falló o excedió cuota. Activando motor determinista colombiano: ${(err as Error).message}`,
        );
      }
    }

    return deterministicResult;
  }

  /**
   * Algoritmo de afinidad para la Cápsula Anti-Devoluciones:
   * 1. Solo productos con precio <= al producto principal.
   * 2. Excluye el producto principal.
   * 3. Ordena por afinidad con las preferencias del receptor y precio más cercano al ticket principal.
   */
  private calculateCapsuleRecommendations(
    products: Array<{
      id: string;
      priceCop: number;
      category: string;
      tagsJson: unknown;
    }>,
    mainProductId: string,
    maxPriceCop: number,
    preferences: string[],
  ): string[] {
    const eligible = products.filter(
      (p) => p.id !== mainProductId && p.priceCop <= maxPriceCop,
    );

    const scored = eligible.map((p) => {
      const tags: string[] = Array.isArray(p.tagsJson) ? (p.tagsJson as string[]) : [];
      let score = 0;

      // Evaluar coincidencia con gustos declarados
      for (const pref of preferences) {
        const prefLower = pref.toLowerCase();
        if (tags.some((tag) => tag.toLowerCase().includes(prefLower) || prefLower.includes(tag.toLowerCase()))) {
          score += 3;
        }
      }

      // Favorecer productos con precio cercano al principal para mantener el alto valor percibido
      const priceRatio = p.priceCop / maxPriceCop;
      score += priceRatio * 2;

      return { id: p.id, score };
    });

    scored.sort((a, b) => b.score - a.score);

    // Retorna exactamente 2 alternativas recomendadas
    const top2 = scored.slice(0, 2).map((s) => s.id);
    if (top2.length < 2 && eligible.length >= 2) {
      return eligible.slice(0, 2).map((p) => p.id);
    }
    return top2;
  }

  /**
   * Generador determinista contextualizado en la cultura y calidez colombiana
   */
  private buildDeterministicAdvice(params: {
    senderName: string;
    receiverName: string;
    occasion: string;
    tone: string;
    productTitle: string;
    productCategory: string;
    recommendedCapsuleIds: string[];
  }): GiftAssistantResponse {
    const { senderName, receiverName, occasion, tone, productCategory, recommendedCapsuleIds } = params;
    const toneLower = tone.toLowerCase();
    const occasionLower = occasion.toLowerCase();

    // Banco contextual de dedicatorias cálidas colombianas
    let dedication = '';
    if (toneLower.includes('divertido') || toneLower.includes('humor')) {
      dedication = `¡Hola, ${receiverName}! Dicen por ahí que los mejores regalos no se piden, se disfrutan con una sonrisa. Para celebrar este ${occasionLower}, quise sorprenderte con algo que le suba el volumen a tu felicidad. ¡Un abrazo gigante de parte de ${senderName}!`;
    } else if (toneLower.includes('romántico') || toneLower.includes('amor')) {
      dedication = `Para mi adorada ${receiverName}: celebrar este ${occasionLower} a tu lado es mi mayor alegría. Cada detalle fue pensado para recordarte lo especial e inspiradora que eres en mi vida. Con todo mi amor y cariño, ${senderName}.`;
    } else if (toneLower.includes('elegante')) {
      dedication = `Apreciada ${receiverName}: en ocasión de ${occasionLower}, es un verdadero placer compartir este presente contigo. Que este detalle refleje la admiración y aprecio sincero que te tengo. Con gran afecto, ${senderName}.`;
    } else {
      // Tono cariñoso / cercano por defecto
      dedication = `¡Querida ${receiverName}! En este ${occasionLower} quería regalarte algo genuino, pensado especialmente para ti y tus momentos favoritos. Espero que te encante tanto como a mí elegirlo para ti. ¡Un abrazo muy especial de ${senderName}!`;
    }

    // Banco de pistas secretas intrigantes según la categoría
    let secretHint = '';
    switch (productCategory) {
      case 'Tecnología':
        secretHint = 'Vibra al compás de tus melodías favoritas y te transportará a otra dimensión sonora sin cables.';
        break;
      case 'Hogar':
        secretHint = 'Despierta los sentidos, tiene aroma a hogar y convertirá tus pausas diarias en un auténtico ritual.';
        break;
      case 'Moda':
        secretHint = 'Tiene textura, estilo impecable y está listo para convertirse en tu prenda favorita de esta temporada.';
        break;
      case 'Belleza':
        secretHint = 'Un secreto botánico que le devolverá la luz natural y vitalidad a tu rutina de bienestar diario.';
        break;
      case 'Experiencias':
        secretHint = 'No viene envuelto en papel tradicional: es un viaje de sabores y sensaciones diseñado para compartir y recordar.';
        break;
      default:
        secretHint = 'Una sorpresa cuidadosamente seleccionada que combina diseño, calidez y mucha buena energía.';
    }

    return {
      dedication,
      secretHint,
      recommendedCapsuleIds,
      provider: 'deterministic-engine',
    };
  }

  /**
   * Llamada a Google Generative AI (Gemini) con límite de tiempo de 2.5s
   */
  private async tryGeminiGeneration(
    apiKey: string,
    senderName: string,
    receiverName: string,
    occasion: string,
    tone: string,
    productTitle: string,
    productCategory: string,
  ): Promise<{ dedication: string; secretHint: string } | null> {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Eres el asistente de regalos de "Nido", una marca colombiana de diseño, bienestar y estilo de vida.
Genera una dedicatoria personalizada y una pista intrigante para un regalo.
- Quien regala: ${senderName}
- Quien recibe: ${receiverName}
- Ocasión: ${occasion}
- Tono: ${tone}
- Categoría del regalo: ${productCategory}
- Producto elegido (NO lo nombres explícitamente en la pista): ${productTitle}

IMPORTANTE: Responde ÚNICAMENTE con un objeto JSON válido con este formato:
{
  "dedication": "Texto de la dedicatoria con calidez colombiana",
  "secretHint": "Pista intrigante de 1 o 2 oraciones sin revelar el producto exacto"
}`;

    // Promesa con timeout de 2500ms
    const timeoutPromise = new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout de Gemini excedido (2500ms)')), 2500),
    );

    const callPromise = (async () => {
      const response = await model.generateContent(prompt);
      const text = response.response.text();
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned) as { dedication?: string; secretHint?: string };
      if (parsed.dedication && parsed.secretHint) {
        return {
          dedication: parsed.dedication,
          secretHint: parsed.secretHint,
        };
      }
      return null;
    })();

    return Promise.race([callPromise, timeoutPromise]);
  }
}
