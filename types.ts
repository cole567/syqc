export interface ProcessedImageResult {
  originalUrl: string;
  processedUrl: string | null;
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
  errorMessage?: string;
}

export interface UploadProps {
  onImageSelected: (base64: string) => void;
  isProcessing: boolean;
}

export interface ComparisonProps {
  original: string;
  processed: string;
}
