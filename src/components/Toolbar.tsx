"use client";

import React from 'react';
import { HandwritingOptions, HandwritingStyle, InkColor, PageType } from '../types';
import { Download, Type, Palette, FileText } from 'lucide-react';

interface Props {
  options: HandwritingOptions;
  updateOption: <K extends keyof HandwritingOptions>(key: K, value: HandwritingOptions[K]) => void;
  onExport: () => void;
}

const Toolbar: React.FC<Props> = ({ options, updateOption, onExport }) => {
  const styles: HandwritingStyle[] = [
    'Homemade Apple', 
    'Caveat', 
    'Shadows Into Light',
    'Dancing Script',
    'Pacifico',
    'Indie Flower',
    'Gochi Hand',
    'Reenie Beanie',
    'Gloria Hallelujah',
    'Nothing You Could Do',
    'Just Me Again Down Here'
  ];
  
  const colors: InkColor[] = ['blue', 'black'];
  const pages: PageType[] = ['ruled', 'plain'];

  return (
    <div className="flex flex-col gap-6 p-6 glass rounded-2xl paper-shadow">
      
      {/* Style Selection */}
      <section>
        <div className="flex items-center gap-2 mb-3 text-slate-700 font-semibold">
          <Type size={18} />
          <span>Handwriting Style</span>
        </div>
        <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {styles.map((style) => (
            <button
              key={style}
              onClick={() => updateOption('style', style)}
              className={`px-4 py-3 rounded-xl text-left transition-all border ${
                options.style === style
                  ? 'bg-primary border-primary text-white scale-[1.02]'
                  : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex flex-col">
                <span className="text-xs opacity-70 mb-1">{style}</span>
                <span style={{ fontFamily: style }} className="text-xl">
                  Sample Text
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Ink Color */}
      <section>
        <div className="flex items-center gap-2 mb-3 text-slate-700 font-semibold">
          <Palette size={18} />
          <span>Ink Color</span>
        </div>
        <div className="flex gap-3">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => updateOption('inkColor', color)}
              className={`flex-1 px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                options.inkColor === color
                  ? 'ring-2 ring-primary ring-offset-2'
                  : ''
              }`}
              style={{
                backgroundColor: color === 'blue' ? '#2563eb' : '#1e293b',
                color: 'white',
              }}
            >
              <div className={`w-3 h-3 rounded-full bg-white`}></div>
              <span className="capitalize">{color}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Page Layout */}
      <section>
        <div className="flex items-center gap-2 mb-3 text-slate-700 font-semibold">
          <FileText size={18} />
          <span>Page Layout</span>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            {pages.map((page) => (
              <button
                key={page}
                onClick={() => updateOption('pageType', page)}
                className={`flex-1 px-4 py-3 rounded-xl transition-all ${
                  options.pageType === page
                    ? 'bg-primary text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'
                }`}
              >
                <span className="capitalize">{page}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => updateOption('showBorder', !options.showBorder)}
            className={`w-full px-4 py-3 rounded-xl transition-all font-medium ${
              options.showBorder
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'
            }`}
          >
            {options.showBorder ? 'Hide Page Border' : 'Show Page Border'}
          </button>
          
          {options.showBorder && (
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Border Width: {options.borderWidth}px
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={options.borderWidth}
                onChange={(e) => updateOption('borderWidth', parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          )}

          <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
            💡 Tip: Click anywhere on the preview paper to set where the text starts.
          </div>
        </div>
      </section>

      {/* Sliders for fine-tuning */}
      <section className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Font Size: {options.fontSize}px</label>
          <input
            type="range"
            min="12"
            max="40"
            value={options.fontSize}
            onChange={(e) => updateOption('fontSize', parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Realism (Jitter): {options.jitter}</label>
          <input
            type="range"
            min="0"
            max="8"
            step="0.5"
            value={options.jitter}
            onChange={(e) => updateOption('jitter', parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>
      </section>

      {/* Export Button (Desktop Only) */}
      <button
        onClick={onExport}
        className="hidden lg:flex w-full mt-4 bg-primary hover:bg-primary-hover text-white font-bold py-4 px-6 rounded-2xl items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-500/20"
      >
        <Download size={20} />
        Download PDF
      </button>
    </div>
  );
};

export default Toolbar;
