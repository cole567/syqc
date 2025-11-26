import React, { useState } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ComparisonSlider } from './components/ComparisonSlider';
import { removeWatermarkFromImage, enhanceImageQuality } from './services/geminiService';
import { ProcessedImageResult, AppMode } from './types';
import { AlertCircle, Eraser, Wand2 } from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('watermark');
  const [state, setState] = useState<ProcessedImageResult>({
    originalUrl: '',
    processedUrl: null,
    status: 'idle'
  });

  const handleImageSelected = async (base64: string) => {
    setState({
      originalUrl: base64,
      processedUrl: null,
      status: 'processing'
    });

    try {
      const processedImage = mode === 'watermark' 
        ? await removeWatermarkFromImage(base64)
        : await enhanceImageQuality(base64);

      setState(prev => ({
        ...prev,
        processedUrl: processedImage,
        status: 'completed'
      }));
    } catch (error: any) {
      console.error(error);
      setState(prev => ({
        ...prev,
        status: 'error',
        errorMessage: error.message || "出错了，请重试。"
      }));
    }
  };

  const resetApp = () => {
    setState({
      originalUrl: '',
      processedUrl: null,
      status: 'idle'
    });
  };

  const switchMode = (newMode: AppMode) => {
    if (state.status !== 'idle' && state.status !== 'completed' && state.status !== 'error') return;
    setMode(newMode);
    // Optional: Reset state when switching modes if you want a fresh start
    // resetApp(); 
  };

  const getContentText = () => {
    if (mode === 'watermark') {
      return {
        title: '智能去除水印',
        highlight: '宛如魔法',
        desc: '上传您的图片，让我们的 AI 重构背景，瞬间去除文字、徽标和覆盖物，且不损失画质。'
      };
    } else {
      return {
        title: '智能画质增强',
        highlight: '清晰入微',
        desc: '一键提升照片清晰度。智能降噪、锐化细节，让模糊的图片焕发新生。'
      };
    }
  };

  const content = getContentText();

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8 max-w-5xl">
        <div className="space-y-10">
          
          {/* Hero Section */}
          {state.status === 'idle' && (
            <div className="text-center space-y-6 py-4 animate-fade-in">
              <div className="inline-flex p-1 bg-dark-800 rounded-xl border border-dark-700 mb-4">
                <button
                  onClick={() => switchMode('watermark')}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    mode === 'watermark' 
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/50' 
                      : 'text-gray-400 hover:text-white hover:bg-dark-700'
                  }`}
                >
                  <Eraser className="w-4 h-4" />
                  去除水印
                </button>
                <button
                  onClick={() => switchMode('enhance')}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    mode === 'enhance' 
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/50' 
                      : 'text-gray-400 hover:text-white hover:bg-dark-700'
                  }`}
                >
                  <Wand2 className="w-4 h-4" />
                  画质增强
                </button>
              </div>

              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                {content.title} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-purple-400">
                  {content.highlight}
                </span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                {content.desc}
              </p>
            </div>
          )}

          {/* Main Content Area */}
          <div className="w-full">
            {state.status === 'idle' && (
              <ImageUploader 
                onImageSelected={handleImageSelected} 
                isProcessing={false} 
                mode={mode}
              />
            )}

            {state.status === 'processing' && (
              <div className="space-y-6">
                <ImageUploader 
                  onImageSelected={() => {}} 
                  isProcessing={true} 
                  mode={mode}
                />
                 {/* Preview of what's being processed */}
                <div className="opacity-50 blur-sm pointer-events-none max-w-md mx-auto h-48 overflow-hidden rounded-lg border border-dark-700">
                    <img src={state.originalUrl} className="w-full h-full object-cover" alt="Processing" />
                </div>
              </div>
            )}

            {state.status === 'completed' && state.processedUrl && (
              <div className="animate-fade-in-up">
                <ComparisonSlider 
                  original={state.originalUrl} 
                  processed={state.processedUrl}
                  onReset={resetApp}
                  mode={mode}
                />
              </div>
            )}

            {state.status === 'error' && (
               <div className="max-w-xl mx-auto mt-8">
                <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 flex items-start gap-4">
                  <div className="bg-red-500/20 p-2 rounded-full">
                    <AlertCircle className="w-6 h-6 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">处理失败</h3>
                    <p className="text-red-200 text-sm mb-4">{state.errorMessage}</p>
                    <button 
                      onClick={resetApp}
                      className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      重试
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Features Grid - Only visible in idle state */}
          {state.status === 'idle' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-dark-700/50">
              <div className="p-6 rounded-2xl bg-dark-800/50 border border-dark-700 hover:bg-dark-800 transition-colors">
                <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <Eraser className="w-4 h-4 text-primary-500" /> 智能消笔
                </h3>
                <p className="text-gray-400 text-sm">精准识别并移除图片中的水印、路人或不需要的物体。</p>
              </div>
              <div className="p-6 rounded-2xl bg-dark-800/50 border border-dark-700 hover:bg-dark-800 transition-colors">
                <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-purple-500" /> 画质增强
                </h3>
                <p className="text-gray-400 text-sm">智能修复模糊图片，提升分辨率，让照片细节更加清晰。</p>
              </div>
              <div className="p-6 rounded-2xl bg-dark-800/50 border border-dark-700 hover:bg-dark-800 transition-colors">
                 <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-green-500" /> 隐私保护
                </h3>
                <p className="text-gray-400 text-sm">图片仅在浏览器会话中处理，不会永久存储在服务器上。</p>
              </div>
            </div>
          )}

        </div>
      </main>

      <footer className="py-6 text-center text-gray-600 text-sm border-t border-dark-800 mt-auto">
        <p>© {new Date().getFullYear()} ClearView AI. 保留所有权利。</p>
      </footer>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;