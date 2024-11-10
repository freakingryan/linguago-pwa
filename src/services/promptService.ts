export class PromptService {
    static getTranslationPrompt(text: string, targetLang: string, formatAsJson: boolean = false): string {
        if (formatAsJson) {
            return `Please perform the following tasks:
1. Detect the language of this text: "${text}"
2. Translate it to ${targetLang}
3. Format the response as JSON:
{
    "detectedLang": "detected language code",
    "sourceLangName": "language name in Chinese",
    "translation": "translated text"
}
Important: Return ONLY the JSON object, no markdown formatting or other text.`;
        }

        return `Please translate the following text to ${targetLang}. Only provide the translation without any additional explanation or text:

${text}`;
    }

    static getAudioTranscriptionPrompt(): string {
        return `Please transcribe the following audio content and format it as proper text.
Rules:
1. Remove all background noise, filler words, and unnecessary spaces
2. Remove any timestamps or numbers that don't belong to the actual content
3. Format the text following proper grammar and punctuation rules
4. Ensure the output is well-structured and logically coherent
5. If the content is unclear or nonsensical, respond with "无法识别有效语音内容"
6. Keep only meaningful content that forms complete sentences
7. Maintain the original meaning while improving clarity
8. Use proper capitalization and punctuation
9. Remove any repeated words or phrases
10. Ensure the output reads like natural, written text`;
    }

    static getImageAnalysisPrompt(targetLang: string): string {
        return `Please analyze this image and translate any text content you find into ${targetLang}. 
Follow these rules:
1. First detect the language of the text in the image
2. Then translate the detected text into ${targetLang}
3. Format the output as follows:
   Original Text: (original text from image)
   Detected Language: (language name)
   Translation: (translated text)
4. If no text is found, respond with "未在图片中检测到文字"
5. Ensure accurate translation while maintaining the original structure
6. Handle any special characters or formatting appropriately`;
    }

    static getWordRecommendationPrompt(condition: string): string {
        return `请根据以下条件推荐一组日语单词："${condition}"
请按照以下 JSON 格式返回数据：
{
    "words": [
        {
            "word": "日语单词",
            "reading": "读音",
            "meaning": "中文含义",
            "level": "JLPT等级(N1-N5)",
            "types": ["词性"],
            "tags": ["相关标签"],
            "examples": [
                {
                    "japanese": "日语例句",
                    "reading": "例句读音",
                    "meaning": "例句翻译"
                }
            ],
            "etymology": "词源/历史典故（如果有）",
            "mnemonic": "助记方法",
            "associations": ["联想记忆点"],
            "commonCollocations": ["常见搭配"],
            "similarWords": [
                {
                    "word": "相似词",
                    "explanation": "区别说明"
                }
            ],
            "usageNotes": "使用注意事项",
            "culturalNotes": "文化背景注释",
            "frequency": 使用频率(1-5)
        }
    ],
    "category": "推荐分类",
    "description": "推荐说明",
    "totalCount": 推荐单词总数
}
请确保返回的是合法的 JSON 格式，并包含尽可能详细的信息。`;
    }

    static getLyricsProcessingPrompt(content: string): string {
        return `请为以下日语文本中的汉字添加假名标注：

格式要求：
- 仅为汉字添加假名标注，格式为：漢字(かんじ)
- 不要添加翻译
- 保持原有换行格式

返回格式：
{
    "japanese": "标注读音后的日语文本"
}

示例：
输入：
桜の花が咲く

输出：
{
    "japanese": "桜(さくら)の花(はな)が咲(さ)く"
}

待处理文本：
${content}

注意：
- 仅为汉字添加假名标注
- 保持原有换行格式
- 不需要提供翻译`;
    }
} 