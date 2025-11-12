export const supportedLanguages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'it', name: 'Italian' }
];

export const translateText = async (text, targetLang) => {
  if (!text) return text;
  
  // Mock implementation - in production, integrate with translation API
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const langName = supportedLanguages.find(lang => lang.code === targetLang)?.name || targetLang;
  return `[TRANSLATED to ${langName}] ${text}`;
};

export const detectLanguage = async (text) => {
  if (!text || text.trim().length === 0) return 'en';
  
  // Mock implementation - simple heuristics
  const chinesePattern = /[\u4e00-\u9fff]/;
  const japanesePattern = /[\u3040-\u309f\u30a0-\u30ff]/;
  const koreanPattern = /[\uac00-\ud7af]/;
  const arabicPattern = /[\u0600-\u06ff]/;
  const cyrillicPattern = /[\u0400-\u04ff]/;
  const hindiPattern = /[\u0900-\u097f]/;
  
  if (chinesePattern.test(text)) return 'zh';
  if (japanesePattern.test(text)) return 'ja';
  if (koreanPattern.test(text)) return 'ko';
  if (arabicPattern.test(text)) return 'ar';
  if (cyrillicPattern.test(text)) return 'ru';
  if (hindiPattern.test(text)) return 'hi';
  
  // Default to English for Latin script
  return 'en';
};
