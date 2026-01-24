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
  backgroundColor?: string;
}

export function CategorySelector({ 
  open, 
  onOpenChange, 
  categories, 
  selectedCategories, 
  onCategoriesChange,
  backgroundColor 
}: CategorySelectorProps) {
  const [tempSelection, setTempSelection] = useState<string[]>(selectedCategories);
  const [justToggled, setJustToggled] = useState<Set<string>>(new Set());

  // Update temp selection when selectedCategories prop changes
  useEffect(() => {
    setTempSelection(selectedCategories);
  }, [selectedCategories]);

  // Handle modal open - no animation state needed
  useEffect(() => {
    if (open) {
      setJustToggled(new Set());
    }
  }, [open]);

  const getCategoryColors = (category: string, index: number) => {
    // Use specific color mapping for each category - same as QuizCard
    let colorIndex;
    // Category to color index mapping - must match QuizApp.tsx (add 1 to 0-based values)
    const categoryColorMapping: { [key: string]: number } = {
      'Körperliche Intimität': 1,
      'Emotionale Intimität': 2,
      'Geistige Intimität': 3,
      'Kreative Intimität': 4,
      'Spielerische Intimität': 5,
      'Spirituelle Intimität': 6,
      'Alltagsintimität': 6,
      'Gemeinsame Abenteuer': 7,
      'Vision': 8,
      'Grenzen': 9,
      'Reflexion': 10,
    };
    
    colorIndex = categoryColorMapping[category] ?? ((index % 11) + 1);
    
    // Use CSS variables to match QuizCard exactly
    const colorVars = {
      1: { cardColor: 'hsl(var(--quiz-category1-card))', pageBg: 'hsl(var(--quiz-category1-bg))' },
      2: { cardColor: 'hsl(var(--quiz-category2-card))', pageBg: 'hsl(var(--quiz-category2-bg))' },
      3: { cardColor: 'hsl(var(--quiz-category3-card))', pageBg: 'hsl(var(--quiz-category3-bg))' },
      4: { cardColor: 'hsl(var(--quiz-category4-card))', pageBg: 'hsl(var(--quiz-category4-bg))' },
      5: { cardColor: 'hsl(var(--quiz-category5-card))', pageBg: 'hsl(var(--quiz-category5-bg))' },
      6: { cardColor: 'hsl(var(--quiz-category6-card))', pageBg: 'hsl(var(--quiz-category6-bg))' },
      7: { cardColor: 'hsl(var(--quiz-category7-card))', pageBg: 'hsl(var(--quiz-category7-bg))' },
      8: { cardColor: 'hsl(var(--quiz-category8-card))', pageBg: 'hsl(var(--quiz-category8-bg))' },
      9: { cardColor: 'hsl(var(--quiz-category9-card))', pageBg: 'hsl(var(--quiz-category9-bg))' },
      10: { cardColor: 'hsl(var(--quiz-category10-card))', pageBg: 'hsl(var(--quiz-category10-bg))' },
      11: { cardColor: 'hsl(var(--quiz-category11-card))', pageBg: 'hsl(var(--quiz-category11-bg))' },
    };
    
    return colorVars[colorIndex as keyof typeof colorVars] || colorVars[1];
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
    setTempSelection(prev => {
      // Prevent deselecting the last category
      let next: string[];
      if (prev.includes(category) && prev.length === 1) {
        next = prev;
      } else {
        next = prev.includes(category)
          ? prev.filter(c => c !== category)
          : [...prev, category];
      }
      // Apply immediately so QuizApp updates slides in real-time
      onCategoriesChange(next);
      return next;
    });
    setJustToggled(prev => new Set(prev).add(category));
  };

  const handleApply = () => {
    // Ensure at least one category is selected
    if (tempSelection.length > 0) {
      onCategoriesChange(tempSelection);
    }
    onOpenChange(false);
  };

  const handleClose = () => {
    onOpenChange(false);
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
        {/* Fully opaque overlay - no animations */}
        <DialogOverlay className="bg-black pointer-events-none" />
        <DialogContent className="mx-auto border-0 p-0 overflow-hidden [&>button]:hidden flex flex-col data-[state=open]:animate-none data-[state=closed]:animate-none bg-transparent" style={{ height: '100svh', width: '100vw' }}>
        <DialogDescription className="sr-only">
          Wählen Sie die Kategorien aus, die Sie sehen möchten
        </DialogDescription>
        
        <div className="flex flex-col w-full h-full overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 pb-0 shrink-0" style={{ paddingTop: 'max(16px, env(safe-area-inset-top))' }}>
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
                    <div onClick={(e) => { e.stopPropagation(); handleCategoryToggle(category); }}>
                      <div
                        className="relative cursor-pointer opacity-100 z-10"
                        onClick={() => handleCategoryToggle(category)}
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