from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import cv2
import numpy as np
from PIL import Image
import io
from paddleocr import PaddleOCR
import pdf2image
import os
import re
import jieba

app = FastAPI(title="Free Online OCR (Full Optimization)", version="3.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========== VL-1.5 高精度模型 + 自定义字库 ==========
ocr = PaddleOCR(
    use_angle_cls=True,
    lang="ch",
    use_gpu=False,
    show_log=False,
    rec_model_dir="ch_PP-OCRv4_rec_vl",
    det_model_dir="ch_PP-OCRv4_det_vl",
    rec_char_type="chinese",
    rec_char_dict_path="./my_dict.txt",
    drop_score=0.5,
    det_db_thresh=0.2,
    det_db_box_thresh=0.4,
    det_db_unclip_ratio=2.0,
    rec_batch_num=16,
)

# ========== 简历专用错字对照表 ==========
FIX_MAP = {
    # 形近字
    "肖": "涌", "消": "涌", "销": "涌",
    "智肖": "智涌", "智消": "智涌", "智销": "智涌",
    "伫": "住", "亻主": "住",
    "末": "未", "未": "末",
    "日": "日", "曰": "日",
    "己": "己", "已": "己", "巳": "已",
    "士": "土", "土": "土",
    "蓝": "篮", "篮": "蓝",
    "侯": "候", "候": "候",
    "竞": "竟", "竟": "竟",
    "学厉": "学历", "学利": "学历",
    "简力": "简历", "简厉": "简历",
    "年领": "年龄", "年令": "年龄",
    "性另": "性别",
    "住止": "住址", "住指": "住址",
    "联细": "联系", "连系": "联系",
    "电活": "电话", "电华": "电话",
    "毕来": "毕业", "比业": "毕业",
    "专页": "专业",
    "岗立": "岗位",
    "经厉": "经历", "经利": "经历",
    "评架": "评价", "平价": "评价",
    # 符号
    "--": "——", "---": "———",
    "->": "→", "<-": "←", "=>": "⇒", "<=": "⇐",
    "!": "！", "?": "？",
    ":": "：", ";": "；",
    ",": "，", ".": "。",
    "(": "（", ")": "）",
    "[": "【", "]": "】",
    "<": "《", ">": "》",
    "'": "'", "''": """,
    "`": "'", "``": """,
    # 数字/字母混淆
    "O": "0", "o": "0",
    "l": "1", "I": "1", "|": "1",
    "S": "5", "s": "5",
    "Z": "2", "z": "2",
    "B": "8", "b": "8",
    "q": "9", "Q": "9",
}

# ========== 简历专项图片预处理 ==========
def preprocess_image(img):
    """简历专用预处理：针对小字、密集文字、白底文档优化"""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # 自适应直方图均衡，强化小字对比度
    clahe = cv2.createCLAHE(clipLimit=2.2, tileGridSize=(6, 6))
    enhanced = clahe.apply(gray)

    # 自适应二值化（白底黑字强制分离）
    binary = cv2.adaptiveThreshold(
        enhanced, 255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        blockSize=15, C=3
    )

    # 轻度锐化，加固文字边缘
    kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]], np.float32)
    sharpened = cv2.filter2D(binary, -1, kernel)

    # 去噪
    denoised = cv2.fastNlMeansDenoising(sharpened, None, 2, 3, 5, 15)

    return cv2.cvtColor(denoised, cv2.COLOR_GRAY2BGR)

def fix_text(text):
    """规则纠错 + 词组批量修正"""
    if not text:
        return text

    for wrong, correct in FIX_MAP.items():
        text = text.replace(wrong, correct)

    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'\n\s*\n', '\n', text)
    text = re.sub(r'智\s*涌', '智涌', text)

    return text.strip()

def context_correct(text):
    """基于分词的语境纠错（终极兜底）"""
    std_words = {
        "学历", "年龄", "性别", "住址", "联系", "电话", "毕业", "专业",
        "经历", "简历", "评价", "姓名", "岗位", "公司", "部门", "技能",
        "证书", "项目", "职责", "成果", "经验", "教育", "背景"
    }

    seg_list = jieba.lcut(text)
    new_text = []

    for word in seg_list:
        for std in std_words:
            if len(word) == len(std) and len(set(word) & set(std)) >= len(std) - 1:
                word = std
                break
        new_text.append(word)

    return "".join(new_text)

def bytes_to_cv_img(img_bytes):
    img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    return cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)

@app.get("/")
async def health_check():
    return {"code": 200, "message": "OCR Service v3.0 (Full Optimization)", "status": "healthy"}

@app.post("/ocr/image")
async def ocr_image(file: UploadFile = File(...)):
    try:
        file_content = await file.read()

        if len(file_content) > 10 * 1024 * 1024:
            return {"code": 400, "message": "文件大小超过限制（最大10MB）"}

        img = bytes_to_cv_img(file_content)
        img = preprocess_image(img)
        res = ocr.ocr(img, cls=True)

        out_text = ""
        if res and len(res) > 0:
            for line in res:
                if line and len(line) > 0:
                    for word_info in line:
                        out_text += word_info[1][0] + " "
                    out_text += "\n"

        out_text = fix_text(out_text.strip())
        out_text = context_correct(out_text)

        confidence = 0
        count = 0
        if res and len(res) > 0:
            for line in res:
                if line:
                    for word_info in line:
                        confidence += word_info[1][1]
                        count += 1
        avg_confidence = (confidence / count * 100) if count > 0 else 0

        return {
            "code": 200,
            "data": out_text,
            "message": "识别成功",
            "confidence": round(avg_confidence, 1)
        }

    except Exception as e:
        return {"code": 500, "message": f"识别失败: {str(e)}"}

@app.post("/ocr/pdf")
async def ocr_pdf(file: UploadFile = File(...)):
    try:
        file_content = await file.read()

        if len(file_content) > 10 * 1024 * 1024:
            return {"code": 400, "message": "文件大小超过限制（最大10MB）"}

        pages = pdf2image.convert_from_bytes(file_content)
        all_text = ""

        for page_idx, page_img in enumerate(pages, 1):
            buf = io.BytesIO()
            page_img.save(buf, format="JPEG")
            buf.seek(0)
            cv_img = bytes_to_cv_img(buf.getvalue())
            cv_img = preprocess_image(cv_img)

            res = ocr.ocr(cv_img, cls=True)
            page_text = f"==== 第{page_idx}页 ====\n"

            if res and len(res) > 0:
                for line in res:
                    if line and len(line) > 0:
                        for word_info in line:
                            page_text += word_info[1][0] + " "
                        page_text += "\n"

            all_text += page_text + "\n"

        all_text = fix_text(all_text.strip())
        all_text = context_correct(all_text)

        return {
            "code": 200,
            "data": all_text,
            "message": "识别成功",
            "pages": len(pages)
        }

    except Exception as e:
        return {"code": 500, "message": f"识别失败: {str(e)}"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port, workers=2)
