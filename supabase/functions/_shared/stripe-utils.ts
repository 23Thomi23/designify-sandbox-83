
import Stripe from 'https://esm.sh/stripe@14.5.0?target=deno'

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

export const initializeStripe = (secretKey: string) => {
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not set')
  }

  return new Stripe(secretKey, {
    apiVersion: '2023-10-16',
    httpClient: Stripe.createFetchHttpClient(),
  })
}

// Map plan names to Stripe price IDs
export const PLAN_PRICE_MAP: Record<string, string> = {
  // Free plan - should be $0
  'free': 'price_1P2nW5Gy89EHd6dDUEvQ62Kl',
  
  // Paid plans
  'basic': 'price_1R4nE5Gjhg0xshREbP6LcuYK',  // Updated Basic plan price ID
  'business': 'price_1R4nFpGjhg0xshREqOyu5upT',  // Updated Business plan price ID
  
  // Pay per image packs
  'payperimage': 'price_1R4n9pGjhg0xshRE0S2KYoqU',  // Updated Pay per image price ID
  
  // Default fallback - use the basic plan if no match found
  'default': 'price_1R4nE5Gjhg0xshREbP6LcuYK'  // Updated default to new Basic plan price ID
}
