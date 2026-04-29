"use client";

import React, { useState } from 'react';
import HandwritingCanvas from '@/components/HandwritingCanvas';
import Toolbar from '@/components/Toolbar';
import { useHandwriting } from '@/hooks/useHandwriting';
import { jsPDF } from 'jspdf';
import { FileEdit, ChevronDown, ChevronUp, Settings2, Download } from 'lucide-react';

export default function Home() {
  const { options, updateOption, updateCurrentPageText, goToPage } = useHandwriting();
  const [isToolbarOpen, setIsToolbarOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    // Find the last page that has text
    let lastContentPage = 0;
    options.pagesText.forEach((text, index) => {
      if (text.trim().length > 0) {
        lastContentPage = index;
      }
    });

    setIsExporting(true);
    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'px',
      format: 'a4' // Use standard A4
    });

    const originalPage = options.currentPage;

    // We need to render each page, capture it, and add it to PDF
    for (let i = 0; i <= lastContentPage; i++) {
      // Switch to the page to render it on the canvas
      goToPage(i);
      
      // Wait a small bit for React to re-render the canvas
      await new Promise(resolve => setTimeout(resolve, 200));

      const canvas = document.querySelector('canvas');
      if (canvas) {
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        
        // On pages after the first, add a new page to the PDF
        if (i > 0) {
          pdf.addPage();
        }

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      }
    }

    // Return to the original page user was on
    goToPage(originalPage);
    setIsExporting(false);
    
    pdf.save('handwritten-assignment.pdf');
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="py-8 px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="bg-primary p-2 rounded-lg">
            <FileEdit className="text-white" size={24} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Handwriting <span className="text-primary">Generator</span>
          </h1>
        </div>
        <p className="text-slate-500 max-w-md mx-auto px-4">
          Convert your typed text into beautiful, realistic human-like handwriting instantly.
        </p>
      </header>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Input and Controls */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass rounded-2xl p-6 paper-shadow">
              <div className="flex items-center justify-between mb-3">
                <label className="text-slate-700 font-semibold">Your Text</label>
                <div className="text-xs font-bold text-primary bg-blue-50 px-2 py-1 rounded">
                  Page {options.currentPage + 1} of 50
                </div>
              </div>
              
              <textarea
                value={options.pagesText[options.currentPage]}
                onChange={(e) => updateCurrentPageText(e.target.value)}
                placeholder={`Type content for page ${options.currentPage + 1}...`}
                className="w-full h-48 lg:h-64 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none bg-white text-slate-700 placeholder:text-slate-300"
              />

              {/* Page Navigation */}
              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => goToPage(options.currentPage - 1)}
                  disabled={options.currentPage === 0 || isExporting}
                  className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-medium text-sm"
                >
                  Previous Page
                </button>
                <button
                  onClick={() => goToPage(options.currentPage + 1)}
                  disabled={options.currentPage === 49 || isExporting}
                  className="flex-1 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-medium text-sm"
                >
                  Next Page
                </button>
              </div>
            </div>
            
            {/* Mobile Dropdown for Toolbar */}
            <div className="lg:hidden">
              <button 
                onClick={() => setIsToolbarOpen(!isToolbarOpen)}
                className="w-full flex items-center justify-between p-5 glass rounded-2xl paper-shadow border border-slate-100 mb-2"
              >
                <div className="flex items-center gap-2 text-slate-700 font-bold">
                  <Settings2 size={20} className="text-primary" />
                  <span>Handwriting Settings</span>
                </div>
                {isToolbarOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              
              <div className={`transition-all duration-300 overflow-hidden ${isToolbarOpen ? 'max-h-[2000px] opacity-100 mb-8' : 'max-h-0 opacity-0'}`}>
                <Toolbar 
                  options={options} 
                  updateOption={updateOption} 
                  onExport={handleExport} 
                />
              </div>
            </div>

            {/* Desktop Toolbar (Always Visible) */}
            <div className="hidden lg:block">
              <Toolbar 
                options={options} 
                updateOption={updateOption} 
                onExport={handleExport} 
              />
            </div>
          </div>

          {/* Right Column: Preview */}
          <div className="lg:col-span-8 lg:sticky lg:top-8">
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-lg font-semibold text-slate-700">
                Live Preview <span className="text-slate-400 font-normal ml-2">(Page {options.currentPage + 1})</span>
              </h2>
              <div className="text-[10px] sm:text-xs text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-100 uppercase tracking-widest">
                Print Quality 300DPI
              </div>
            </div>
            
            <div className="relative aspect-[210/297] w-full max-w-[800px] mx-auto">
              <HandwritingCanvas options={options} />
              
              {isExporting && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-lg">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-primary font-bold">Generating PDF Pages...</p>
                  <p className="text-xs text-slate-400">Capturing Page {options.currentPage + 1}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-col items-center gap-4">
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="w-full max-w-md bg-primary hover:bg-primary-hover text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Download size={20} />
                    Download Multi-Page PDF
                  </>
                )}
              </button>
              
              <p className="text-center text-sm text-slate-400 px-4">
                 Your PDF will include all pages up to your last written page.
              </p>
            </div>
          </div>

        </div>
      </div>

    </main>
  );
}
