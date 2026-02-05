import { useState, useEffect, useCallback } from 'react';
import type { CustomerInfo, Offerings, Package } from '@revenuecat/purchases-js';
import { 
  initializeRevenueCat, 
  getPurchases, 
  isRevenueCatInitialized,
  ENTITLEMENT_ID 
} from '@/lib/revenuecat';

// Check if running inside BuildNatively native app
function isNativeApp(): boolean {
  return typeof window !== 'undefined' && (
    !!(window as any).NativelyPurchases ||
    !!(window as any).natively ||
    !!(window as any).webkit?.messageHandlers?.natively
  );
}

// Local storage keys for persistence
const STORAGE_KEYS = {
  QUESTIONS_VIEWED: 'rc_questions_viewed',
  SESSION_BONUS_APPLIED: 'rc_session_bonus_applied',
};

const FREE_QUESTIONS_LIMIT = 10;
const SESSION_BONUS_QUESTIONS = 3;

interface UseRevenueCatReturn {
  // State
  isInitialized: boolean;
  isLoading: boolean;
  isEntitled: boolean;
  customerInfo: CustomerInfo | null;
  offerings: Offerings | null;
  currentPackage: Package | null;
  priceString: string | null;
  error: string | null;
  
  // Paywall state
  showPaywall: boolean;
  isPurchasing: boolean;
  
  // Question tracking
  questionsViewed: number;
  remainingFreeQuestions: number;
  
  // Actions
  checkEntitlement: () => Promise<boolean>;
  purchase: () => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  presentPaywall: (targetElement: HTMLElement) => Promise<void>;
  dismissPaywall: () => void;
  setShowPaywall: (show: boolean) => void;
  incrementQuestionCount: () => boolean;
  getManagementUrl: () => string | null;
  refreshCustomerInfo: () => Promise<void>;
}

export function useRevenueCat(appUserId?: string): UseRevenueCatReturn {
  // Core state
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEntitled, setIsEntitled] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [offerings, setOfferings] = useState<Offerings | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Paywall state
  const [showPaywall, setShowPaywall] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  
  // Question tracking
  const [questionsViewed, setQuestionsViewed] = useState(0);

  // Derived state
  const currentPackage = offerings?.current?.availablePackages?.[0] || null;
  const priceString = currentPackage?.rcBillingProduct?.currentPrice?.formattedPrice || null;
  const remainingFreeQuestions = isEntitled 
    ? Infinity 
    : Math.max(0, FREE_QUESTIONS_LIMIT - questionsViewed);

  // Only enable paywall functionality for native app
  const isInNativeApp = isNativeApp();

  // Initialize RevenueCat and load initial data
  useEffect(() => {
    let mounted = true;

    async function init() {
      // Skip RevenueCat initialization if not in native app
      if (!isInNativeApp) {
        setIsLoading(false);
        setIsEntitled(true); // Grant full access on web
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Initialize SDK
        await initializeRevenueCat(appUserId);
        
        if (!mounted) return;
        setIsInitialized(true);

        // Fetch customer info and offerings in parallel
        const purchases = getPurchases();
        const [info, offers] = await Promise.all([
          purchases.getCustomerInfo(),
          purchases.getOfferings(),
        ]);

        console.log('RevenueCat Customer Info:', info);
        console.log('RevenueCat Offerings:', offers);
        console.log('Current Offering:', offers?.current);
        console.log('Available Packages:', offers?.current?.availablePackages);

        if (!mounted) return;

        setCustomerInfo(info);
        setOfferings(offers);

        // Check entitlement
        const hasEntitlement = ENTITLEMENT_ID in (info.entitlements.active || {});
        setIsEntitled(hasEntitlement);

        // Initialize question count from storage (only if not entitled)
        if (!hasEntitlement) {
          initializeQuestionCount();
        }

      } catch (err) {
        console.error('RevenueCat initialization error:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to initialize');
          // Still initialize question count for offline functionality
          initializeQuestionCount();
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    function initializeQuestionCount() {
      const storedCount = localStorage.getItem(STORAGE_KEYS.QUESTIONS_VIEWED);
      const currentCount = storedCount ? parseInt(storedCount, 10) : 0;
      
      // Apply session bonus (reduce count by 3 on each app restart)
      const bonusApplied = sessionStorage.getItem(STORAGE_KEYS.SESSION_BONUS_APPLIED);
      
      if (!bonusApplied && currentCount > 0) {
        const newCount = Math.max(0, currentCount - SESSION_BONUS_QUESTIONS);
        localStorage.setItem(STORAGE_KEYS.QUESTIONS_VIEWED, newCount.toString());
        sessionStorage.setItem(STORAGE_KEYS.SESSION_BONUS_APPLIED, 'true');
        setQuestionsViewed(newCount);
      } else {
        setQuestionsViewed(currentCount);
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, [appUserId]);

  // Check entitlement
  const checkEntitlement = useCallback(async (): Promise<boolean> => {
    if (!isRevenueCatInitialized()) return false;

    try {
      const purchases = getPurchases();
      const info = await purchases.getCustomerInfo();
      setCustomerInfo(info);
      
      const hasEntitlement = ENTITLEMENT_ID in (info.entitlements.active || {});
      setIsEntitled(hasEntitlement);
      
      return hasEntitlement;
    } catch (err) {
      console.error('Failed to check entitlement:', err);
      return false;
    }
  }, []);

  // Refresh customer info
  const refreshCustomerInfo = useCallback(async (): Promise<void> => {
    if (!isRevenueCatInitialized()) return;

    try {
      const purchases = getPurchases();
      const info = await purchases.getCustomerInfo();
      setCustomerInfo(info);
      
      const hasEntitlement = ENTITLEMENT_ID in (info.entitlements.active || {});
      setIsEntitled(hasEntitlement);
    } catch (err) {
      console.error('Failed to refresh customer info:', err);
    }
  }, []);

  // Purchase the lifetime product
  const purchase = useCallback(async (): Promise<boolean> => {
    if (!isRevenueCatInitialized() || !currentPackage) {
      console.error('Cannot purchase: not initialized or no package available');
      return false;
    }

    setIsPurchasing(true);
    setError(null);

    try {
      const purchases = getPurchases();
      const result = await purchases.purchase({ rcPackage: currentPackage });
      
      // Update customer info after purchase
      setCustomerInfo(result.customerInfo);
      
      // Check if now entitled
      const hasEntitlement = ENTITLEMENT_ID in (result.customerInfo.entitlements.active || {});
      setIsEntitled(hasEntitlement);
      
      if (hasEntitlement) {
        setShowPaywall(false);
      }
      
      return hasEntitlement;
    } catch (err) {
      console.error('Purchase failed:', err);
      setError(err instanceof Error ? err.message : 'Purchase failed');
      return false;
    } finally {
      setIsPurchasing(false);
    }
  }, [currentPackage]);

  // Present RevenueCat hosted paywall
  const presentPaywall = useCallback(async (targetElement: HTMLElement): Promise<void> => {
    if (!isRevenueCatInitialized()) {
      throw new Error('RevenueCat not initialized');
    }

    try {
      const purchases = getPurchases();
      const result = await purchases.presentPaywall({
        htmlTarget: targetElement,
        offering: offerings?.current || undefined,
      });
      
      // Update state after paywall closes
      if (result.customerInfo) {
        setCustomerInfo(result.customerInfo);
        const hasEntitlement = ENTITLEMENT_ID in (result.customerInfo.entitlements.active || {});
        setIsEntitled(hasEntitlement);
      }
    } catch (err) {
      console.error('Paywall presentation failed:', err);
      throw err;
    }
  }, [offerings]);

  // Dismiss paywall
  const dismissPaywall = useCallback(() => {
    setShowPaywall(false);
  }, []);

  // Increment question count
  const incrementQuestionCount = useCallback((): boolean => {
    // Always allow on web (non-native)
    if (!isInNativeApp || isEntitled) return true;

    const newCount = questionsViewed + 1;
    
    if (newCount > FREE_QUESTIONS_LIMIT) {
      setShowPaywall(true);
      return false;
    }
    
    setQuestionsViewed(newCount);
    localStorage.setItem(STORAGE_KEYS.QUESTIONS_VIEWED, newCount.toString());
    return true;
  }, [isInNativeApp, isEntitled, questionsViewed]);

  // Get subscription management URL
  const getManagementUrl = useCallback((): string | null => {
    return customerInfo?.managementURL || null;
  }, [customerInfo]);

  // Restore purchases (on web, this is just refreshing customer info)
  const restorePurchases = useCallback(async (): Promise<boolean> => {
    if (!isRevenueCatInitialized()) return false;

    try {
      const purchases = getPurchases();
      const info = await purchases.getCustomerInfo();
      setCustomerInfo(info);
      
      const hasEntitlement = ENTITLEMENT_ID in (info.entitlements.active || {});
      setIsEntitled(hasEntitlement);
      
      if (hasEntitlement) {
        setShowPaywall(false);
      }
      
      return hasEntitlement;
    } catch (err) {
      console.error('Failed to restore purchases:', err);
      return false;
    }
  }, []);

  return {
    // State
    isInitialized,
    isLoading,
    isEntitled,
    customerInfo,
    offerings,
    currentPackage,
    priceString,
    error,
    
    // Paywall state
    showPaywall,
    isPurchasing,
    
    // Question tracking
    questionsViewed,
    remainingFreeQuestions,
    
    // Actions
    checkEntitlement,
    purchase,
    restorePurchases,
    presentPaywall,
    dismissPaywall,
    setShowPaywall,
    incrementQuestionCount,
    getManagementUrl,
    refreshCustomerInfo,
  };
}
