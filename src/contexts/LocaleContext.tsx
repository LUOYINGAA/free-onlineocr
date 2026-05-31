"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type Locale = "zh-CN" | "en" | "zh-TW" | "ja" | "ko";

interface Translations {
  [key: string]: {
    [locale in Locale]: string;
  };
}

const translations: Translations = {
  // Header
  "header.title": {
    "zh-CN": "Free Online OCR",
    "en": "Free Online OCR",
    "zh-TW": "Free Online OCR",
    "ja": "Free Online OCR",
    "ko": "Free Online OCR",
  },
  "header.subtitle": {
    "zh-CN": "纯前端识别 · 数据本地处理 · 免费",
    "en": "Browser-based · Local Processing · Free",
    "zh-TW": "純前端識別 · 數據本地處理 · 免費",
    "ja": "ブラウザベース · ローカル処理 · 無料",
    "ko": "브라우저 기반 · 로컬 처리 · 무료",
  },
  "header.badge.free": {
    "zh-CN": "100% 免费",
    "en": "100% Free",
    "zh-TW": "100% 免費",
    "ja": "100% 無料",
    "ko": "100% 무료",
  },
  "header.badge.local": {
    "zh-CN": "本地处理",
    "en": "Local Processing",
    "zh-TW": "本地處理",
    "ja": "ローカル処理",
    "ko": "로컬 처리",
  },
  "header.badge.noApi": {
    "zh-CN": "无需API",
    "en": "No API Key",
    "zh-TW": "無需API",
    "ja": "API不要",
    "ko": "API 불필요",
  },

  // Upload
  "upload.title": {
    "zh-CN": "上传图片",
    "en": "Upload Image",
    "zh-TW": "上傳圖片",
    "ja": "画像をアップロード",
    "ko": "이미지 업로드",
  },
  "upload.dragHint": {
    "zh-CN": "拖拽图片到这里，或点击上传",
    "en": "Drag image here or click to upload",
    "zh-TW": "拖曳圖片到這裡，或點擊上傳",
    "ja": "画像をドラッグ＆ドロップまたはクリックしてアップロード",
    "ko": "이미지를 여기로 드래그하거나 클릭하여 업로드",
  },
  "upload.formatHint": {
    "zh-CN": "支持 JPG, PNG, GIF, BMP 格式，最大 10MB",
    "en": "Supports JPG, PNG, GIF, BMP, max 10MB",
    "zh-TW": "支援 JPG, PNG, GIF, BMP 格式，最大 10MB",
    "ja": "JPG, PNG, GIF, BMP対応、最大10MB",
    "ko": "JPG, PNG, GIF, BMP 지원, 최대 10MB",
  },
  "upload.clearBtn": {
    "zh-CN": "清空图片",
    "en": "Clear Image",
    "zh-TW": "清除圖片",
    "ja": "画像をクリア",
    "ko": "이미지 지우기",
  },
  "upload.language": {
    "zh-CN": "识别语言",
    "en": "Recognition Language",
    "zh-TW": "識別語言",
    "ja": "認識言語",
    "ko": "인식 언어",
  },
  "upload.startBtn": {
    "zh-CN": "开始识别",
    "en": "Start Recognition",
    "zh-TW": "開始識別",
    "ja": "認識開始",
    "ko": "인식 시작",
  },
  "upload.processing": {
    "zh-CN": "识别中...",
    "en": "Processing...",
    "zh-TW": "識別中...",
    "ja": "処理中...",
    "ko": "처리 중...",
  },
  "upload.firstUseHint": {
    "zh-CN": "💡 首次使用需下载语言包（约50MB），请耐心等待",
    "en": "💡 First use requires downloading language pack (~50MB), please wait patiently",
    "zh-TW": "💡 首次使用需下載語言包（約50MB），請耐心等待",
    "ja": "💡 初回のみ言語パック（約50MB）のダウンロードが必要です",
    "ko": "💡 첫 사용 시 언어 팩(~50MB) 다운로드 필요, 잠시만 기다려주세요",
  },

  // Result
  "result.title": {
    "zh-CN": "识别结果",
    "en": "Recognition Result",
    "zh-TW": "識別結果",
    "ja": "認識結果",
    "ko": "인식 결과",
  },
  "result.copy": {
    "zh-CN": "复制",
    "en": "Copy",
    "zh-TW": "複製",
    "ja": "コピー",
    "ko": "복사",
  },
  "result.export": {
    "zh-CN": "导出 TXT",
    "en": "Export TXT",
    "zh-TW": "導出 TXT",
    "ja": "TXT出力",
    "ko": "TXT 내보내기",
  },
  "result.confidence": {
    "zh-CN": "置信度",
    "en": "Confidence",
    "zh-TW": "置信度",
    "ja": "信頼度",
    "ko": "신뢰도",
  },
  "result.charCount": {
    "zh-CN": "字数",
    "en": "Characters",
    "zh-TW": "字數",
    "ja": "文字数",
    "ko": "글자 수",
  },
  "result.placeholder": {
    "zh-CN": "上传图片并点击识别",
    "en": "Upload image and click recognize",
    "zh-TW": "上傳圖片並點擊識別",
    "ja": "画像をアップロードして認識をクリック",
    "ko": "이미지를 업로드하고 인식 버튼을 클릭하세요",
  },
  "result.placeholder2": {
    "zh-CN": "识别结果将显示在这里",
    "en": "Recognition result will appear here",
    "zh-TW": "識別結果將顯示在這裡",
    "ja": "認識結果がここに表示されます",
    "ko": "인식 결과가 여기에 표시됩니다",
  },

  // Features
  "features.title": {
    "zh-CN": "核心优势",
    "en": "Core Features",
    "zh-TW": "核心優勢",
    "ja": "コア機能",
    "ko": "핵심 기능",
  },
  "features.free.title": {
    "zh-CN": "完全免费",
    "en": "Completely Free",
    "zh-TW": "完全免費",
    "ja": "完全無料",
    "ko": "완전 무료",
  },
  "features.free.desc": {
    "zh-CN": "无需API密钥，无调用限制",
    "en": "No API key required, unlimited calls",
    "zh-TW": "無需API密鑰，無調用限制",
    "ja": "APIキー不要、制限なし",
    "ko": "API 키 불필요, 무제한",
  },
  "features.privacy.title": {
    "zh-CN": "隐私安全",
    "en": "Privacy & Security",
    "zh-TW": "隱私安全",
    "ja": "プライバシーとセキュリティ",
    "ko": "개인정보 보호",
  },
  "features.privacy.desc": {
    "zh-CN": "数据不上传，本地浏览器处理",
    "en": "Data not uploaded, processed locally",
    "zh-TW": "數據不上傳，本地瀏覽器處理",
    "ja": "データはアップロードせずローカルで処理",
    "ko": "데이터 업로드 없음, 브라우저에서 로컬 처리",
  },
  "features.global.title": {
    "zh-CN": "全球可用",
    "en": "Global Access",
    "zh-TW": "全球可用",
    "ja": "世界中どこからでも",
    "ko": "전 세계 사용 가능",
  },
  "features.global.desc": {
    "zh-CN": "不依赖国内API，海外可正常使用",
    "en": "No dependency on domestic APIs, works overseas",
    "zh-TW": "不依賴國內API，海外可正常使用",
    "ja": "国内APIに依存せず、海外でも利用可能",
    "ko": "국내 API에 의존하지 않음, 해외에서도正常使用",
  },
  "features.multiLang.title": {
    "zh-CN": "多语言支持",
    "en": "Multi-language",
    "zh-TW": "多語言支援",
    "ja": "多言語対応",
    "ko": "다국어 지원",
  },
  "features.multiLang.desc": {
    "zh-CN": "中英日韩等多种语言识别",
    "en": "Supports Chinese, English, Japanese, Korean",
    "zh-TW": "中英日韓等多種語言識別",
    "ja": "中日韓など多言語認識対応",
    "ko": "중일한국어 등 다국어 인식",
  },

  // Premium
  "premium.title": {
    "zh-CN": "需要更高精度？",
    "en": "Need Higher Accuracy?",
    "zh-TW": "需要更高精度？",
    "ja": "より高い精度が必要ですか？",
    "ko": "더 높은 정확도가 필요하신가요?",
  },
  "premium.desc": {
    "zh-CN": "如需实现文字、符号零误差识别，可点击前往免费在线OCR服务（数据需上传至第三方平台，识别后立即删除）。",
    "en": "For zero-error text and symbol recognition, click to visit free online OCR service (data will be uploaded to third-party platform, deleted immediately after recognition).",
    "zh-TW": "如需實現文字、符號零誤差識別，可點擊前往免費在線OCR服務（數據需上傳至第三方平台，識別後立即刪除）。",
    "ja": "文字・記号の零誤認識が必要な場合は、無料オンラインOCRサービスをクリックしてご覧ください（データは第三者プラットフォームにアップロードされ、認識後すぐに削除されます）。",
    "ko": "문자, 기호 오류 없는 인식이 필요하시면 무료 온라인 OCR 서비스를 클릭해주세요 (데이터가 제3자 플랫폼에 업로드되고 인식 후 즉시 삭제됩니다)",
  },
  "premium.btn": {
    "zh-CN": "前往高精度识别",
    "en": "Go to High Precision",
    "zh-TW": "前往高精度識別",
    "ja": "高精度認識へ",
    "ko": "고정밀 인식으로 이동",
  },

  // Footer
  "footer.title": {
    "zh-CN": "Free Online OCR - 免费在线文字识别工具",
    "en": "Free Online OCR - Free Online Text Recognition Tool",
    "zh-TW": "Free Online OCR - 免費在線文字識別工具",
    "ja": "Free Online OCR - 無料オンライン文字認識ツール",
    "ko": "Free Online OCR - 무료 온라인 문자 인식 도구",
  },
  "footer.subtitle": {
    "zh-CN": "基于 Tesseract.js · 数据本地处理 · 无需API密钥",
    "en": "Based on Tesseract.js · Local Data Processing · No API Key Required",
    "zh-TW": "基於 Tesseract.js · 數據本地處理 · 無需API密鑰",
    "ja": "Tesseract.jsベース · ローカルデータ処理 · APIキー不要",
    "ko": "Tesseract.js 기반 · 로컬 데이터 처리 · API 키 불필요",
  },

  // Languages
  "lang.zh-CN": { "zh-CN": "中文简体", "en": "简体中文", "zh-TW": "簡體中文", "ja": "简体中文", "ko": "중국어 간체" },
  "lang.en": { "zh-CN": "English", "en": "English", "zh-TW": "English", "ja": "English", "ko": "English" },
  "lang.zh-TW": { "zh-CN": "中文繁體", "en": "繁體中文", "zh-TW": "繁體中文", "ja": "繁体中文", "ko": "중국어 번체" },
  "lang.ja": { "zh-CN": "日本語", "en": "日本語", "zh-TW": "日本語", "ja": "日本語", "ko": "일본어" },
  "lang.ko": { "zh-CN": "한국어", "en": "한국어", "zh-TW": "한국어", "ja": "한국어", "ko": "한국어" },

  // Common
  "common.selected": {
    "zh-CN": "已选择",
    "en": "Selected",
    "zh-TW": "已選擇",
    "ja": "選択済み",
    "ko": "선택됨",
  },

  // Errors
  "error.imageOnly": {
    "zh-CN": "请上传图片文件",
    "en": "Please upload an image file",
    "zh-TW": "請上傳圖片文件",
    "ja": "画像ファイルをアップロードしてください",
    "ko": "이미지 파일을 업로드해주세요",
  },
  "error.fileTooLarge": {
    "zh-CN": "文件大小超过10MB限制",
    "en": "File size exceeds 10MB limit",
    "zh-TW": "文件大小超過10MB限制",
    "ja": "ファイルサイズが10MBの制限を超えています",
    "ko": "파일 크기가 10MB 제한을 초과했습니다",
  },
  "error.noText": {
    "zh-CN": "未识别到文字，请尝试更换图片",
    "en": "No text recognized, please try another image",
    "zh-TW": "未識別到文字，請嘗試更換圖片",
    "ja": "文字が認識できませんでした。別の画像试试ください",
    "ko": "텍스트가 인식되지 않았습니다. 다른 이미지를 시도해주세요",
  },

  // Status
  "status.loading": {
    "zh-CN": "正在初始化...",
    "en": "Initializing...",
    "zh-TW": "正在初始化...",
    "ja": "初期化中...",
    "ko": "초기화 중...",
  },
  "status.loadingCore": {
    "zh-CN": "加载OCR核心...",
    "en": "Loading OCR core...",
    "zh-TW": "載入OCR核心...",
    "ja": "OCRコアを読み込み中...",
    "ko": "OCR 코어 로딩 중...",
  },
  "status.initEngine": {
    "zh-CN": "初始化识别引擎...",
    "en": "Initializing recognition engine...",
    "zh-TW": "初始化識別引擎...",
    "ja": "認識エンジンを初期化中...",
    "ko": "인식 엔진 초기화 중...",
  },
  "status.loadingLang": {
    "zh-CN": "加载语言包",
    "en": "Loading language pack",
    "zh-TW": "載入語言包",
    "ja": "言語パックを読み込み中",
    "ko": "언어 팩 로딩 중",
  },
  "status.ready": {
    "zh-CN": "准备就绪",
    "en": "Ready",
    "zh-TW": "準備就緒",
    "ja": "準備完了",
    "ko": "준비 완료",
  },
  "status.recognizing": {
    "zh-CN": "识别中",
    "en": "Recognizing",
    "zh-TW": "識別中",
    "ja": "認識中",
    "ko": "인식 중",
  },
  "status.done": {
    "zh-CN": "识别完成，置信度",
    "en": "Recognition complete, confidence",
    "zh-TW": "識別完成，置信度",
    "ja": "認識完了、信頼度",
    "ko": "인식 완료, 신뢰도",
  },

  // Alert
  "alert.copied": {
    "zh-CN": "已复制到剪贴板",
    "en": "Copied to clipboard",
    "zh-TW": "已複製到剪貼簿",
    "ja": "クリップボードにコピーしました",
    "ko": "클립보드에 복사되었습니다",
  },
};

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LocaleContext = createContext<LocaleContextType | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("zh-CN");

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) return key;
    return translation[locale] || translation["zh-CN"] || key;
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return context;
}

export const localeNames: { value: Locale; label: string }[] = [
  { value: "zh-CN", label: "中文简体" },
  { value: "en", label: "English" },
  { value: "zh-TW", label: "中文繁體" },
  { value: "ja", label: "日本語" },
  { value: "ko", label: "한국어" },
];
