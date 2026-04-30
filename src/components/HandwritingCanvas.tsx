"use client";

import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Text, Line, Rect } from 'react-konva';
import Konva from 'konva';
import { HandwritingOptions } from '../types';

interface Props {
  options: HandwritingOptions;
  stageRef?: React.RefObject<Konva.Stage | null>;
  updateOption?: <K extends keyof HandwritingOptions>(key: K, value: HandwritingOptions[K]) => void;
}

const HandwritingCanvas: React.FC<Props> = ({ options, stageRef, updateOption }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  
  // Fixed high-resolution base dimensions for A4 (Standard for PDF export)
  const BASE_WIDTH = 794; // 210mm at 96 DPI
  const BASE_HEIGHT = 1123; // 297mm at 96 DPI

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        // Use the container's width to calculate scale
        const containerWidth = containerRef.current.clientWidth;
        setScale(containerWidth / BASE_WIDTH);
      }
    };

    // Small delay to ensure container is rendered
    const timeoutId = setTimeout(handleResize, 0);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
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
  const marginX = options.startX ?? 80;
  const marginY = options.startY ?? 60;
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

    const bgMarginX = 80;
    const bgMarginY = 60;
    const lineElements = [];
    const numLines = Math.floor((BASE_HEIGHT - bgMarginY) / lineGap);

    for (let i = 0; i <= numLines; i++) {
        const y = bgMarginY + i * lineGap + (fontSize * 0.8);
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
            points={[bgMarginX, 0, bgMarginX, BASE_HEIGHT]}
            stroke="#fecaca"
            strokeWidth={2}
        />
    );

    return lineElements;
  };

  const renderBorder = () => {
    if (!options.showBorder) return null;
    
    // Fallback to 4 if somehow undefined
    const bw = options.borderWidth ?? 4; 
    
    return (
      <Rect
        // Offset by half the border width so the stroke isn't clipped by the edge
        x={bw / 2}
        y={bw / 2}
        width={BASE_WIDTH - bw}
        height={BASE_HEIGHT - bw}
        stroke="#333333"
        strokeWidth={bw}
      />
    );
  };

  const handleStageClick = (e: any) => {
    if (!updateOption) return;
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    if (pos) {
      updateOption('startX', pos.x);
      updateOption('startY', pos.y);
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="w-full h-auto bg-white paper-shadow rounded-sm overflow-hidden flex items-start justify-center"
      style={{ aspectRatio: `${BASE_WIDTH} / ${BASE_HEIGHT}` }}
    >
      <div style={{ 
        transform: `scale(${scale})`, 
        transformOrigin: 'top center',
        width: BASE_WIDTH,
        height: BASE_HEIGHT,
        flexShrink: 0
      }}>
        <Stage 
          width={BASE_WIDTH} 
          height={BASE_HEIGHT} 
          id="handwriting-stage"
          ref={stageRef}
          onClick={handleStageClick}
          onTap={handleStageClick}
        >
          <Layer>
            <Rect width={BASE_WIDTH} height={BASE_HEIGHT} fill="white" />
            {renderBackground()}
            {renderBorder()}
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
