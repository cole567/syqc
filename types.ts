export type AppMode = 'watermark' | 'enhance';

export interface ProcessedImageResult {
  originalUrl: string;
  processedUrl: string | null;
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
  errorMessage?: string;
}

export interface UploadProps {
  onImageSelected: (base64: string) => void;
  isProcessing: boolean;
  mode: AppMode;
}

export interface ComparisonProps {
  original: string;
  processed: string;
  mode: AppMode;
}