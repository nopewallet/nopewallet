'use client';

import React from 'react';
import { Audiowide, Rammetto_One } from 'next/font/google';

const audiowide = Audiowide({ subsets: ['latin'], weight: ['400'] });
const rammetto = Rammetto_One({ subsets: ['latin'], weight: ['400'] });

export interface TickerSafeLogoProps {
  size?: number;
  showText?: boolean;
  showIcon?: boolean;
  rotate?: number;
  colorClass?: string;
  hover?: boolean;
  className?: string;
  fontFamily?: string;
  text?: string;
  letterSpacing?: number;
  leftPad?: number;
}

const TickerSafeLogo: React.FC<TickerSafeLogoProps> = ({
  size = 40,
  showText = true,
  showIcon = true,
  rotate = 0,
  colorClass,
  hover = true,
  className = '',
  fontFamily,
  text = 'wallet',
  letterSpacing = -4,
  leftPad,
}) => {
  const labelSize = Math.max(12, Math.round(size * 0.5));

  // Use className for color, fallback to colorClass, fallback to default
  const baseColorClass = colorClass ?? className ?? '';
  const wrapperClasses = [
    'inline-flex',
    'items-baseline',
    'leading-none',
    'select-none',
    audiowide.className,
    className,
    hover ? 'group cursor-pointer' : '',
  ]
    .filter(Boolean)
    .join(' ');

  // Dimensions
  const rectWidth = size;
  const rectHeight = Math.round(size * 0.62);
  const letterFont = Math.round(rectHeight * 1.5);

  // Positioning logic
  const pnY = rectHeight / 2 + letterFont * 0.32;
  const overlap = letterSpacing;
  const effectiveLeftPad = leftPad !== undefined ? leftPad : 0.10 * letterFont;
  const nX = rectWidth / 2 - letterFont * 0.38 + effectiveLeftPad;
  const verticalLift = -0.18 * size;

  const SvgElement = showIcon ? (
    <svg
      width={size}
      height={rectHeight}
      viewBox={`${-effectiveLeftPad} 0 ${rectWidth + effectiveLeftPad * 2} ${rectHeight}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{
        overflow: 'visible',
        display: 'inline-block',
        verticalAlign: 'baseline',
        position: 'relative',
        top: '0em',
      }}
      className={hover ? 'group-hover:-translate-y-1 group-hover:scale-105 transition-transform duration-300 ease-out' : ''}
    >
      <g
        transform={`translate(0, ${verticalLift}) rotate(${rotate}, ${rectWidth / 2}, ${rectHeight / 2})`}
      >
        {/* "nope" letters */}
        <text
          x={nX}
          y={pnY}
          textAnchor="start"
          dominantBaseline="middle"
          fontSize={letterFont}
          fontWeight="700"
          className={baseColorClass}
          fill="currentColor" // <-- Add this line
          style={{
            fontFamily: fontFamily || rammetto.style.fontFamily,
            userSelect: 'none',
            letterSpacing: `${overlap}px`,
          }}
        >
          nope
        </text>
      </g>
    </svg>
  ) : null;

  const LabelElement = showText ? (
    <span
      className={baseColorClass}
      style={{
        fontSize: `${labelSize * 1}px`,
        lineHeight: 1,
        marginLeft: `${Math.round(size * 1.65)}px`,
        position: 'relative',
        top: `${Math.round(size * 0.08)}px`,
        userSelect: 'none',
      }}
    >
      {text}
    </span>
  ) : null;

  return (
    <span className={wrapperClasses} aria-label={text} suppressHydrationWarning={true}>
      {SvgElement}
      {LabelElement}
    </span>
  );
};

export default TickerSafeLogo;
