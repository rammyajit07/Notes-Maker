"use client";

import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Text, Line, Rect, Image as KonvaImage, Transformer, Group } from 'react-konva';
import Konva from 'konva';
import useImage from 'use-image';
import { HandwritingOptions, ImageItem, TextBlock } from '../types';

interface Props {
  options: HandwritingOptions;
  stageRef?: React.RefObject<Konva.Stage | null>;
  updateOption?: <K extends keyof HandwritingOptions>(key: K, value: HandwritingOptions[K]) => void;
  updateImage?: (id: string, updates: Partial<ImageItem>) => void;
  updateTextBlock?: (id: string, updates: Partial<TextBlock>) => void;
  isExporting?: boolean;
}

// ── Draggable image with resize handles ──────────────────────────────────────
const CanvasImage = ({
  image, isSelected, onSelect, onChange, isExporting
}: {
  image: ImageItem;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newAttrs: Partial<ImageItem>) => void;
  isExporting: boolean;
}) => {
  const [img] = useImage(image.src);
  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <React.Fragment>
      <KonvaImage
        ref={shapeRef}
        image={img}
        x={image.x}
        y={image.y}
        width={image.width}
        height={image.height}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
        onTransformEnd={() => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            x: node.x(), y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
          });
        }}
      />
      {isSelected && !isExporting && (
        <Transformer
          ref={trRef}
          flipEnabled={false}
          boundBoxFunc={(oldBox, newBox) =>
            newBox.width < 5 || newBox.height < 5 ? oldBox : newBox
          }
        />
      )}
    </React.Fragment>
  );
};

// ── Renders one text paragraph as individual chars with jitter ───────────────
const renderChars = (
  text: string,
  startX: number,
  startY: number,
  fontSize: number,
  letterSpacing: number,
  lineHeight: number,
  jitter: number,
  color: string,
  fontFamily: string,
  keyPrefix: string,
) => {
  const lineGap = fontSize * lineHeight;
  const nodes: React.ReactNode[] = [];
  const lines = text.split('\n');

  lines.forEach((line, lineIndex) => {
    let currentX = startX + 10;
    const currentY = startY + lineIndex * lineGap;

    line.split('').forEach((char, charIndex) => {
      const randomY = (Math.random() - 0.5) * jitter;
      const randomRotation = (Math.random() - 0.5) * jitter * 2;
      const randomOpacity = 0.85 + Math.random() * 0.15;
      const charWidth = char === ' ' ? fontSize * 0.3 : fontSize * 0.5;

      nodes.push(
        <Text
          key={`${keyPrefix}-${lineIndex}-${charIndex}`}
          text={char}
          x={currentX}
          y={currentY + randomY}
          fontSize={fontSize}
          fontFamily={fontFamily}
          fill={color}
          opacity={randomOpacity}
          rotation={randomRotation}
        />
      );
      currentX += charWidth + letterSpacing;
    });
  });

  return nodes;
};

// ── Main canvas ──────────────────────────────────────────────────────────────
const HandwritingCanvas: React.FC<Props> = ({
  options, stageRef, updateOption, updateImage, updateTextBlock, isExporting = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [selectedId, selectShape] = useState<string | null>(null);

  const BASE_WIDTH = 794;
  const BASE_HEIGHT = 1123;

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setScale(containerRef.current.clientWidth / BASE_WIDTH);
      }
    };
    const id = setTimeout(handleResize, 0);
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize); clearTimeout(id); };
  }, []);

  const { pagesText, currentPage, style, inkColor, pageType, fontSize, letterSpacing, lineHeight, jitter, pageImages } = options;

  const currentImages = pageImages ? (pageImages[currentPage] || []) : [];
  const currentBlocks: TextBlock[] = options.pageBlocks?.[currentPage] || [];

  const color = inkColor === 'blue' ? '#0000ff' : '#1a1a1a';
  const marginX = options.startX ?? 80;
  const marginY = options.startY ?? 60;
  const lineGap = fontSize * lineHeight;
  const mainText = pagesText[currentPage] || '';

  const renderBackground = () => {
    if (pageType === 'plain') return null;
    const elems: React.ReactNode[] = [];
    const numLines = Math.floor((BASE_HEIGHT - 60) / lineGap);
    for (let i = 0; i <= numLines; i++) {
      elems.push(
        <Line key={`rl-${i}`} points={[0, 60 + i * lineGap + fontSize * 0.8, BASE_WIDTH, 60 + i * lineGap + fontSize * 0.8]} stroke="#e2e8f0" strokeWidth={1} />
      );
    }
    elems.push(<Line key="ml" points={[80, 0, 80, BASE_HEIGHT]} stroke="#fecaca" strokeWidth={2} />);
    return elems;
  };

  const renderBorder = () => {
    if (!options.showBorder) return null;
    const bw = options.borderWidth ?? 4;
    return <Rect x={bw / 2} y={bw / 2} width={BASE_WIDTH - bw} height={BASE_HEIGHT - bw} stroke="#333333" strokeWidth={bw} />;
  };

  const handleStageClick = (e: any) => {
    const clickedOnEmpty = e.target === e.target.getStage() || e.target.hasName('bg-rect') || e.target.hasName('ruled-line');
    if (clickedOnEmpty) selectShape(null);
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-auto bg-white paper-shadow rounded-sm overflow-hidden flex items-start justify-center"
      style={{ aspectRatio: `${BASE_WIDTH} / ${BASE_HEIGHT}` }}
    >
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'top center', width: BASE_WIDTH, height: BASE_HEIGHT, flexShrink: 0 }}>
        <Stage width={BASE_WIDTH} height={BASE_HEIGHT} id="handwriting-stage" ref={stageRef} onClick={handleStageClick} onTap={handleStageClick}>
          <Layer>
            <Rect name="bg-rect" width={BASE_WIDTH} height={BASE_HEIGHT} fill="white" />
            {renderBackground()}
            {renderBorder()}

            {/* Images */}
            {currentImages.map((image) => (
              <CanvasImage
                key={image.id}
                image={image}
                isSelected={image.id === selectedId}
                onSelect={() => selectShape(image.id)}
                onChange={(u) => updateImage && updateImage(image.id, u)}
                isExporting={isExporting}
              />
            ))}

            {/* Main text block — draggable */}
            <Group
              draggable={!isExporting}
              onDragEnd={(e) => {
                if (!updateOption) return;
                const node = e.target;
                updateOption('startX', marginX + node.x());
                updateOption('startY', marginY + node.y());
                node.x(0);
                node.y(0);
              }}
            >
              {renderChars(mainText, marginX, marginY, fontSize, letterSpacing, lineHeight, jitter, color, style, 'main')}
            </Group>

            {/* Extra text blocks — each independently draggable */}
            {currentBlocks.map((block) => (
              <Group
                key={block.id}
                draggable={!isExporting}
                onDragEnd={(e) => {
                  if (!updateTextBlock) return;
                  const node = e.target;
                  updateTextBlock(block.id, { x: block.x + node.x(), y: block.y + node.y() });
                  node.x(0);
                  node.y(0);
                }}
              >
                {renderChars(block.text, block.x, block.y, fontSize, letterSpacing, lineHeight, jitter, color, style, `block-${block.id}`)}
              </Group>
            ))}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default HandwritingCanvas;
