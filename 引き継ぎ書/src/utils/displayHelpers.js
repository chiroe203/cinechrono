import { Film, Tv, BookMarked, Gamepad2, Lightbulb, Swords, AlertCircle, Skull, ScrollText, MapPin, Clock } from 'lucide-react';

// カテゴリごとのスタイル定義
export const styleBase = { 
  movie: { b: 'border-blue-500', txt: 'text-blue-700', ic: Film, icc: 'text-blue-600', bg: 'bg-blue-50' }, 
  drama: { b: 'border-cyan-500', txt: 'text-cyan-700', ic: Tv, icc: 'text-cyan-600', bg: 'bg-cyan-50' }, 
  manga: { b: 'border-green-500', txt: 'text-green-700', ic: BookMarked, icc: 'text-green-600', bg: 'bg-green-50' }, 
  anime: { b: 'border-green-500', txt: 'text-green-700', ic: Tv, icc: 'text-green-600', bg: 'bg-green-50' },
  game: { b: 'border-yellow-500', txt: 'text-yellow-700', ic: Gamepad2, icc: 'text-yellow-600', bg: 'bg-yellow-50' },
  trivia: { b: 'border-gray-400', txt: 'text-gray-700', ic: Lightbulb, icc: 'text-gray-500', bg: 'bg-gray-100' }
};

// ラベル定義
export const labelBase = { 
  movie: '🎬 映画', 
  drama: '📺 ドラマ', 
  manga: '📚 漫画', 
  anime: '📺 アニメ', 
  game: '🎮 ゲーム', 
  trivia: '💡 トリビア' 
};

// typeが配列または文字列に対応
export const getTypes = (t) => {
  if (!t) return ['movie'];
  if (Array.isArray(t)) return t;
  return [t];
};

// スタイルを取得
export const getStyle = (t) => {
  const types = getTypes(t);
  // トリビアの場合は専用スタイル
  if (types.includes('trivia')) return styleBase.trivia;
  // 優先順位: 映画(青) > ドラマ(ティール) > ゲーム(黄) > 漫画・アニメ(緑)
  const primary = types.includes('movie') ? 'movie' 
    : types.includes('drama') ? 'drama'
    : types.includes('game') ? 'game'
    : types[0];
  return styleBase[primary] || styleBase.movie;
};

// ラベルを取得
export const getLabel = (t) => {
  const types = getTypes(t);
  return types.map(type => labelBase[type] || '').filter(Boolean).join('・') || '';
};

// 複数カテゴリのアイコンを取得
export const getTypeIcons = (t) => {
  const types = getTypes(t);
  return types.map(type => {
    switch(type) {
      case 'movie': return { icon: Film, color: 'text-blue-600' };
      case 'drama': return { icon: Tv, color: 'text-blue-600' };
      case 'manga': return { icon: BookMarked, color: 'text-green-600' };
      case 'anime': return { icon: Tv, color: 'text-green-600' };
      case 'game': return { icon: Gamepad2, color: 'text-yellow-600' };
      case 'trivia': return { icon: Lightbulb, color: 'text-gray-500' };
      default: return { icon: Film, color: 'text-blue-600' };
    }
  });
};

// イベントアイコンを取得
export const getEventIcon = (eventType) => {
  switch(eventType) {
    case 'war': return { icon: Swords, label: '⚔️ 戦争・紛争', color: 'red', bgColor: 'bg-red-100', borderColor: 'border-red-500', textColor: 'text-red-700', iconColor: 'text-red-600' };
    case 'incident': return { icon: AlertCircle, label: '❗ 事件', color: 'red', bgColor: 'bg-red-100', borderColor: 'border-red-500', textColor: 'text-red-700', iconColor: 'text-red-600' };
    case 'plague': return { icon: Skull, label: '💀 疫病・災害', color: 'gray', bgColor: 'bg-gray-100', borderColor: 'border-gray-500', textColor: 'text-gray-700', iconColor: 'text-gray-600' };
    case 'treaty': return { icon: ScrollText, label: '📜 条約・宣言', color: 'gray', bgColor: 'bg-gray-100', borderColor: 'border-gray-500', textColor: 'text-gray-700', iconColor: 'text-gray-600' };
    default: return { icon: MapPin, label: '📍 出来事', color: 'red', bgColor: 'bg-red-100', borderColor: 'border-red-500', textColor: 'text-red-700', iconColor: 'text-red-600' };
  }
};

// サブ時代アイコンを取得
export const getSubEraIcon = (subEraType) => {
  switch(subEraType) {
    case 'war': 
      return { icon: Swords, label: '⚔️ 戦争・紛争', color: 'red', bgColor: 'bg-red-100', borderColor: 'border-red-300', iconColor: 'text-red-600' };
    case 'incident': 
      return { icon: AlertCircle, label: '❗ 事件', color: 'red', bgColor: 'bg-red-100', borderColor: 'border-red-300', iconColor: 'text-red-600' };
    case 'plague': 
      return { icon: Skull, label: '💀 疫病・災害', color: 'gray', bgColor: 'bg-gray-100', borderColor: 'border-gray-300', iconColor: 'text-gray-600' };
    case 'treaty': 
      return { icon: ScrollText, label: '📜 条約・宣言', color: 'gray', bgColor: 'bg-gray-100', borderColor: 'border-gray-300', iconColor: 'text-gray-600' };
    case 'event': 
      return { icon: AlertCircle, label: '📌 その他イベント', color: 'gray', bgColor: 'bg-gray-100', borderColor: 'border-gray-300', iconColor: 'text-gray-500' };
    default: 
      return { icon: Clock, label: '🕐 時代区分', color: 'gray', bgColor: 'bg-gray-100', borderColor: 'border-gray-300', iconColor: 'text-gray-600' };
  }
};

// YouTube URLから動画IDを抽出
export const getYoutubeId = (url) => {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};
