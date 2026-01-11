// Vercel Serverless Function - DeepL翻訳プロキシ
// /api/translate

export default async function handler(req, res) {
  // CORSヘッダー
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONSリクエスト（プリフライト）への対応
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POSTのみ許可
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const DEEPL_API_KEY = process.env.DEEPL_API_KEY;
  
  if (!DEEPL_API_KEY) {
    return res.status(500).json({ error: 'DeepL API key is not configured' });
  }

  try {
    const { text, sourceLang = 'EN', targetLang = 'JA' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const response = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: Array.isArray(text) ? text : [text],
        source_lang: sourceLang,
        target_lang: targetLang,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('DeepL API error:', errorData);
      return res.status(response.status).json({ error: 'DeepL API error', details: errorData });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('Translation error:', error);
    return res.status(500).json({ error: 'Translation failed', message: error.message });
  }
}
