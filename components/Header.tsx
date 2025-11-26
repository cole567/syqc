import React from 'react';
import { Sparkles, Image as ImageIcon } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="w-full py-6 px-4 border-b border-dark-700 bg-dark-900/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-primary-500 to-purple-600 p-2 rounded-lg">
            <ImageIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              ClearView AI
            </h1>
            <p className="text-xs text-gray-500">一站式智能图像处理工具</p>
          </div>
        </div>
        
        <div className="hidden sm:flex items-center gap-2 text-sm text-gray-400">
          <Sparkles className="w-4 h-4 text-primary-500" />
          <span>由 Gemini 2.5 Flash 驱动</span>
        </div>
      </div>
    </header>
  );
};