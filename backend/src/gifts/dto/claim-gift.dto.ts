import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class ClaimGiftDto {
  @IsString({ message: 'El selectedProductId debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El selectedProductId es obligatorio' })
  selectedProductId: string;

  @IsString({ message: 'La variante seleccionada es obligatoria (ej: Talla, Color, Sede)' })
  @IsNotEmpty({ message: 'La variante seleccionada es obligatoria' })
  selectedVariant: string;

  @IsOptional()
  reaction?: string;
}
