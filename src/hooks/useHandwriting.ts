"use client";

import { useState } from 'react';
import { HandwritingOptions, HandwritingStyle, InkColor, PageType, ImageItem, TextBlock } from '../types';

export const useHandwriting = () => {
  const [options, setOptions] = useState<HandwritingOptions>({
    pagesText: Array(50).fill(''), // Initialize 50 empty pages
    pageImages: {}, // Initialize empty images record
    pageBlocks: {}, // Initialize empty blocks record
    currentPage: 0,
    style: 'Homemade Apple',
    inkColor: 'blue',
    pageType: 'ruled',
    fontSize: 20,
    letterSpacing: 2,
    lineHeight: 1.5,
    jitter: 1.5,
    showBorder: false,
    borderWidth: 4,
    startX: 80,
    startY: 60,
  });

  const updateOption = <K extends keyof HandwritingOptions>(
    key: K,
    value: HandwritingOptions[K]
  ) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  const updateCurrentPageText = (text: string) => {
    setOptions((prev) => {
      const newPagesText = [...prev.pagesText];
      newPagesText[prev.currentPage] = text;
      return { ...prev, pagesText: newPagesText };
    });
  };

  const goToPage = (pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < 50) {
      updateOption('currentPage', pageIndex);
    }
  };

  const addImage = (image: ImageItem) => {
    setOptions((prev) => {
      const currentPageImages = prev.pageImages[prev.currentPage] || [];
      return {
        ...prev,
        pageImages: {
          ...prev.pageImages,
          [prev.currentPage]: [...currentPageImages, image],
        },
      };
    });
  };

  const updateImage = (id: string, updates: Partial<ImageItem>) => {
    setOptions((prev) => {
      const currentPageImages = prev.pageImages[prev.currentPage] || [];
      return {
        ...prev,
        pageImages: {
          ...prev.pageImages,
          [prev.currentPage]: currentPageImages.map(img => 
            img.id === id ? { ...img, ...updates } : img
          ),
        },
      };
    });
  };

  const removeImage = (id: string) => {
    setOptions((prev) => {
      const currentPageImages = prev.pageImages[prev.currentPage] || [];
      return {
        ...prev,
        pageImages: {
          ...prev.pageImages,
          [prev.currentPage]: currentPageImages.filter(img => img.id !== id),
        },
      };
    });
  };

  const addTextBlock = (block: TextBlock) => {
    setOptions((prev) => {
      const currentPageBlocks = prev.pageBlocks?.[prev.currentPage] || [];
      return {
        ...prev,
        pageBlocks: {
          ...prev.pageBlocks,
          [prev.currentPage]: [...currentPageBlocks, block],
        },
      };
    });
  };

  const updateTextBlock = (id: string, updates: Partial<TextBlock>) => {
    setOptions((prev) => {
      const currentPageBlocks = prev.pageBlocks?.[prev.currentPage] || [];
      return {
        ...prev,
        pageBlocks: {
          ...prev.pageBlocks,
          [prev.currentPage]: currentPageBlocks.map(block => 
            block.id === id ? { ...block, ...updates } : block
          ),
        },
      };
    });
  };

  const removeTextBlock = (id: string) => {
    setOptions((prev) => {
      const currentPageBlocks = prev.pageBlocks?.[prev.currentPage] || [];
      return {
        ...prev,
        pageBlocks: {
          ...prev.pageBlocks,
          [prev.currentPage]: currentPageBlocks.filter(block => block.id !== id),
        },
      };
    });
  };

  return {
    options,
    updateOption,
    updateCurrentPageText,
    goToPage,
    addImage,
    updateImage,
    removeImage,
    addTextBlock,
    updateTextBlock,
    removeTextBlock,
  };
};
