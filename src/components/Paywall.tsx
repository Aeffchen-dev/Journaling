import { Button } from './ui/button';
import { Dialog, DialogContent, DialogOverlay, DialogPortal, DialogDescription } from './ui/dialog';

interface PaywallProps {
  isOpen: boolean;
  isPurchasing: boolean;
  priceString: string | null;
  isLoadingPrice: boolean;
  onPurchase: () => void;
  onRestore: () => void;
  onDismiss: () => void;
}

export function Paywall({ 
  isOpen, 
  isPurchasing, 
  priceString,
  isLoadingPrice,
  onPurchase, 
  onRestore, 
  onDismiss 
}: PaywallProps) {
  const buttonText = isPurchasing 
    ? 'Wird geladen...' 
    : isLoadingPrice 
      ? 'Laden...'
      : priceString 
        ? `Vollversion für ${priceString}` 
        : 'Vollversion kaufen';
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

            {/* Purchase Button */}
            <Button
              onClick={onPurchase}
              disabled={isPurchasing || isLoadingPrice}
              className="w-full py-6 text-lg font-bold rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0"
            >
              {buttonText}
            </Button>

            {/* Restore Purchases */}
            <button
              onClick={onRestore}
              disabled={isPurchasing}
              className="text-white/60 hover:text-white/80 text-sm underline transition-colors"
            >
              Käufe wiederherstellen
            </button>

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
