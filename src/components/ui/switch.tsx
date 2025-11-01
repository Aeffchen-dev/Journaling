import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  isAnimating?: boolean;
  checked?: boolean;
}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className, isAnimating, checked, ...props }, ref) => {
  const [totalRotation, setTotalRotation] = React.useState(-10);
  
  React.useEffect(() => {
    if (isAnimating) {
      if (checked) {
        setTotalRotation(prev => prev + 360);
      } else {
        setTotalRotation(prev => prev - 360);
      }
    }
  }, [isAnimating, checked]);

  return (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-[23px] w-11 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input relative",
      className
    )}
    {...props}
    ref={ref}
  >
    {/* Invisible thumb for touch area */}
    <SwitchPrimitives.Thumb
      className="pointer-events-none block h-[18px] w-[18px] rounded-full opacity-0 transition-transform duration-300 ease-in-out data-[state=checked]:translate-x-[23.5px] data-[state=unchecked]:translate-x-[2px]"
    />
    
    {/* Smiley that moves across the full switch */}
    <div
      className="absolute pointer-events-none"
      style={{ 
        left: checked ? 'calc(100% - 18px - 2px)' : '2px',
        top: '1.5px',
        width: '18px',
        height: '18px',
        backgroundColor: 'white',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        transition: 'all 0.5s ease-in-out',
        filter: 'brightness(1.2)'
      }}
    >
      <svg 
        width="10.8" 
        height="10.8" 
        viewBox="0 0 12 12" 
        fill="none" 
        style={{ 
          transform: `rotate(${totalRotation}deg)`,
          transition: 'transform 0.5s ease-in-out'
        }}
      >
        {/* Eyes */}
        <circle cx="3.5" cy="4" r="1.2" fill="black" />
        <circle cx="8.5" cy="4" r="1.2" fill="black" />
        {/* Mouth */}
        <path d="M3 8 Q6 10.5 9 8" stroke="black" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  </SwitchPrimitives.Root>
)
})
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
