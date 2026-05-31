import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { image, language } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    const mockTexts: Record<string, string[]> = {
      "zh-CN": [
        "这是一个免费的在线OCR文字识别工具",
        "支持多种语言识别：中英文、日语、韩语等",
        "可以上传图片进行文字提取",
        "识别结果可以导出为TXT或JSON格式",
        "保护隐私，数据本地处理不上传",
      ],
      en: [
        "This is a free online OCR text recognition tool",
        "Supports multiple languages: Chinese, English, Japanese, Korean, etc",
        "Upload images to extract text",
        "Recognition results can be exported as TXT or JSON format",
        "Privacy protected, data processed locally without upload",
      ],
      ja: [
        "これは無料のオンラインOCR文字認識ツールです",
        "複数の言語をサポート：中国語、英語、日本語、韓国語など",
        "画像をアップロードしてテキストを抽出",
        "認識結果はTXTまたはJSON形式でエクスポート可能",
        "プライバシーが保護され、データはローカルで処理されます",
      ],
      ko: [
        "これは 무료 온라인 OCR 텍스트 인식 도구입니다",
        "중국어, 영어, 일본어, 한국어 등 여러 언어 지원",
        "이미지를 업로드하여 텍스트 추출",
        "인식 결과는 TXT 또는 JSON 형식으로 내보낼 수 있습니다",
        "개인 정보 보호, 데이터는 로컬에서 처리됩니다",
      ],
    };

    const texts = mockTexts[language] || mockTexts["en"];
    const words = texts.join("\n\n");

    const words_result = texts.map((text, index) => ({
      words: text,
      location: {
        left: 10,
        top: 50 + index * 60,
        width: 500,
        height: 40,
      },
    }));

    return NextResponse.json({
      words,
      json: {
        words_result,
        words_result_num: words_result.length,
      },
    });
  } catch (error) {
    console.error("OCR Error:", error);
    return NextResponse.json(
      { error: "OCR processing failed" },
      { status: 500 }
    );
  }
}
