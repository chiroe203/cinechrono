// TMDB API接続（映画・ドラマ・アニメ情報 + ポスター画像）
// https://www.themoviedb.org/

const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// 画像サイズオプション
// w92, w154, w185, w342, w500, w780, original
const POSTER_SIZE = 'w500';

/**
 * 映画を検索して情報を取得
 * @param {string} movieName - 映画タイトル（日本語または英語）
 * @param {string} personHint - 監督名または俳優名（任意、同名映画の絞り込み用）
 * @param {string} releaseYear - 公開年（任意、同名映画の絞り込み用）例: "2010"
 * @returns {Promise<Object|null>} 映画情報
 */
export const searchMovie = async (movieName, personHint = '', releaseYear = '') => {
  if (!TMDB_API_KEY) {
    console.error('TMDB API key is not set');
    return null;
  }

  try {
    // 検索URLを構築（公開年がある場合はパラメータ追加）
    let searchUrl = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(movieName)}&language=ja-JP`;
    
    // 公開年が指定されている場合はパラメータ追加（APIで絞り込み）
    if (releaseYear && /^\d{4}$/.test(releaseYear)) {
      searchUrl += `&primary_release_year=${releaseYear}`;
    }
    
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (!searchData.results || searchData.results.length === 0) {
      // 公開年で見つからない場合は、公開年なしで再検索
      if (releaseYear) {
        console.log('Retrying without release year...');
        const retryUrl = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(movieName)}&language=ja-JP`;
        const retryResponse = await fetch(retryUrl);
        const retryData = await retryResponse.json();
        
        if (!retryData.results || retryData.results.length === 0) {
          console.log('Movie not found:', movieName);
          return null;
        }
        searchData.results = retryData.results;
      } else {
        console.log('Movie not found:', movieName);
        return null;
      }
    }

    let movie = searchData.results[0];

    // 監督名/俳優名が指定されている場合は絞り込み
    if (personHint) {
      for (const result of searchData.results) {
        const creditsUrl = `${TMDB_BASE_URL}/movie/${result.id}/credits?api_key=${TMDB_API_KEY}`;
        const creditsResponse = await fetch(creditsUrl);
        const creditsData = await creditsResponse.json();
        
        // 監督で検索
        const director = creditsData.crew?.find(
          person => person.job === 'Director' && 
          person.name.toLowerCase().includes(personHint.toLowerCase())
        );
        
        // メインキャスト（上位5名）で検索
        const mainCast = creditsData.cast?.slice(0, 5).find(
          person => person.name.toLowerCase().includes(personHint.toLowerCase())
        );
        
        if (director || mainCast) {
          movie = result;
          console.log(`Found movie by ${director ? 'director' : 'cast'}: ${personHint}`);
          break;
        }
      }
    }

    // 詳細情報を取得
    const detailUrl = `${TMDB_BASE_URL}/movie/${movie.id}?api_key=${TMDB_API_KEY}&language=ja-JP`;
    const detailResponse = await fetch(detailUrl);
    const detailData = await detailResponse.json();

    // クレジット情報を取得（監督）
    const creditsUrl = `${TMDB_BASE_URL}/movie/${movie.id}/credits?api_key=${TMDB_API_KEY}`;
    const creditsResponse = await fetch(creditsUrl);
    const creditsData = await creditsResponse.json();

    const director = creditsData.crew?.find(person => person.job === 'Director');

    return {
      mediaType: 'movie',
      id: movie.id,
      title: detailData.title,
      originalTitle: detailData.original_title,
      releaseDate: detailData.release_date,
      runtime: detailData.runtime,
      overview: detailData.overview,
      director: director?.name || null,
      posterPath: detailData.poster_path,
      posterUrl: detailData.poster_path 
        ? `${TMDB_IMAGE_BASE_URL}/${POSTER_SIZE}${detailData.poster_path}` 
        : null,
      backdropUrl: detailData.backdrop_path
        ? `${TMDB_IMAGE_BASE_URL}/w780${detailData.backdrop_path}`
        : null
    };
  } catch (error) {
    console.error('TMDB API error:', error);
    return null;
  }
};

/**
 * TVシリーズ（ドラマ・アニメ）を検索して情報を取得
 * @param {string} tvName - 番組タイトル（日本語または英語）
 * @param {string} searchHint - 検索補助キーワード（任意、原作者名など）
 * @param {boolean} preferJapanese - 日本の作品を優先するか（アニメ用）
 * @returns {Promise<Object|null>} TV情報
 */
export const searchTV = async (tvName, searchHint = '', preferJapanese = false) => {
  if (!TMDB_API_KEY) {
    console.error('TMDB API key is not set');
    return null;
  }

  try {
    // 検索クエリを構築（補助キーワードがあれば追加）
    const searchQuery = searchHint ? `${tvName} ${searchHint}` : tvName;
    
    // TVシリーズを検索
    const searchUrl = `${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchQuery)}&language=ja-JP`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (!searchData.results || searchData.results.length === 0) {
      // 補助キーワードで見つからなければ、タイトルのみで再検索
      if (searchHint) {
        console.log('Retrying without search hint...');
        const retryUrl = `${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(tvName)}&language=ja-JP`;
        const retryResponse = await fetch(retryUrl);
        const retryData = await retryResponse.json();
        
        if (!retryData.results || retryData.results.length === 0) {
          console.log('TV series not found:', tvName);
          return null;
        }
        searchData.results = retryData.results;
      } else {
        console.log('TV series not found:', tvName);
        return null;
      }
    }

    let tv = searchData.results[0];
    
    // 日本の作品を優先する場合（アニメ用）
    if (preferJapanese && searchData.results.length > 1) {
      // origin_country に 'JP' が含まれる作品を探す
      const japaneseShow = searchData.results.find(result => 
        result.origin_country?.includes('JP')
      );
      if (japaneseShow) {
        tv = japaneseShow;
        console.log('Found Japanese show:', japaneseShow.name);
      }
    }

    // 詳細情報を取得
    const detailUrl = `${TMDB_BASE_URL}/tv/${tv.id}?api_key=${TMDB_API_KEY}&language=ja-JP`;
    const detailResponse = await fetch(detailUrl);
    const detailData = await detailResponse.json();

    // 総話数を計算
    const totalEpisodes = detailData.seasons?.reduce((sum, season) => {
      // シーズン0（特別編）は除外することも可能
      return sum + (season.episode_count || 0);
    }, 0) || detailData.number_of_episodes;

    return {
      mediaType: 'tv',
      id: tv.id,
      name: detailData.name,
      originalName: detailData.original_name,
      firstAirDate: detailData.first_air_date,
      lastAirDate: detailData.last_air_date,
      numberOfSeasons: detailData.number_of_seasons,
      numberOfEpisodes: totalEpisodes,
      episodeRunTime: detailData.episode_run_time?.[0] || null,
      episodeRuntime: detailData.episode_run_time?.[0] || null,
      overview: detailData.overview,
      creators: detailData.created_by?.map(c => c.name) || [],
      creator: detailData.created_by?.map(c => c.name).join('、') || null,
      posterPath: detailData.poster_path,
      posterUrl: detailData.poster_path 
        ? `${TMDB_IMAGE_BASE_URL}/${POSTER_SIZE}${detailData.poster_path}` 
        : null,
      backdropUrl: detailData.backdrop_path
        ? `${TMDB_IMAGE_BASE_URL}/w780${detailData.backdrop_path}`
        : null,
      status: detailData.status,
      genres: detailData.genres?.map(g => g.name) || []
    };
  } catch (error) {
    console.error('TMDB API error:', error);
    return null;
  }
};

/**
 * 日付をフォーマット
 * @param {string} dateStr - YYYY-MM-DD形式の日付
 * @returns {string} フォーマット済み日付
 */
export const formatMovieReleaseDate = (dateStr) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
};

/**
 * 上映時間をフォーマット
 * @param {number} minutes - 分数
 * @returns {string} フォーマット済み時間
 */
export const formatRuntime = (minutes) => {
  if (!minutes) return null;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}分`;
  return `${hours}時間${mins}分`;
};
