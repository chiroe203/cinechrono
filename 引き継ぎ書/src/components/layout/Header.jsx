import React from 'react';
import { Menu, Filter, Clock } from 'lucide-react';

/**
 * ヘッダーコンポーネント
 * ナビゲーション、フィルター機能を含む
 */
const Header = ({
  page,
  navigate,
  location,
  menu,
  setMenu,
  historyFilter,
  setHistoryFilter,
  categoryFilter,
  setCategoryFilter,
  tempCategoryFilter,
  setTempCategoryFilter,
  showCategoryFilter,
  setShowCategoryFilter,
  settingTypesFilter,
  setSettingTypesFilter,
  showSettingFilter,
  setShowSettingFilter
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur z-50 shadow-md border-b">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 
          className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent cursor-pointer" 
          onClick={() => navigate('/')}
        >
          CINEchrono TRAVEL
        </h1>
        
        {/* 歴史フィルター - 年表ページでのみ表示 */}
        {page === 'timeline' && (
          <div className="flex items-center gap-2">
            {/* 歴史カテゴリフィルター */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
              <button 
                onClick={() => setHistoryFilter('all')} 
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${historyFilter === 'all' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}
              >
                🌍 全部
              </button>
              <button 
                onClick={() => setHistoryFilter('japan')} 
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${historyFilter === 'japan' ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}
              >
                🇯🇵 日本史
              </button>
              <button 
                onClick={() => setHistoryFilter('world')} 
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${historyFilter === 'world' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}
              >
                🌐 世界史
              </button>
            </div>

            {/* カテゴリーフィルター */}
            <CategoryFilter 
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              tempCategoryFilter={tempCategoryFilter}
              setTempCategoryFilter={setTempCategoryFilter}
              showCategoryFilter={showCategoryFilter}
              setShowCategoryFilter={setShowCategoryFilter}
            />

            {/* 時代設定フィルター */}
            <SettingTypeFilter 
              settingTypesFilter={settingTypesFilter}
              setSettingTypesFilter={setSettingTypesFilter}
              showSettingFilter={showSettingFilter}
              setShowSettingFilter={setShowSettingFilter}
            />
          </div>
        )}
        
        <button onClick={() => setMenu(!menu)} className="p-2 hover:bg-gray-100 rounded-lg">
          <Menu className="w-6 h-6" />
        </button>
      </div>
      
      {/* ナビゲーションメニュー */}
      {menu && (
        <div className="bg-white border-t">
          {[
            ['/', '🕰️ 年表と物語'], 
            ['/articles', '📚 トピック記事'], 
            ['/about', '📝 CINEchrono TRAVELとは'], 
            ['/request', '💬 作品リクエスト']
          ].map(([path, name]) => (
            <button 
              key={path} 
              onClick={() => { navigate(path); setMenu(false); }} 
              className={`w-full text-left px-4 py-3 hover:bg-gray-50 ${location.pathname === path || (path === '/' && location.pathname === '') ? 'bg-purple-50 text-purple-700 font-semibold' : ''}`}
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};

/**
 * カテゴリーフィルター
 */
const CategoryFilter = ({
  categoryFilter,
  setCategoryFilter,
  tempCategoryFilter,
  setTempCategoryFilter,
  showCategoryFilter,
  setShowCategoryFilter
}) => {
  return (
    <div className="relative">
      <button 
        onClick={() => {
          if (!showCategoryFilter) {
            setTempCategoryFilter({ ...categoryFilter });
          }
          setShowCategoryFilter(!showCategoryFilter);
        }}
        className={`p-2 rounded-lg transition-all ${Object.values(categoryFilter).every(v => v) ? 'hover:bg-gray-100 text-gray-600' : 'bg-purple-100 text-purple-700'}`}
        title="カテゴリーで絞り込み"
      >
        <Filter className="w-5 h-5" />
      </button>
      
      {showCategoryFilter && (
        <>
          {/* 背景のオーバーレイ */}
          <div className="fixed inset-0 z-40" onClick={() => setShowCategoryFilter(false)} />
          
          {/* フィルターメニュー */}
          <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-xl border p-4 z-50 min-w-[200px]">
            <div className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              カテゴリーで絞り込み
            </div>
            <div className="space-y-2">
              {[
                { id: 'movie', label: '🎬 映画', color: 'blue' },
                { id: 'drama', label: '📺 ドラマ', color: 'blue' },
                { id: 'manga', label: '📚 漫画', color: 'green' },
                { id: 'anime', label: '📺 アニメ', color: 'green' },
                { id: 'game', label: '🎮 ゲーム', color: 'yellow' },
                { id: 'trivia', label: '💡 トリビア', color: 'gray' }
              ].map(cat => (
                <label key={cat.id} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded p-2 -mx-2">
                  <input
                    type="checkbox"
                    checked={tempCategoryFilter[cat.id]}
                    onChange={(e) => setTempCategoryFilter(prev => ({ ...prev, [cat.id]: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm">{cat.label}</span>
                </label>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t">
              <button 
                onClick={() => {
                  setCategoryFilter({ ...tempCategoryFilter });
                  setShowCategoryFilter(false);
                }}
                className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold text-sm hover:from-purple-700 hover:to-pink-700"
              >
                表示
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/**
 * 時代設定フィルター
 */
const SettingTypeFilter = ({
  settingTypesFilter,
  setSettingTypesFilter,
  showSettingFilter,
  setShowSettingFilter
}) => {
  return (
    <div className="relative">
      <button 
        onClick={() => setShowSettingFilter(!showSettingFilter)}
        className={`p-2 rounded-lg transition-all ${settingTypesFilter.length === 3 ? 'hover:bg-gray-100 text-gray-600' : 'bg-purple-100 text-purple-700'}`}
        title="時代設定で絞り込み"
      >
        <Clock className="w-5 h-5" />
      </button>
      
      {showSettingFilter && (
        <>
          {/* 背景のオーバーレイ */}
          <div className="fixed inset-0 z-40" onClick={() => setShowSettingFilter(false)} />
          
          {/* フィルターメニュー */}
          <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-xl border p-4 z-50 min-w-[220px]">
            <div className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              時代設定で絞り込み
            </div>
            <div className="space-y-2">
              {[
                { id: 'contemporary', label: '⬇️ 制作当時が舞台' },
                { id: 'past', label: '⏪ 過去が舞台' },
                { id: 'future', label: '⏩ 未来が舞台' }
              ].map(opt => (
                <label key={opt.id} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded p-2 -mx-2">
                  <input
                    type="checkbox"
                    checked={settingTypesFilter.includes(opt.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSettingTypesFilter(prev => [...prev, opt.id]);
                      } else {
                        if (settingTypesFilter.length > 1) {
                          setSettingTypesFilter(prev => prev.filter(t => t !== opt.id));
                        }
                      }
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t flex gap-2">
              <button 
                onClick={() => setSettingTypesFilter(['contemporary', 'past', 'future'])}
                className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
              >
                すべて選択
              </button>
              <button 
                onClick={() => setShowSettingFilter(false)}
                className="flex-1 px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold text-sm hover:from-purple-700 hover:to-pink-700"
              >
                閉じる
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Header;
