import { IsOptional, IsString, Length, Matches, MaxLength } from 'class-validator';

export class CustomerPasscodeSignupDto {
  @IsString()
  @Matches(/^[0-9]{10}$/)
  phone!: string;

  @IsString()
  @Length(1, 5)
  countryCode!: string;

  @IsString()
  @Matches(/^\d{6}$/)
  passcode!: string;

  @IsString()
  @Matches(/^\d{6}$/)
  confirmPasscode!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  fullName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  profession?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  deliveryAddress?: string;
}
