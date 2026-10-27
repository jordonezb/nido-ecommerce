import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsOptional,
  IsBoolean,
  ArrayMaxSize,
} from 'class-validator';

export class CreateGiftDto {
  @IsString({ message: 'El senderId debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El senderId es obligatorio' })
  senderId: string;

  @IsString({ message: 'El receiverId debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El receiverId es obligatorio' })
  receiverId: string;

  @IsString({ message: 'El mainProductId debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El mainProductId es obligatorio' })
  mainProductId: string;

  @IsArray({ message: 'capsuleProductIds debe ser una lista de IDs' })
  @ArrayMaxSize(2, { message: 'La cápsula anti-devoluciones admite hasta 2 alternativas' })
  @IsOptional()
  capsuleProductIds?: string[];

  @IsBoolean({ message: 'isGroupGift debe ser un booleano' })
  @IsOptional()
  isGroupGift?: boolean;

  @IsString({ message: 'La dedicatoria debe ser una cadena de texto' })
  @IsOptional()
  dedication?: string;

  @IsString({ message: 'La pista secreta debe ser una cadena de texto' })
  @IsOptional()
  secretHint?: string;

  @IsString({ message: 'La variante seleccionada inicial debe ser una cadena de texto' })
  @IsOptional()
  selectedVariant?: string;
}
