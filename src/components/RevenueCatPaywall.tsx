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
     await onPurchase();
   };
 
   const handleRestore = async () => {
     await onRestore();
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
       <Dialog open={isOpen}>
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
     <Dialog open={isOpen}>
       <DialogPortal>
         <DialogOverlay className="bg-background" />
         <DialogContent 
           className="mx-auto border-0 p-0 overflow-hidden [&>button]:hidden flex flex-col items-center justify-center max-w-md bg-background"
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
           
           <div className="p-8 flex flex-col items-center text-center gap-6 w-full">
             {/* Title - Same styling as question text */}
             <h1 
               className="font-factora leading-[120%] w-full text-[2.364rem] md:text-[2.832rem] text-white"
               style={{ 
                 fontWeight: 'bold',
                 fontStyle: 'normal',
                 letterSpacing: '0px',
               }}
             >
               <span style={{ fontFeatureSettings: '"ss01" 1' }}>D</span>
               <span>ir gefällt's?</span>
             </h1>
 
             {/* Description - Same styling as small text (14px) */}
             <p 
                className="font-factora leading-relaxed w-full text-left"
               style={{
                 fontSize: '14px',
                 opacity: 0.8,
                  color: 'white',
               }}
             >
               Du hast alle kostenlosen Fragen aufgebraucht. Schalte für einmalig {priceString || '...'} alle Fragen frei. Du hast lebenslang Zugriff zur Vollversion, es gibt kein Abo. Du erhältst alle Updates.
             </p>
 
             {/* Purchase Button - Pink */}
             <Button
               onClick={handlePurchase}
               disabled={isDisabled}
               className="w-full py-6 text-lg font-factora font-bold rounded-full border-0 text-white"
               style={{
                 backgroundColor: 'hsl(335, 100%, 81%)',
                 color: 'hsl(347, 95%, 12%)',
               }}
             >
               {isPurchasing ? 'Wird verarbeitet...' : 'Vollversion kaufen'}
             </Button>
 
             {/* Restore Purchases - White text, no underline */}
             <button
               onClick={handleRestore}
               disabled={isDisabled}
                className="font-factora text-sm transition-opacity disabled:opacity-50"
               style={{
                 textDecoration: 'none',
                  color: 'white',
               }}
             >
               {isRestoring ? 'Wird wiederhergestellt...' : 'Kauf wiederherstellen'}
             </button>
 
             {/* Management link (for existing subscribers) */}
             {managementUrl && (
               <a
                 href={managementUrl}
                 target="_blank"
                 rel="noopener noreferrer"
                  className="font-factora text-sm transition-opacity"
                 style={{
                   textDecoration: 'none',
                    color: 'white',
                 }}
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
