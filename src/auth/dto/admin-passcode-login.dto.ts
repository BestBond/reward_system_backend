import { IsString, Length, Matches } from 'class-validator';

export class AdminPasscodeLoginDto {
  @IsString()
  @Matches(/^[0-9]{10}$/)
  phone!: string;

  @IsString()
  @Length(1, 5)
  countryCode!: string;

  @IsString()
  @Matches(/^\d{6}$/)
  passcode!: string;
}
