// app/utils/permissions.server.js

export const PLANS = {
  FREE: "FREE",
  BASIC: "BASIC",
  PREMIUM: "PREMIUM",
};

export const TEMPLATE_PERMISSIONS = {
  "template-1": PLANS.FREE,    // Clean Announcement
  "template-2": PLANS.BASIC,   // Modern Promo
  "template-3": PLANS.BASIC,   // Double Message
  "template-4": PLANS.BASIC,   // Minimal Store
  "template-5": PLANS.PREMIUM, // Gradient Flow
  "template-6": PLANS.PREMIUM, // Luxury Motion
  "template-7": PLANS.PREMIUM, // Promo + CTA
  "template-8": PLANS.PREMIUM, // Advanced Marquee
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
  return 1; // Free plan gets 1 active banner
}
