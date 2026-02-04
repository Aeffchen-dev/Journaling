import { useRef, useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogOverlay, DialogPortal, DialogDescription } from './ui/dialog';
import type { Package } from '@revenuecat/purchases-js';

interface RevenueCatPaywallProps {
  isOpen: boolean;
  isPurchasing: boolean;
  isLoading: boolean;
  isRestoring: boolean;
  priceString: string | null;
  currentPackage: Package | null;
  managementUrl: string | null;
  onPurchase: () => Promise<boolean>;
  onRestore: () => Promise<boolean>;
  onDismiss: () => void;
  presentHostedPaywall?: (target: HTMLElement) => Promise<void>;
}

export function RevenueCatPaywall({ 
  isOpen, 
  isPurchasing,
  isLoading,
  isRestoring,
  priceString,
  currentPackage,
  managementUrl,
  onPurchase,
  onRestore,
  onDismiss,
  presentHostedPaywall,
}: RevenueCatPaywallProps) {
  const paywallContainerRef = useRef<HTMLDivElement>(null);
  const [useHostedPaywall, setUseHostedPaywall] = useState(false);
  const [hostedPaywallError, setHostedPaywallError] = useState(false);

  // Try to present hosted paywall when opened
  useEffect(() => {
    if (isOpen && presentHostedPaywall && paywallContainerRef.current && useHostedPaywall) {
      presentHostedPaywall(paywallContainerRef.current).catch((err) => {
        console.error('Hosted paywall failed, using custom paywall:', err);
        setHostedPaywallError(true);
        setUseHostedPaywall(false);
      });
    }
  }, [isOpen, presentHostedPaywall, useHostedPaywall]);

  const handlePurchase = async () => {
    const success = await onPurchase();
    if (success) {
      onDismiss();
    }
  };

  const handleRestore = async () => {
    const success = await onRestore();
    if (success) {
      onDismiss();
    }
  };

  const buttonText = isPurchasing 
    ? 'Wird verarbeitet...' 
    : isLoading 
      ? 'Laden...'
      : priceString 
        ? `Vollversion für ${priceString}` 
        : 'Vollversion kaufen';

  const isDisabled = isPurchasing || isLoading || isRestoring || !currentPackage;

  // If using hosted paywall, render the container
  if (useHostedPaywall && !hostedPaywallError) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onDismiss()}>
        <DialogPortal>
          <DialogOverlay className="bg-background/95" />
          <DialogContent 
            className="mx-auto border-0 p-0 overflow-hidden [&>button]:hidden bg-background"
            style={{ 
              height: '90vh', 
              width: '95vw',
              maxWidth: '500px',
              borderRadius: '2rem',
            }}
          >
            <DialogDescription className="sr-only">
              RevenueCat Paywall
            </DialogDescription>
            <div ref={paywallContainerRef} className="w-full h-full" />
          </DialogContent>
        </DialogPortal>
      </Dialog>
    );
  }

  // Custom paywall UI with app branding
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onDismiss()}>
      <DialogPortal>
        <DialogOverlay className="bg-background/95" />
        <DialogContent 
          className="mx-auto border-0 p-0 overflow-hidden [&>button]:hidden flex flex-col items-center justify-center bg-background max-w-md"
          style={{ 
            height: 'auto', 
            width: '90vw',
            maxWidth: '400px',
            borderRadius: '2rem',
          }}
        >
          <DialogDescription className="sr-only">
            Kaufe die Vollversion um alle Fragen freizuschalten
          </DialogDescription>
          
          <div className="p-8 flex flex-col items-center text-center gap-6">
            {/* Title with app font */}
            <h2 
              className="text-3xl text-foreground"
              style={{ fontFamily: 'Factor A Bold Italic, sans-serif' }}
            >
              Dir gefällt's?
            </h2>

            {/* Description */}
            <p className="text-muted-foreground text-base leading-relaxed">
              Du hast deine kostenlosen Fragen aufgebraucht. 
              Schalte alle Fragen frei und entdecke noch mehr Intimität!
            </p>

            {/* Product info card */}
            {currentPackage && (
              <div className="bg-secondary rounded-2xl p-4 w-full">
                <div className="flex justify-between items-center">
                  <span className="text-foreground font-medium">Lifetime Zugang</span>
                  <span className="text-foreground font-bold">{priceString || '...'}</span>
                </div>
                <p className="text-muted-foreground text-sm mt-1 text-left">
                  Einmalzahlung • Für immer freigeschaltet
                </p>
              </div>
            )}

            {/* Purchase Button */}
            <Button
              onClick={handlePurchase}
              disabled={isDisabled}
              className="w-full py-6 text-lg font-bold rounded-full bg-primary hover:bg-primary/90 text-primary-foreground border-0"
            >
              {buttonText}
            </Button>

            {/* Restore Purchases */}
            <button
              onClick={handleRestore}
              disabled={isDisabled}
              className="text-muted-foreground hover:text-foreground text-sm underline transition-colors disabled:opacity-50"
            >
              {isRestoring ? 'Wird wiederhergestellt...' : 'Kauf wiederherstellen'}
            </button>

            {/* Management link (for existing subscribers) */}
            {managementUrl && (
              <a
                href={managementUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground text-sm underline transition-colors"
              >
                Abonnement verwalten
              </a>
            )}
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
