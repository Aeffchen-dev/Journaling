import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { toast } from '@/hooks/use-toast';

declare global {
  interface Window {
    NativelyPurchases: any;
  }
}

interface PaywallProps {
  open: boolean;
  onPurchaseSuccess: () => void;
}

export function Paywall({ open, onPurchaseSuccess }: PaywallProps) {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [price, setPrice] = useState<string | null>(null);

  const showError = (message: string) => {
    toast({
      description: message,
      variant: 'destructive',
    });
  };

  // Fetch price when paywall opens
  useEffect(() => {
    if (!open) return;

    const fetchPrice = async () => {
      try {
        if (typeof window.NativelyPurchases !== 'undefined') {
          console.log('🔧 NativelyPurchases exists, type:', typeof window.NativelyPurchases);
          const purchases = new window.NativelyPurchases();
          console.log('🔧 NativelyPurchases instance created, available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(purchases)));
          const packageId = '$rc_lifetime';
          console.log('🔧 Calling packagePrice with packageId:', packageId);
          try {
            purchases.packagePrice(packageId, (resp: any) => {
              console.log('💰 packagePrice response:', JSON.stringify(resp, null, 2));
              if (resp.status === 'SUCCESS' && resp.localized) {
                setPrice(resp.localized);
              } else {
                console.warn('💰 packagePrice non-success:', resp.status, resp.error || '');
              }
            });
          } catch (innerErr: any) {
            console.error('💰 packagePrice call threw:', innerErr?.message || innerErr, innerErr?.stack || '');
          }
        } else {
          console.log('🔧 NativelyPurchases not found, using web SDK');
          const { Purchases } = await import('@revenuecat/purchases-js');
          const userId = getOrCreateUserId();
          const purchases = Purchases.configure('appl_pmfaGQMjIIiPzVbbGpkjhccvWHm', userId);
          const offerings = await purchases.getOfferings();
          const pkg = offerings.current?.availablePackages?.[0];
          if (pkg?.rcBillingProduct?.currentPrice?.formattedPrice) {
            setPrice(pkg.rcBillingProduct.currentPrice.formattedPrice);
          }
        }
      } catch (e: any) {
        console.error('❌ Failed to fetch price:', e?.message || e, e?.stack || '');
      }
    };

    fetchPrice();
  }, [open]);

  const handlePurchase = async () => {
    setIsPurchasing(true);
    try {
      if (typeof window.NativelyPurchases !== 'undefined') {
        const purchases = new window.NativelyPurchases();
        const packageId = '$rc_lifetime';
        console.log('🛒 About to call purchasePackage with:', packageId);
        console.log('🛒 purchasePackage method exists:', typeof purchases.purchasePackage);

        try {
          purchases.purchasePackage(packageId, (resp: any) => {
            console.log('🛒 purchasePackage response:', JSON.stringify(resp, null, 2));
            if (resp.status === 'SUCCESS') {
              localStorage.setItem('journaling_premium', 'true');
              onPurchaseSuccess();
            } else if (resp.status === 'CANCELLED') {
              console.log('🛒 Purchase cancelled by user');
            } else {
              console.error('🛒 Purchase failed:', resp.status, resp.error || '');
              showError('Kauf fehlgeschlagen. Bitte versuche es erneut.');
            }
            setIsPurchasing(false);
          });
        } catch (innerErr: any) {
          console.error('🛒 purchasePackage call threw:', innerErr?.message || innerErr, innerErr?.stack || '');
          showError('Kauf fehlgeschlagen: ' + (innerErr?.message || 'Unbekannter Fehler'));
          setIsPurchasing(false);
        }
        return;
      } else {
        // Fallback: RevenueCat Web SDK
        const { Purchases } = await import('@revenuecat/purchases-js');
        const userId = getOrCreateUserId();
        const purchases = Purchases.configure('appl_pmfaGQMjIIiPzVbbGpkjhccvWHm', userId);

        const offerings = await purchases.getOfferings();
        const pkg = offerings.current?.availablePackages?.[0];

        if (!pkg) {
          showError('Kein Paket verfügbar. Bitte versuche es später erneut.');
          setIsPurchasing(false);
          return;
        }

        const { customerInfo } = await purchases.purchase({ rcPackage: pkg });

        if (customerInfo.entitlements.active['Journaling']) {
          localStorage.setItem('journaling_premium', 'true');
          onPurchaseSuccess();
        }
      }
    } catch (e: any) {
      if (e?.errorCode !== 1) {
        console.error('❌ Purchase error:', e?.message || e, e?.stack || '');
        showError('Kauf fehlgeschlagen. Bitte versuche es erneut.');
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      if (typeof window.NativelyPurchases !== 'undefined') {
        const purchases = new window.NativelyPurchases();
        console.log('🔄 About to call restore, method exists:', typeof purchases.restore);
        try {
          purchases.restore((resp: any) => {
            console.log('🔄 restore response:', JSON.stringify(resp, null, 2));
            if (resp.status === 'SUCCESS' && resp.customerId) {
              localStorage.setItem('journaling_premium', 'true');
              onPurchaseSuccess();
            } else {
              showError('Kein aktiver Kauf gefunden.');
            }
            setIsRestoring(false);
          });
        } catch (innerErr: any) {
          console.error('🔄 restore call threw:', innerErr?.message || innerErr, innerErr?.stack || '');
          showError('Wiederherstellung fehlgeschlagen: ' + (innerErr?.message || 'Unbekannter Fehler'));
          setIsRestoring(false);
        }
        return;
      } else {
        const { Purchases } = await import('@revenuecat/purchases-js');
        const userId = getOrCreateUserId();
        const purchases = Purchases.configure('appl_pmfaGQMjIIiPzVbbGpkjhccvWHm', userId);

        const customerInfo = await purchases.getCustomerInfo();

        if (customerInfo.entitlements.active['Journaling']) {
          localStorage.setItem('journaling_premium', 'true');
          onPurchaseSuccess();
        } else {
          showError('Kein aktiver Kauf gefunden.');
        }
      }
    } catch (e) {
      console.error('Restore error:', e);
      showError('Wiederherstellung fehlgeschlagen. Bitte versuche es erneut.');
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <Dialog open={open} modal={!isPurchasing}>
      <DialogPrimitive.Content
        className="fixed inset-0 z-50 flex flex-col items-center justify-center px-8"
        style={{
          backgroundColor: '#000000',
          pointerEvents: isPurchasing ? 'none' : 'auto',
        }}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">Vollversion</DialogTitle>
        <DialogDescription className="sr-only">Kaufe die Vollversion</DialogDescription>
        
        <div className="flex flex-col items-center text-center max-w-md w-full gap-6">
          <h2
            className="font-factora text-[1.5rem] md:text-[1.9rem] lg:text-[2.4rem] leading-[120%] text-center w-full"
            style={{
              fontWeight: 'bold',
              fontStyle: 'normal',
              color: '#ffffff',
              letterSpacing: '0px',
            }}
          >
            <span style={{ fontFeatureSettings: '"ss01" 1' }}>E</span>ntdecke alle Fragen
          </h2>

          <p
            style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.8)',
              lineHeight: 1.5,
            }}
          >
            Einmaliger Kauf. Kein Abo. Für immer Zugriff auf alle Fragen und zukünftige Updates.
          </p>

          <Button
            onClick={handlePurchase}
            disabled={isPurchasing || isRestoring}
            className="w-full rounded-full font-factora font-bold text-base"
            style={{
              backgroundColor: '#F88EFF',
              color: '#1a1a1a',
              height: '52px',
              fontSize: '16px',
              outline: 'none',
              boxShadow: 'none',
            }}
          >
            {isPurchasing ? 'Wird geladen...' : price ? `Vollversion kaufen – ${price}` : 'Vollversion kaufen'}
          </Button>

          <button
            onClick={handleRestore}
            disabled={isPurchasing || isRestoring}
            style={{
              fontSize: '14px',
              color: '#ffffff',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'none',
              outline: 'none',
            }}
          >
            {isRestoring ? 'Wird wiederhergestellt...' : 'Kauf wiederherstellen'}
          </button>
        </div>
      </DialogPrimitive.Content>
    </Dialog>
  );
}

function getOrCreateUserId(): string {
  const key = 'journaling_rc_user_id';
  let userId = localStorage.getItem(key);
  if (!userId) {
    userId = 'anon_' + crypto.randomUUID();
    localStorage.setItem(key, userId);
  }
  return userId;
}
