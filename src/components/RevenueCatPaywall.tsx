import { useRef, useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogOverlay, DialogPortal, DialogDescription } from './ui/dialog';
import type { Package } from '@revenuecat/purchases-js';

interface RevenueCatPaywallProps {
  isOpen: boolean;
  isPurchasing: boolean;
  isLoading: boolean;
  priceString: string | null;
  currentPackage: Package | null;
  managementUrl: string | null;
  onPurchase: () => Promise<boolean>;
  onDismiss: () => void;
  presentHostedPaywall?: (target: HTMLElement) => Promise<void>;
}

export function RevenueCatPaywall({ 
  isOpen, 
  isPurchasing,
  isLoading,
  priceString,
  currentPackage,
  managementUrl,
  onPurchase, 
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

  const buttonText = isPurchasing 
    ? 'Wird verarbeitet...' 
    : isLoading 
      ? 'Laden...'
      : priceString 
        ? `Vollversion für ${priceString}` 
        : 'Vollversion kaufen';

  // If using hosted paywall, render the container
  if (useHostedPaywall && !hostedPaywallError) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onDismiss()}>
        <DialogPortal>
          <DialogOverlay className="bg-black/90" />
          <DialogContent 
            className="mx-auto border-0 p-0 overflow-hidden [&>button]:hidden bg-black"
            style={{ 
              height: '90vh', 
              width: '95vw',
              maxWidth: '500px',
              borderRadius: '24px',
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

  // Custom paywall UI
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onDismiss()}>
      <DialogPortal>
        <DialogOverlay className="bg-black/90" />
        <DialogContent 
          className="mx-auto border-0 p-0 overflow-hidden [&>button]:hidden flex flex-col items-center justify-center bg-black max-w-md"
          style={{ 
            height: 'auto', 
            width: '90vw',
            maxWidth: '400px',
            borderRadius: '24px',
          }}
        >
          <DialogDescription className="sr-only">
            Kaufe die Vollversion um alle Fragen freizuschalten
          </DialogDescription>
          
          <div className="p-8 flex flex-col items-center text-center gap-6">
            {/* Icon/Logo */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
              <span className="text-4xl">💝</span>
            </div>

            {/* Title */}
            <h2 
              className="text-2xl text-white"
              style={{ fontFamily: 'Factor A Bold Italic, sans-serif' }}
            >
              Dir gefällt's?
            </h2>

            {/* Description */}
            <p className="text-white/80 text-base leading-relaxed">
              Du hast deine kostenlosen Fragen aufgebraucht. 
              Schalte alle Fragen frei und entdecke noch mehr Intimität!
            </p>

            {/* Product info */}
            {currentPackage && (
              <div className="bg-white/10 rounded-2xl p-4 w-full">
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium">Lifetime Zugang</span>
                  <span className="text-white font-bold">{priceString || '...'}</span>
                </div>
                <p className="text-white/60 text-sm mt-1 text-left">
                  Einmalzahlung • Für immer freigeschaltet
                </p>
              </div>
            )}

            {/* Purchase Button */}
            <Button
              onClick={handlePurchase}
              disabled={isPurchasing || isLoading || !currentPackage}
              className="w-full py-6 text-lg font-bold rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0"
            >
              {buttonText}
            </Button>

            {/* Management link (for existing subscribers) */}
            {managementUrl && (
              <a
                href={managementUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white/80 text-sm underline transition-colors"
              >
                Abonnement verwalten
              </a>
            )}

            {/* Dismiss */}
            <button
              onClick={onDismiss}
              disabled={isPurchasing}
              className="text-white/40 hover:text-white/60 text-xs transition-colors mt-2"
            >
              Später
            </button>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
