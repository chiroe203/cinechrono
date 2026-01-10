import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Loader2 } from 'lucide-react';
import { getArticles, getArticleById } from '../libs/microcms';

// 記事一覧ページ
const ArticleList = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const data = await getArticles(20, 0);
        setArticles(data.contents);
      } catch (err) {
        setError('記事の取得に失敗しました');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        📚 トピック記事
      </h1>
      
      {articles.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          まだ記事がありません
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {articles.map((article) => (
            <Link
              key={article.id}
              to={`/articles/${article.id}`}
              className="block bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-100"
            >
              {article.eyecatch && (
                <div className="aspect-video bg-gray-100">
                  <img
                    src={article.eyecatch.url}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <h2 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                  {article.title}
                </h2>
                {article.category && (
                  <span className="inline-block px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full mb-2">
                    {article.category.name}
                  </span>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(article.publishedAt).toLocaleDateString('ja-JP')}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

// 記事詳細ページ
const ArticleDetail = ({ id }) => {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const data = await getArticleById(id);
        setArticle(data);
      } catch (err) {
        setError('記事の取得に失敗しました');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600 mb-4">{error || '記事が見つかりませんでした'}</p>
        <button
          onClick={() => navigate('/articles')}
          className="text-purple-600 hover:underline"
        >
          ← 記事一覧に戻る
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* 戻るボタン */}
      <button
        onClick={() => navigate('/articles')}
        className="flex items-center gap-2 text-purple-600 hover:text-purple-800 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        記事一覧に戻る
      </button>

      {/* アイキャッチ画像 */}
      {article.eyecatch && (
        <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden mb-6">
          <img
            src={article.eyecatch.url}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* 記事ヘッダー */}
      <header className="mb-8">
        {article.category && (
          <span className="inline-block px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-full mb-3">
            {article.category.name}
          </span>
        )}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          {article.title}
        </h1>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {new Date(article.publishedAt).toLocaleDateString('ja-JP')}
          </span>
          {article.revisedAt && article.revisedAt !== article.publishedAt && (
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              更新: {new Date(article.revisedAt).toLocaleDateString('ja-JP')}
            </span>
          )}
        </div>
      </header>

      {/* 記事本文 */}
      <article 
        className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-purple-600 prose-img:rounded-lg"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      {/* フッター：記事一覧へ戻る */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <Link
          to="/articles"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          記事一覧に戻る
        </Link>
      </div>
    </div>
  );
};

// メインコンポーネント：URLによって一覧/詳細を切り替え
const Articles = () => {
  const location = useLocation();
  
  // /articles/xxx からIDを取得
  const pathParts = location.pathname.split('/');
  const id = pathParts.length > 2 ? pathParts[2] : null;

  if (id) {
    return <ArticleDetail id={id} />;
  }

  return <ArticleList />;
};

export default Articles;
