import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import * as DialogPrimitive from '@radix-ui/react-dialog';

interface PaywallProps {
  open: boolean;
  onPurchaseSuccess: () => void;
}

export function Paywall({ open, onPurchaseSuccess }: PaywallProps) {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async () => {
    setIsPurchasing(true);
    setError(null);
    try {
      const { Purchases } = await import('@revenuecat/purchases-js');
      const userId = getOrCreateUserId();
      const purchases = Purchases.configure('appl_pmfaGQMjIIiPzVbbGpkjhccvWHm', userId);
      
      const offerings = await purchases.getOfferings();
      const pkg = offerings.current?.availablePackages?.[0];
      
      if (!pkg) {
        setError('Kein Paket verfügbar. Bitte versuche es später erneut.');
        setIsPurchasing(false);
        return;
      }

      const { customerInfo } = await purchases.purchase({ rcPackage: pkg });
      
      if (customerInfo.entitlements.active['Journaling']) {
        localStorage.setItem('journaling_premium', 'true');
        onPurchaseSuccess();
      }
    } catch (e: any) {
      if (e?.errorCode !== 1 /* UserCancelledError */) {
        console.error('Purchase error:', e);
        setError('Kauf fehlgeschlagen. Bitte versuche es erneut.');
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setIsRestoring(true);
    setError(null);
    try {
      const { Purchases } = await import('@revenuecat/purchases-js');
      const userId = getOrCreateUserId();
      const purchases = Purchases.configure('appl_pmfaGQMjIIiPzVbbGpkjhccvWHm', userId);
      
      const customerInfo = await purchases.getCustomerInfo();
      
      if (customerInfo.entitlements.active['Journaling']) {
        localStorage.setItem('journaling_premium', 'true');
        onPurchaseSuccess();
      } else {
        setError('Kein aktiver Kauf gefunden.');
      }
    } catch (e) {
      console.error('Restore error:', e);
      setError('Wiederherstellung fehlgeschlagen. Bitte versuche es erneut.');
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
            className="font-factora"
            style={{
              fontSize: 'clamp(1.8rem, 7vw, 2.8rem)',
              fontWeight: 700,
              fontStyle: 'italic',
              color: '#ffffff',
              lineHeight: 1.15,
            }}
          >
            Entdecke alle Fragen
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

          {error && (
            <p style={{ fontSize: '13px', color: 'hsl(0, 80%, 60%)' }}>
              {error}
            </p>
          )}

          <Button
            onClick={handlePurchase}
            disabled={isPurchasing || isRestoring}
            className="w-full rounded-full font-factora font-bold text-base"
            style={{
              backgroundColor: 'hsl(285, 73%, 75%)',
              color: '#1a1a1a',
              height: '52px',
              fontSize: '16px',
              outline: 'none',
              boxShadow: 'none',
            }}
          >
            {isPurchasing ? 'Wird geladen...' : 'Vollversion kaufen'}
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
