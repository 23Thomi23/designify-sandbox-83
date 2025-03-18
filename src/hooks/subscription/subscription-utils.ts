
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
  switch (planName) {
    case "Business":
      return "https://buy.stripe.com/14k2bVglj6pf3m0bIL";
    case "Basic":
      return "https://buy.stripe.com/dR68Aj7ON14V1dSfZ0";
    case "Professional":
      return "https://buy.stripe.com/dR6aIrc5328Z09O5kl";
    default:
      return null;
  }
};
