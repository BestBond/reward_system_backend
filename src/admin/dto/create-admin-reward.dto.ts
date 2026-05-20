import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import type { GiftTier } from '../../rewards/entities/reward.entity';

export class CreateAdminRewardDto {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsInt()
  @Min(1)
  pointsCost!: number;

  @IsIn(['WORKER', 'CONTRACTOR'])
  giftTier!: GiftTier;

  @IsOptional()
  @IsString()
  imageUrl?: string | null;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
