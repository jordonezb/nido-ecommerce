import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class GiftAssistantDto {
  @IsString({ message: 'El receiverId debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El receiverId es obligatorio' })
  receiverId: string;

  @IsString({ message: 'El mainProductId debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El mainProductId es obligatorio' })
  mainProductId: string;

  @IsString({ message: 'La ocasión debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La ocasión es obligatoria' })
  occasion: string;

  @IsString({ message: 'El tono debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El tono es obligatorio' })
  tone: string;

  @IsString({ message: 'El nombre de quien regala es obligatorio' })
  @IsNotEmpty({ message: 'El senderName es obligatorio' })
  senderName: string;
}

export interface GiftAssistantResponse {
  dedication: string;
  secretHint: string;
  recommendedCapsuleIds: string[];
  provider: 'gemini' | 'deterministic-engine';
}
