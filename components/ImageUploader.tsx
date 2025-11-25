import React, { useCallback, useState } from 'react';
import { UploadCloud, ImagePlus, Loader2 } from 'lucide-react';
import { UploadProps } from '../types';

export const ImageUploader: React.FC<UploadProps> = ({ onImageSelected, isProcessing }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onImageSelected(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`
        relative group w-full h-80 sm:h-96 rounded-2xl border-2 border-dashed transition-all duration-300 ease-out
        flex flex-col items-center justify-center text-center cursor-pointer overflow-hidden
        ${isDragging 
          ? 'border-primary-500 bg-primary-500/10 scale-[1.01]' 
          : 'border-dark-700 bg-dark-800 hover:border-dark-500 hover:bg-dark-700/50'
        }
        ${isProcessing ? 'pointer-events-none opacity-50' : ''}
      `}
    >
      <input
        type="file"
        accept="image/*"
        onChange={onInputChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        disabled={isProcessing}
      />

      <div className="z-0 p-6 flex flex-col items-center gap-4">
        {isProcessing ? (
          <>
            <div className="relative">
              <div className="absolute inset-0 bg-primary-500/20 blur-xl rounded-full animate-pulse"></div>
              <Loader2 className="w-12 h-12 text-primary-500 animate-spin relative z-10" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-medium text-white">Analyzing Image...</p>
              <p className="text-sm text-gray-400">Removing watermark artifacts</p>
            </div>
          </>
        ) : (
          <>
            <div className={`
              w-16 h-16 rounded-2xl flex items-center justify-center transition-colors duration-300
              ${isDragging ? 'bg-primary-500 text-white' : 'bg-dark-700 text-gray-300 group-hover:bg-dark-600'}
            `}>
              {isDragging ? <ImagePlus className="w-8 h-8" /> : <UploadCloud className="w-8 h-8" />}
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">
                {isDragging ? 'Drop image here' : 'Upload an Image'}
              </h3>
              <p className="text-sm text-gray-400 max-w-xs mx-auto">
                Drag & drop or click to browse. <br/>
                <span className="text-xs opacity-70">Supports JPG, PNG, WEBP</span>
              </p>
            </div>
          </>
        )}
      </div>
      
      {/* Decorative gradient blob */}
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary-600/10 rounded-full blur-3xl pointer-events-none"></div>
    </div>
  );
};