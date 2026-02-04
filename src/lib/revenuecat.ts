import { Purchases } from '@revenuecat/purchases-js';

// RevenueCat Configuration
export const REVENUECAT_API_KEY = 'test_cAUcnvXzumOxjgZLEENCOdYexAI';
export const ENTITLEMENT_ID = 'Journaling';
export const PRODUCT_ID = 'lifetime';

// Singleton instance
let purchasesInstance: Purchases | null = null;
let isConfigured = false;

/**
 * Initialize RevenueCat SDK
 * Call this once when the app starts
 */
export async function initializeRevenueCat(appUserId?: string): Promise<Purchases> {
  if (isConfigured && purchasesInstance) {
    return purchasesInstance;
  }

  try {
    // Configure with API key and optional user ID
    purchasesInstance = await Purchases.configure(
      REVENUECAT_API_KEY,
      appUserId || undefined
    );
    isConfigured = true;
    console.log('RevenueCat initialized successfully');
    return purchasesInstance;
  } catch (error) {
    console.error('Failed to initialize RevenueCat:', error);
    throw error;
  }
}

/**
 * Get the RevenueCat Purchases instance
 * Throws if not initialized
 */
export function getPurchases(): Purchases {
  if (!purchasesInstance) {
    throw new Error('RevenueCat not initialized. Call initializeRevenueCat first.');
  }
  return purchasesInstance;
}

/**
 * Check if RevenueCat is initialized
 */
export function isRevenueCatInitialized(): boolean {
  return isConfigured && purchasesInstance !== null;
}

/**
 * Change the current user (for login/logout)
 */
export async function changeUser(newAppUserId: string): Promise<void> {
  const purchases = getPurchases();
  await purchases.changeUser(newAppUserId);
  console.log('RevenueCat user changed to:', newAppUserId);
}

/**
 * Log out the current user (switch to anonymous)
 */
export async function logOutUser(): Promise<void> {
  // For web SDK, we re-configure with no user ID
  isConfigured = false;
  purchasesInstance = null;
  await initializeRevenueCat();
}
