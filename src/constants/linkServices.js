// アフィリエイトリンクのサービス定義（表示順: 電子書籍→配信→購入→ゲーム→その他）
export const linkServices = {
  book: {
    label: '📚 電子書籍で読む',
    buttonText: 'で読む',
    order: 1,
    services: [
      { id: 'kindle', name: 'Kindle', icon: '📖', color: 'from-orange-500 to-orange-600' },
      { id: 'rakuten_kobo', name: '楽天Kobo', icon: '📖', color: 'from-red-600 to-red-700' },
      { id: 'booklive', name: 'BookLive!', icon: '📖', color: 'from-orange-600 to-red-500' },
      { id: 'cmoa', name: 'コミックシーモア', icon: '📖', color: 'from-amber-500 to-orange-500' },
      { id: 'dmm_books', name: 'DMMブックス', icon: '📖', color: 'from-pink-500 to-red-500' },
      { id: 'renta', name: 'Renta!', icon: '📖', color: 'from-lime-500 to-green-500' },
    ]
  },
  watch: {
    label: '📺 視聴する',
    buttonText: 'で見る',
    order: 2,
    services: [
      { id: 'amazon_prime', name: 'Amazon Prime Video', icon: '▶️', color: 'from-cyan-600 to-cyan-800' },
      { id: 'netflix', name: 'Netflix', icon: '▶️', color: 'from-red-600 to-red-800' },
      { id: 'unext', name: 'U-NEXT', icon: '▶️', color: 'from-slate-700 to-slate-900' },
      { id: 'hulu', name: 'Hulu', icon: '▶️', color: 'from-emerald-500 to-emerald-700' },
      { id: 'disney', name: 'Disney+', icon: '▶️', color: 'from-blue-700 to-indigo-900' },
    ]
  },
  buy: {
    label: '🛒 購入する',
    buttonText: 'で買う',
    order: 3,
    services: [
      { id: 'amazon', name: 'Amazon', icon: '🛒', color: 'from-teal-600 to-teal-800' },
      { id: 'rakuten', name: '楽天市場', icon: '🛒', color: 'from-red-700 to-red-900' },
      { id: 'yahoo', name: 'Yahoo!ショッピング', icon: '🛒', color: 'from-orange-500 to-orange-700' },
    ]
  },
  game: {
    label: '🎮 ゲームを入手',
    buttonText: 'で入手',
    order: 4,
    services: [
      { id: 'psstore', name: 'PlayStation Store', icon: '🎮', color: 'from-blue-600 to-blue-800' },
      { id: 'nintendo', name: 'Nintendo eShop', icon: '🎮', color: 'from-red-500 to-red-700' },
      { id: 'steam', name: 'Steam', icon: '🎮', color: 'from-gray-700 to-gray-900' },
      { id: 'xbox', name: 'Xbox Store', icon: '🎮', color: 'from-green-600 to-green-800' },
      { id: 'amazon_game', name: 'Amazon（パッケージ版）', icon: '🛒', color: 'from-teal-600 to-teal-800' },
    ]
  },
  other: {
    label: '🔗 その他',
    buttonText: 'で見る',
    order: 5,
    services: []
  }
};

// サービスIDからサービス情報を取得するヘルパー関数
export const getServiceInfo = (serviceId) => {
  for (const category of Object.values(linkServices)) {
    const service = category.services.find(s => s.id === serviceId);
    if (service) return service;
  }
  // 旧形式のサービス名にも対応
  if (serviceId) {
    return { id: serviceId, name: serviceId, icon: '🔗', color: 'from-purple-600 to-pink-600' };
  }
  return null;
};
