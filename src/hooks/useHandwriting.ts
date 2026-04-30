"use client";

import { useState } from 'react';
import { HandwritingOptions, HandwritingStyle, InkColor, PageType } from '../types';

export const useHandwriting = () => {
  const [options, setOptions] = useState<HandwritingOptions>({
    pagesText: Array(50).fill(''), // Initialize 50 empty pages
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

  return {
    options,
    updateOption,
    updateCurrentPageText,
    goToPage,
  };
};
