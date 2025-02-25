import { useState, useEffect, useRef } from 'react';

interface ScrollingTextProps {
  text: string;
  className?: string;
}

export function ScrollingText({ text, className = '' }: ScrollingTextProps) {
  const [isScrolling, setIsScrolling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && textRef.current) {
      const shouldScroll = textRef.current.scrollWidth > containerRef.current.clientWidth;
      setIsScrolling(shouldScroll);
    }
  }, [text]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={() => setIsScrolling(true)}
      onMouseLeave={() => setIsScrolling(false)}
    >
      <div
        ref={textRef}
        className={`whitespace-nowrap transition-transform duration-[2000ms] ${
          isScrolling ? '-translate-x-[calc(100%-100%)]' : 'translate-x-0'
        }`}
      >
        {text}
      </div>
    </div>
  );
}
