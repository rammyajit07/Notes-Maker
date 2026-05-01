"use client";

import React, { useState, useRef } from 'react';
import HandwritingCanvas from '@/components/HandwritingCanvas';
import Toolbar from '@/components/Toolbar';
import { useHandwriting } from '@/hooks/useHandwriting';
import { jsPDF } from 'jspdf';
import Konva from 'konva';
import { FileEdit, ChevronDown, ChevronUp, Settings2, Download, Image as ImageIcon } from 'lucide-react';

export default function Home() {
  const { options, updateOption, updateCurrentPageText, goToPage, addImage, updateImage, removeImage, addTextBlock, updateTextBlock, removeTextBlock } = useHandwriting();
  const [isToolbarOpen, setIsToolbarOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const stageRef = useRef<Konva.Stage>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      if (addImage) {
        addImage({
          id: Date.now().toString(),
          src,
          x: 100,
          y: 100,
          width: 200,
          height: 200,
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleExport = async () => {
    // Find the last page that has text
    let lastContentPage = 0;
    options.pagesText.forEach((text, index) => {
      if (text.trim().length > 0) {
        lastContentPage = index;
      }
    });

    // Request file handle BEFORE async generation to preserve user gesture in Chrome/Brave
    let fileHandle: any = null;
    try {
      if ('showSaveFilePicker' in window) {
        // @ts-ignore
        fileHandle = await window.showSaveFilePicker({
          suggestedName: 'handwritten-assignment.pdf',
          types: [{
            description: 'PDF Document',
            accept: { 'application/pdf': ['.pdf'] },
          }],
        });
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return; // User cancelled the native save dialog
      }
      console.warn('File picker failed, falling back to standard download', err);
    }

    setIsExporting(true);
    
    // Create PDF with A4 dimensions
    // A4 is 210mm x 297mm
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const originalPage = options.currentPage;

    // We need to render each page, capture it, and add it to PDF
    for (let i = 0; i <= lastContentPage; i++) {
      // Switch to the page to render it on the canvas
      goToPage(i);
      
      // Wait for React and Konva to re-render
      await new Promise(resolve => setTimeout(resolve, 300));

      if (stageRef.current) {
        // Capture the Stage at its full resolution (no scaling)
        const imgData = stageRef.current.toDataURL({ pixelRatio: 2 });
        
        // On pages after the first, add a new page to the PDF
        if (i > 0) {
          pdf.addPage();
        }

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      }
    }

    // Return to the original page user was on
    goToPage(originalPage);
    setIsExporting(false);

    // If we got a native file handle, write directly to it (Chrome/Edge/Brave)
    if (fileHandle) {
      try {
        const writable = await fileHandle.createWritable();
        const pdfBlob = pdf.output('blob');
        await writable.write(pdfBlob);
        await writable.close();
        return; // Success!
      } catch (err) {
        console.error('Failed to write to file handle', err);
        // Fallback if writing fails
      }
    }
    
    // Fallback for Safari/Firefox (or if filePicker failed)
    const dataUri = pdf.output('datauristring');
    const a = document.createElement('a');
    a.href = dataUri;
    a.download = 'handwritten-assignment.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Column: Input and Controls */}
          <div className="w-full lg:w-[380px] space-y-6 flex-shrink-0">
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

              {options.pageBlocks && options.pageBlocks[options.currentPage]?.map((block, index) => (
                <div key={block.id} className="relative mt-3 bg-slate-50 rounded-xl border border-slate-200 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Text Block {index + 1}</label>
                    <button
                      onClick={() => removeTextBlock && removeTextBlock(block.id)}
                      className="text-xs text-red-500 hover:text-red-700 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                  <textarea
                    value={block.text}
                    onChange={(e) => updateTextBlock && updateTextBlock(block.id, { text: e.target.value })}
                    placeholder="Type content..."
                    className="w-full h-20 p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none bg-white text-slate-700 text-sm placeholder:text-slate-300"
                  />
                  <div className="mt-2 space-y-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        Font Size: {block.fontSize ?? options.fontSize}px
                      </label>
                      <input
                        type="range" min="12" max="40"
                        value={block.fontSize ?? options.fontSize}
                        onChange={(e) => updateTextBlock && updateTextBlock(block.id, { fontSize: parseInt(e.target.value) })}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        Realism (Jitter): {block.jitter ?? options.jitter}
                      </label>
                      <input
                        type="range" min="0" max="8" step="0.5"
                        value={block.jitter ?? options.jitter}
                        onChange={(e) => updateTextBlock && updateTextBlock(block.id, { jitter: parseFloat(e.target.value) })}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={() => addTextBlock && addTextBlock({
                  id: Date.now().toString(),
                  text: '',
                  x: 100,
                  y: 100 + ((options.pageBlocks?.[options.currentPage]?.length || 0) * 50)
                })}
                className="w-full mt-3 py-2 border border-dashed border-primary/50 text-primary rounded-xl font-medium hover:bg-blue-50 transition-colors text-sm"
              >
                + Add Extra Text Block
              </button>

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 bg-blue-50 text-primary px-3 py-2 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors text-sm font-medium">
                    <ImageIcon size={16} />
                    Insert Image
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                  {options.pageImages && options.pageImages[options.currentPage]?.length > 0 && (
                    <button 
                      onClick={() => {
                        const images = options.pageImages[options.currentPage];
                        if (images && removeImage) {
                          images.forEach(img => removeImage(img.id));
                        }
                      }}
                      className="text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
                    >
                      Clear Images
                    </button>
                  )}
                </div>
              </div>

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
          <div className="w-full flex-grow lg:sticky lg:top-8">
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-lg font-semibold text-slate-700">
                Live Preview <span className="text-slate-400 font-normal ml-2">(Page {options.currentPage + 1})</span>
              </h2>
              <div className="text-[10px] sm:text-xs text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-100 uppercase tracking-widest">
                Print Quality 300DPI
              </div>
            </div>
            
            <div className="relative w-full max-w-[794px] mx-auto bg-slate-200/30 p-1 sm:p-2 rounded-xl border border-slate-200/50">
              <HandwritingCanvas 
                options={options} 
                stageRef={stageRef} 
                updateOption={updateOption}
                updateImage={updateImage}
                updateTextBlock={updateTextBlock}
                isExporting={isExporting}
              />

              
              {isExporting && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-lg">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-primary font-bold">Generating PDF Pages...</p>
                  <p className="text-xs text-slate-400">Capturing Page {options.currentPage + 1}</p>
                </div>
              )}
            </div>

            {/* Mobile Export Button (Below Paper) */}
            <button
              onClick={handleExport}
              className="lg:hidden w-full mt-6 bg-primary hover:bg-primary-hover text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-500/20"
            >
              <Download size={20} />
              Download PDF
            </button>
          </div>

        </div>
      </div>

    </main>
  );
}
