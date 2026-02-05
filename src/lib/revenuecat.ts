import { Purchases } from '@revenuecat/purchases-js';

// RevenueCat Configuration
export const REVENUECAT_API_KEY = 'test_cAUcnvXzumOxjgZLEENCOdYexAI';
export const ENTITLEMENT_ID = 'Journaling';
export const PRODUCT_ID = 'prod53efac0b7a';

// Singleton instance
let purchasesInstance: Purchases | null = null;
let isConfigured = false;

 /**
  * Generate or retrieve a unique anonymous user ID
  */
 function getOrCreateAnonymousUserId(): string {
   const STORAGE_KEY = 'rc_anonymous_user_id';
   let userId = localStorage.getItem(STORAGE_KEY);
   
   if (!userId) {
     // Generate a unique ID
     userId = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
     localStorage.setItem(STORAGE_KEY, userId);
   }
   
   return userId;
 }
 
 /**
  * Initialize RevenueCat SDK
  * Call this once when the app starts
  */
 export async function initializeRevenueCat(appUserId?: string): Promise<Purchases> {
   if (isConfigured && purchasesInstance) {
     return purchasesInstance;
   }
 
   try {
     // Use provided user ID or generate anonymous one
     const userId = appUserId || getOrCreateAnonymousUserId();
     
     // Configure with API key and user ID
     purchasesInstance = await Purchases.configure(
       REVENUECAT_API_KEY,
       userId
     );
     isConfigured = true;
     console.log('RevenueCat initialized successfully with user:', userId);
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
