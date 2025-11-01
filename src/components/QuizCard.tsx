import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Eye component with synchronized blinking and pupil movement
function Eye({ 
  categoryColors, 
  pupilOffset, 
  isBlinking 
}: { 
  categoryColors: { cardColor: string; pageBg: string }, 
  pupilOffset: { x: number, y: number },
  isBlinking: boolean
}) {

  return (
    <div
      style={{
        position: 'relative',
        width: '30px',
        height: '30px',
        backgroundColor: 'white',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        transform: isBlinking ? 'scaleY(0.1)' : 'scaleY(1)',
        transition: 'transform 0.15s ease-out'
      }}
    >
      {/* Pupil */}
      <div
        style={{
          width: '12px',
          height: '12px',
          backgroundColor: 'black',
          borderRadius: '50%',
          transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)`,
          transition: 'transform 0.8s ease-in-out'
        }}
      />
    </div>
  );
}

interface Question {
  question: string;
  category: string;
  depth?: 'light' | 'deep';
}

interface QuizCardProps {
  question: Question;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  animationClass?: string;
  categoryIndex?: number;
  onDragStart?: (clientX: number) => void;
  onDragMove?: (clientX: number) => void;
  onDragEnd?: () => void;
  dragOffset?: number;
  isDragging?: boolean;
}

export function QuizCard({ 
  question, 
  onSwipeLeft, 
  onSwipeRight, 
  animationClass = '', 
  categoryIndex = 0,
  onDragStart,
  onDragMove,
  onDragEnd,
  dragOffset = 0,
  isDragging = false
}: QuizCardProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [mouseStart, setMouseStart] = useState<number | null>(null);
  const [mouseEnd, setMouseEnd] = useState<number | null>(null);
  const [isLocalDragging, setIsLocalDragging] = useState(false);
  const [processedText, setProcessedText] = useState<JSX.Element[]>([]);
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  
  const textRef = useRef<HTMLHeadingElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const minSwipeDistance = 50;

  // Synchronized pupil movement for both eyes
  useEffect(() => {
    const movePupil = () => {
      const maxOffset = 4;
      const randomX = (Math.random() - 0.5) * 2 * maxOffset;
      const randomY = (Math.random() - 0.5) * 2 * maxOffset;
      setPupilOffset({ x: randomX, y: randomY });
    };

    movePupil();

    const scheduleNextMove = () => {
      const delay = 10000 + Math.random() * 10000;
      return setTimeout(() => {
        movePupil();
        scheduleNextMove();
      }, delay);
    };

    const timeoutId = scheduleNextMove();
    return () => clearTimeout(timeoutId);
  }, []);

  // Synchronized blinking for both eyes - less frequent
  useEffect(() => {
    const blink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    };

    const initialDelay = 5000 + Math.random() * 5000;
    const initialTimeout = setTimeout(blink, initialDelay);

    const scheduleNextBlink = () => {
      const delay = 8000 + Math.random() * 12000; // 8-20 seconds for less frequent blinking
      return setTimeout(() => {
        blink();
        scheduleNextBlink();
      }, delay);
    };

    const timeoutId = scheduleNextBlink();
    return () => {
      clearTimeout(initialTimeout);
      clearTimeout(timeoutId);
    };
  }, []);

  // Process text to handle long words individually and preserve line breaks
  useEffect(() => {
    const processText = () => {
      if (!containerRef.current) return;

      // Remove all line breaks and let text flow naturally
      console.log('Original question text:', JSON.stringify(question.question));
      const cleanedText = question.question.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
      console.log('Cleaned text:', JSON.stringify(cleanedText));
      
      const words = cleanedText.split(' ');
      console.log('Words:', words.length, words);
      const containerWidth = containerRef.current.getBoundingClientRect().width;
      
      // Create temporary element to measure word width with exact same styles
      const tempElement = document.createElement('span');
      tempElement.style.cssText = `
        position: absolute;
        visibility: hidden;
        white-space: nowrap;
        font-size: 4rem;
        font-family: FactorA, sans-serif;
        font-weight: bold;
        font-style: normal;
        padding: 0;
        margin: 0;
        border: 0;
      `;
      
      // Add to same container to inherit styles
      containerRef.current.appendChild(tempElement);

      const processedWords = words.map((word, wordIndex) => {
        tempElement.textContent = word;
        const wordWidth = tempElement.getBoundingClientRect().width;
        
        // Only apply hyphenation if word is actually wider than available space
        // Use full container width minus some padding buffer
        const needsHyphenation = wordWidth > (containerWidth - 20);
        
        return (
          <span 
            key={wordIndex}
            style={{
              hyphens: needsHyphenation ? 'auto' : 'none',
              overflowWrap: needsHyphenation ? 'break-word' : 'normal',
              wordBreak: 'normal'
            }}
            lang="de"
          >
            {word}
            {wordIndex < words.length - 1 && ' '}
          </span>
        );
      });

      containerRef.current.removeChild(tempElement);
      setProcessedText([<span key="single-line">{processedWords}</span>]);
    };

    const timeoutId = setTimeout(processText, 50);
    window.addEventListener('resize', processText);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', processText);
    };
  }, [question.question]);

  // Get category-specific colors using specific category mapping
  const getCategoryColors = (categoryIndex: number) => {
    // Use specific color mapping for each category based on the actual category name
    let colorIndex;
    switch(question.category) {
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
        colorIndex = (categoryIndex % 11) + 1;
    }
    
    // Card color (first hex) for card bg, logo, header text, pill text
    // Page bg color (second hex) for page background
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

  const categoryColors = getCategoryColors(categoryIndex);

  const onTouchStart = (e: React.TouchEvent) => {
    if (onDragStart) {
      onDragStart(e.touches[0].clientX);
    } else {
      setTouchEnd(null);
      setTouchStart(e.targetTouches[0].clientX);
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (onDragMove) {
      onDragMove(e.touches[0].clientX);
    } else {
      setTouchEnd(e.targetTouches[0].clientX);
    }
  };

  const onTouchEnd = () => {
    if (onDragEnd) {
      onDragEnd();
    } else {
      if (!touchStart || !touchEnd) return;
      
      const distance = touchStart - touchEnd;
      const isLeftSwipe = distance > minSwipeDistance;
      const isRightSwipe = distance < -minSwipeDistance;

      if (isLeftSwipe) {
        onSwipeLeft();
      } else if (isRightSwipe) {
        onSwipeRight();
      }
    }
  };

  // Mouse drag handlers for desktop
  const onMouseDown = (e: React.MouseEvent) => {
    if (onDragStart) {
      onDragStart(e.clientX);
    } else {
      setMouseEnd(null);
      setMouseStart(e.clientX);
      setIsLocalDragging(true);
    }
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (onDragMove) {
      onDragMove(e.clientX);
    } else {
      if (!isLocalDragging) return;
      setMouseEnd(e.clientX);
    }
  };

  const onMouseUp = () => {
    if (onDragEnd) {
      onDragEnd();
    } else {
      if (!isLocalDragging || !mouseStart || !mouseEnd) {
        setIsLocalDragging(false);
        return;
      }
      
      const distance = mouseStart - mouseEnd;
      const isLeftDrag = distance > minSwipeDistance;
      const isRightDrag = distance < -minSwipeDistance;

      if (isLeftDrag) {
        onSwipeLeft();
      } else if (isRightDrag) {
        onSwipeRight();
      }
      
      setIsLocalDragging(false);
    }
  };

  const onMouseLeave = () => {
    if (onDragEnd && isDragging) {
      onDragEnd();
    } else {
      setIsLocalDragging(false);
    }
  };

  return (
    <div 
      className={`relative w-full max-w-[500px] mx-auto rounded-[2rem] select-none`}
      style={{
        height: 'calc(100% - 16px)',
        maxHeight: 'calc(100% - 16px)',
        backgroundColor: question.category.toLowerCase() !== 'intro' ? categoryColors.cardColor : 'hsl(var(--card-background))',
        color: question.category.toLowerCase() !== 'intro' ? categoryColors.pageBg : 'hsl(var(--foreground))',
        overflow: 'visible',
        boxShadow: '0 0 0 16px rgba(0, 0, 0, 0.24)'
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
    >
      {/* Decorative circle at bottom */}
      {question.category.toLowerCase() !== 'intro' && (
        <div
          style={{
            position: 'absolute',
            bottom: '-40%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '120%',
            aspectRatio: '1',
            borderRadius: '50%',
            backgroundColor: categoryColors.pageBg,
            pointerEvents: 'none',
            zIndex: 0
          }}
        >
          {/* Eyes container */}
          <div
            style={{
              position: 'absolute',
              top: 'calc(33.33% - 15px)',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '20px',
              pointerEvents: 'none'
            }}
          >
            {/* Left Eye */}
            <Eye categoryColors={categoryColors} pupilOffset={pupilOffset} isBlinking={isBlinking} />
            {/* Right Eye */}
            <Eye categoryColors={categoryColors} pupilOffset={pupilOffset} isBlinking={isBlinking} />
          </div>
        </div>
      )}
      {/* Left Click Area - Previous */}
      <div 
        className="absolute left-0 top-0 w-20 h-full z-20 cursor-pointer"
        onClick={onSwipeRight}
      />

      {/* Right Click Area - Next */}
      <div 
        className="absolute right-0 top-0 w-20 h-full z-20 cursor-pointer"
        onClick={onSwipeLeft}
      />

      {/* Main Content */}
      <div className={`h-full flex flex-col justify-start ${question.category.toLowerCase() === 'intro' ? 'p-8' : 'p-8 lg:p-10'} relative z-10`}>
        
        {/* Category Pill - Only for non-intro slides */}
        {question.category.toLowerCase() !== 'intro' && (
          <div className="mb-4">
            <div 
              className="px-2 py-0.5 rounded-full font-medium inline-block border font-factora"
              style={{
                backgroundColor: 'transparent',
                borderColor: categoryColors.pageBg,
                color: categoryColors.pageBg,
                fontSize: '12px'
              }}
            >
              {question.category}
            </div>
          </div>
        )}

        <div ref={containerRef} className={`flex-1 flex w-full ${question.category.toLowerCase() === 'intro' ? 'items-center justify-start text-left' : 'items-start justify-start text-left'}`}>
          <h1 
            ref={textRef}
            className={`font-factora leading-tight lg:leading-[1.09] w-full ${question.category.toLowerCase() === 'intro' ? 'text-base md:text-lg lg:text-xl max-w-md' : 'text-3xl md:text-4xl lg:text-5xl max-w-full'}`}
            style={{ 
              fontWeight: 'bold',
              fontStyle: question.category.toLowerCase() === 'intro' ? 'normal' : 'italic',
              color: question.category.toLowerCase() !== 'intro' ? categoryColors.pageBg : 'hsl(var(--foreground))'
            }}
          >
            {processedText.length > 0 ? processedText : question.question}
          </h1>
        </div>

        {/* Navigation hint at bottom - only for intro slides */}
        {question.category.toLowerCase() === 'intro' && (
          <div className="text-center">
            <p className="text-xs opacity-60">
              Swipe um weiter zu navigieren
            </p>
          </div>
        )}

      </div>

    </div>
  );
}