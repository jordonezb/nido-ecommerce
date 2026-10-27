import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene todos los productos del catálogo de Nido
   */
  async findAll() {
    return this.prisma.product.findMany({
      orderBy: { category: 'asc' },
    });
  }

  /**
   * Obtiene un producto por su identificador único
   */
  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
    return product;
  }

  /**
   * Obtiene productos alternativos elegibles para la cápsula (precio <= precio del principal)
   */
  async findAlternatives(mainProductId: string) {
    const mainProduct = await this.findById(mainProductId);
    return this.prisma.product.findMany({
      where: {
        id: { not: mainProductId },
        priceCop: { lte: mainProduct.priceCop },
      },
      orderBy: { priceCop: 'desc' },
    });
  }
}
