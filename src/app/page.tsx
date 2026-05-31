"use client";

import { useState, useRef, useCallback } from "react";
import Tesseract from "tesseract.js";
import { useLocale, localeNames } from "@/contexts/LocaleContext";

type Language = "chi_sim" | "eng" | "chi_tra" | "jpn" | "kor";

interface OCRResult {
  words: string;
  confidence: number;
}

export default function OCRPage() {
  const { locale, setLocale, t } = useLocale();
  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [language, setLanguage] = useState<Language>("chi_sim");
  const [result, setResult] = useState<OCRResult | null>(null);
  const [error, setError] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setError(t("error.imageOnly"));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError(t("error.fileTooLarge"));
      return;
    }
    setError("");
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
      setResult(null);
    };
    reader.readAsDataURL(file);
  }, [t]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const recognizeText = async () => {
    if (!image) return;
    setIsProcessing(true);
    setError("");
    setProgress(0);
    setStatusText(t("status.loading"));

    try {
      const langLabel = {
        chi_sim: "中文简体",
        eng: "English",
        chi_tra: "中文繁體",
        jpn: "日本語",
        kor: "한국어",
      }[language] || language;

      const result = await Tesseract.recognize(image, language, {
        logger: (m) => {
          if (m.status === "loading tesseract core") {
            setStatusText(t("status.loadingCore"));
            setProgress(5);
          } else if (m.status === "initializing tesseract") {
            setStatusText(t("status.initEngine"));
            setProgress(10);
          } else if (m.status === "loading language traineddata") {
            setStatusText(`${t("status.loadingLang")} ${langLabel}...`);
            setProgress(20);
          } else if (m.status === "initializing api") {
            setStatusText(t("status.ready"));
            setProgress(30);
          } else if (m.status === "recognizing text") {
            const progressPercent = Math.round(m.progress * 70 + 30);
            setProgress(progressPercent);
            setStatusText(`${t("status.recognizing")} ${progressPercent}%`);
          }
        },
      });

      const text = result.data.text.trim();
      if (text) {
        setResult({
          words: text,
          confidence: result.data.confidence,
        });
        setStatusText(`${t("status.done")} ${Math.round(result.data.confidence)}%`);
      } else {
        setError(t("error.noText"));
      }
    } catch (err) {
      setError(t("error recognition"));
      console.error(err);
    } finally {
      setIsProcessing(false);
      setProgress(100);
    }
  };

  const exportResult = () => {
    if (!result) return;
    const blob = new Blob([result.words], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName.replace(/\.[^.]+$/, "")}_ocr.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    if (result?.words) {
      navigator.clipboard.writeText(result.words);
      alert(t("alert.copied"));
    }
  };

  const clearAll = () => {
    setImage(null);
    setFileName("");
    setResult(null);
    setError("");
    setProgress(0);
    setStatusText("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="border-b border-slate-700 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{t("header.title")}</h1>
              <p className="text-xs text-slate-400">{t("header.subtitle")}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded">{t("header.badge.free")}</span>
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded">{t("header.badge.local")}</span>
              <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded">{t("header.badge.noApi")}</span>
            </div>

            {/* Language Switcher */}
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as typeof locale)}
              className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              {localeNames.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
              <h2 className="text-lg font-semibold text-white mb-4">{t("upload.title")}</h2>
              <div
                className={`relative border-2 border-dashed rounded-xl transition-all ${
                  isDragging
                    ? "border-cyan-400 bg-cyan-400/10"
                    : "border-slate-600 hover:border-slate-500"
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                {image ? (
                  <div className="p-4">
                    <img
                      src={image}
                      alt="Preview"
                      className="max-h-64 mx-auto rounded-lg object-contain"
                    />
                    <button
                      onClick={clearAll}
                      className="mt-4 w-full py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
                    >
                      {t("upload.clearBtn")}
                    </button>
                  </div>
                ) : (
                  <div
                    className="p-12 text-center cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="w-16 h-16 mx-auto mb-4 bg-slate-700 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-slate-300 mb-2">{t("upload.dragHint")}</p>
                    <p className="text-slate-500 text-sm">{t("upload.formatHint")}</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {fileName && (
                <p className="text-sm text-slate-400">{t("common.selected")}: {fileName}</p>
              )}

              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {t("upload.language")}
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="chi_sim">中文简体</option>
                  <option value="eng">English</option>
                  <option value="chi_tra">中文繁體</option>
                  <option value="jpn">日本語</option>
                  <option value="kor">한국어</option>
                </select>
              </div>

              <button
                onClick={recognizeText}
                disabled={!image || isProcessing}
                className={`w-full py-3 rounded-lg font-medium transition-all mt-4 ${
                  !image || isProcessing
                    ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white"
                }`}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {t("upload.processing")}
                  </span>
                ) : (
                  t("upload.startBtn")
                )}
              </button>

              {isProcessing && (
                <div className="mt-4">
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-2 text-center">{statusText}</p>
                </div>
              )}

              {!isProcessing && !result && (
                <p className="text-xs text-cyan-400 mt-2 text-center">
                  {t("upload.firstUseHint")}
                </p>
              )}
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400">
                {error}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">{t("result.title")}</h2>
                {result && (
                  <div className="flex gap-2">
                    <button
                      onClick={copyToClipboard}
                      className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors"
                    >
                      {t("result.copy")}
                    </button>
                    <button
                      onClick={exportResult}
                      className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors"
                    >
                      {t("result.export")}
                    </button>
                  </div>
                )}
              </div>

              {result && (
                <div className="mb-4 flex items-center gap-2 text-xs">
                  <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded">
                    {t("result.confidence")}: {Math.round(result.confidence)}%
                  </span>
                  <span className="px-2 py-1 bg-slate-700 text-slate-400 rounded">
                    {t("result.charCount")}: {result.words.length}
                  </span>
                </div>
              )}

              <div className="bg-slate-900/50 rounded-lg p-4 min-h-[400px] max-h-[600px] overflow-auto">
                {result ? (
                  <pre className="text-slate-300 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                    {result.words}
                  </pre>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500">
                    <div className="text-center">
                      <svg className="w-16 h-16 mx-auto mb-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p>{t("result.placeholder")}</p>
                      <p className="text-sm mt-1">{t("result.placeholder2")}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
              <h3 className="text-white font-medium mb-4">{t("features.title")}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-white text-sm font-medium">{t("features.free.title")}</h4>
                    <p className="text-slate-400 text-xs mt-1">{t("features.free.desc")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-white text-sm font-medium">{t("features.privacy.title")}</h4>
                    <p className="text-slate-400 text-xs mt-1">{t("features.privacy.desc")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-white text-sm font-medium">{t("features.global.title")}</h4>
                    <p className="text-slate-400 text-xs mt-1">{t("features.global.desc")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-white text-sm font-medium">{t("features.multiLang.title")}</h4>
                    <p className="text-slate-400 text-xs mt-1">{t("features.multiLang.desc")}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium OCR Entry */}
            <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-sm rounded-2xl p-6 border border-amber-500/50">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-amber-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-amber-400 font-medium mb-2">{t("premium.title")}</h3>
                  <p className="text-amber-200/80 text-sm mb-4">{t("premium.desc")}</p>
                  <a
                    href="https://ocr.space/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-medium rounded-lg transition-all shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50"
                  >
                    <span>{t("premium.btn")}</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-700 mt-12 py-6 px-4">
        <div className="max-w-7xl mx-auto text-center text-slate-500 text-sm">
          <p>{t("footer.title")}</p>
          <p className="mt-1">{t("footer.subtitle")}</p>
        </div>
      </footer>
    </div>
  );
}
