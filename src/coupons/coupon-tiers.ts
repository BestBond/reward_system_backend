/**
 * Allowed coupon point tiers for generation.
 * Keep in sync with:
 * - reward-system-frontend/src/constants/couponTiers.ts
 * - BestBond/src/constants/couponTiers.ts
 */
export const ALLOWED_COUPON_POINTS = [10, 20, 30, 40, 50, 100] as const;

export type AllowedCouponPoints = (typeof ALLOWED_COUPON_POINTS)[number];

export type CouponTierGradientStop = { offset: string; color: string };

export type CouponTierTheme = {
  points: AllowedCouponPoints | null;
  label: string;
  /** Solid fill or url(#tierGrad_*) for left panel and pill */
  panelFill: string;
  pillFill: string;
  pillStroke: string;
  pillStrokeWidth: number;
  /** When set, emit linearGradient defs for left + pill */
  gradient?: {
    idSuffix: string;
    stops: CouponTierGradientStop[];
  };
};

const TIER_THEMES: Record<AllowedCouponPoints, CouponTierTheme> = {
  10: {
    points: 10,
    label: '10 Points',
    panelFill: '#FFFFFF',
    pillFill: '#FFFFFF',
    pillStroke: '#9CA3AF',
    pillStrokeWidth: 2,
  },
  20: {
    points: 20,
    label: '20 Points',
    panelFill: '#F5F0E6',
    pillFill: '#F5F0E6',
    pillStroke: '#C9A227',
    pillStrokeWidth: 2,
  },
  30: {
    points: 30,
    label: '30 Points',
    panelFill: '#D4F0E4',
    pillFill: '#D4F0E4',
    pillStroke: '#2D6A4F',
    pillStrokeWidth: 2,
  },
  40: {
    points: 40,
    label: '40 Points',
    panelFill: 'url(#tierGrad_panel)',
    pillFill: 'url(#tierGrad_pill)',
    pillStroke: '#B8860B',
    pillStrokeWidth: 2,
    gradient: {
      idSuffix: 'bronze',
      stops: [
        { offset: '0%', color: '#E8B88A' },
        { offset: '50%', color: '#CD7F32' },
        { offset: '100%', color: '#A0522D' },
      ],
    },
  },
  50: {
    points: 50,
    label: '50 Points',
    panelFill: 'url(#tierGrad_panel)',
    pillFill: 'url(#tierGrad_pill)',
    pillStroke: '#6B7280',
    pillStrokeWidth: 2,
    gradient: {
      idSuffix: 'silver',
      stops: [
        { offset: '0%', color: '#F3F4F6' },
        { offset: '50%', color: '#C0C0C0' },
        { offset: '100%', color: '#9CA3AF' },
      ],
    },
  },
  100: {
    points: 100,
    label: '100 Points',
    panelFill: 'url(#tierGrad_panel)',
    pillFill: 'url(#tierGrad_pill)',
    pillStroke: '#B8860B',
    pillStrokeWidth: 2,
    gradient: {
      idSuffix: 'gold',
      stops: [
        { offset: '0%', color: '#FFE566' },
        { offset: '50%', color: '#FFD700' },
        { offset: '100%', color: '#DAA520' },
      ],
    },
  },
};

const LEGACY_FALLBACK: CouponTierTheme = {
  points: null,
  label: 'Coupon',
  panelFill: '#FFFFFF',
  pillFill: '#FFFFFF',
  pillStroke: '#9CA3AF',
  pillStrokeWidth: 2,
};

export function isAllowedCouponPoints(n: number): n is AllowedCouponPoints {
  return (ALLOWED_COUPON_POINTS as readonly number[]).includes(n);
}

export function getCouponTierTheme(points: number): CouponTierTheme {
  if (isAllowedCouponPoints(points)) {
    return TIER_THEMES[points];
  }
  return LEGACY_FALLBACK;
}

export function getCouponTierOptions(): Array<{
  value: AllowedCouponPoints;
  label: string;
}> {
  return ALLOWED_COUPON_POINTS.map((value) => ({
    value,
    label: TIER_THEMES[value].label,
  }));
}
