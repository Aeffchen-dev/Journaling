import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogPortal, DialogOverlay } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CategorySelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: string[];
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
}

export function CategorySelector({ 
  open, 
  onOpenChange, 
  categories, 
  selectedCategories, 
  onCategoriesChange 
}: CategorySelectorProps) {
  const [tempSelection, setTempSelection] = useState<string[]>(selectedCategories);
  const [justToggled, setJustToggled] = useState<Set<string>>(new Set());
  const [showContent, setShowContent] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Update temp selection when selectedCategories prop changes
  useEffect(() => {
    setTempSelection(selectedCategories);
  }, [selectedCategories]);

  // Handle modal open animation sequence
  useEffect(() => {
    if (open) {
      setJustToggled(new Set());
      setShowContent(false);
      setIsClosing(false);
      // Start content fade after black fully fades in
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const getCategoryColors = (category: string, index: number) => {
    // Use specific color mapping for each category
    let colorIndex;
    switch(category) {
      case 'Körperliche Intimität':
        colorIndex = 1;
        break;
      case 'Emotionale Intimität':
        colorIndex = 2;
        break;
      case 'Geistige Intimität':
        colorIndex = 4;
        break;
      case 'Kreative Intimität':
        colorIndex = 3;
        break;
      case 'Spielerische Intimität':
        colorIndex = 6;
        break;
      case 'Spirituelle Intimität':
        colorIndex = 7;
        break;
      case 'Alltagsintimität':
        colorIndex = 5;
        break;
      case 'Gemeinsame Abenteuer':
        colorIndex = 8;
        break;
      default:
        colorIndex = (index % 11) + 1;
    }
    
    const colorMap = {
      1: { cardColor: 'hsl(335, 100%, 81%)', pageBg: 'hsl(347, 95%, 12%)' },
      2: { cardColor: 'hsl(182, 87%, 68%)', pageBg: 'hsl(250, 95%, 12%)' },
      3: { cardColor: 'hsl(259, 45%, 72%)', pageBg: 'hsl(0, 65%, 10%)' },
      4: { cardColor: 'hsl(335, 100%, 90%)', pageBg: 'hsl(14, 100%, 25%)' },
      5: { cardColor: 'hsl(289, 100%, 79%)', pageBg: 'hsl(281, 100%, 10%)' },
      6: { cardColor: 'hsl(76, 100%, 75%)', pageBg: 'hsl(159, 100%, 10%)' },
      7: { cardColor: 'hsl(307, 100%, 80%)', pageBg: 'hsl(23, 98%, 18%)' },
      8: { cardColor: 'hsl(157, 100%, 87%)', pageBg: 'hsl(178, 93%, 12%)' },
      9: { cardColor: 'hsl(157, 100%, 50%)', pageBg: 'hsl(170, 100%, 10%)' },
      10: { cardColor: 'hsl(200, 100%, 77%)', pageBg: 'hsl(205, 100%, 14%)' },
      11: { cardColor: 'hsl(70, 100%, 49%)', pageBg: 'hsl(187, 94%, 10%)' },
    };
    
    return colorMap[colorIndex as keyof typeof colorMap] || colorMap[1];
  };

  const darkenColor = (hslColor: string, factor: number = 0.8) => {
    // Parse HSL color and reduce lightness by the given factor
    const match = hslColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (match) {
      const h = match[1];
      const s = match[2];
      const l = Math.max(0, parseInt(match[3]) * factor);
      return `hsl(${h}, ${s}%, ${l}%)`;
    }
    return hslColor;
  };

  const lightenColor = (hslColor: string, factor: number = 1.1) => {
    // Parse HSL color and increase lightness by the given factor
    const match = hslColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (match) {
      const h = match[1];
      const s = match[2];
      const l = Math.min(100, parseInt(match[3]) * factor);
      return `hsl(${h}, ${s}%, ${l}%)`;
    }
    return hslColor;
  };

  const handleCategoryToggle = (category: string) => {
    setTempSelection(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
    setJustToggled(prev => new Set(prev).add(category));
  };

  const handleApply = () => {
    onCategoriesChange(tempSelection);
    onOpenChange(false);
  };

  const handleClose = () => {
    setIsClosing(true);
    setShowContent(false);
    // Wait for content fade + black fade to complete
    setTimeout(() => {
      onCategoriesChange(tempSelection);
      onOpenChange(false);
      setIsClosing(false);
    }, 400);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <style>
        {`
          @keyframes widthBounceRight {
            0% {
              width: calc(100% - 8px);
            }
            50% {
              width: calc(100% + 8px);
            }
            100% {
              width: 100%;
            }
          }
          @keyframes checkmarkAppear {
            0% {
              transform: scale(0);
              opacity: 0;
            }
            50% {
              transform: scale(1.2);
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}
      </style>
      <DialogPortal>
        {/* Disable default overlay, use our custom black fade */}
        <DialogOverlay className="bg-transparent pointer-events-none" />
        <DialogContent className="mx-auto border-0 p-0 overflow-hidden [&>button]:hidden flex flex-col data-[state=open]:animate-none data-[state=closed]:animate-none" style={{ height: '100svh', width: '100vw' }}>
        <DialogDescription className="sr-only">
          Wählen Sie die Kategorien aus, die Sie sehen möchten
        </DialogDescription>
        
        {/* Black fade overlay */}
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'black',
            zIndex: 50,
            opacity: (!showContent && !isClosing) ? 1 : 0,
            transition: (!showContent && !isClosing) 
              ? 'opacity 200ms cubic-bezier(0.4, 0, 1, 1)' // Ease-out for fade in
              : 'opacity 300ms cubic-bezier(0, 0, 0.2, 1)', // Ease-in for fade out
            pointerEvents: 'none'
          }}
        />
        
        <div className="flex flex-col w-full h-full overflow-hidden" style={{ 
          opacity: showContent ? 1 : 0,
          transform: showContent ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.98)',
          filter: showContent ? 'blur(0px)' : 'blur(4px)',
          transition: showContent
            ? 'opacity 400ms cubic-bezier(0.4, 0, 0.2, 1), transform 400ms cubic-bezier(0.4, 0, 0.2, 1), filter 400ms cubic-bezier(0.4, 0, 0.2, 1)' // Ease-out for reveal
            : 'opacity 300ms cubic-bezier(0.4, 0, 1, 1), transform 300ms cubic-bezier(0.4, 0, 1, 1), filter 300ms cubic-bezier(0.4, 0, 1, 1)' // Ease-in for hide
        }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-0 shrink-0">
            <DialogHeader>
               <DialogTitle className="text-white font-factora font-normal" style={{ fontSize: '18px' }}>
                 <span style={{ fontFeatureSettings: '"salt" 1, "ss01" 1, "ss02" 1' }}>K</span>ategorien wählen
               </DialogTitle>
            </DialogHeader>
            
            <button
              onClick={handleClose}
              className="text-white transition-colors"
              style={{ marginRight: '8px' }}
            >
              <X className="h-7 w-7" strokeWidth={2} />
            </button>
          </div>

          {/* Categories List */}
          <ScrollArea className="flex-1 min-h-0">
            <div className="px-4 pt-2 pb-4 space-y-2" style={{ marginTop: '8px' }}>
              {categories.map((category, index) => {
              const isSelected = tempSelection.includes(category);
              const shouldAnimate = justToggled.has(category) && isSelected;
              const colors = getCategoryColors(category, index);
              const checkboxColor = lightenColor(colors.pageBg, 1.1); // 10% lighter for checkbox
              
              return (
                <div 
                  key={category}
                  className="flex items-center justify-between cursor-pointer rounded-full relative overflow-hidden"
                  style={{ 
                    paddingLeft: isSelected ? '32px' : '64px',
                    paddingRight: '2px',
                    paddingTop: '2px',
                    paddingBottom: '2px',
                    width: isSelected ? '100%' : '90%',
                    animation: shouldAnimate ? 'widthBounceRight 0.3s ease-in-out 0.05s both' : 'none',
                    transition: isSelected ? 'padding-left 0.2s ease-in-out' : 'width 0.2s ease-in-out, padding-left 0.2s ease-in-out'
                  }}
                  onClick={() => handleCategoryToggle(category)}
                >
                  {/* Dark grey background */}
                  <div 
                    className="absolute inset-0 rounded-full"
                    style={{ 
                      backgroundColor: '#1a1a1a',
                      zIndex: 0
                    }}
                  />
                  
                   {/* Colored background that expands/contracts */}
                   <div 
                     className="absolute inset-y-0 left-0 rounded-full"
                     style={{ 
                       background: `linear-gradient(to right, ${darkenColor(colors.cardColor, 0.95)} 0%, ${colors.cardColor} 50%)`,
                       width: isSelected ? '100%' : '48px',
                       transition: shouldAnimate 
                         ? 'width 0.2s ease-in-out'
                         : isSelected 
                         ? 'none'
                         : 'width 0.2s ease-in-out',
                       zIndex: 1
                     }}
                   />
                  
                   <span className="font-factora font-normal tracking-wide opacity-100 relative z-10" style={{ 
                     color: isSelected ? colors.pageBg : 'white', 
                     fontSize: '14px', 
                     transition: isSelected 
                       ? 'color 0.3s ease-in-out'
                       : 'color 0.2s ease-in-out'
                   }}>
                     {category}
                   </span>
                   <div onClick={(e) => e.stopPropagation()}>
                     <div
                       className="relative cursor-pointer opacity-100 z-10"
                       onClick={() => {
                         const newCategories = isSelected 
                           ? tempSelection.filter(c => c !== category)
                           : [...tempSelection, category];
                         setTempSelection(newCategories);
                       }}
                     >
                        <div
                          className={`flex items-center justify-center rounded-full`}
                          style={{ 
                            width: '44px', 
                            height: '44px',
                            border: isSelected ? 'none' : `2px solid ${colors.cardColor}`,
                            backgroundColor: isSelected ? colors.pageBg : 'transparent',
                            transition: shouldAnimate && isSelected
                              ? 'background-color 0.1s ease-in-out 0.1s, border 0.1s ease-in-out 0.1s'
                              : isSelected
                              ? 'none'
                              : 'background-color 0.2s ease-in-out, border 0.2s ease-in-out'
                          }}
                        >
                          {isSelected && (
                            <svg 
                              width="26" 
                              height="26" 
                              viewBox="0 0 24 24" 
                              fill="none"
                              style={{ 
                                color: colors.cardColor,
                                animation: shouldAnimate ? 'checkmarkAppear 0.1s ease-out 0.1s both' : 'none'
                              }}
                            >
                             <path
                               d="M20 6 9 17l-5-5"
                               stroke="currentColor"
                               strokeWidth="2"
                               strokeLinecap="round"
                               strokeLinejoin="round"
                             />
                           </svg>
                         )}
                       </div>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          </ScrollArea>

          {/* Delete entries button */}
          <div className="flex items-center justify-center px-4 pb-4 pt-2 shrink-0">
            <button
              onClick={() => {
                // Clear all cookies
                document.cookie.split(";").forEach((c) => {
                  document.cookie = c
                    .replace(/^ +/, "")
                    .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
                });
                
                // Clear all localStorage
                localStorage.clear();
                
                // Clear all sessionStorage
                sessionStorage.clear();
                
                // Reload to reset all state (filters, text entries, show default view)
                window.location.reload();
              }}
              className="text-white font-factora font-normal hover:opacity-70 transition-opacity"
              style={{ fontSize: '14px' }}
            >
              <span style={{ fontFeatureSettings: '"salt" 1, "ss01" 1, "ss02" 1' }}>M</span>eine Einträge löschen
            </button>
          </div>
        </div>
      </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}