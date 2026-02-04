import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEYS = {
  TOTAL_QUESTIONS_VIEWED: 'iap_total_questions_viewed',
  SESSION_BONUS_APPLIED: 'iap_session_bonus_applied',
  IS_UNLOCKED: 'iap_is_unlocked',
};

const FREE_QUESTIONS_LIMIT = 10;
const SESSION_BONUS_QUESTIONS = 3;

interface NativelyPurchasesResponse {
  status: 'SUCCESS' | 'ERROR' | 'CANCELLED';
  transactionId?: string;
  error?: string;
}

interface NativelyPackage {
  identifier: string;
  priceString: string;
  price: number;
  currencyCode: string;
  localizedTitle?: string;
  localizedDescription?: string;
}

interface NativelyOfferingsResponse {
  status: 'SUCCESS' | 'ERROR';
  offerings?: {
    current?: {
      availablePackages?: NativelyPackage[];
    };
  };
  error?: string;
}

declare global {
  interface Window {
    NativelyPurchases?: new () => {
      purchasePackage: (packageId: string, callback: (resp: NativelyPurchasesResponse) => void) => void;
      restorePurchases: (callback: (resp: NativelyPurchasesResponse & { entitlements?: string[] }) => void) => void;
      getOfferings: (callback: (resp: NativelyOfferingsResponse) => void) => void;
    };
  }
}

export function useInAppPurchase(productId: string) {
  const [questionsViewed, setQuestionsViewed] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [priceString, setPriceString] = useState<string | null>(null);
  const [isLoadingPrice, setIsLoadingPrice] = useState(true);
  const [sessionBonusApplied, setSessionBonusApplied] = useState(false);

  // Fetch price from store
  useEffect(() => {
    if (!window.NativelyPurchases) {
      // Web mode - no real price available
      setIsLoadingPrice(false);
      return;
    }

    const purchases = new window.NativelyPurchases();
    purchases.getOfferings((resp) => {
      setIsLoadingPrice(false);
      if (resp.status === 'SUCCESS' && resp.offerings?.current?.availablePackages) {
        const pkg = resp.offerings.current.availablePackages.find(
          p => p.identifier === productId
        );
        if (pkg) {
          setPriceString(pkg.priceString);
        }
      }
    });
  }, [productId]);

  // Initialize state from localStorage
  useEffect(() => {
    const storedUnlocked = localStorage.getItem(STORAGE_KEYS.IS_UNLOCKED);
    if (storedUnlocked === 'true') {
      setIsUnlocked(true);
      return;
    }

    const storedTotal = localStorage.getItem(STORAGE_KEYS.TOTAL_QUESTIONS_VIEWED);
    const currentTotal = storedTotal ? parseInt(storedTotal, 10) : 0;
    
    // Check if session bonus was already applied this session
    const bonusApplied = sessionStorage.getItem(STORAGE_KEYS.SESSION_BONUS_APPLIED);
    
    if (!bonusApplied && currentTotal > 0) {
      // Apply session bonus: reduce count by 3 (but not below 0)
      const newTotal = Math.max(0, currentTotal - SESSION_BONUS_QUESTIONS);
      localStorage.setItem(STORAGE_KEYS.TOTAL_QUESTIONS_VIEWED, newTotal.toString());
      sessionStorage.setItem(STORAGE_KEYS.SESSION_BONUS_APPLIED, 'true');
      setQuestionsViewed(newTotal);
      setSessionBonusApplied(true);
    } else {
      setQuestionsViewed(currentTotal);
      if (bonusApplied) {
        setSessionBonusApplied(true);
      }
    }
  }, []);

  // Increment question count when viewing a new question
  const incrementQuestionCount = useCallback(() => {
    if (isUnlocked) return true;

    setQuestionsViewed(prev => {
      const newCount = prev + 1;
      localStorage.setItem(STORAGE_KEYS.TOTAL_QUESTIONS_VIEWED, newCount.toString());
      
      if (newCount > FREE_QUESTIONS_LIMIT) {
        setShowPaywall(true);
        return prev; // Don't increment past limit
      }
      
      return newCount;
    });

    return questionsViewed < FREE_QUESTIONS_LIMIT;
  }, [isUnlocked, questionsViewed]);

  // Check if user can view more questions
  const canViewQuestion = useCallback(() => {
    if (isUnlocked) return true;
    return questionsViewed < FREE_QUESTIONS_LIMIT;
  }, [isUnlocked, questionsViewed]);

  // Get remaining free questions
  const remainingFreeQuestions = isUnlocked 
    ? Infinity 
    : Math.max(0, FREE_QUESTIONS_LIMIT - questionsViewed);

  // Purchase the full app
  const purchaseFullApp = useCallback(async (): Promise<boolean> => {
    if (!window.NativelyPurchases) {
      console.warn('NativelyPurchases not available - running in web mode');
      // For web testing, simulate successful purchase
      setIsUnlocked(true);
      localStorage.setItem(STORAGE_KEYS.IS_UNLOCKED, 'true');
      setShowPaywall(false);
      return true;
    }

    setIsPurchasing(true);

    return new Promise((resolve) => {
      const purchases = new window.NativelyPurchases!();
      
      purchases.purchasePackage(productId, (resp) => {
        setIsPurchasing(false);
        
        if (resp.status === 'SUCCESS') {
          setIsUnlocked(true);
          localStorage.setItem(STORAGE_KEYS.IS_UNLOCKED, 'true');
          setShowPaywall(false);
          resolve(true);
        } else {
          console.error('Purchase failed:', resp.error);
          resolve(false);
        }
      });
    });
  }, [productId]);

  // Restore purchases
  const restorePurchases = useCallback(async (): Promise<boolean> => {
    if (!window.NativelyPurchases) {
      console.warn('NativelyPurchases not available');
      return false;
    }

    setIsPurchasing(true);

    return new Promise((resolve) => {
      const purchases = new window.NativelyPurchases!();
      
      purchases.restorePurchases((resp) => {
        setIsPurchasing(false);
        
        if (resp.status === 'SUCCESS' && resp.entitlements && resp.entitlements.length > 0) {
          setIsUnlocked(true);
          localStorage.setItem(STORAGE_KEYS.IS_UNLOCKED, 'true');
          setShowPaywall(false);
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }, []);

  // Dismiss paywall
  const dismissPaywall = useCallback(() => {
    setShowPaywall(false);
  }, []);

  return {
    questionsViewed,
    isUnlocked,
    showPaywall,
    isPurchasing,
    remainingFreeQuestions,
    priceString,
    isLoadingPrice,
    incrementQuestionCount,
    canViewQuestion,
    purchaseFullApp,
    restorePurchases,
    dismissPaywall,
    setShowPaywall,
  };
}
