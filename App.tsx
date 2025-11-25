import React, { useState } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ComparisonSlider } from './components/ComparisonSlider';
import { removeWatermarkFromImage } from './services/geminiService';
import { ProcessedImageResult } from './types';
import { AlertCircle } from 'lucide-react';

const App: React.FC = () => {
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
      const processedImage = await removeWatermarkFromImage(base64);
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

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8 max-w-5xl">
        <div className="space-y-12">
          
          {/* Hero Section - Only show when idle */}
          {state.status === 'idle' && (
            <div className="text-center space-y-4 py-8 animate-fade-in">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                智能去除水印 <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-purple-400">
                  宛如魔法
                </span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                上传您的图片，让我们的 AI 重构背景，瞬间去除文字、徽标和覆盖物，且不损失画质。
              </p>
            </div>
          )}

          {/* Main Content Area */}
          <div className="w-full">
            {state.status === 'idle' && (
              <ImageUploader 
                onImageSelected={handleImageSelected} 
                isProcessing={false} 
              />
            )}

            {state.status === 'processing' && (
              <div className="space-y-6">
                <ImageUploader 
                  onImageSelected={() => {}} 
                  isProcessing={true} 
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
          
          {/* Features Grid - Only visible in idle state for SEO/Explanation */}
          {state.status === 'idle' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-dark-700/50">
              {[
                { title: 'AI 驱动', desc: '使用先进的 Gemini Vision 模型理解图像内容。' },
                { title: '高质量', desc: '保持原始分辨率的同时填充背景空隙。' },
                { title: '隐私优先', desc: '图像仅在内存中处理，不会永久存储。' }
              ].map((feat, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-dark-800/50 border border-dark-700 hover:bg-dark-800 transition-colors">
                  <h3 className="text-white font-semibold mb-2">{feat.title}</h3>
                  <p className="text-gray-400 text-sm">{feat.desc}</p>
                </div>
              ))}
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