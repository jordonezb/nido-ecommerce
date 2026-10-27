import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class LiveStatusDto {
  @IsString({ message: 'El estado en vivo debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El estado en vivo es obligatorio' })
  status: string; // ej: 'UNBOXING_LIVE', 'SCRATCHING', 'CHOOSING_VARIANT'

  @IsString({ message: 'La acción debe ser una cadena de texto' })
  @IsOptional()
  action?: string;

  @IsString({ message: 'El mensaje contextual debe ser una cadena de texto' })
  @IsOptional()
  message?: string;
}
