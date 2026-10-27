import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsPositive,
  IsIn,
} from 'class-validator';
import { PaymentStatus } from '../../common/types/gift.types';

export class SimulateCheckoutDto {
  @IsString({ message: 'El giftOrderId debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El giftOrderId es obligatorio' })
  giftOrderId: string;

  @IsString({ message: 'El nombre del pagador debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El payerName es obligatorio' })
  payerName: string;

  @IsNumber({}, { message: 'El monto en COP debe ser un número' })
  @IsPositive({ message: 'El monto en COP debe ser mayor a 0' })
  amountCop: number;

  @IsIn(['APPROVED', 'PENDING', 'REJECTED'], {
    message: 'El resultado simulado debe ser APPROVED, PENDING o REJECTED',
  })
  @IsNotEmpty({ message: 'simulationOutcome es obligatorio' })
  simulationOutcome: PaymentStatus;
}
