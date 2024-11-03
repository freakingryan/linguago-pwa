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
} 