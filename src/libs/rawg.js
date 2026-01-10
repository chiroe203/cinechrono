// RAWG API接続（ゲーム情報 + 画像）
// https://rawg.io/apidocs

const RAWG_API_KEY = process.env.REACT_APP_RAWG_API_KEY;
const RAWG_BASE_URL = 'https://api.rawg.io/api';

/**
 * ゲームを検索して情報を取得
 * @param {string} gameName - ゲームタイトル（英語推奨）
 * @returns {Promise<Object|null>} ゲーム情報
 */
export const searchGame = async (gameName) => {
  if (!RAWG_API_KEY) {
    console.error('RAWG API key is not set');
    return null;
  }

  try {
    // ゲームを検索
    const searchUrl = `${RAWG_BASE_URL}/games?key=${RAWG_API_KEY}&search=${encodeURIComponent(gameName)}&page_size=5`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (!searchData.results || searchData.results.length === 0) {
      console.log('Game not found:', gameName);
      return null;
    }

    const game = searchData.results[0];

    // 詳細情報を取得（より詳しい情報が必要な場合）
    const detailUrl = `${RAWG_BASE_URL}/games/${game.id}?key=${RAWG_API_KEY}`;
    const detailResponse = await fetch(detailUrl);
    const detailData = await detailResponse.json();

    // プラットフォーム名を抽出
    const platforms = game.platforms?.map(p => p.platform.name) || [];

    return {
      id: game.id,
      name: game.name,
      slug: game.slug,
      released: game.released,
      platforms: platforms,
      backgroundImage: game.background_image,
      // 詳細情報から追加データ
      description: detailData.description_raw || null,
      metacritic: detailData.metacritic || null,
      genres: detailData.genres?.map(g => g.name) || [],
      developers: detailData.developers?.map(d => d.name) || [],
      publishers: detailData.publishers?.map(p => p.name) || [],
      website: detailData.website || null
    };
  } catch (error) {
    console.error('RAWG API error:', error);
    return null;
  }
};

/**
 * 日付をフォーマット
 * @param {string} dateStr - YYYY-MM-DD形式の日付
 * @returns {string} フォーマット済み日付
 */
export const formatReleaseDate = (dateStr) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
};
