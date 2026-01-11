import React, { useState, useEffect } from 'react';
import { X, Settings, Pencil, Loader2, ToggleLeft, ToggleRight, Lightbulb, RefreshCw, CheckSquare, Square } from 'lucide-react';
import { eras, linkServices, gamePlatforms } from '../../constants';
import { parseYear, detectMainEra, getHistoryCategories, hasHistoryCategory, getLabel, getSubEraIcon } from '../../utils';

/**
 * 管理パネルコンポーネント
 * 作品・時代区分・トリビアの追加・編集・削除を行う
 */
const AdminPanel = ({
  // 表示制御
  show,
  onClose,
  // タブ
  tab,
  setTab,
  // 設定
  affiliateEnabled,
  toggleAffiliate,
  // フォームstate
  cf, setCf,
  sf, setSf,
  tf, setTf,
  // 編集
  editMode,
  editTarget,
  // 保存中
  saving,
  // データ
  sortedData,
  existingYears,
  // ソート
  contentSort, setContentSort,
  subEraSort, setSubEraSort,
  triviaSort, setTriviaSort,
  // フィルター
  adminContentFilter, setAdminContentFilter,
  adminSubEraFilter, setAdminSubEraFilter,
  adminTriviaFilter, setAdminTriviaFilter,
  // フォーム送信
  onSubmitContent,
  onSubmitSubEra,
  onSubmitTrivia,
  // リセット
  resetContentForm,
  resetSubEraForm,
  resetTriviaForm,
  // 編集開始
  startEditContent,
  startEditSubEra,
  startEditTrivia,
  // 削除
  deleteContent,
  deleteSubEra,
  // Ref
  contentFormRef,
  // ゲームあらすじ一括更新
  onBulkUpdateGameSynopsis,
  bulkUpdateProgress,
  // ゲーム初期選択
  initialSelectedGame
}) => {
  if (!show) return null;

  // ローカル関数
  const label = getLabel;
  const subEraIcon = getSubEraIcon;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 overflow-y-auto">
      <div className="min-h-screen p-4 py-8">
        <div className="max-w-3xl mx-auto bg-white rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">✏️ 管理画面</h2>
            <button 
              onClick={onClose} 
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* 設定エリア */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="font-semibold text-gray-800">アフィリエイトリンク表示</div>
                  <div className="text-xs text-gray-500">オフの場合、管理者のみリンクが表示されます</div>
                </div>
              </div>
              <button 
                type="button"
                onClick={toggleAffiliate} 
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all ${affiliateEnabled ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}
              >
                {affiliateEnabled ? (
                  <>
                    <ToggleRight className="w-5 h-5" />
                    <span>公開中</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-5 h-5" />
                    <span>非公開</span>
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* タブ選択 */}
          <div className="flex gap-2 mb-6">
            {[['content', '🎬 作品'], ['subEra', '🏛️ 時代区分'], ['trivia', '💡 トリビア']].map(([t, l]) => (
              <button 
                key={t} 
                onClick={() => { setTab(t); resetContentForm(); resetSubEraForm(); resetTriviaForm(); }} 
                className={`flex-1 py-2 text-sm rounded-lg font-bold ${tab === t ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                {l}
              </button>
            ))}
          </div>

          {/* 作品タブ */}
          {tab === 'content' && (
            <ContentForm 
              cf={cf}
              setCf={setCf}
              editMode={editMode}
              editTarget={editTarget}
              saving={saving}
              sortedData={sortedData}
              existingYears={existingYears}
              contentSort={contentSort}
              setContentSort={setContentSort}
              adminContentFilter={adminContentFilter}
              setAdminContentFilter={setAdminContentFilter}
              onSubmit={onSubmitContent}
              resetForm={resetContentForm}
              startEdit={startEditContent}
              deleteContent={deleteContent}
              contentFormRef={contentFormRef}
              label={label}
              onBulkUpdateGameSynopsis={onBulkUpdateGameSynopsis}
              bulkUpdateProgress={bulkUpdateProgress}
              initialSelectedGame={initialSelectedGame}
            />
          )}

          {/* 時代区分タブ */}
          {tab === 'subEra' && (
            <SubEraForm 
              sf={sf}
              setSf={setSf}
              editMode={editMode}
              editTarget={editTarget}
              saving={saving}
              sortedData={sortedData}
              subEraSort={subEraSort}
              setSubEraSort={setSubEraSort}
              adminSubEraFilter={adminSubEraFilter}
              setAdminSubEraFilter={setAdminSubEraFilter}
              onSubmit={onSubmitSubEra}
              resetForm={resetSubEraForm}
              startEdit={startEditSubEra}
              deleteSubEra={deleteSubEra}
              subEraIcon={subEraIcon}
            />
          )}

          {/* トリビアタブ */}
          {tab === 'trivia' && (
            <TriviaForm 
              tf={tf}
              setTf={setTf}
              editMode={editMode}
              editTarget={editTarget}
              saving={saving}
              sortedData={sortedData}
              existingYears={existingYears}
              triviaSort={triviaSort}
              setTriviaSort={setTriviaSort}
              adminTriviaFilter={adminTriviaFilter}
              setAdminTriviaFilter={setAdminTriviaFilter}
              onSubmit={onSubmitTrivia}
              resetForm={resetTriviaForm}
              startEdit={startEditTrivia}
              deleteContent={deleteContent}
            />
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * 作品フォーム
 */
const ContentForm = ({
  cf, setCf,
  editMode, editTarget,
  saving,
  sortedData, existingYears,
  contentSort, setContentSort,
  adminContentFilter, setAdminContentFilter,
  onSubmit,
  resetForm,
  startEdit,
  deleteContent,
  contentFormRef,
  label,
  onBulkUpdateGameSynopsis,
  bulkUpdateProgress,
  initialSelectedGame
}) => {
  return (
    <form ref={contentFormRef} onSubmit={onSubmit} className="bg-gray-50 rounded-lg p-6 border space-y-4">
      {/* 編集モード表示 */}
      {editMode && editTarget?.type === 'content' && (
        <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400 rounded-lg p-4 mb-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Pencil className="w-5 h-5 text-yellow-700" />
            <p className="text-yellow-800 font-bold text-lg">編集モード</p>
          </div>
          <p className="text-yellow-700 text-sm mb-2">「{cf.title}」を編集中です。内容を変更して「更新」ボタンを押してください。</p>
          <button type="button" onClick={resetForm} className="text-sm text-yellow-700 hover:text-yellow-900 underline font-semibold">✕ キャンセルして新規追加に戻る</button>
        </div>
      )}

      {/* カテゴリ選択 */}
      <div className="bg-white border rounded-lg p-4">
        <label className="block text-sm font-semibold text-gray-700 mb-3">カテゴリ（複数選択可）</label>
        <div className="flex flex-wrap gap-4">
          {[
            { id: 'movie', label: '🎬 映画', color: 'blue' },
            { id: 'drama', label: '📺 ドラマ', color: 'blue' },
            { id: 'manga', label: '📚 漫画', color: 'green' },
            { id: 'anime', label: '📺 アニメ', color: 'green' },
            { id: 'game', label: '🎮 ゲーム', color: 'yellow' }
          ].map(cat => (
            <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={cf.categories.includes(cat.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setCf(p => ({ ...p, categories: [...p.categories, cat.id] }));
                  } else {
                    setCf(p => ({ ...p, categories: p.categories.filter(c => c !== cat.id) }));
                  }
                }}
                className={`w-5 h-5 rounded accent-${cat.color}-600`}
              />
              <span className={`font-medium ${cat.color === 'blue' ? 'text-blue-700' : cat.color === 'green' ? 'text-green-700' : 'text-yellow-700'}`}>
                {cat.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* 歴史カテゴリ選択 */}
      <div className="bg-white border rounded-lg p-4">
        <label className="block text-sm font-semibold text-gray-700 mb-3">歴史カテゴリ（複数選択可）</label>
        <div className="flex flex-wrap gap-4">
          {[
            { id: 'japan', label: '🇯🇵 日本史', color: 'red' },
            { id: 'world', label: '🌐 世界史', color: 'blue' }
          ].map(cat => (
            <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={cf.historyCategories?.includes(cat.id)}
                onChange={() => setCf(p => {
                  const cats = p.historyCategories || ['world'];
                  if (cats.includes(cat.id)) {
                    const newCats = cats.filter(c => c !== cat.id);
                    return { ...p, historyCategories: newCats.length > 0 ? newCats : cats };
                  } else {
                    return { ...p, historyCategories: [...cats, cat.id] };
                  }
                })}
                className="w-5 h-5 rounded"
              />
              <span className={`font-medium ${cat.color === 'red' ? 'text-red-700' : 'text-blue-700'}`}>
                {cat.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* 時代設定 */}
      <div className="bg-white border rounded-lg p-4">
        <label className="block text-sm font-semibold text-gray-700 mb-3">⏱️ 時代設定（複数選択可）</label>
        <div className="flex flex-wrap gap-4">
          {[
            { id: 'past', label: '⏪ 過去が舞台', desc: '歴史もの' },
            { id: 'contemporary', label: '⬇️ 制作当時が舞台', desc: '現代劇' },
            { id: 'future', label: '⏩ 未来が舞台', desc: 'SF・未来' }
          ].map(opt => (
            <label key={opt.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={cf.settingTypes?.includes(opt.id)}
                onChange={() => setCf(p => {
                  const types = p.settingTypes || ['past'];
                  if (types.includes(opt.id)) {
                    const newTypes = types.filter(t => t !== opt.id);
                    return { ...p, settingTypes: newTypes.length > 0 ? newTypes : types };
                  } else {
                    return { ...p, settingTypes: [...types, opt.id] };
                  }
                })}
                className="w-5 h-5 rounded"
              />
              <span className="font-medium text-gray-700">{opt.label}</span>
            </label>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">タイムトラベル作品など、複数の時代にまたがる場合は複数選択してください</p>
      </div>

      {/* 配置用の親時代区分 */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">📍 配置用の親（タイムライン表示位置）</label>
        <select 
          value={cf.positionParent || ''} 
          onChange={e => {
            const newParent = e.target.value;
            setCf(p => {
              const newRelated = [...(p.relatedSubEras || [])];
              // 新しい親を関連作品にも追加（まだ含まれていない場合）
              if (newParent && !newRelated.includes(newParent)) {
                newRelated.push(newParent);
              }
              return { ...p, positionParent: newParent, relatedSubEras: newRelated };
            });
          }} 
          className="w-full px-4 py-3 bg-white border border-purple-300 rounded-lg"
        >
          <option value="">なし（年号順に配置）</option>
          {[...new Set(sortedData.filter(i => i.subEra).map(i => i.subEra))].map(sub => (
            <option key={sub} value={sub}>{sub}</option>
          ))}
        </select>
        <p className="text-xs text-purple-600">↑ 選択すると、その時代区分グループ内に配置されます（例：第二次世界大戦内に表示）</p>
      </div>

      {/* 関連作品として表示する時代区分 */}
      <div className="bg-white border rounded-lg p-4">
        <label className="block text-sm font-semibold text-gray-700 mb-3">📚 関連作品として表示する時代区分（複数選択可）</label>
        <div className="max-h-48 overflow-y-auto space-y-2">
          {[...new Set(sortedData.filter(i => i.subEra).map(i => i.subEra))].map(sub => (
            <label key={sub} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded">
              <input
                type="checkbox"
                checked={(cf.relatedSubEras || []).includes(sub)}
                onChange={(e) => {
                  setCf(p => {
                    const current = p.relatedSubEras || [];
                    if (e.target.checked) {
                      return { ...p, relatedSubEras: [...current, sub] };
                    } else {
                      return { ...p, relatedSubEras: current.filter(s => s !== sub) };
                    }
                  });
                }}
                className="w-4 h-4 rounded accent-purple-600"
              />
              <span className={`text-sm ${(cf.relatedSubEras || []).includes(sub) ? 'font-semibold text-purple-700' : 'text-gray-700'}`}>
                {sub}
                {cf.positionParent === sub && <span className="ml-2 text-xs text-purple-500">（配置用に設定中）</span>}
              </span>
            </label>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">↑ チェックした時代区分の「関連作品」欄に表示されます。配置用の親を設定すると自動でチェックされます</p>
      </div>

      {/* タイトル */}
      <input 
        value={cf.title} 
        onChange={e => setCf(p => ({ ...p, title: e.target.value }))} 
        placeholder="タイトル ※必須" 
        className="w-full px-4 py-3 bg-white border rounded-lg" 
        required 
      />

      {/* 英語タイトル（ゲーム・映画・ドラマ・アニメ） */}
      {(cf.categories.includes('game') || cf.categories.includes('movie') || cf.categories.includes('drama') || cf.categories.includes('anime')) && (
        <div className="space-y-2">
          <input 
            value={cf.englishTitle} 
            onChange={e => setCf(p => ({ ...p, englishTitle: e.target.value }))} 
            placeholder={cf.categories.includes('game') 
              ? "英語タイトル（RAWG検索用）例: Assassin's Creed Odyssey" 
              : "英語タイトル（任意・TMDB検索精度向上用）例: Gladiator"} 
            className={`w-full px-4 py-3 bg-white border ${cf.categories.includes('game') ? 'border-yellow-300' : 'border-blue-300'} rounded-lg`} 
          />
          <p className={`text-xs ${cf.categories.includes('game') ? 'text-yellow-600' : 'text-blue-600'}`}>
            {cf.categories.includes('game') 
              ? '↑ 英語タイトルを入力すると、プラットフォーム・リリース日が自動表示されます'
              : '↑ 空欄でも日本語タイトルで検索します。見つからない場合は英語タイトルを入力してください'}
          </p>
        </div>
      )}

      {/* 監督名/俳優名（映画） */}
      {cf.categories.includes('movie') && (
        <div className="space-y-2">
          <input 
            value={cf.searchDirector} 
            onChange={e => setCf(p => ({ ...p, searchDirector: e.target.value }))} 
            placeholder="監督名/俳優名（任意・同名映画の絞り込み用）例: Ridley Scott, Russell Crowe" 
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg" 
          />
          <p className="text-xs text-gray-500">↑ 同名映画がある場合に監督またはメインキャスト（主演俳優など）の名前を入力すると、正しい作品を特定できます</p>
        </div>
      )}

      {/* 公開年（映画） */}
      {cf.categories.includes('movie') && (
        <div className="space-y-2">
          <input 
            value={cf.releaseYear || ''} 
            onChange={e => setCf(p => ({ ...p, releaseYear: e.target.value }))} 
            placeholder="公開年（任意・同名映画の絞り込み用）例: 2010" 
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg" 
            maxLength={4}
          />
          <p className="text-xs text-gray-500">↑ 同名映画がある場合に公開年を入力すると、正しい作品を特定できます（西暦4桁）</p>
        </div>
      )}

      {/* 検索補助キーワード（アニメ・ドラマ） */}
      {(cf.categories.includes('anime') || cf.categories.includes('drama')) && (
        <div className="space-y-2">
          <input 
            value={cf.searchHint} 
            onChange={e => setCf(p => ({ ...p, searchHint: e.target.value }))} 
            placeholder="検索補助キーワード（任意）例: 原泰久、進撃の巨人 アニメ" 
            className="w-full px-4 py-3 bg-white border border-green-300 rounded-lg" 
          />
          <p className="text-xs text-green-600">↑ 同名作品がある場合に原作者名などを入力すると、正しい作品を特定できます（日本のアニメを優先検索します）</p>
        </div>
      )}

      {/* 主な時代 */}
      <div className="space-y-2">
        <input 
          value={cf.year} 
          onChange={e => setCf(p => ({ ...p, year: e.target.value, mainEra: detectMainEra(e.target.value) }))} 
          placeholder={cf.positionParent ? "主な時代（例: 1907）※任意（親グループ内に表示）" : "主な時代（例: 1907）※必須・ソート基準"} 
          className={`w-full px-4 py-3 bg-white border rounded-lg ${cf.positionParent ? 'border-gray-300' : 'border-purple-300'}`} 
          required={!cf.positionParent}
          list="existing-years-list"
        />
        <datalist id="existing-years-list">
          {existingYears.map(year => (
            <option key={year} value={year} />
          ))}
        </datalist>
        <p className={`text-xs ${cf.positionParent ? 'text-gray-500' : 'text-purple-600'}`}>
          {cf.positionParent 
            ? '↑ 親グループ内に表示されます。年号を入力すると紫色のラベルが付きます' 
            : '↑ 紫色で表示され、年表の並び順に使用されます（大区分は自動判定）・入力で既存年号をサジェスト'}
        </p>
      </div>

      {/* 大体の時期 */}
      <div className="space-y-2">
        <input 
          value={cf.periodRange} 
          onChange={e => setCf(p => ({ ...p, periodRange: e.target.value }))} 
          placeholder="大体の時期（例: 1904-1907）※任意" 
          className="w-full px-4 py-3 bg-white border rounded-lg" 
        />
        <p className="text-xs text-gray-500">↑ 回想シーン等も含めた期間を入力（黒字で表示）</p>
      </div>

      {/* ゲームあらすじ（翻訳済み） - ゲームの場合のみ表示 */}
      {cf.categories.includes('game') && (
        <div className="space-y-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <label className="block text-sm font-semibold text-gray-700">
            🎮 ゲームあらすじ（RAWG+DeepL翻訳）
          </label>
          <textarea 
            value={cf.translatedDescription || ''} 
            onChange={e => setCf(p => ({ ...p, translatedDescription: e.target.value }))} 
            placeholder="RAWGから取得したあらすじがここに表示されます。手動で編集も可能です。" 
            className="w-full px-4 py-3 bg-white border rounded-lg h-32" 
          />
          <p className="text-xs text-gray-500">
            ※一括更新または詳細画面の「あらすじを取得」ボタンで自動取得できます
          </p>
        </div>
      )}

      {/* ひとことTips */}
      <textarea 
        value={cf.synopsis} 
        onChange={e => setCf(p => ({ ...p, synopsis: e.target.value }))} 
        placeholder="💡 ひとことTips（任意）映画・ドラマ・アニメはTMDBからあらすじを自動取得します" 
        className="w-full px-4 py-3 bg-white border rounded-lg h-24" 
      />

      {/* サムネイル */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          🖼️ サムネイル画像URL（任意）
          <span className="text-xs text-green-600 font-normal ml-2">
            ※映画・ドラマ・アニメ・ゲームは保存時に自動取得
          </span>
        </label>
        <input 
          value={cf.thumbnail} 
          onChange={e => setCf(p => ({ ...p, thumbnail: e.target.value }))} 
          placeholder="自動取得できない場合のみ入力（漫画など）" 
          className="w-full px-4 py-3 bg-white border rounded-lg" 
        />
        <p className="text-xs text-gray-500">↑ 漫画など自動取得できない場合は、Google検索で画像を右クリック →「画像アドレスをコピー」で取得</p>
        {cf.thumbnail && (
          <div className="flex items-center gap-2">
            <img src={cf.thumbnail} alt="プレビュー" className="w-16 h-16 object-cover rounded border" onError={(e) => e.target.style.display='none'} />
            <span className="text-xs text-green-600">✓ プレビュー</span>
          </div>
        )}
      </div>

      {/* YouTube動画 */}
      <div className="pt-4 border-t">
        <label className="block font-semibold mb-2">🎬 YouTube動画（任意）</label>
        {cf.youtubeUrls.map((url, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input 
              value={url} 
              onChange={e => {
                const newUrls = [...cf.youtubeUrls];
                newUrls[i] = e.target.value;
                setCf(p => ({ ...p, youtubeUrls: newUrls }));
              }} 
              placeholder={`YouTube URL ${i + 1}（例: https://www.youtube.com/watch?v=xxxxx）`} 
              className="flex-1 px-4 py-2 bg-white border rounded-lg" 
            />
            {cf.youtubeUrls.length > 1 && (
              <button 
                type="button" 
                onClick={() => setCf(p => ({ ...p, youtubeUrls: p.youtubeUrls.filter((_, idx) => idx !== i) }))}
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}
        <button 
          type="button" 
          onClick={() => setCf(p => ({ ...p, youtubeUrls: [...p.youtubeUrls, ''] }))} 
          className="text-purple-600 text-sm font-semibold"
        >
          + 動画を追加
        </button>
        <p className="text-xs text-gray-500 mt-1">予告編や名シーンなど、複数の動画を登録できます</p>
      </div>

      {/* 視聴・購入リンク */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-700">🔗 視聴・購入リンク</label>
        {cf.links.map((l, i) => (
          <div key={i} className="p-3 bg-white border rounded-lg space-y-2">
            <div className="flex gap-2">
              <select 
                value={l.category} 
                onChange={e => { 
                  const nl = [...cf.links]; 
                  nl[i].category = e.target.value; 
                  nl[i].service = ''; 
                  nl[i].customName = ''; 
                  setCf(p => ({ ...p, links: nl })); 
                }} 
                className="px-3 py-2 bg-gray-50 border rounded-lg text-sm"
              >
                <option value="book">📚 電子書籍・本</option>
                <option value="buy">🛒 購入する</option>
                <option value="watch">📺 視聴する</option>
                <option value="game">🎮 ゲーム</option>
                <option value="other">🔗 その他</option>
              </select>
              {l.category === 'other' ? (
                <input 
                  value={l.customName || ''} 
                  onChange={e => { 
                    const nl = [...cf.links]; 
                    nl[i].customName = e.target.value; 
                    setCf(p => ({ ...p, links: nl })); 
                  }} 
                  placeholder="サービス名を入力" 
                  className="flex-1 px-3 py-2 bg-gray-50 border rounded-lg text-sm" 
                />
              ) : (
                <select 
                  value={l.service} 
                  onChange={e => { 
                    const nl = [...cf.links]; 
                    nl[i].service = e.target.value; 
                    setCf(p => ({ ...p, links: nl })); 
                  }} 
                  className="flex-1 px-3 py-2 bg-gray-50 border rounded-lg text-sm"
                >
                  <option value="">サービスを選択</option>
                  {linkServices[l.category]?.services.map(s => (
                    <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
                  ))}
                </select>
              )}
              <button 
                type="button" 
                onClick={() => { 
                  const nl = cf.links.filter((_, idx) => idx !== i); 
                  setCf(p => ({ ...p, links: nl.length > 0 ? nl : [{ category: 'book', service: '', platform: '', url: '', customName: '' }] })); 
                }} 
                className="px-2 text-red-500 hover:bg-red-50 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {l.category === 'game' && (
              <select 
                value={l.platform || ''} 
                onChange={e => { 
                  const nl = [...cf.links]; 
                  nl[i].platform = e.target.value; 
                  setCf(p => ({ ...p, links: nl })); 
                }} 
                className="w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm"
              >
                <option value="">機種を選択（任意）</option>
                {gamePlatforms.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            )}
            <input 
              value={l.url} 
              onChange={e => { 
                const nl = [...cf.links]; 
                nl[i].url = e.target.value; 
                setCf(p => ({ ...p, links: nl })); 
              }} 
              placeholder="URL" 
              className="w-full px-3 py-2 bg-white border rounded-lg text-sm" 
            />
          </div>
        ))}
        <button 
          type="button" 
          onClick={() => setCf(p => ({ ...p, links: [...p.links, { category: 'book', service: '', platform: '', url: '', customName: '' }] }))} 
          className="text-purple-600 text-sm font-semibold"
        >
          + リンクを追加
        </button>
      </div>

      {/* トピック記事 */}
      <div className="pt-4 border-t">
        <label className="block font-semibold mb-2">📖 トピック記事（任意）</label>
        <input 
          value={cf.topic.title} 
          onChange={e => setCf(p => ({ ...p, topic: { ...p.topic, title: e.target.value }}))} 
          placeholder="記事タイトル" 
          className="w-full px-4 py-2 bg-white border rounded-lg mb-2" 
        />
        <input 
          value={cf.topic.url} 
          onChange={e => setCf(p => ({ ...p, topic: { ...p.topic, url: e.target.value }}))} 
          placeholder="記事URL" 
          className="w-full px-4 py-2 bg-white border rounded-lg" 
        />
      </div>

      {/* 送信ボタン */}
      <button 
        type="submit" 
        disabled={saving} 
        className={`w-full py-3 ${editMode ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600' : 'bg-gradient-to-r from-purple-600 to-pink-600'} text-white rounded-lg font-bold disabled:opacity-50 flex items-center justify-center gap-2`}
      >
        {saving && <Loader2 className="w-5 h-5 animate-spin" />}
        {editMode ? '✓ 更新する' : '追加'}
      </button>

      {/* 登録済みコンテンツ一覧 */}
      <ContentList 
        sortedData={sortedData}
        contentSort={contentSort}
        setContentSort={setContentSort}
        adminContentFilter={adminContentFilter}
        setAdminContentFilter={setAdminContentFilter}
        editMode={editMode}
        editTarget={editTarget}
        saving={saving}
        startEdit={startEdit}
        deleteContent={deleteContent}
        label={label}
        onBulkUpdateGameSynopsis={onBulkUpdateGameSynopsis}
        bulkUpdateProgress={bulkUpdateProgress}
        initialSelectedGame={initialSelectedGame}
      />
    </form>
  );
};

/**
 * 登録済みコンテンツ一覧
 */
const ContentList = ({
  sortedData,
  contentSort, setContentSort,
  adminContentFilter, setAdminContentFilter,
  editMode, editTarget,
  saving,
  startEdit,
  deleteContent,
  label,
  onBulkUpdateGameSynopsis,
  bulkUpdateProgress,
  initialSelectedGame
}) => {
  // ゲーム選択用state
  const [selectedGames, setSelectedGames] = useState([]);
  const [showGamesOnly, setShowGamesOnly] = useState(false);

  // 初期選択ゲームがある場合に設定
  useEffect(() => {
    if (initialSelectedGame) {
      setSelectedGames([initialSelectedGame]);
    }
  }, [initialSelectedGame]);

  // コンテンツを抽出（トリビアは除外）
  const allContent = sortedData.flatMap(item => 
    (item.content || [])
      .map((c, idx) => ({ item, content: c, idx }))
      .filter(({ content: c }) => c.type !== 'trivia')
  );
  
  // フィルター適用
  let filtered = adminContentFilter === 'all' 
    ? allContent 
    : allContent.filter(({ content: c }) => hasHistoryCategory(c, adminContentFilter));
  
  // ゲームのみ表示フィルター
  if (showGamesOnly) {
    filtered = filtered.filter(({ content: c }) => {
      const types = Array.isArray(c.type) ? c.type : [c.type];
      return types.includes('game');
    });
  }
  
  // 並び替え
  const sorted = [...filtered].sort((a, b) => {
    if (contentSort === 'year') {
      return parseYear(a.item.year) - parseYear(b.item.year);
    } else if (contentSort === 'title') {
      return (a.content.title || '').localeCompare(b.content.title || '', 'ja');
    } else {
      return (b.item.id || '').localeCompare(a.item.id || '');
    }
  });

  // ゲームのみ抽出
  const games = sorted.filter(({ content: c }) => {
    const types = Array.isArray(c.type) ? c.type : [c.type];
    return types.includes('game');
  });

  // あらすじなしのゲームのみ抽出
  const gamesWithoutSynopsis = games.filter(({ content: c }) => !c.translatedDescription);

  // 全選択/解除（あらすじなしのみ）
  const toggleSelectAll = () => {
    if (selectedGames.length === gamesWithoutSynopsis.length && gamesWithoutSynopsis.length > 0) {
      setSelectedGames([]);
    } else {
      setSelectedGames(gamesWithoutSynopsis.map(({ item, idx }) => `${item.id}-${idx}`));
    }
  };

  // 個別選択
  const toggleSelect = (itemId, idx) => {
    const key = `${itemId}-${idx}`;
    if (selectedGames.includes(key)) {
      setSelectedGames(selectedGames.filter(k => k !== key));
    } else {
      setSelectedGames([...selectedGames, key]);
    }
  };

  // 一括更新実行
  const handleBulkUpdate = () => {
    if (selectedGames.length === 0) {
      alert('ゲームを選択してください');
      return;
    }
    
    // 選択されたゲームの情報を抽出
    const selectedItems = selectedGames.map(key => {
      const [itemId, idx] = key.split('-');
      const game = games.find(g => g.item.id === itemId && g.idx === parseInt(idx));
      return game;
    }).filter(Boolean);
    
    if (onBulkUpdateGameSynopsis) {
      onBulkUpdateGameSynopsis(selectedItems);
    }
  };

  return (
    <div className="mt-8 pt-8 border-t">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold">📋 登録済みコンテンツ</h3>
        <div className="flex gap-1 flex-wrap">
          <button type="button" onClick={() => setAdminContentFilter('all')} className={`px-3 py-1 text-xs rounded-full ${adminContentFilter === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>すべて</button>
          <button type="button" onClick={() => setAdminContentFilter('japan')} className={`px-3 py-1 text-xs rounded-full ${adminContentFilter === 'japan' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>🇯🇵日本史</button>
          <button type="button" onClick={() => setAdminContentFilter('world')} className={`px-3 py-1 text-xs rounded-full ${adminContentFilter === 'world' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>🌐世界史</button>
          <span className="border-l mx-1"></span>
          <button type="button" onClick={() => setContentSort('year')} className={`px-3 py-1 text-xs rounded-full ${contentSort === 'year' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>年代順</button>
          <button type="button" onClick={() => setContentSort('title')} className={`px-3 py-1 text-xs rounded-full ${contentSort === 'title' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>五十音順</button>
          <button type="button" onClick={() => setContentSort('created')} className={`px-3 py-1 text-xs rounded-full ${contentSort === 'created' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>登録日順</button>
        </div>
      </div>

      {/* ゲームあらすじ一括更新エリア */}
      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎮</span>
            <span className="font-semibold text-gray-700">ゲームあらすじ一括更新</span>
          </div>
          <button
            type="button"
            onClick={() => setShowGamesOnly(!showGamesOnly)}
            className={`px-3 py-1 text-xs rounded-full ${showGamesOnly ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            {showGamesOnly ? '🎮 ゲームのみ表示中' : 'ゲームのみ表示'}
          </button>
        </div>
        
        {gamesWithoutSynopsis.length > 0 && (
          <div className="flex items-center gap-3 mb-3">
            <button
              type="button"
              onClick={toggleSelectAll}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
            >
              {selectedGames.length === gamesWithoutSynopsis.length ? (
                <CheckSquare className="w-4 h-4 text-yellow-600" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              あらすじなしを全選択 ({gamesWithoutSynopsis.length}件)
            </button>
            <span className="text-sm text-gray-500">
              選択中: {selectedGames.length}件
            </span>
          </div>
        )}
        {gamesWithoutSynopsis.length === 0 && games.length > 0 && (
          <div className="text-sm text-green-600 mb-3">
            ✅ すべてのゲームにあらすじが登録されています
          </div>
        )}

        {/* 更新進捗表示 */}
        {bulkUpdateProgress && bulkUpdateProgress.isUpdating && (
          <div className="mb-3 p-3 bg-white rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Loader2 className="w-4 h-4 animate-spin text-yellow-600" />
              <span className="text-sm font-medium">更新中...</span>
            </div>
            <div className="text-sm text-gray-600 mb-2">
              {bulkUpdateProgress.current} / {bulkUpdateProgress.total}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${(bulkUpdateProgress.current / bulkUpdateProgress.total) * 100}%` }}
              />
            </div>
            {bulkUpdateProgress.currentTitle && (
              <div className="text-xs text-gray-500 mt-2">
                処理中: {bulkUpdateProgress.currentTitle}
              </div>
            )}
            {bulkUpdateProgress.results && bulkUpdateProgress.results.length > 0 && (
              <div className="mt-2 text-xs space-y-1 max-h-24 overflow-y-auto">
                {bulkUpdateProgress.results.map((r, i) => (
                  <div key={i} className={r.success ? 'text-green-600' : 'text-red-600'}>
                    {r.success ? '✅' : '❌'} {r.title}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={handleBulkUpdate}
          disabled={selectedGames.length === 0 || saving || (bulkUpdateProgress && bulkUpdateProgress.isUpdating)}
          className="w-full py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-semibold disabled:opacity-50 hover:from-yellow-600 hover:to-orange-600 flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          あらすじなしのゲームを一括取得 ({selectedGames.length}件)
        </button>
        <p className="text-xs text-gray-500 mt-2">
          ※RAWGから英語あらすじを取得し、DeepLで日本語に翻訳してFirestoreに保存します
        </p>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {sorted.map(({ item, content: c, idx }) => {
          const displayPeriod = c.periodRange || (c.year ? `${c.year}年頃` : '');
          const cats = getHistoryCategories(c);
          const types = Array.isArray(c.type) ? c.type : [c.type];
          const isGame = types.includes('game');
          const isSelected = selectedGames.includes(`${item.id}-${idx}`);
          
          return (
            <div 
              key={`${item.id}-c-${idx}`} 
              className={`flex items-center justify-between p-3 bg-white border rounded-lg ${editMode && editTarget?.itemId === item.id && editTarget?.idx === idx && editTarget?.type === 'content' ? 'ring-2 ring-yellow-400 bg-yellow-50' : ''} ${isSelected ? 'ring-2 ring-yellow-300 bg-yellow-50' : ''}`}
            >
              {/* チェックボックス（ゲームのみ） */}
              {isGame && (
                <button
                  type="button"
                  onClick={() => toggleSelect(item.id, idx)}
                  className="mr-3 flex-shrink-0"
                >
                  {isSelected ? (
                    <CheckSquare className="w-5 h-5 text-yellow-600" />
                  ) : (
                    <Square className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              )}
              
              <div className="flex-1">
                <div className="font-semibold flex items-center gap-2">
                  {c.title}
                  {cats.includes('japan') && <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">🇯🇵</span>}
                  {cats.includes('world') && cats.includes('japan') && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">🌐</span>}
                  {(c.positionParent || c.parentSubEra) && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">📍 {c.positionParent || c.parentSubEra}</span>
                  )}
                  {(c.relatedSubEras?.length > 0) && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">📚 {c.relatedSubEras.length}件</span>
                  )}
                  {isGame && c.translatedDescription && (
                    <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">あらすじあり</span>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {label(c.type)} • <span className="text-purple-600">{item.year}</span>
                  {displayPeriod && ` • ${displayPeriod}`}
                </div>
              </div>
              <div className="flex gap-1">
                <button 
                  type="button" 
                  onClick={() => startEdit(item.id, idx)} 
                  disabled={saving} 
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50" 
                  title="編集"
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <button 
                  type="button" 
                  onClick={() => deleteContent(item.id, 'content', idx)} 
                  disabled={saving} 
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50" 
                  title="削除"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * 時代区分フォーム
 */
const SubEraForm = ({
  sf, setSf,
  editMode, editTarget,
  saving,
  sortedData,
  subEraSort, setSubEraSort,
  adminSubEraFilter, setAdminSubEraFilter,
  onSubmit,
  resetForm,
  startEdit,
  deleteSubEra,
  subEraIcon
}) => {
  return (
    <form onSubmit={onSubmit} className="bg-gray-50 rounded-lg p-6 border space-y-4">
      {/* 編集モード表示 */}
      {editMode && editTarget?.type === 'subEra' && (
        <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400 rounded-lg p-4 mb-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Pencil className="w-5 h-5 text-yellow-700" />
            <p className="text-yellow-800 font-bold text-lg">編集モード</p>
          </div>
          <p className="text-yellow-700 text-sm mb-2">「{sf.subEra}」を編集中です。内容を変更して「更新」ボタンを押してください。</p>
          <button type="button" onClick={resetForm} className="text-sm text-yellow-700 hover:text-yellow-900 underline font-semibold">✕ キャンセルして新規追加に戻る</button>
        </div>
      )}

      {/* 大区分 */}
      <select 
        value={sf.mainEra} 
        onChange={e => setSf(p => ({ ...p, mainEra: e.target.value }))} 
        className="w-full px-4 py-3 bg-white border rounded-lg"
      >
        {eras.map(e => <option key={e.id} value={e.id}>{e.name}（{e.years}）</option>)}
      </select>

      {/* タイプ */}
      <select 
        value={sf.subEraType} 
        onChange={e => setSf(p => ({ ...p, subEraType: e.target.value }))} 
        className="w-full px-4 py-3 bg-white border rounded-lg"
      >
        <option value="normal">🏛️ 通常の時代区分</option>
        <option value="war">⚔️ 戦争・紛争</option>
        <option value="event">📜 歴史的事件</option>
        <option value="location">📍 場所・地域</option>
        <option value="disaster">💀 災害・疫病</option>
      </select>

      {/* 時代区分名 */}
      <input 
        value={sf.subEra} 
        onChange={e => setSf(p => ({ ...p, subEra: e.target.value }))} 
        placeholder="時代区分名（例: 日露戦争、江戸時代）" 
        className="w-full px-4 py-3 bg-white border rounded-lg" 
        required 
      />

      {/* 期間 */}
      <input 
        value={sf.subEraYears} 
        onChange={e => setSf(p => ({ ...p, subEraYears: e.target.value }))} 
        placeholder="期間（例: 1904-1905、1603-1868）" 
        className="w-full px-4 py-3 bg-white border rounded-lg" 
      />

      {/* 歴史カテゴリ */}
      <div className="bg-white border rounded-lg p-4">
        <label className="block text-sm font-semibold text-gray-700 mb-3">歴史カテゴリ（複数選択可）</label>
        <div className="flex flex-wrap gap-4">
          {[
            { id: 'japan', label: '🇯🇵 日本史', color: 'red' },
            { id: 'world', label: '🌐 世界史', color: 'blue' }
          ].map(cat => (
            <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={sf.historyCategories?.includes(cat.id)}
                onChange={() => setSf(p => {
                  const cats = p.historyCategories || ['world'];
                  if (cats.includes(cat.id)) {
                    const newCats = cats.filter(c => c !== cat.id);
                    return { ...p, historyCategories: newCats.length > 0 ? newCats : cats };
                  } else {
                    return { ...p, historyCategories: [...cats, cat.id] };
                  }
                })}
                className="w-5 h-5 rounded"
              />
              <span className={`font-medium ${cat.color === 'red' ? 'text-red-700' : 'text-blue-700'}`}>
                {cat.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* 親時代区分 */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">🔗 親となる時代区分（任意）</label>
        <select 
          value={sf.parentSubEra} 
          onChange={e => setSf(p => ({ ...p, parentSubEra: e.target.value }))} 
          className="w-full px-4 py-3 bg-white border rounded-lg"
        >
          <option value="">なし（独立した時代区分）</option>
          {[...new Set(sortedData.filter(i => i.subEra && i.subEra !== sf.subEra).map(i => i.subEra))].map(sub => (
            <option key={sub} value={sub}>{sub}</option>
          ))}
        </select>
        <p className="text-xs text-gray-500">例：ポーツマス条約の親を「日露戦争」にすると、日露戦争グループ内の終点として表示されます</p>
      </div>

      {/* 概要 */}
      <textarea 
        value={sf.desc} 
        onChange={e => setSf(p => ({ ...p, desc: e.target.value }))} 
        placeholder="概要（クリック時に表示）※任意" 
        className="w-full px-4 py-3 bg-white border rounded-lg h-20" 
      />

      {/* 詳細 */}
      <textarea 
        value={sf.detail} 
        onChange={e => setSf(p => ({ ...p, detail: e.target.value }))} 
        placeholder="詳細（クリック時に表示）※任意" 
        className="w-full px-4 py-3 bg-white border rounded-lg h-32" 
      />

      {/* 送信ボタン */}
      <button 
        type="submit" 
        disabled={saving} 
        className={`w-full py-3 ${editMode ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600' : 'bg-gradient-to-r from-purple-600 to-pink-600'} text-white rounded-lg font-bold disabled:opacity-50 flex items-center justify-center gap-2`}
      >
        {saving && <Loader2 className="w-5 h-5 animate-spin" />}
        {editMode ? '✓ 更新する' : '追加'}
      </button>

      {/* 登録済み時代区分一覧 */}
      <SubEraList 
        sortedData={sortedData}
        subEraSort={subEraSort}
        setSubEraSort={setSubEraSort}
        adminSubEraFilter={adminSubEraFilter}
        setAdminSubEraFilter={setAdminSubEraFilter}
        editMode={editMode}
        editTarget={editTarget}
        saving={saving}
        startEdit={startEdit}
        deleteSubEra={deleteSubEra}
        subEraIcon={subEraIcon}
      />
    </form>
  );
};

/**
 * 登録済み時代区分一覧
 */
const SubEraList = ({
  sortedData,
  subEraSort, setSubEraSort,
  adminSubEraFilter, setAdminSubEraFilter,
  editMode, editTarget,
  saving,
  startEdit,
  deleteSubEra,
  subEraIcon
}) => {
  const allSubEras = [...new Set(sortedData.filter(i => i.subEra).map(i => `${i.mainEra}::${i.subEra}`))]
    .map(key => {
      const [mainEra, subEra] = key.split('::');
      const item = sortedData.find(i => i.mainEra === mainEra && i.subEra === subEra);
      return { key, mainEra, subEra, item };
    });
  
  // フィルター適用
  const filtered = adminSubEraFilter === 'all' 
    ? allSubEras 
    : allSubEras.filter(({ item }) => hasHistoryCategory(item, adminSubEraFilter));
  
  // 並び替え
  const sorted = [...filtered].sort((a, b) => {
    if (subEraSort === 'year') {
      return parseYear(a.item?.subEraYears?.split('-')[0] || a.item?.year) - parseYear(b.item?.subEraYears?.split('-')[0] || b.item?.year);
    } else if (subEraSort === 'title') {
      return (a.subEra || '').localeCompare(b.subEra || '', 'ja');
    } else {
      return (b.item?.id || '').localeCompare(a.item?.id || '');
    }
  });

  return (
    <div className="mt-8 pt-8 border-t">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold">📋 登録済み時代区分</h3>
        <div className="flex gap-1 flex-wrap">
          <button type="button" onClick={() => setAdminSubEraFilter('all')} className={`px-3 py-1 text-xs rounded-full ${adminSubEraFilter === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>すべて</button>
          <button type="button" onClick={() => setAdminSubEraFilter('japan')} className={`px-3 py-1 text-xs rounded-full ${adminSubEraFilter === 'japan' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>🇯🇵日本史</button>
          <button type="button" onClick={() => setAdminSubEraFilter('world')} className={`px-3 py-1 text-xs rounded-full ${adminSubEraFilter === 'world' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>🌐世界史</button>
          <span className="border-l mx-1"></span>
          <button type="button" onClick={() => setSubEraSort('year')} className={`px-3 py-1 text-xs rounded-full ${subEraSort === 'year' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>年代順</button>
          <button type="button" onClick={() => setSubEraSort('title')} className={`px-3 py-1 text-xs rounded-full ${subEraSort === 'title' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>五十音順</button>
          <button type="button" onClick={() => setSubEraSort('created')} className={`px-3 py-1 text-xs rounded-full ${subEraSort === 'created' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>登録日順</button>
        </div>
      </div>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {sorted.map(({ key, mainEra, subEra, item }) => {
          const seIcon = subEraIcon(item?.subEraType);
          const SeIcon = seIcon.icon;
          const eraName = eras.find(e => e.id === mainEra)?.name || mainEra;
          const cats = getHistoryCategories(item);
          return (
            <div 
              key={key} 
              className={`flex items-center justify-between p-3 bg-white border rounded-lg ${editMode && editTarget?.type === 'subEra' && editTarget?.mainEra === mainEra && editTarget?.subEra === subEra ? 'ring-2 ring-yellow-400 bg-yellow-50' : ''}`}
            >
              <div className="flex-1">
                <div className="font-semibold flex items-center gap-2">
                  <SeIcon className={`w-4 h-4 ${seIcon.iconColor}`} />
                  {subEra}
                  {cats.includes('japan') && <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">🇯🇵</span>}
                  {cats.includes('world') && cats.includes('japan') && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">🌐</span>}
                  {item?.parentSubEra && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">→ {item.parentSubEra}</span>
                  )}
                </div>
                <div className="text-sm text-gray-500">{seIcon.label} • {eraName} • {item?.subEraYears || '期間未設定'}</div>
              </div>
              <div className="flex gap-1">
                <button 
                  type="button" 
                  onClick={() => startEdit(mainEra, subEra)} 
                  disabled={saving} 
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50" 
                  title="編集"
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <button 
                  type="button" 
                  onClick={() => deleteSubEra(mainEra, subEra)} 
                  disabled={saving} 
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50" 
                  title="削除"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * トリビアフォーム
 */
const TriviaForm = ({
  tf, setTf,
  editMode, editTarget,
  saving,
  sortedData,
  existingYears,
  triviaSort, setTriviaSort,
  adminTriviaFilter, setAdminTriviaFilter,
  onSubmit,
  resetForm,
  startEdit,
  deleteContent
}) => {
  return (
    <form onSubmit={onSubmit} className="bg-gray-50 rounded-lg p-6 border space-y-4">
      {/* 編集モード表示 */}
      {editMode && editTarget?.type === 'trivia' && (
        <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400 rounded-lg p-4 mb-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Pencil className="w-5 h-5 text-yellow-700" />
            <p className="text-yellow-800 font-bold text-lg">編集モード</p>
          </div>
          <p className="text-yellow-700 text-sm mb-2">「{tf.title}」を編集中です。内容を変更して「更新」ボタンを押してください。</p>
          <button type="button" onClick={resetForm} className="text-sm text-yellow-700 hover:text-yellow-900 underline font-semibold">✕ キャンセルして新規追加に戻る</button>
        </div>
      )}

      {/* タイトル */}
      <input 
        value={tf.title} 
        onChange={e => setTf(p => ({ ...p, title: e.target.value }))} 
        placeholder="トリビアのタイトル ※必須" 
        className="w-full px-4 py-3 bg-white border rounded-lg" 
        required 
      />

      {/* 年代 */}
      <div className="space-y-2">
        <input 
          value={tf.year} 
          onChange={e => setTf(p => ({ ...p, year: e.target.value, mainEra: detectMainEra(e.target.value) }))} 
          placeholder="年代（例: 1868）※必須" 
          className="w-full px-4 py-3 bg-white border border-purple-300 rounded-lg" 
          required
          list="trivia-years-list"
        />
        <datalist id="trivia-years-list">
          {existingYears.map(year => (
            <option key={year} value={year} />
          ))}
        </datalist>
        <p className="text-xs text-purple-600">↑ 年表の並び順に使用されます</p>
      </div>

      {/* 説明 */}
      <textarea 
        value={tf.description} 
        onChange={e => setTf(p => ({ ...p, description: e.target.value }))} 
        placeholder="トリビアの内容 ※必須" 
        className="w-full px-4 py-3 bg-white border rounded-lg h-32" 
        required
      />

      {/* 画像 */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-700">📷 画像URL（任意・複数可）</label>
        {tf.images.map((url, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex gap-2">
              <input 
                value={url} 
                onChange={e => {
                  const newImages = [...tf.images];
                  newImages[idx] = e.target.value;
                  setTf(p => ({ ...p, images: newImages }));
                }} 
                placeholder={`画像URL ${idx + 1}`} 
                className="flex-1 px-4 py-2 bg-white border rounded-lg" 
              />
              {tf.images.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    const newImages = tf.images.filter((_, i) => i !== idx);
                    setTf(p => ({ ...p, images: newImages }));
                  }}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {url && (
              <div className="mt-2 p-2 bg-gray-50 rounded border">
                <img src={url} alt="プレビュー" className="max-h-24 rounded" onError={(e) => e.target.style.display='none'} />
              </div>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => setTf(p => ({ ...p, images: [...p.images, ''] }))}
          className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-purple-400 hover:text-purple-600 transition-colors"
        >
          + 画像を追加
        </button>
      </div>

      {/* 歴史カテゴリ */}
      <div className="bg-white border rounded-lg p-4">
        <label className="block text-sm font-semibold text-gray-700 mb-3">歴史カテゴリ（複数選択可）</label>
        <div className="flex flex-wrap gap-4">
          {[
            { id: 'japan', label: '🇯🇵 日本史', color: 'red' },
            { id: 'world', label: '🌐 世界史', color: 'blue' }
          ].map(cat => (
            <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={tf.historyCategories?.includes(cat.id)}
                onChange={() => setTf(p => {
                  const cats = p.historyCategories || ['world'];
                  if (cats.includes(cat.id)) {
                    const newCats = cats.filter(c => c !== cat.id);
                    return { ...p, historyCategories: newCats.length > 0 ? newCats : ['world'] };
                  }
                  return { ...p, historyCategories: [...cats, cat.id] };
                })}
                className={`w-4 h-4 rounded border-gray-300 text-${cat.color}-600 focus:ring-${cat.color}-500`}
              />
              <span className={`text-sm font-medium text-${cat.color}-700`}>{cat.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 送信ボタン */}
      <button 
        type="submit" 
        disabled={saving} 
        className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold text-lg shadow-lg disabled:opacity-50 hover:from-purple-700 hover:to-pink-700 transition-all"
      >
        {saving ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : editMode ? '✏️ 更新する' : '💡 トリビアを追加'}
      </button>

      {/* 登録済みトリビア一覧 */}
      <TriviaList 
        sortedData={sortedData}
        triviaSort={triviaSort}
        setTriviaSort={setTriviaSort}
        adminTriviaFilter={adminTriviaFilter}
        setAdminTriviaFilter={setAdminTriviaFilter}
        editMode={editMode}
        editTarget={editTarget}
        saving={saving}
        startEdit={startEdit}
        deleteContent={deleteContent}
      />
    </form>
  );
};

/**
 * 登録済みトリビア一覧
 */
const TriviaList = ({
  sortedData,
  triviaSort, setTriviaSort,
  adminTriviaFilter, setAdminTriviaFilter,
  editMode, editTarget,
  saving,
  startEdit,
  deleteContent
}) => {
  // トリビアを抽出
  const allTrivia = sortedData.flatMap(item => 
    (item.content || [])
      .map((c, idx) => ({ item, content: c, idx }))
      .filter(({ content: c }) => c.type === 'trivia')
  );
  
  // フィルター適用
  const filtered = adminTriviaFilter === 'all' 
    ? allTrivia 
    : allTrivia.filter(({ content: c }) => hasHistoryCategory(c, adminTriviaFilter));
  
  // 並び替え
  const sorted = [...filtered].sort((a, b) => {
    if (triviaSort === 'year') {
      return parseYear(a.item.year) - parseYear(b.item.year);
    } else {
      return (a.content.title || '').localeCompare(b.content.title || '', 'ja');
    }
  });

  if (sorted.length === 0) {
    return (
      <div className="mt-8 pt-8 border-t">
        <h3 className="font-bold mb-4">📋 登録済みトリビア</h3>
        <div className="text-center text-gray-500 py-4">トリビアがまだ登録されていません</div>
      </div>
    );
  }

  return (
    <div className="mt-8 pt-8 border-t">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold">📋 登録済みトリビア</h3>
        <div className="flex gap-1 flex-wrap">
          <button type="button" onClick={() => setAdminTriviaFilter('all')} className={`px-3 py-1 text-xs rounded-full ${adminTriviaFilter === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>すべて</button>
          <button type="button" onClick={() => setAdminTriviaFilter('japan')} className={`px-3 py-1 text-xs rounded-full ${adminTriviaFilter === 'japan' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>🇯🇵日本史</button>
          <button type="button" onClick={() => setAdminTriviaFilter('world')} className={`px-3 py-1 text-xs rounded-full ${adminTriviaFilter === 'world' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>🌐世界史</button>
          <span className="border-l mx-1"></span>
          <button type="button" onClick={() => setTriviaSort('year')} className={`px-3 py-1 text-xs rounded-full ${triviaSort === 'year' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>年代順</button>
          <button type="button" onClick={() => setTriviaSort('title')} className={`px-3 py-1 text-xs rounded-full ${triviaSort === 'title' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>五十音順</button>
        </div>
      </div>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {sorted.map(({ item, content: c, idx }) => {
          const cats = getHistoryCategories(c);
          return (
            <div 
              key={`${item.id}-t-${idx}`} 
              className={`flex items-center justify-between p-3 bg-white border rounded-lg ${editMode && editTarget?.itemId === item.id && editTarget?.idx === idx && editTarget?.type === 'trivia' ? 'ring-2 ring-yellow-400 bg-yellow-50' : ''}`}
            >
              <div className="flex-1">
                <div className="font-semibold flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-500" />
                  {c.title}
                  {cats.includes('japan') && <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">🇯🇵</span>}
                  {cats.includes('world') && cats.includes('japan') && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">🌐</span>}
                </div>
                <div className="text-sm text-gray-500">{item.year}{c.images?.length > 0 && ` • 📷${c.images.length}枚`}</div>
              </div>
              <div className="flex gap-1">
                <button 
                  type="button" 
                  onClick={() => startEdit(item.id, idx)} 
                  disabled={saving} 
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50" 
                  title="編集"
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <button 
                  type="button" 
                  onClick={() => deleteContent(item.id, 'content', idx)} 
                  disabled={saving} 
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50" 
                  title="削除"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminPanel;
