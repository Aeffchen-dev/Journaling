import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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
      // Show content after black fade completes
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 300);
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
    // Wait for black fade out to complete before actually closing
    setTimeout(() => {
      onCategoriesChange(tempSelection);
      onOpenChange(false);
      setIsClosing(false);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <style>
        {`
          @keyframes checkboxPopBounce {
            0% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.1);
            }
            100% {
              transform: scale(1);
            }
          }
          @keyframes widthBounceTwice {
            0% {
              width: 90%;
            }
            40% {
              width: 106%;
            }
            70% {
              width: 98%;
            }
            100% {
              width: 100%;
            }
          }
          @keyframes widthBounceRight {
            0% {
              width: 90%;
            }
            60% {
              width: 103%;
            }
            100% {
              width: 100%;
            }
          }
          @keyframes checkmarkAppear {
            0% {
              opacity: 0;
              transform: scale(0.8);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }
          @keyframes blackFadeIn {
            0% {
              opacity: 0;
            }
            100% {
              opacity: 1;
            }
          }
          @keyframes blackFadeOut {
            0% {
              opacity: 1;
            }
            100% {
              opacity: 0;
            }
          }
        `}
      </style>
      <DialogContent className="mx-auto bg-background border-0 p-0 overflow-hidden [&>button]:hidden flex flex-col data-[state=open]:animate-none data-[state=closed]:animate-none" style={{ height: '100svh', width: '100vw' }}>
        <DialogDescription className="sr-only">
          Wählen Sie die Kategorien aus, die Sie sehen möchten
        </DialogDescription>
        
        {/* Black fade overlay */}
        {(!showContent || isClosing) && (
          <div 
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'black',
              zIndex: 50,
              animation: isClosing ? 'blackFadeOut 300ms ease-in-out forwards' : 'blackFadeIn 300ms ease-in-out forwards'
            }}
          />
        )}
        
        <div className="flex flex-col w-full h-full bg-background overflow-hidden" style={{ 
          opacity: showContent ? 1 : 0,
          transition: 'opacity 300ms ease-in-out'
        }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-0 shrink-0">
            <DialogHeader>
               <DialogTitle className="text-white font-factora font-normal" style={{ fontSize: '20px' }}>
                 <span style={{ fontFeatureSettings: '"salt" 1, "ss01" 1, "ss02" 1' }}>K</span>ategorien wählen
               </DialogTitle>
            </DialogHeader>
            
            <button
              onClick={handleClose}
              className="text-white hover:bg-white/10 p-2 rounded-full transition-colors"
            >
              <X className="h-6 w-6" strokeWidth={1} />
            </button>
          </div>

          {/* Categories List */}
          <ScrollArea className="flex-1 min-h-0">
            <div className="px-4 pt-2 pb-4 space-y-2" style={{ marginTop: '8px' }}>
              {categories.map((category, index) => {
              const isSelected = tempSelection.includes(category);
              const shouldAnimate = justToggled.has(category) && isSelected;
              const colors = getCategoryColors(category, index);
              const textColor = darkenColor(colors.pageBg, 0.7); // 30% darker for text
              const checkboxColor = lightenColor(colors.pageBg, 1.1); // 10% lighter for checkbox
              
              return (
                <div 
                  key={category}
                  className="flex items-center justify-between cursor-pointer rounded-full relative overflow-hidden"
                  style={{ 
                    paddingLeft: '64px',
                    paddingRight: '8px',
                    paddingTop: '8px',
                    paddingBottom: '8px',
                    width: isSelected ? '100%' : '90%',
                    animation: shouldAnimate ? 'widthBounceRight 0.3s ease-in-out 0.05s both' : 'none',
                    transition: isSelected ? 'none' : 'width 0.2s ease-in-out'
                  }}
                  onClick={() => handleCategoryToggle(category)}
                >
                  {/* Dark grey background */}
                  <div 
                    className="absolute inset-0 rounded-full"
                    style={{ 
                      backgroundColor: '#333333',
                      zIndex: 0
                    }}
                  />
                  
                   {/* Colored background that expands/contracts */}
                   <div 
                     className="absolute inset-y-0 left-0 rounded-full"
                     style={{ 
                       backgroundColor: colors.cardColor,
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
                     color: isSelected ? textColor : 'white', 
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
                      {/* Ripple effect */}
                      {isSelected && (
                        <div
                          className="absolute inset-0 rounded-full"
                          style={{
                            border: '2px solid black',
                            animation: 'ripple 0.6s ease-out'
                          }}
                        />
                      )}
                      
                       <div
                         className={`w-8 h-8 flex items-center justify-center rounded-full`}
                         style={{ 
                           width: '32px', 
                           height: '32px',
                           border: `2px solid white`,
                           backgroundColor: isSelected ? 'black' : 'transparent',
                           transition: shouldAnimate && isSelected
                             ? 'background-color 0.1s ease-in-out 0.1s'
                             : isSelected
                             ? 'none'
                             : 'background-color 0.2s ease-in-out'
                         }}
                       >
                         {isSelected && (
                           <svg 
                             width="20" 
                             height="20" 
                             viewBox="0 0 24 24" 
                             fill="none"
                             style={{ 
                               color: 'white',
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
        </div>
      </DialogContent>
    </Dialog>
  );
}