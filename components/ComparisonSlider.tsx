import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Download, RefreshCw, ChevronsLeftRight } from 'lucide-react';
import { ComparisonProps } from '../types';

export const ComparisonSlider: React.FC<ComparisonProps & { onReset: () => void }> = ({ original, processed, onReset, mode }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = () => setIsResizing(true);
  const handleMouseUp = () => setIsResizing(false);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPosition(percent);
  }, [isResizing]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
     if (!isResizing || !containerRef.current) return;
     const rect = containerRef.current.getBoundingClientRect();
     const touch = e.touches[0];
     const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
     const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
     setSliderPosition(percent);
  }, [isResizing]);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [handleMouseMove, handleTouchMove]);

  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = processed;
    link.download = mode === 'watermark' ? 'clean_image_gemini.png' : 'enhanced_image_gemini.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const processedLabel = mode === 'watermark' ? '去水印后' : '增强后';

  return (
    <div className="w-full space-y-6">
      <div 
        ref={containerRef}
        className="relative w-full aspect-square sm:aspect-[4/3] max-h-[600px] overflow-hidden rounded-xl border border-dark-700 bg-dark-900 select-none shadow-2xl shadow-black/50"
      >
        {/* Processed Image (Background layer - visible on the right) */}
        <img 
          src={processed} 
          alt="Clean" 
          className="absolute inset-0 w-full h-full object-contain bg-checkered" 
          draggable={false}
        />
        
        {/* Original Image (Foreground layer - clipped) */}
        <div 
          className="absolute inset-0 h-full w-full overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <img 
            src={original} 
            alt="Original" 
            className="absolute inset-0 w-full h-full object-contain bg-checkered" 
            draggable={false}
          />
          {/* Label Original */}
          <div className="absolute top-4 left-4 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm">
            原图
          </div>
        </div>

        {/* Label Processed */}
         <div className="absolute top-4 right-4 bg-primary-600/80 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm">
            {processedLabel}
          </div>

        {/* Slider Handle */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-10 shadow-[0_0_10px_rgba(0,0,0,0.5)]"
          style={{ left: `${sliderPosition}%` }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg text-primary-600">
            <ChevronsLeftRight className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-dark-800 p-4 rounded-xl border border-dark-700">
        <div className="text-sm text-gray-400">
          <span className="text-white font-medium">对比模式：</span> 拖动滑块查看差异。
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={onReset}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-white font-medium transition-colors border border-dark-600"
          >
            <RefreshCw className="w-4 h-4" />
            上传新图
          </button>
          <button 
            onClick={downloadImage}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-bold transition-all shadow-lg shadow-primary-900/50"
          >
            <Download className="w-4 h-4" />
            下载图片
          </button>
        </div>
      </div>
      
      <style>{`
        .bg-checkered {
          background-color: #1e293b;
          background-image:
            linear-gradient(45deg, #0f172a 25%, transparent 25%),
            linear-gradient(-45deg, #0f172a 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #0f172a 75%),
            linear-gradient(-45deg, transparent 75%, #0f172a 75%);
          background-size: 20px 20px;
          background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
        }
      `}</style>
    </div>
  );
};