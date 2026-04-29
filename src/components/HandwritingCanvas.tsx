"use client";

import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Text, Line, Rect } from 'react-konva';
import { HandwritingOptions } from '../types';

interface Props {
  options: HandwritingOptions;
}

const HandwritingCanvas: React.FC<Props> = ({ options }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  
  // Fixed high-resolution base dimensions for A4 (Standard for PDF export)
  const BASE_WIDTH = 800;
  const BASE_HEIGHT = 1131;

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        setScale(containerWidth / BASE_WIDTH);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const {
    pagesText,
    currentPage,
    style,
    inkColor,
    pageType,
    fontSize,
    letterSpacing,
    lineHeight,
    jitter,
  } = options;

  const text = pagesText[currentPage] || '';

  const color = inkColor === 'blue' ? '#0000ff' : '#1a1a1a';
  const marginX = 80;
  const marginY = 60;
  const lineGap = fontSize * lineHeight;

  const lines = text.split('\n');

  const renderLine = (line: string, lineIndex: number) => {
    let currentX = marginX + 10;
    const currentY = marginY + lineIndex * lineGap;

    return line.split('').map((char, charIndex) => {
      const randomY = (Math.random() - 0.5) * jitter;
      const randomRotation = (Math.random() - 0.5) * jitter * 2;
      const randomOpacity = 0.85 + Math.random() * 0.15;
      
      const charWidth = char === ' ' ? fontSize * 0.3 : fontSize * 0.5; 
      const x = currentX;
      const y = currentY + randomY;
      
      currentX += charWidth + letterSpacing;

      // Determine font family
      const fontFamily = style;

      return (
        <Text
          key={`${lineIndex}-${charIndex}`}
          text={char}
          x={x}
          y={y}
          fontSize={fontSize}
          fontFamily={fontFamily}
          fill={color}
          opacity={randomOpacity}
          rotation={randomRotation}
        />
      );
    });
  };

  const renderBackground = () => {
    if (pageType === 'plain') return null;

    const lineElements = [];
    const numLines = Math.floor((BASE_HEIGHT - marginY) / lineGap);

    for (let i = 0; i <= numLines; i++) {
        const y = marginY + i * lineGap + (fontSize * 0.8);
        lineElements.push(
            <Line
                key={`line-${i}`}
                points={[0, y, BASE_WIDTH, y]}
                stroke="#e2e8f0"
                strokeWidth={1}
            />
        );
    }

    lineElements.push(
        <Line
            key="margin-line"
            points={[marginX, 0, marginX, BASE_HEIGHT]}
            stroke="#fecaca"
            strokeWidth={2}
        />
    );

    return lineElements;
  };

  return (
    <div ref={containerRef} className="w-full h-full bg-white paper-shadow rounded-lg overflow-hidden flex items-start justify-center">
      <div style={{ 
        transform: `scale(${scale})`, 
        transformOrigin: 'top center',
        width: BASE_WIDTH,
        height: BASE_HEIGHT
      }}>
        <Stage width={BASE_WIDTH} height={BASE_HEIGHT}>
          <Layer>
            <Rect width={BASE_WIDTH} height={BASE_HEIGHT} fill="white" />
            {renderBackground()}
            {lines.map((line, index) => (
              <React.Fragment key={`line-frag-${index}`}>
                {renderLine(line, index)}
              </React.Fragment>
            ))}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default HandwritingCanvas;
