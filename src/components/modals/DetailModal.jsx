import React from 'react';
import { X, Pencil, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { linkServices, getServiceInfo, gamePlatforms } from '../../constants';
import { getLabel, getEventIcon, getSubEraIcon, getYoutubeId } from '../../utils';
import { formatReleaseDate } from '../../libs/rawg';
import { formatMovieReleaseDate, formatRuntime } from '../../libs/tmdb';

/**
 * 詳細モーダルコンポーネント
 * 作品・イベント・時代区分の詳細を表示
 */
const DetailModal = ({
  sel,
  onClose,
  adminMode,
  affiliateEnabled,
  autoThumbnail,
  gameInfo,
  gameInfoLoading,
  tmdbInfo,
  tmdbInfoLoading,
  videoIndex,
  setVideoIndex,
  onEdit,
  onRemoveRelated  // 関連作品から削除する関数
}) => {
  if (!sel) return null;

  // ローカル関数: ラベル取得
  const label = getLabel;
  const eventIcon = getEventIcon;
  const subEraIcon = getSubEraIcon;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start sm:items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg lg:max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col my-4 sm:my-auto">
        {/* ヘッダー */}
        <div className="flex-shrink-0 bg-white p-4 flex justify-between items-center border-b rounded-t-3xl">
          <h2 className="text-xl font-bold">
            {sel.type === 'history' 
              ? eventIcon(sel.eventType).label 
              : sel.type === 'subEra' 
                ? subEraIcon(sel.subEraType).label 
                : label(sel.type)}
          </h2>
          <div className="flex items-center gap-2">
            {adminMode && (
              <button 
                onClick={onEdit} 
                className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-bold hover:from-purple-700 hover:to-pink-700 flex items-center gap-1"
              >
                <Pencil className="w-4 h-4" />
                編集
              </button>
            )}
            <button 
              onClick={onClose} 
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="p-6 overflow-y-auto flex-1">
          <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {sel.title}
          </h3>
          
          {/* 英語タイトル（ゲーム・映画・ドラマ・アニメ） */}
          {(sel.type === 'game' || sel.type === 'movie' || sel.type === 'drama' || sel.type === 'anime' || 
            (Array.isArray(sel.type) && (sel.type.includes('game') || sel.type.includes('movie') || sel.type.includes('drama') || sel.type.includes('anime')))) && sel.englishTitle && (
            <p className="text-sm text-gray-500 mb-4">英語タイトル: {sel.englishTitle}</p>
          )}

          {/* 時代区分の場合 */}
          {sel.type === 'subEra' ? (
            <SubEraContent sel={sel} adminMode={adminMode} onRemoveRelated={onRemoveRelated} />
          ) : sel.type !== 'history' ? (
            /* 通常コンテンツの場合 */
            <ContentDetail 
              sel={sel}
              autoThumbnail={autoThumbnail}
              adminMode={adminMode}
              affiliateEnabled={affiliateEnabled}
              gameInfo={gameInfo}
              gameInfoLoading={gameInfoLoading}
              tmdbInfo={tmdbInfo}
              tmdbInfoLoading={tmdbInfoLoading}
              videoIndex={videoIndex}
              setVideoIndex={setVideoIndex}
            />
          ) : (
            /* 歴史イベントの場合 */
            <HistoryEventContent sel={sel} />
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * 時代区分コンテンツ
 */
const SubEraContent = ({ sel, adminMode, onRemoveRelated }) => {
  // relatedContentsを使用（後方互換性: childContentsもサポート）
  const relatedContents = sel.relatedContents || sel.childContents || [];
  
  // 関連作品から削除
  const handleRemove = (pc) => {
    if (onRemoveRelated && pc.itemId && pc.content) {
      onRemoveRelated(pc.itemId, pc.idx, sel.subEra || sel.title);
    }
  };
  
  return (
    <>
      {sel.subEraYears && (
        <div className="mb-4">
          <div className="text-sm text-gray-500 mb-1">期間</div>
          <div className="text-lg font-semibold">{sel.subEraYears}</div>
        </div>
      )}
      {sel.desc && (
        <div className="mb-4">
          <div className="text-sm text-gray-500 mb-2">概要</div>
          <p className="text-gray-700 whitespace-pre-wrap">{sel.desc}</p>
        </div>
      )}
      {sel.detail && (
        <div className="mb-4 pt-4 border-t">
          <div className="text-sm text-gray-500 mb-2">詳細</div>
          <p className="text-gray-700 whitespace-pre-wrap">{sel.detail}</p>
        </div>
      )}
      
      {/* 関連作品 */}
      {relatedContents.length > 0 && (
        <div className="mb-4 pt-4 border-t">
          <div className="text-sm text-gray-500 mb-3">📚 関連作品</div>
          <div className="space-y-2">
            {relatedContents.map((pc, idx) => (
              <div 
                key={idx}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {pc.content.thumbnail && (
                  <img 
                    src={pc.content.thumbnail} 
                    alt="" 
                    className="w-12 h-12 object-cover rounded flex-shrink-0"
                    onError={(e) => e.target.style.display='none'}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-purple-700 truncate">{pc.content.title}</div>
                  <div className="text-xs text-gray-500">{pc.year}</div>
                </div>
                {/* 管理者モードで削除ボタン表示 */}
                {adminMode && onRemoveRelated && (
                  <button
                    onClick={() => handleRemove(pc)}
                    className="flex-shrink-0 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="関連作品から削除"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {!sel.desc && !sel.detail && relatedContents.length === 0 && (
        <p className="text-gray-500 text-center py-8">詳細情報はまだ登録されていません</p>
      )}
    </>
  );
};

/**
 * 歴史イベントコンテンツ
 */
const HistoryEventContent = ({ sel }) => (
  <>
    <div className="mb-4">
      <div className="text-sm text-gray-500 mb-1">年代</div>
      <div className="text-lg font-semibold">{sel.year}</div>
    </div>
    {sel.desc && (
      <div className="mb-4">
        <div className="text-sm text-gray-500 mb-2">概要</div>
        <p className="text-gray-700">{sel.desc}</p>
      </div>
    )}
    {sel.detail && (
      <div className="mb-4 pt-4 border-t">
        <div className="text-sm text-gray-500 mb-2">詳細</div>
        <p className="text-gray-700">{sel.detail}</p>
      </div>
    )}
    {sel.topic && <TopicLink topic={sel.topic} />}
  </>
);

/**
 * 通常コンテンツ詳細
 */
const ContentDetail = ({
  sel,
  autoThumbnail,
  adminMode,
  affiliateEnabled,
  gameInfo,
  gameInfoLoading,
  tmdbInfo,
  tmdbInfoLoading,
  videoIndex,
  setVideoIndex
}) => {
  return (
    <>
      {/* 主な時代 */}
      <div className="mb-4">
        <div className="text-sm text-gray-500 mb-1">主な時代</div>
        <div className="text-lg font-semibold text-purple-600">{sel.year}</div>
        {sel.periodRange && (
          <div className="text-sm text-gray-600 mt-1">大体の時期: {sel.periodRange}</div>
        )}
      </div>

      {/* YouTube動画カルーセル */}
      <VideoCarousel 
        sel={sel} 
        videoIndex={videoIndex} 
        setVideoIndex={setVideoIndex} 
      />

      {/* サムネイル画像（YouTube動画がない場合） */}
      {(autoThumbnail || sel.thumbnail) && !(sel.youtubeUrls?.length > 0 || sel.youtubeUrl) && (
        <div className="mb-4 flex justify-center relative">
          <img 
            src={autoThumbnail || sel.thumbnail} 
            alt={sel.title} 
            className="max-w-full max-h-80 object-contain rounded-lg shadow-md" 
            style={{ imageRendering: '-webkit-optimize-contrast' }}
            onError={(e) => e.target.style.display='none'} 
          />
          {adminMode && autoThumbnail && (
            <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded shadow">
              自動取得
            </span>
          )}
        </div>
      )}

      {/* TMDBあらすじ（映画・ドラマ・アニメ） */}
      {tmdbInfo?.overview && (
        <div className="mb-4">
          <div className="text-sm text-gray-500 mb-2">あらすじ</div>
          <p className="text-gray-700">{tmdbInfo.overview}</p>
        </div>
      )}

      {/* 手動入力のひとことTips */}
      {sel.synopsis && (
        <div className="mb-4">
          <div className="text-sm text-gray-500 mb-2">💡 ひとことTips</div>
          <p className="text-gray-700">{sel.synopsis}</p>
        </div>
      )}

      {/* 説明（トリビア等） */}
      {sel.description && (
        <div className="mb-4">
          <div className="text-sm text-gray-500 mb-2">説明</div>
          <p className="text-gray-700">{sel.description}</p>
        </div>
      )}

      {/* トリビアの複数画像表示 */}
      {sel.images?.length > 0 && (
        <div className="mb-4">
          <div className="text-sm text-gray-500 mb-2">画像</div>
          <div className="space-y-3">
            {sel.images.map((img, idx) => (
              <div key={idx} className="flex justify-center">
                <img 
                  src={img} 
                  alt={`${sel.title} - ${idx + 1}`} 
                  className="max-w-full max-h-80 object-contain rounded-lg shadow-md" 
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                  onError={(e) => e.target.style.display='none'} 
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* プラットフォーム情報（ゲーム） */}
      <GameInfo 
        sel={sel} 
        gameInfo={gameInfo} 
        gameInfoLoading={gameInfoLoading} 
      />

      {/* TMDB情報（映画・ドラマ・アニメ） */}
      <TmdbInfo 
        sel={sel} 
        tmdbInfo={tmdbInfo} 
        tmdbInfoLoading={tmdbInfoLoading} 
      />

      {/* アフィリエイトリンク */}
      <AffiliateLinks 
        sel={sel} 
        adminMode={adminMode} 
        affiliateEnabled={affiliateEnabled} 
      />

      {/* 関連記事 */}
      {sel.topic && <TopicLink topic={sel.topic} />}
    </>
  );
};

/**
 * YouTube動画カルーセル
 */
const VideoCarousel = ({ sel, videoIndex, setVideoIndex }) => {
  // 旧形式と新形式の両方に対応
  const videos = sel.youtubeUrls?.length > 0 
    ? sel.youtubeUrls.filter(url => getYoutubeId(url))
    : sel.youtubeUrl && getYoutubeId(sel.youtubeUrl) 
      ? [sel.youtubeUrl] 
      : [];
  
  if (videos.length === 0) return null;
  
  const currentIndex = Math.min(videoIndex, videos.length - 1);
  const currentVideoId = getYoutubeId(videos[currentIndex]);
  
  return (
    <div className="mb-4">
      <div className="relative">
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe 
            src={`https://www.youtube.com/embed/${currentVideoId}`}
            className="absolute top-0 left-0 w-full h-full rounded-lg"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="YouTube動画"
          />
        </div>
        {videos.length > 1 && (
          <>
            <button 
              onClick={() => setVideoIndex(i => i > 0 ? i - 1 : videos.length - 1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={() => setVideoIndex(i => i < videos.length - 1 ? i + 1 : 0)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>
      {videos.length > 1 && (
        <div className="flex justify-center gap-2 mt-3">
          {videos.map((_, i) => (
            <button
              key={i}
              onClick={() => setVideoIndex(i)}
              className={`w-2 h-2 rounded-full transition-colors ${i === currentIndex ? 'bg-purple-600' : 'bg-gray-300 hover:bg-gray-400'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * ゲーム情報表示
 */
const GameInfo = ({ sel, gameInfo, gameInfoLoading }) => {
  // ゲームかつ英語タイトルがある場合のみ表示
  const isGame = sel.type === 'game' || (Array.isArray(sel.type) && sel.type.includes('game'));
  if (!isGame || !sel.englishTitle) return null;

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      {gameInfoLoading ? (
        <p className="text-gray-500 text-sm">プラットフォーム情報を取得中...</p>
      ) : gameInfo ? (
        <div className="space-y-2">
          {gameInfo.released && (
            <p className="text-sm">
              <span className="font-semibold">📅 初リリース日：</span>
              {formatReleaseDate(gameInfo.released)}
            </p>
          )}
          {gameInfo.platforms && gameInfo.platforms.length > 0 && (
            <p className="text-sm">
              <span className="font-semibold">🎮 プラットフォーム：</span>
              {gameInfo.platforms.join('、')}
            </p>
          )}
        </div>
      ) : (
        <p className="text-gray-400 text-sm">プラットフォーム情報が見つかりませんでした</p>
      )}
    </div>
  );
};

/**
 * TMDB情報表示（映画・ドラマ・アニメ）
 */
const TmdbInfo = ({ sel, tmdbInfo, tmdbInfoLoading }) => {
  // 映画・ドラマ・アニメの場合のみ表示
  const isMedia = sel.type === 'movie' || sel.type === 'drama' || sel.type === 'anime' || 
    (Array.isArray(sel.type) && (sel.type.includes('movie') || sel.type.includes('drama') || sel.type.includes('anime')));
  if (!isMedia) return null;

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      {tmdbInfoLoading ? (
        <p className="text-gray-500 text-sm">作品情報を取得中...</p>
      ) : tmdbInfo ? (
        <div className="space-y-2">
          {/* 映画の場合 */}
          {tmdbInfo.mediaType === 'movie' && (
            <>
              {tmdbInfo.releaseDate && (
                <p className="text-sm">
                  <span className="font-semibold">📅 公開日：</span>
                  {formatMovieReleaseDate(tmdbInfo.releaseDate)}
                </p>
              )}
              {tmdbInfo.runtime && (
                <p className="text-sm">
                  <span className="font-semibold">⏱️ 上映時間：</span>
                  {formatRuntime(tmdbInfo.runtime)}
                </p>
              )}
              {tmdbInfo.director && (
                <p className="text-sm">
                  <span className="font-semibold">🎬 監督：</span>
                  {tmdbInfo.director}
                </p>
              )}
            </>
          )}
          {/* ドラマ・アニメの場合 */}
          {tmdbInfo.mediaType === 'tv' && (
            <>
              {tmdbInfo.firstAirDate && (
                <p className="text-sm">
                  <span className="font-semibold">📅 初回放送：</span>
                  {formatMovieReleaseDate(tmdbInfo.firstAirDate)}
                </p>
              )}
              {tmdbInfo.numberOfSeasons && (
                <p className="text-sm">
                  <span className="font-semibold">📺 シーズン数：</span>
                  {tmdbInfo.numberOfSeasons}シーズン（全{tmdbInfo.numberOfEpisodes}話）
                </p>
              )}
              {tmdbInfo.episodeRuntime && (
                <p className="text-sm">
                  <span className="font-semibold">⏱️ 1話あたり：</span>
                  約{tmdbInfo.episodeRuntime}分
                </p>
              )}
              {tmdbInfo.creator && (
                <p className="text-sm">
                  <span className="font-semibold">🎬 クリエイター：</span>
                  {tmdbInfo.creator}
                </p>
              )}
            </>
          )}
        </div>
      ) : (
        <p className="text-gray-400 text-sm">作品情報が見つかりませんでした</p>
      )}
    </div>
  );
};

/**
 * アフィリエイトリンク表示
 */
const AffiliateLinks = ({ sel, adminMode, affiliateEnabled }) => {
  if (!((adminMode || affiliateEnabled) && sel.links?.length > 0)) return null;

  const validLinks = sel.links.filter(l => l.url);
  if (validLinks.length === 0) return null;

  // カテゴリのorder順でソート（電子書籍→配信→購入→ゲーム→その他）
  const sortedLinks = [...validLinks].sort((a, b) => {
    const orderA = linkServices[a.category]?.order || 99;
    const orderB = linkServices[b.category]?.order || 99;
    return orderA - orderB;
  });

  // カテゴリごとにグループ化
  const groupedLinks = {};
  sortedLinks.forEach(l => {
    const cat = l.category || 'other';
    if (!groupedLinks[cat]) groupedLinks[cat] = [];
    groupedLinks[cat].push(l);
  });

  return (
    <div className="mt-6 space-y-4">
      {Object.entries(groupedLinks).map(([category, links]) => {
        const categoryInfo = linkServices[category];
        return (
          <div key={category} className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs font-semibold text-gray-500 mb-2">
              {categoryInfo?.label || '🔗 その他'}
            </div>
            <div className={links.length <= 3 ? 'flex gap-2' : 'grid grid-cols-2 gap-2'}>
              {links.map((l, i) => {
                const serviceInfo = getServiceInfo(l.service);
                const displayName = l.customName || (serviceInfo ? serviceInfo.name : l.service) || 'リンク';
                const colorClass = serviceInfo ? serviceInfo.color : 'from-purple-600 to-pink-600';
                const platformText = l.platform ? `（${gamePlatforms.find(p => p.id === l.platform)?.name || l.platform}）` : '';
                const buttonText = categoryInfo?.buttonText || 'で見る';
                const icon = serviceInfo?.icon || '🔗';
                return (
                  <a 
                    key={i} 
                    href={l.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={`flex-1 flex items-center justify-center gap-1 py-3 px-2 bg-gradient-to-r ${colorClass} text-white rounded-lg text-center font-bold hover:opacity-90 transition-opacity text-sm`}
                  >
                    <span>{icon}</span>
                    <span className="truncate">{displayName}{platformText}{buttonText}</span>
                  </a>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/**
 * 関連記事リンク
 */
const TopicLink = ({ topic }) => {
  if (!topic || !topic.url) return null;

  return (
    <div className="mt-6 pt-6 border-t">
      <div className="text-sm text-gray-500 mb-2">📖 関連記事</div>
      <a 
        href={topic.url} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="flex items-center justify-between p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100"
      >
        <span className="font-semibold text-purple-700">{topic.title}</span>
        <ExternalLink className="w-5 h-5 text-purple-600" />
      </a>
    </div>
  );
};

export default DetailModal;
