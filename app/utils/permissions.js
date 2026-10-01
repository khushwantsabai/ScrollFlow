// app/utils/permissions.js

export const PLANS = {
  FREE: "FREE",
  BASIC: "BASIC",
  PREMIUM: "PREMIUM",
};

export const TEMPLATE_PERMISSIONS = {
  "template-1": PLANS.FREE,    // Cyan Neon Glow
  "template-2": PLANS.FREE,    // Minimal Monochrome
  "template-3": PLANS.FREE,    // Sunset Coral Flash
  "template-4": PLANS.BASIC,   // Crimson Fire Sale
  "template-5": PLANS.BASIC,   // Ocean Breeze Navy
  "template-6": PLANS.BASIC,   // Emerald Eco Organic
  "template-7": PLANS.BASIC,   // Electric Violet Spark
  "template-8": PLANS.PREMIUM, // Aurora Cyber Gradient
  "template-9": PLANS.PREMIUM, // Obsidian Gold Luxury
  "template-10": PLANS.PREMIUM,// Emerald Gold VIP
  "template-11": PLANS.PREMIUM,// Rose Gold Elegance
  "template-12": PLANS.PREMIUM,// Midnight Pulsar Glow
};

export function canAccessTemplate(currentPlan = PLANS.BASIC, templateId) {
  const requiredPlan = TEMPLATE_PERMISSIONS[templateId] || PLANS.FREE;
  if (currentPlan === PLANS.PREMIUM) return true;
  if (currentPlan === PLANS.BASIC) {
    return requiredPlan === PLANS.FREE || requiredPlan === PLANS.BASIC;
  }
  return requiredPlan === PLANS.FREE;
}

export function canUseFeature(currentPlan = PLANS.BASIC, featureKey) {
  const planOrder = { [PLANS.FREE]: 1, [PLANS.BASIC]: 2, [PLANS.PREMIUM]: 3 };
  const featureRequirements = {
    multipleMessages: PLANS.BASIC,
    dividersAndIcons: PLANS.BASIC,
    advancedTypography: PLANS.BASIC,
    ctaButton: PLANS.PREMIUM,
    gradientBackground: PLANS.PREMIUM,
    advancedAnimations: PLANS.PREMIUM,
  };

  const requiredPlan = featureRequirements[featureKey] || PLANS.FREE;
  return (planOrder[currentPlan] || 1) >= (planOrder[requiredPlan] || 1);
}

export function getMaxAllowedBanners(currentPlan = PLANS.BASIC) {
  if (currentPlan === PLANS.PREMIUM) return 50;
  if (currentPlan === PLANS.BASIC) return 10;
  return 1;
}
