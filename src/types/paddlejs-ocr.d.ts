declare module "@paddlejs-models/ocr" {
  interface OCRResult {
    text: Array<{
      text: string;
      confidence: number;
    }>;
  }

  interface OCRModule {
    load: (option?: { det?: boolean; rec?: boolean }) => Promise<void>;
    recognize: (image: string | HTMLImageElement | HTMLCanvasElement) => Promise<OCRResult>;
  }

  const ocr: OCRModule;
  export default ocr;
}