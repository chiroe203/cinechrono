import { useState, useEffect } from 'react';
import { searchGame } from '../libs/rawg';
import { searchMovie, searchTV } from '../libs/tmdb';

/**
 * 選択中のメディアに応じてAPI情報を取得するカスタムフック
 * @param {Object} selectedItem - 選択中のアイテム（sel）
 * @returns {Object} API情報と状態
 */
export const useMediaInfo = (selectedItem) => {
  // ゲーム情報（RAWG API）
  const [gameInfo, setGameInfo] = useState(null);
  const [gameInfoLoading, setGameInfoLoading] = useState(false);
  
  // TMDB情報（映画・ドラマ・アニメ）
  const [tmdbInfo, setTmdbInfo] = useState(null);
  const [tmdbInfoLoading, setTmdbInfoLoading] = useState(false);
  
  // 自動取得サムネイル
  const [autoThumbnail, setAutoThumbnail] = useState(null);

  // ゲーム情報取得関数
  const fetchGameInfo = async (englishTitle) => {
    if (!englishTitle) {
      setGameInfo(null);
      return;
    }
    setGameInfoLoading(true);
    try {
      const info = await searchGame(englishTitle);
      setGameInfo(info);
      // サムネイル自動取得
      if (info?.backgroundImage) {
        setAutoThumbnail(info.backgroundImage);
      }
    } catch (error) {
      console.error('Failed to fetch game info:', error);
      setGameInfo(null);
    } finally {
      setGameInfoLoading(false);
    }
  };

  // TMDB情報取得関数（映画・ドラマ・アニメ対応）
  const fetchTmdbInfo = async (title, englishTitle, categories, searchDirector = '', searchHint = '') => {
    // 検索するタイトル（英語タイトルがあればそちらを優先）
    const searchTitle = englishTitle || title;
    if (!searchTitle) {
      setTmdbInfo(null);
      return;
    }
    
    // カテゴリから検索タイプを判定
    const isMovie = categories === 'movie' || (Array.isArray(categories) && categories.includes('movie'));
    const isDrama = categories === 'drama' || (Array.isArray(categories) && categories.includes('drama'));
    const isAnime = categories === 'anime' || (Array.isArray(categories) && categories.includes('anime'));
    
    if (!isMovie && !isDrama && !isAnime) {
      setTmdbInfo(null);
      return;
    }
    
    setTmdbInfoLoading(true);
    try {
      let info = null;
      
      if (isMovie) {
        // 映画検索
        info = await searchMovie(searchTitle, searchDirector);
      } else if (isDrama || isAnime) {
        // ドラマ・アニメはTV検索（アニメは日本作品を優先）
        info = await searchTV(searchTitle, searchHint, isAnime);
      }
      
      setTmdbInfo(info);
      // サムネイル自動取得
      if (info?.posterUrl) {
        setAutoThumbnail(info.posterUrl);
      }
    } catch (error) {
      console.error('Failed to fetch TMDB info:', error);
      setTmdbInfo(null);
    } finally {
      setTmdbInfoLoading(false);
    }
  };

  // 選択中アイテムが変わったときにゲーム情報を取得
  useEffect(() => {
    if (selectedItem && (selectedItem.type === 'game' || (Array.isArray(selectedItem.type) && selectedItem.type.includes('game'))) && selectedItem.englishTitle) {
      fetchGameInfo(selectedItem.englishTitle);
    } else {
      setGameInfo(null);
    }
    // selectedItemが変わったらautoThumbnailをリセット
    setAutoThumbnail(null);
  }, [selectedItem]);

  // 選択中アイテムが変わったときにTMDB情報を取得
  useEffect(() => {
    if (selectedItem && (selectedItem.type === 'movie' || selectedItem.type === 'drama' || selectedItem.type === 'anime' || 
        (Array.isArray(selectedItem.type) && (selectedItem.type.includes('movie') || selectedItem.type.includes('drama') || selectedItem.type.includes('anime'))))) {
      fetchTmdbInfo(selectedItem.title, selectedItem.englishTitle, selectedItem.type, selectedItem.searchDirector || '', selectedItem.searchHint || '');
    } else {
      setTmdbInfo(null);
    }
  }, [selectedItem]);

  return {
    // ゲーム情報
    gameInfo,
    gameInfoLoading,
    // TMDB情報
    tmdbInfo,
    tmdbInfoLoading,
    // サムネイル
    autoThumbnail,
    // 手動で情報を再取得する場合用
    fetchGameInfo,
    fetchTmdbInfo
  };
};
