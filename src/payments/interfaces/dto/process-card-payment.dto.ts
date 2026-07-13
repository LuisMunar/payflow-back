import { Type } from 'class-transformer';
import {
  IsInt,
  IsString,
  Length,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class CardPaymentDto {
  @IsString()
  @Matches(/^\d{13,19}$/)
  number: string;

  @IsString()
  @Matches(/^(0[1-9]|1[0-2])$/)
  expMonth: string;

  @IsString()
  @Matches(/^\d{2}$/)
  expYear: string;

  @IsString()
  @Matches(/^\d{3,4}$/)
  cvc: string;

  @IsString()
  @Length(5, 80)
  cardHolder: string;
}

export class ProcessCardPaymentDto {
  @ValidateNested()
  @Type(() => CardPaymentDto)
  card: CardPaymentDto;

  @IsInt()
  @Min(1)
  @Max(36)
  installments: number;
}
