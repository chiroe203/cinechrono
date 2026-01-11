// DeepL API接続（翻訳）- Vercel Functions経由
// /api/translate を使用してCORSを回避

/**
 * テキストを日本語に翻訳
 * @param {string} text - 翻訳するテキスト（英語）
 * @param {string} sourceLang - ソース言語（デフォルト: EN）
 * @returns {Promise<string|null>} 翻訳されたテキスト
 */
export const translateToJapanese = async (text, sourceLang = 'EN') => {
  if (!text || text.trim() === '') {
    return null;
  }

  try {
    // Vercel Functions経由でDeepL APIを呼び出し
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        sourceLang: sourceLang,
        targetLang: 'JA',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Translation API error:', errorData);
      return null;
    }

    const data = await response.json();
    
    if (data.translations && data.translations.length > 0) {
      return data.translations[0].text;
    }
    
    return null;
  } catch (error) {
    console.error('Translation error:', error);
    return null;
  }
};

/**
 * 複数のテキストを一括で日本語に翻訳
 * @param {string[]} texts - 翻訳するテキストの配列
 * @param {string} sourceLang - ソース言語（デフォルト: EN）
 * @returns {Promise<string[]>} 翻訳されたテキストの配列
 */
export const translateMultipleToJapanese = async (texts, sourceLang = 'EN') => {
  // 空のテキストをフィルタリング
  const validTexts = texts.filter(t => t && t.trim() !== '');
  if (validTexts.length === 0) {
    return texts.map(() => null);
  }

  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: validTexts,
        sourceLang: sourceLang,
        targetLang: 'JA',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Translation API error:', errorData);
      return texts.map(() => null);
    }

    const data = await response.json();
    
    if (data.translations) {
      // 元の配列と同じ順序で結果を返す
      let translationIndex = 0;
      return texts.map(originalText => {
        if (!originalText || originalText.trim() === '') {
          return null;
        }
        return data.translations[translationIndex++]?.text || null;
      });
    }
    
    return texts.map(() => null);
  } catch (error) {
    console.error('Translation error:', error);
    return texts.map(() => null);
  }
};
