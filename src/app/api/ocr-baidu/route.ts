import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageBase64 = formData.get("image") as string;
    const language = formData.get("language") as string;

    const appId = request.nextUrl.searchParams.get("appId");
    const apiKey = request.nextUrl.searchParams.get("apiKey");
    const secretKey = request.nextUrl.searchParams.get("secretKey");

    if (!apiKey || !secretKey) {
      return NextResponse.json(
        { error: "Missing API credentials" },
        { status: 400 }
      );
    }

    const tokenUrl = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${apiKey}&client_secret=${secretKey}&`;
    
    const tokenResponse = await axios.post(tokenUrl);
    const accessToken = tokenResponse.data.access_token;

    const languageMap: Record<string, string> = {
      "zh-CN": "CHN_ENG",
      en: "ENG",
      ja: "JAP",
      ko: "KOR",
      fr: "FRE",
      de: "GER",
      es: "SPA",
      ru: "RUS",
    };

    const ocrLang = languageMap[language] || "CHN_ENG";

    const ocrUrl = `https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic?access_token=${accessToken}`;

    const ocrResponse = await axios.post(
      ocrUrl,
      new URLSearchParams({
        image: imageBase64,
        language_type: ocrLang,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const words_result = ocrResponse.data.words_result || [];
    const words = words_result.map((item: { words: string }) => item.words).join("\n");

    return NextResponse.json({
      words,
      json: {
        words_result: words_result.map((item: { words: string; location: object }) => ({
          words: item.words,
          location: item.location || {},
        })),
        words_result_num: words_result.length,
      },
    });
  } catch (error) {
    console.error("Baidu OCR Error:", error);
    return NextResponse.json(
      { error: "OCR processing failed" },
      { status: 500 }
    );
  }
}
