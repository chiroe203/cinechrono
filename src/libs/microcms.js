// microCMS API接続用ライブラリ

const serviceDomain = process.env.REACT_APP_MICROCMS_SERVICE_DOMAIN;
const apiKey = process.env.REACT_APP_MICROCMS_API_KEY;

const baseUrl = `https://${serviceDomain}.microcms.io/api/v1`;

// 記事一覧を取得
export const getArticles = async (limit = 10, offset = 0) => {
  try {
    const response = await fetch(
      `${baseUrl}/blog?limit=${limit}&offset=${offset}`,
      {
        headers: {
          'X-MICROCMS-API-KEY': apiKey,
        },
      }
    );
    if (!response.ok) {
      throw new Error('Failed to fetch articles');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching articles:', error);
    throw error;
  }
};

// 記事詳細を取得
export const getArticleById = async (id) => {
  try {
    const response = await fetch(
      `${baseUrl}/blog/${id}`,
      {
        headers: {
          'X-MICROCMS-API-KEY': apiKey,
        },
      }
    );
    if (!response.ok) {
      throw new Error('Failed to fetch article');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching article:', error);
    throw error;
  }
};

// カテゴリ一覧を取得（将来用）
export const getCategories = async () => {
  try {
    const response = await fetch(
      `${baseUrl}/categories`,
      {
        headers: {
          'X-MICROCMS-API-KEY': apiKey,
        },
      }
    );
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};
