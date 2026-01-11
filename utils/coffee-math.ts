export type BrewingAdjustments = {
  bloomTimeAdjustment: number; // seconds
  tempAdjustment: number; // degrees Celsius
  advice: string;
};

/**
 * Calculates total water based on coffee grounds and ratio.
 * Formula: W_total = G * Ratio
 */
export function calculateTotalWater(grams: number, ratio: number): number {
  return grams * ratio;
}

/**
 * Calculates water adjustment for a specific step (e.g. 15% Bloom).
 */
export function calculateStepWater(totalWater: number, percentage: number): number {
  return totalWater * (percentage / 100);
}

/**
 * Calculates aging adjustments based on days since roast.
 * D <= 6: Bloom +15s, Temp -1°C (Too fresh, needs off-gassing)
 * D >= 22: Bloom -5s, Temp +2°C (Aged, needs higher extraction)
 */
/**
 * Calculates aging adjustments based on days since roast and roast level.
 * Implements Scientific Aging Matrix.
 */
export function getAgingAdjustments(roastDate: Date, roastLevel: string = 'Medium'): BrewingAdjustments {
  const today = new Date();
  const oneDay = 1000 * 60 * 60 * 24;
  const daysSinceRoast = Math.floor(
    (today.getTime() - roastDate.getTime()) / oneDay
  );

  let adjustments: BrewingAdjustments = {
    bloomTimeAdjustment: 0,
    tempAdjustment: 0,
    advice: "エイジング適正範囲内（Peak）。標準抽出変数を適用します。",
  };

  const level = roastLevel.toLowerCase();

  // Matrix Logic
  if (level === 'light' || level === '浅煎り') {
    if (daysSinceRoast <= 10) {
      // Light Fresh (0-10d)
      adjustments.bloomTimeAdjustment = 20;
      adjustments.advice = `[Light/Fresh] ガス放出過多（${daysSinceRoast}日）。蒸らしを+20秒延長し、十分な脱ガスを行います。`;
    } else if (daysSinceRoast >= 26) {
      // Light Late (26d+)
      adjustments.tempAdjustment = 2;
      adjustments.advice = `[Light/Aged] 酸化リスク（${daysSinceRoast}日）。湯温を+2°C上げ、抽出効率を高めます。`;
    } else {
      adjustments.advice = `[Light/Peak] 飲み頃です（${daysSinceRoast}日）。標準レシピでフレーバーを最大化できます。`;
    }
  } else if (level === 'dark' || level === '深煎り') {
    if (daysSinceRoast <= 3) {
      // Dark Fresh (0-3d)
      adjustments.bloomTimeAdjustment = 10;
      adjustments.tempAdjustment = -3;
      adjustments.advice = `[Dark/Fresh] 極めてガスが多い状態（${daysSinceRoast}日）。蒸らし+10秒、湯温-3°Cで刺激味を抑制します。`;
    } else if (daysSinceRoast >= 15) {
      // Dark Late (15d+)
      adjustments.tempAdjustment = 2;
      adjustments.advice = `[Dark/Aged] 酸化リスク（${daysSinceRoast}日）。湯温+2°Cでボディ感を補強します。`;
    } else {
      adjustments.advice = `[Dark/Peak] 飲み頃です（${daysSinceRoast}日）。標準レシピでコクと甘みを楽しめます。`;
    }
  } else {
    // Medium (Default)
    if (daysSinceRoast <= 6) {
      // Medium Fresh (0-6d)
      adjustments.bloomTimeAdjustment = 15;
      adjustments.advice = `[Medium/Fresh] ガス放出過多（${daysSinceRoast}日）。蒸らしを+15秒延長します。`;
    } else if (daysSinceRoast >= 22) {
      // Medium Late (22d+)
      adjustments.tempAdjustment = 2;
      adjustments.advice = `[Medium/Aged] 酸化リスク（${daysSinceRoast}日）。湯温+2°Cで抽出効率を改善します。`;
    } else {
      adjustments.advice = `[Medium/Peak] 飲み頃です（${daysSinceRoast}日）。バランスの良い標準レシピが最適です。`;
    }
  }

  return adjustments;
}
