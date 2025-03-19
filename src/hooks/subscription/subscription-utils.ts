
/**
 * Formats a date string to a readable format
 */
export const formatSubscriptionDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

/**
 * Gets the direct Stripe URL for specific plan names
 */
export const getDirectPlanUrl = (planName: string): string | null => {
  // Make case-insensitive comparison
  const normalizedName = planName.toLowerCase();
  
  if (normalizedName === "business") {
    return "https://buy.stripe.com/14k2bVglj6pf3m0bIL";
  } else if (normalizedName === "basic") {
    return "https://buy.stripe.com/dR68Aj7ON14V1dSfZ0";
  } else if (normalizedName === "professional") {
    return "https://buy.stripe.com/dR6aIrc5328Z09O5kl";
  } else if (normalizedName === "pay per image") {
    return "https://buy.stripe.com/5kA2bV0mldRHaOseUU";
  }
  
  return null;
};
