import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SEED_USERS, SEED_PRODUCTS } from './seed-data';

@Injectable()
export class BootstrapService implements OnModuleInit {
  private readonly logger = new Logger(BootstrapService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.autoSeed();
  }

  /**
   * Verifica si la base de datos está vacía e inserta usuarios y catálogo Nido
   */
  async autoSeed() {
    try {
      const userCount = await this.prisma.user.count();
      if (userCount === 0) {
        this.logger.log('🌱 Base de datos vacía detectada. Iniciando Auto-Seed de Nido...');

        // 1. Precarga de Usuarios (Mateo y Valentina)
        for (const user of SEED_USERS) {
          await this.prisma.user.upsert({
            where: { id: user.id },
            update: {},
            create: {
              id: user.id,
              name: user.name,
              email: user.email,
              avatar: user.avatar,
              role: user.role,
              preferencesJson: user.preferencesJson,
            },
          });
        }
        this.logger.log(`✅ ${SEED_USERS.length} Usuarios precargados exitosamente.`);

        // 2. Precarga de Productos de Nido Colombia (8 productos, 5 categorías)
        for (const product of SEED_PRODUCTS) {
          await this.prisma.product.upsert({
            where: { id: product.id },
            update: {},
            create: {
              id: product.id,
              title: product.title,
              brand: product.brand,
              category: product.category,
              priceCop: product.priceCop,
              image: product.image,
              description: product.description,
              variantsJson: product.variantsJson,
              tagsJson: product.tagsJson,
            },
          });
        }
        this.logger.log(`✅ ${SEED_PRODUCTS.length} Productos del catálogo precargados.`);
      } else {
        this.logger.log(`⚡ Base de datos ya cuenta con ${userCount} usuarios. Omitiendo seed inicial.`);
      }
    } catch (error) {
      this.logger.warn(`⚠️ Error durante el Auto-Seed (posiblemente la BD aún no está disponible): ${(error as Error).message}`);
    }
  }

  /**
   * Obtiene todos los usuarios, productos y regalos con sus transacciones
   */
  async getBootstrapData() {
    const [users, products, gifts] = await Promise.all([
      this.prisma.user.findMany({
        orderBy: { name: 'asc' },
      }),
      this.prisma.product.findMany({
        orderBy: { category: 'asc' },
      }),
      this.prisma.giftOrder.findMany({
        include: {
          sender: true,
          receiver: true,
          mainProduct: true,
          selectedProduct: true,
          transactions: {
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      success: true,
      data: {
        users,
        products,
        gifts,
      },
    };
  }

  /**
   * Reinicia la demo: Limpia GiftOrder y PaymentTransaction y crea 1 regalo de ejemplo
   */
  async resetDemo() {
    this.logger.log('🔄 Reiniciando demostración de Nido...');

    // Asegurar que usuarios y productos existan antes de vincular
    await this.autoSeed();

    // Eliminar transacciones y órdenes anteriores en orden de integridad referencial
    await this.prisma.paymentTransaction.deleteMany({});
    await this.prisma.giftOrder.deleteMany({});

    // Crear 1 regalo inicial de prueba para que el evaluador interactúe de inmediato
    const sampleGift = await this.prisma.giftOrder.create({
      data: {
        id: 'gift-demo-1',
        senderId: 'user-mateo',
        receiverId: 'user-valentina',
        mainProductId: 'prod-tec-1', // Audífonos Inalámbricos Hi-Fi ($195.000 COP)
        capsuleProductIdsJson: ['prod-hog-1', 'prod-moda-2'], // Set Barista ($98.000 COP) y Hoodie Minimal ($115.000 COP)
        status: 'PAYMENT_PENDING',
        isGroupGift: false,
        totalAmountCop: 195000,
        paidAmountCop: 0,
        dedication: '¡Feliz cumpleaños Valentina! Sé cuánto disfrutas de la música y la concentración en tus proyectos. Espero que este detalle te acompañe siempre.',
        secretHint: 'Vibra al compás de tu ritmo favorito y te transportará a otro universo sonoro...',
      },
      include: {
        sender: true,
        receiver: true,
        mainProduct: true,
        transactions: true,
      },
    });

    this.logger.log(`✨ Demostración reiniciada. Regalo demo creado: ${sampleGift.id}`);

    return {
      success: true,
      message: 'Demostración reiniciada exitosamente.',
      sampleGift,
    };
  }
}
