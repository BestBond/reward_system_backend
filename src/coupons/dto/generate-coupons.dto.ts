import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ALLOWED_COUPON_POINTS } from '../coupon-tiers';

export class GenerateCouponsDto {
  /**
   * Display title for transaction history, e.g. "Scanned 50kg Cement"
   */
  @IsString()
  title!: string;

  @IsInt()
  @IsIn([...ALLOWED_COUPON_POINTS])
  points!: number;

  @IsInt()
  @Min(1)
  @Max(10000)
  quantity!: number;

  @IsOptional()
  @IsString()
  site?: string;

  /**
   * Optional ISO date string
   */
  @IsOptional()
  @IsString()
  expiresAt?: string;
}
