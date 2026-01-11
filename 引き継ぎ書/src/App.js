import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Film, X, Gamepad2, BookMarked, Settings, Clock, Menu, ExternalLink, LogOut, Loader2, Pencil, Swords, ScrollText, MapPin, ChevronLeft, ChevronRight, Tv, Skull, AlertCircle, ToggleLeft, ToggleRight, Filter, Lightbulb } from 'lucide-react';
import { db, addTimelineItem, deleteTimelineItem, loginAdmin, logoutAdmin } from './firebase';
import { doc, updateDoc } from 'firebase/firestore';
import Articles from './pages/Articles';
import { searchGame, formatReleaseDate } from './libs/rawg';
import { searchMovie, searchTV, formatMovieReleaseDate, formatRuntime } from './libs/tmdb';
import { eras, linkServices, getServiceInfo, gamePlatforms, defaultCategoryFilter } from './constants';
import { parseYear, getCentury, detectMainEra, getHistoryCategories, hasHistoryCategory, styleBase, labelBase, getTypes, getStyle, getLabel, getTypeIcons, getEventIcon, getSubEraIcon, getYoutubeId } from './utils';
import { useAuth, useMediaInfo, useSettings, useTimelineData } from './hooks';
import LoginModal from './components/modals/LoginModal';
import DetailModal from './components/modals/DetailModal';
import AdminPanel from './components/admin/AdminPanel';
import { Header, Footer } from './components/layout';
import { Timeline } from './components/timeline';

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // URLからページを判定
  const page = location.pathname === '/about' ? 'about' 
             : location.pathname === '/request' ? 'request'
             : location.pathname.startsWith('/articles') ? 'articles'
             : 'timeline';
  
  const [sel, setSel] = useState(null);
  const [activeEra, setActiveEra] = useState(null);

  // カスタムフックを使用
  const { currentUser, adminMode, setAdminMode } = useAuth();
  const { affiliateEnabled, toggleAffiliate } = useSettings();
  const { data, setData, sortedData, existingYears, loading } = useTimelineData();
  const { gameInfo, gameInfoLoading, tmdbInfo, tmdbInfoLoading, autoThumbnail } = useMediaInfo(sel);

  const [admin, setAdmin] = useState(false);
  const [tab, setTab] = useState('content');
  const [menu, setMenu] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [authError, setAuthError] = useState('');
  
  // 編集モード用state
  const [editMode, setEditMode] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  
  // 動画カルーセル用state
  const [videoIndex, setVideoIndex] = useState(0);
  
  // フォームへのスクロール用ref
  const contentFormRef = useRef(null);
  const eventFormRef = useRef(null);
  
  // eras, linkServices, gamePlatforms はconstantsからインポート
  // data, sortedData, existingYears はuseTimelineDataからインポート


  const [cf, setCf] = useState({ categories: ['movie'], historyCategories: ['world'], title: '', englishTitle: '', searchDirector: '', searchHint: '', mainEra: 'modern', subEra: '', subEraYears: '', parentSubEra: '', year: '', periodRange: '', synopsis: '', thumbnail: '', youtubeUrls: [''], links: [{ category: 'book', service: '', platform: '', url: '', customName: '' }], topic: { title: '', url: '' }, settingTypes: ['past'] });
  const [ef, setEf] = useState({ eventType: 'war', historyCategories: ['world'], title: '', mainEra: 'modern', subEra: '', subEraYears: '', year: '', desc: '', detail: '', topic: { title: '', url: '' } });
  const [sf, setSf] = useState({ mainEra: 'modern', subEra: '', subEraType: 'normal', subEraYears: '', parentSubEra: '', historyCategories: ['world'], desc: '', detail: '' });
  const [tf, setTf] = useState({ title: '', year: '', mainEra: 'modern', historyCategories: ['world'], description: '', images: [''] }); // トリビア用フォーム
  const [contentSort, setContentSort] = useState('year'); // year, title, created
  const [eventSort, setEventSort] = useState('year');
  const [subEraSort, setSubEraSort] = useState('year');
  const [historyFilter, setHistoryFilter] = useState('all'); // all, japan, world
  // カテゴリーフィルター（defaultCategoryFilterはconstantsからインポート）
  
  // localStorageから読み込み（なければデフォルト値）
  const [categoryFilter, setCategoryFilter] = useState(() => {
    try {
      const saved = localStorage.getItem('cinechrono-category-filter');
      if (saved) {
        const parsed = JSON.parse(saved);
        // デフォルト値とマージ（新しいカテゴリが追加された場合に対応）
        return { ...defaultCategoryFilter, ...parsed };
      }
    } catch (e) {
      console.error('Failed to load category filter from localStorage:', e);
    }
    return defaultCategoryFilter;
  });
  // フィルターUI内の一時的な選択状態
  const [tempCategoryFilter, setTempCategoryFilter] = useState(() => {
    try {
      const saved = localStorage.getItem('cinechrono-category-filter');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaultCategoryFilter, ...parsed };
      }
    } catch (e) {
      console.error('Failed to load category filter from localStorage:', e);
    }
    return defaultCategoryFilter;
  });
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  // 管理画面用フィルター
  const [adminContentFilter, setAdminContentFilter] = useState('all');
  const [adminEventFilter, setAdminEventFilter] = useState('all');
  const [adminSubEraFilter, setAdminSubEraFilter] = useState('all');
  const [adminTriviaFilter, setAdminTriviaFilter] = useState('all');
  const [triviaSort, setTriviaSort] = useState('year');
  
  // 時代設定フィルター用State（複数選択可）
  const [settingTypesFilter, setSettingTypesFilter] = useState(['contemporary', 'past', 'future']); // すべて選択状態がデフォルト
  const [showSettingFilter, setShowSettingFilter] = useState(false);
  
  // gameInfo, tmdbInfo, autoThumbnail はuseMediaInfoからインポート
  
  // サムネイルをFirestoreに自動保存する関数
  const saveThumbnailToFirestore = async (itemId, idx, thumbnailUrl) => {
    if (!itemId || idx === undefined || !thumbnailUrl || itemId.startsWith('sample')) return;
    
    try {
      const item = data.find(i => i.id === itemId);
      if (!item || !item.content || !item.content[idx]) return;
      
      // 既にサムネイルがある場合はスキップ
      if (item.content[idx].thumbnail) return;
      
      // コンテンツを更新
      const updatedContent = [...item.content];
      updatedContent[idx] = { ...updatedContent[idx], thumbnail: thumbnailUrl };
      
      // Firestoreを更新
      const docRef = doc(db, 'timeline', itemId);
      await updateDoc(docRef, { content: updatedContent });
      
      // ローカルデータも更新
      setData(p => p.map(i => i.id === itemId ? { ...i, content: updatedContent } : i));
      
      console.log('サムネイルを自動保存しました:', item.content[idx].title);
    } catch (error) {
      console.error('サムネイル自動保存エラー:', error);
    }
  };

  // autoThumbnailが取得できたらFirestoreに自動保存
  useEffect(() => {
    if (autoThumbnail && sel && sel.itemId && sel.idx !== undefined && !sel.thumbnail) {
      saveThumbnailToFirestore(sel.itemId, sel.idx, autoThumbnail);
    }
  }, [autoThumbnail, sel]);

  // getHistoryCategories, hasHistoryCategory はutilsからインポート

  // parseYear, getCentury, detectMainEra はutilsからインポート

  // sortedData, existingYears はuseTimelineDataからインポート
  // 認証状態監視、データ取得、設定管理はカスタムフックに移動済み

  // styleBase, labelBase, getTypes, getStyle, getLabel, getTypeIcons, getEventIcon, getSubEraIcon, getYoutubeId はutilsからインポート
  // App.js内での関数エイリアス（互換性のため）
  const style = getStyle;
  const label = getLabel;
  const eventIcon = getEventIcon;
  const subEraIcon = getSubEraIcon;
  
  const subs = (m) => [...new Set(data.filter(i => i.mainEra === m).map(i => i.subEra).filter(Boolean))];

  const scroll = (id) => { 
    const el = document.getElementById(`era-${id}`); 
    if (el) { 
      el.scrollIntoView({ behavior: 'smooth' }); 
      setActiveEra(id); 
    }
  };

  useEffect(() => {
    const onScroll = () => { 
      const p = window.scrollY + 200; 
      for (const e of eras) { 
        const el = document.getElementById(`era-${e.id}`); 
        if (el && p >= el.offsetTop && p < el.offsetTop + el.offsetHeight) { 
          setActiveEra(e.id); 
          break; 
        }
      }
    };
    if (page === 'timeline') { 
      window.addEventListener('scroll', onScroll); 
      return () => window.removeEventListener('scroll', onScroll); 
    }
  }, [page]);

  // フォームリセット
  const resetContentForm = () => {
    setCf({ categories: ['movie'], historyCategories: ['world'], title: '', englishTitle: '', searchDirector: '', searchHint: '', mainEra: 'modern', subEra: '', subEraYears: '', parentSubEra: '', year: '', periodRange: '', synopsis: '', thumbnail: '', youtubeUrls: [''], links: [{ category: 'book', service: '', platform: '', url: '', customName: '' }], topic: { title: '', url: '' }, settingTypes: ['past'] });
    setEditMode(false);
    setEditTarget(null);
  };

  const resetEventForm = () => {
    setEf({ eventType: 'war', historyCategories: ['world'], title: '', mainEra: 'modern', subEra: '', subEraYears: '', year: '', desc: '', detail: '', topic: { title: '', url: '' } });
    setEditMode(false);
    setEditTarget(null);
  };

  const resetSubEraForm = () => {
    setSf({ mainEra: 'modern', subEra: '', subEraType: 'normal', subEraYears: '', parentSubEra: '', historyCategories: ['world'], desc: '', detail: '' });
    setEditMode(false);
    setEditTarget(null);
  };

  const resetTriviaForm = () => {
    setTf({ title: '', year: '', mainEra: 'modern', historyCategories: ['world'], description: '', images: [''] });
    setEditMode(false);
    setEditTarget(null);
  };

  // 編集モード開始（コンテンツ）- フォームにスクロール
  const startEditContent = (itemId, idx) => {
    if (!itemId || idx === undefined) {
      console.error('startEditContent: itemId or idx is missing', { itemId, idx });
      return;
    }
    const item = data.find(i => i.id === itemId);
    if (!item) {
      console.error('startEditContent: item not found', { itemId, data });
      return;
    }
    if (!item.content || !item.content[idx]) {
      console.error('startEditContent: content not found', { itemId, idx, content: item.content });
      return;
    }
    const content = item.content[idx];
    
    // 旧形式(youtubeUrl)と新形式(youtubeUrls)の両方に対応
    let urls = [''];
    if (content.youtubeUrls?.length > 0) {
      urls = content.youtubeUrls;
    } else if (content.youtubeUrl) {
      urls = [content.youtubeUrl];
    }
    
    setCf({
      categories: Array.isArray(content.type) ? content.type : [content.type || 'movie'],
      historyCategories: getHistoryCategories(content),
      title: content.title,
      englishTitle: content.englishTitle || '',
      searchDirector: content.searchDirector || '',
      searchHint: content.searchHint || '',
      mainEra: item.mainEra,
      subEra: item.subEra || '',
      subEraYears: item.subEraYears || '',
      parentSubEra: content.parentSubEra || '',
      year: item.year,
      periodRange: content.periodRange || (content.year ? String(content.year) : ''),
      synopsis: content.synopsis || '',
      thumbnail: content.thumbnail || '',
      youtubeUrls: urls,
      links: content.links?.length > 0 ? content.links.map(l => ({
        category: l.category || 'watch',
        service: l.service || '',
        platform: l.platform || '',
        url: l.url || '',
        customName: l.customName || ''
      })) : [{ category: 'book', service: '', platform: '', url: '', customName: '' }],
      topic: content.topic || { title: '', url: '' },
      settingTypes: content.settingTypes || (content.settingType ? [content.settingType] : ['past'])
    });
    setEditMode(true);
    setEditTarget({ itemId, type: 'content', idx });
    setTab('content');
    
    // フォームにスクロール
    setTimeout(() => {
      if (contentFormRef.current) {
        contentFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // 編集モード開始（イベント）- フォームにスクロール
  const startEditEvent = (itemId, idx) => {
    if (!itemId || idx === undefined) {
      console.error('startEditEvent: itemId or idx is missing', { itemId, idx });
      return;
    }
    const item = data.find(i => i.id === itemId);
    if (!item) {
      console.error('startEditEvent: item not found', { itemId, data });
      return;
    }
    if (!item.events || !item.events[idx]) {
      console.error('startEditEvent: event not found', { itemId, idx, events: item.events });
      return;
    }
    const event = item.events[idx];
    
    setEf({
      eventType: event.eventType || 'other',
      historyCategories: getHistoryCategories(event),
      title: event.title,
      mainEra: item.mainEra,
      subEra: item.subEra || '',
      subEraYears: item.subEraYears || '',
      year: item.year,
      desc: event.desc || '',
      detail: event.detail || '',
      topic: event.topic || { title: '', url: '' }
    });
    setEditMode(true);
    setEditTarget({ itemId, type: 'event', idx });
    setTab('event');
    
    // フォームにスクロール
    setTimeout(() => {
      if (eventFormRef.current) {
        eventFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // 編集モード開始（トリビア）
  const startEditTrivia = (itemId, idx) => {
    if (!itemId || idx === undefined) {
      console.error('startEditTrivia: itemId or idx is missing', { itemId, idx });
      return;
    }
    const item = data.find(i => i.id === itemId);
    if (!item) {
      console.error('startEditTrivia: item not found', { itemId, data });
      return;
    }
    if (!item.content || !item.content[idx]) {
      console.error('startEditTrivia: content not found', { itemId, idx, content: item.content });
      return;
    }
    const trivia = item.content[idx];
    
    // 旧形式(thumbnail)と新形式(images)の両方に対応
    let imgs = [''];
    if (trivia.images?.length > 0) {
      imgs = trivia.images;
    } else if (trivia.thumbnail) {
      imgs = [trivia.thumbnail];
    }
    
    setTf({
      title: trivia.title,
      year: item.year,
      mainEra: item.mainEra,
      historyCategories: getHistoryCategories(trivia),
      description: trivia.description || '',
      images: imgs
    });
    setEditMode(true);
    setEditTarget({ itemId, type: 'trivia', idx });
    setTab('trivia');
  };

  // コンテンツ追加・更新（Firebase連携）
  const addC = async (e) => {
    e.preventDefault();
    if (cf.categories.length === 0) {
      alert('カテゴリを1つ以上選択してください');
      return;
    }
    setSaving(true);
    
    // 親が設定されている場合、親のmainEraを使用
    let targetMainEra = cf.mainEra;
    if (cf.parentSubEra) {
      const parentItem = data.find(x => x.subEra === cf.parentSubEra);
      if (parentItem) {
        targetMainEra = parentItem.mainEra;
      }
    }
    
    // サムネイル自動取得（手動入力がない場合のみ）
    let autoFetchedThumbnail = '';
    if (!cf.thumbnail) {
      try {
        const isMovie = cf.categories.includes('movie');
        const isDrama = cf.categories.includes('drama');
        const isAnime = cf.categories.includes('anime');
        const isGame = cf.categories.includes('game');
        
        if (isGame && cf.englishTitle) {
          // ゲーム: RAWG APIから取得
          const gameData = await searchGame(cf.englishTitle);
          if (gameData?.backgroundImage) {
            autoFetchedThumbnail = gameData.backgroundImage;
          }
        } else if (isMovie || isDrama || isAnime) {
          // 映画・ドラマ・アニメ: TMDB APIから取得
          const searchTitle = cf.englishTitle || cf.title;
          if (searchTitle) {
            if (isMovie) {
              const movieData = await searchMovie(searchTitle, cf.searchDirector || '');
              if (movieData?.posterUrl) {
                autoFetchedThumbnail = movieData.posterUrl;
              }
            } else {
              // ドラマ・アニメはTV検索（アニメは日本作品を優先）
              const tvData = await searchTV(searchTitle, cf.searchHint || '', isAnime);
              if (tvData?.posterUrl) {
                autoFetchedThumbnail = tvData.posterUrl;
              }
            }
          }
        }
      } catch (apiError) {
        console.log('サムネイル自動取得スキップ:', apiError.message);
      }
    }
    
    const nc = { 
      type: cf.categories.length === 1 ? cf.categories[0] : cf.categories, 
      historyCategories: cf.historyCategories || ['world'],
      title: cf.title, 
      englishTitle: cf.englishTitle || '',
      searchDirector: cf.searchDirector || '',
      searchHint: cf.searchHint || '',
      periodRange: cf.periodRange || '',
      parentSubEra: cf.parentSubEra || '',
      synopsis: cf.synopsis || '', 
      thumbnail: cf.thumbnail || autoFetchedThumbnail || '',
      youtubeUrls: cf.youtubeUrls.filter(url => url.trim() !== ''),
      links: cf.links.filter(l => l.url), 
      topic: cf.topic.title && cf.topic.url ? cf.topic : null,
      settingTypes: cf.settingTypes || ['past']
    };
    
    try {
      if (editMode && editTarget && editTarget.type === 'content') {
        // 編集モード
        const item = data.find(i => i.id === editTarget.itemId);
        if (item) {
          const updatedContent = [...item.content];
          updatedContent[editTarget.idx] = nc;
          
          // サンプルデータの場合は新規作成
          if (editTarget.itemId.startsWith('sample')) {
            // 時代区分から取得
            const subEraData = data.find(x => x.mainEra === targetMainEra && x.subEra === cf.subEra);
            const newData = { 
              mainEra: targetMainEra, 
              subEra: cf.subEra || '', 
              subEraType: subEraData?.subEraType || item.subEraType || 'normal',
              subEraYears: cf.subEraYears || subEraData?.subEraYears || '', 
              year: cf.year || '', 
              events: item.events || [], 
              content: updatedContent 
            };
            const result = await addTimelineItem(newData);
            setData(p => [...p.filter(i => i.id !== editTarget.itemId), result]);
          } else {
            // 既存ドキュメントを更新
            try {
              const docRef = doc(db, 'timeline', editTarget.itemId);
              const updateData = {
                mainEra: targetMainEra,
                subEra: cf.subEra || '',
                subEraYears: cf.subEraYears || '',
                year: cf.year || '',
                content: updatedContent
              };
              await updateDoc(docRef, updateData);
              setData(p => p.map(i => i.id === editTarget.itemId ? { ...i, ...updateData } : i));
            } catch (updateError) {
              // ドキュメントが存在しない場合は新規作成
              if (updateError.code === 'not-found' || updateError.message.includes('No document to update')) {
                const subEraData = data.find(x => x.mainEra === targetMainEra && x.subEra === cf.subEra);
                const newData = { 
                  mainEra: targetMainEra, 
                  subEra: cf.subEra || '', 
                  subEraType: subEraData?.subEraType || 'normal',
                  subEraYears: cf.subEraYears || subEraData?.subEraYears || '', 
                  year: cf.year || '', 
                  events: item.events || [], 
                  content: updatedContent 
                };
                const result = await addTimelineItem(newData);
                setData(p => [...p.filter(i => i.id !== editTarget.itemId), result]);
              } else {
                throw updateError;
              }
            }
          }
          alert('✅ 更新しました！');
        }
      } else {
        // 新規追加モード
        const existingItem = data.find(x => x.mainEra === targetMainEra && x.subEra === cf.subEra && x.year === cf.year && !x.id?.startsWith('sample'));
        
        if (existingItem) {
          // 既存のFirebaseドキュメントにコンテンツを追加
          const updatedContent = [...(existingItem.content || []), nc];
          const docRef = doc(db, 'timeline', existingItem.id);
          await updateDoc(docRef, { content: updatedContent });
          setData(p => p.map(item => item.id === existingItem.id ? { ...item, content: updatedContent } : item));
        } else {
          // 新しいドキュメントを追加（時代区分から取得）
          const subEraData = data.find(x => x.mainEra === targetMainEra && x.subEra === cf.subEra);
          const newData = { 
            mainEra: targetMainEra, 
            subEra: cf.subEra || '', 
            subEraType: subEraData?.subEraType || 'normal',
            subEraYears: cf.subEraYears || subEraData?.subEraYears || '', 
            year: cf.year || '', 
            events: [], 
            content: [nc] 
          };
          const result = await addTimelineItem(newData);
          setData(p => [...p.filter(item => !item.id?.startsWith('sample')), result]);
        }
        alert('✅ 追加しました！');
      }
      
      resetContentForm();
    } catch (error) {
      console.error('保存エラー:', error);
      alert('❌ 保存に失敗しました: ' + error.message);
    }
    setSaving(false);
  };

  // トリビア追加・更新（Firebase連携）
  const addT = async (e) => {
    e.preventDefault();
    if (!tf.title || !tf.year) {
      alert('タイトルと年号は必須です');
      return;
    }
    // 年号のバリデーション（数字で始まる20文字以内、またはBCで始まる）
    const yearStr = tf.year.trim();
    const isValidYear = /^(BC\s?)?\d/.test(yearStr) && yearStr.length <= 20;
    if (!isValidYear) {
      alert('年号は正しい形式で入力してください（例: 2112, 1930, BC500）\n※長いテキストは入力できません');
      return;
    }
    setSaving(true);
    
    const nt = { 
      type: 'trivia',
      historyCategories: tf.historyCategories || ['world'],
      title: tf.title, 
      description: tf.description || '',
      images: tf.images.filter(url => url.trim() !== '')
    };
    
    const targetMainEra = tf.mainEra || detectMainEra(tf.year);
    
    try {
      if (editMode && editTarget && editTarget.type === 'trivia') {
        // 編集モード
        const item = data.find(i => i.id === editTarget.itemId);
        if (item) {
          const updatedContent = [...item.content];
          updatedContent[editTarget.idx] = nt;
          
          if (editTarget.itemId.startsWith('sample')) {
            const newData = { 
              mainEra: targetMainEra, 
              subEra: '', 
              subEraType: 'normal',
              subEraYears: '', 
              year: tf.year, 
              events: [], 
              content: updatedContent 
            };
            const result = await addTimelineItem(newData);
            setData(p => [...p.filter(i => i.id !== editTarget.itemId), result]);
          } else {
            const docRef = doc(db, 'timeline', editTarget.itemId);
            const updateData = {
              mainEra: targetMainEra,
              year: tf.year,
              content: updatedContent
            };
            await updateDoc(docRef, updateData);
            setData(p => p.map(i => i.id === editTarget.itemId ? { ...i, ...updateData } : i));
          }
          alert('✅ 更新しました！');
        }
      } else {
        // 新規追加モード
        // トリビア専用：既存のトリビア専用アイテム（contentがすべてtrivia）を探す
        const existingTriviaItem = data.find(x => 
          x.mainEra === targetMainEra && 
          !x.subEra && 
          x.year === tf.year && 
          !x.id?.startsWith('sample') &&
          x.content?.length > 0 &&
          x.content.every(c => c.type === 'trivia')
        );
        
        if (existingTriviaItem) {
          // 既存のトリビア専用アイテムに追加
          const updatedContent = [...(existingTriviaItem.content || []), nt];
          const docRef = doc(db, 'timeline', existingTriviaItem.id);
          await updateDoc(docRef, { content: updatedContent });
          setData(p => p.map(item => item.id === existingTriviaItem.id ? { ...item, content: updatedContent } : item));
        } else {
          // 新しいトリビア専用アイテムを作成（作品とは分離）
          const newData = { 
            mainEra: targetMainEra, 
            subEra: '', 
            subEraType: 'normal',
            subEraYears: '', 
            year: tf.year, 
            events: [], 
            content: [nt] 
          };
          const result = await addTimelineItem(newData);
          setData(p => [...p.filter(item => !item.id?.startsWith('sample')), result]);
        }
        alert('✅ 追加しました！');
      }
      
      resetTriviaForm();
    } catch (error) {
      console.error('保存エラー:', error);
      alert('❌ 保存に失敗しました: ' + error.message);
    }
    setSaving(false);
  };

  // イベント追加・更新（Firebase連携）
  const addE = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    const ne = { 
      type: 'history', 
      eventType: ef.eventType,
      historyCategories: ef.historyCategories || ['world'],
      title: ef.title, 
      desc: ef.desc || '', 
      detail: ef.detail || '', 
      topic: ef.topic.title && ef.topic.url ? ef.topic : null 
    };
    
    try {
      if (editMode && editTarget && editTarget.type === 'event') {
        // 編集モード
        const item = data.find(i => i.id === editTarget.itemId);
        if (item) {
          const updatedEvents = [...item.events];
          updatedEvents[editTarget.idx] = ne;
          
          // サンプルデータの場合は新規作成
          if (editTarget.itemId.startsWith('sample')) {
            const newData = { 
              mainEra: ef.mainEra, 
              subEra: ef.subEra || '', 
              subEraType: item.subEraType || 'normal',
              subEraYears: ef.subEraYears || '', 
              year: ef.year, 
              events: updatedEvents, 
              content: item.content || [] 
            };
            const result = await addTimelineItem(newData);
            setData(p => [...p.filter(i => i.id !== editTarget.itemId), result]);
          } else {
            // 既存ドキュメントを更新
            try {
              const docRef = doc(db, 'timeline', editTarget.itemId);
              const updateData = {
                mainEra: ef.mainEra,
                subEra: ef.subEra || '',
                subEraYears: ef.subEraYears || '',
                year: ef.year,
                events: updatedEvents
              };
              await updateDoc(docRef, updateData);
              setData(p => p.map(i => i.id === editTarget.itemId ? { ...i, ...updateData } : i));
            } catch (updateError) {
              // ドキュメントが存在しない場合は新規作成
              if (updateError.code === 'not-found' || updateError.message.includes('No document to update')) {
                const newData = { 
                  mainEra: ef.mainEra, 
                  subEra: ef.subEra || '', 
                  subEraYears: ef.subEraYears || '', 
                  year: ef.year, 
                  events: updatedEvents, 
                  content: item.content || [] 
                };
                const result = await addTimelineItem(newData);
                setData(p => [...p.filter(i => i.id !== editTarget.itemId), result]);
              } else {
                throw updateError;
              }
            }
          }
          alert('✅ 更新しました！');
        }
      } else {
        // 新規追加モード
        const existingItem = data.find(x => x.mainEra === ef.mainEra && x.subEra === ef.subEra && x.year === ef.year && !x.id?.startsWith('sample'));
        
        if (existingItem) {
          // 既存のFirebaseドキュメントにイベントを追加
          const updatedEvents = [...(existingItem.events || []), ne];
          const docRef = doc(db, 'timeline', existingItem.id);
          await updateDoc(docRef, { events: updatedEvents });
          setData(p => p.map(item => item.id === existingItem.id ? { ...item, events: updatedEvents } : item));
        } else {
          // 新しいドキュメントを追加（時代区分から取得）
          const subEraData = data.find(x => x.mainEra === ef.mainEra && x.subEra === ef.subEra);
          const newData = { 
            mainEra: ef.mainEra, 
            subEra: ef.subEra || '', 
            subEraType: subEraData?.subEraType || 'normal',
            subEraYears: ef.subEraYears || subEraData?.subEraYears || '', 
            year: ef.year, 
            events: [ne], 
            content: [] 
          };
          const result = await addTimelineItem(newData);
          setData(p => [...p.filter(item => !item.id?.startsWith('sample')), result]);
        }
        alert('✅ 追加しました！');
      }
      
      resetEventForm();
    } catch (error) {
      console.error('保存エラー:', error);
      alert('❌ 保存に失敗しました: ' + error.message);
    }
    setSaving(false);
  };

  // 時代区分追加・更新（Firebase連携）
  const addSubEra = async (e) => {
    e.preventDefault();
    if (!sf.subEra) {
      alert('時代区分名を入力してください');
      return;
    }
    setSaving(true);
    
    try {
      // 編集モードで大区分(mainEra)が変更された場合の処理
      if (editMode && editTarget?.type === 'subEra' && editTarget.originalMainEra && editTarget.originalSubEra) {
        const originalMainEra = editTarget.originalMainEra;
        const originalSubEra = editTarget.originalSubEra;
        const isMainEraChanged = originalMainEra !== sf.mainEra;
        const isSubEraChanged = originalSubEra !== sf.subEra;
        
        // 元の時代区分に属するアイテムを取得
        const itemsToUpdate = data.filter(x => 
          x.mainEra === originalMainEra && 
          x.subEra === originalSubEra && 
          !x.id?.startsWith('sample')
        );
        
        if (itemsToUpdate.length > 0) {
          for (const item of itemsToUpdate) {
            const docRef = doc(db, 'timeline', item.id);
            await updateDoc(docRef, { 
              mainEra: sf.mainEra, // 新しい大区分
              subEra: sf.subEra, // 新しい時代区分名
              subEraType: sf.subEraType,
              subEraYears: sf.subEraYears,
              parentSubEra: sf.parentSubEra || '',
              historyCategories: sf.historyCategories || ['world'],
              subEraDesc: sf.desc,
              subEraDetail: sf.detail
            });
          }
          // ローカルstate更新（元の場所から新しい場所へ移動）
          setData(p => p.map(item => 
            item.mainEra === originalMainEra && item.subEra === originalSubEra 
              ? { 
                  ...item, 
                  mainEra: sf.mainEra,
                  subEra: sf.subEra,
                  subEraType: sf.subEraType, 
                  subEraYears: sf.subEraYears, 
                  parentSubEra: sf.parentSubEra || '', 
                  historyCategories: sf.historyCategories || ['world'], 
                  subEraDesc: sf.desc, 
                  subEraDetail: sf.detail 
                }
              : item
          ));
          alert('✅ 時代区分を更新しました！');
        } else {
          // 元のアイテムが見つからない場合は新規作成
          const newData = { 
            mainEra: sf.mainEra, 
            subEra: sf.subEra, 
            subEraType: sf.subEraType,
            subEraYears: sf.subEraYears,
            parentSubEra: sf.parentSubEra || '',
            historyCategories: sf.historyCategories || ['world'],
            subEraDesc: sf.desc,
            subEraDetail: sf.detail,
            year: sf.subEraYears.split('-')[0] || '', 
            events: [], 
            content: [] 
          };
          const result = await addTimelineItem(newData);
          setData(p => [...p.filter(item => !item.id?.startsWith('sample')), result]);
          alert('✅ 時代区分を追加しました！');
        }
        
        resetSubEraForm();
        setSaving(false);
        return;
      }
      
      // 新規追加または通常の更新（編集モードでない場合）
      const itemsToUpdate = data.filter(x => x.mainEra === sf.mainEra && x.subEra === sf.subEra && !x.id?.startsWith('sample'));
      
      if (itemsToUpdate.length > 0) {
        // 既存の時代区分を更新
        for (const item of itemsToUpdate) {
          const docRef = doc(db, 'timeline', item.id);
          await updateDoc(docRef, { 
            subEraType: sf.subEraType,
            subEraYears: sf.subEraYears,
            parentSubEra: sf.parentSubEra || '',
            historyCategories: sf.historyCategories || ['world'],
            subEraDesc: sf.desc,
            subEraDetail: sf.detail
          });
        }
        setData(p => p.map(item => 
          item.mainEra === sf.mainEra && item.subEra === sf.subEra 
            ? { ...item, subEraType: sf.subEraType, subEraYears: sf.subEraYears, parentSubEra: sf.parentSubEra || '', historyCategories: sf.historyCategories || ['world'], subEraDesc: sf.desc, subEraDetail: sf.detail }
            : item
        ));
        alert('✅ 時代区分を更新しました！');
      } else {
        // 新しい時代区分用のプレースホルダードキュメントを作成
        const newData = { 
          mainEra: sf.mainEra, 
          subEra: sf.subEra, 
          subEraType: sf.subEraType,
          subEraYears: sf.subEraYears,
          parentSubEra: sf.parentSubEra || '',
          historyCategories: sf.historyCategories || ['world'],
          subEraDesc: sf.desc,
          subEraDetail: sf.detail,
          year: sf.subEraYears.split('-')[0] || '', 
          events: [], 
          content: [] 
        };
        const result = await addTimelineItem(newData);
        setData(p => [...p.filter(item => !item.id?.startsWith('sample')), result]);
        alert('✅ 時代区分を追加しました！');
      }
      
      resetSubEraForm();
    } catch (error) {
      console.error('保存エラー:', error);
      alert('❌ 保存に失敗しました: ' + error.message);
    }
    setSaving(false);
  };

  // 時代区分削除（作品・イベントは残す）
  const deleteSubEra = async (mainEra, subEra) => {
    if (!window.confirm(`「${subEra}」を削除しますか？\n※この時代区分に属する作品・イベントは「時代区分なし」になります。`)) return;
    
    setSaving(true);
    try {
      const itemsWithSubEra = data.filter(x => x.mainEra === mainEra && x.subEra === subEra && !x.id?.startsWith('sample'));
      
      for (const item of itemsWithSubEra) {
        const hasContent = item.content && item.content.length > 0;
        const hasEvents = item.events && item.events.length > 0;
        
        if (hasContent || hasEvents) {
          // 作品・イベントがある場合はsubEraをクリアするだけ
          const docRef = doc(db, 'timeline', item.id);
          await updateDoc(docRef, { 
            subEra: '', 
            subEraType: '', 
            subEraYears: '',
            parentSubEra: '',
            subEraDesc: '',
            subEraDetail: ''
          });
        } else {
          // 空のプレースホルダーは削除
          await deleteTimelineItem(item.id);
        }
      }
      
      // ローカルstate更新
      setData(p => p
        .filter(item => {
          // 空のプレースホルダーは削除
          if (item.mainEra === mainEra && item.subEra === subEra) {
            const hasContent = item.content && item.content.length > 0;
            const hasEvents = item.events && item.events.length > 0;
            return hasContent || hasEvents;
          }
          return true;
        })
        .map(item => {
          // 作品・イベントがある場合はsubEraをクリア
          if (item.mainEra === mainEra && item.subEra === subEra) {
            return { ...item, subEra: '', subEraType: '', subEraYears: '', parentSubEra: '', subEraDesc: '', subEraDetail: '' };
          }
          return item;
        })
      );
      
      alert('✅ 時代区分を削除しました（作品・イベントは残っています）');
    } catch (error) {
      console.error('削除エラー:', error);
      alert('❌ 削除に失敗しました: ' + error.message);
    }
    setSaving(false);
  };

  // 時代区分編集開始
  const startEditSubEra = (mainEra, subEra) => {
    const item = data.find(i => i.mainEra === mainEra && i.subEra === subEra);
    if (!item) return;
    
    setSf({
      mainEra: item.mainEra,
      subEra: item.subEra,
      subEraType: item.subEraType || 'normal',
      subEraYears: item.subEraYears || '',
      parentSubEra: item.parentSubEra || '',
      historyCategories: getHistoryCategories(item),
      desc: item.subEraDesc || '',
      detail: item.subEraDetail || ''
    });
    setEditMode(true);
    // 元のmainEraとsubEraを保存（大区分を跨いだ更新対応）
    setEditTarget({ type: 'subEra', mainEra, subEra, originalMainEra: mainEra, originalSubEra: subEra });
    setTab('subEra');
  };

  // モーダルから編集画面を開く
  const editFromModal = () => {
    if (!sel) return;
    
    if (sel.type === 'subEra') {
      // 時代区分の編集
      startEditSubEra(sel.mainEra, sel.subEra);
      setAdmin(true);
      setSel(null);
    } else if (sel.type === 'history') {
      // イベントの編集
      if (sel.itemId && sel.idx !== undefined) {
        startEditEvent(sel.itemId, sel.idx);
        setAdmin(true);
        setSel(null);
      } else {
        alert('編集情報が見つかりません。一度閉じて再度お試しください。');
      }
    } else if (sel.type === 'trivia') {
      // トリビアの編集
      if (sel.itemId && sel.idx !== undefined) {
        startEditTrivia(sel.itemId, sel.idx);
        setAdmin(true);
        setSel(null);
      } else {
        alert('編集情報が見つかりません。一度閉じて再度お試しください。');
      }
    } else {
      // コンテンツ（映画等）の編集
      if (sel.itemId && sel.idx !== undefined) {
        startEditContent(sel.itemId, sel.idx);
        setAdmin(true);
        setSel(null);
      } else {
        alert('編集情報が見つかりません。一度閉じて再度お試しください。');
      }
    }
  };

  // 削除（Firebase連携）
  const deleteContent = async (itemId, type, idx) => {
    if (!window.confirm('削除しますか？')) return;
    
    setSaving(true);
    try {
      const item = data.find(i => i.id === itemId);
      if (!item) return;
      
      // サンプルデータの場合はローカルのみ削除
      if (itemId.startsWith('sample')) {
        if (type === 'content') {
          const updatedContent = item.content.filter((_, i) => i !== idx);
          if (updatedContent.length === 0 && item.events.length === 0) {
            setData(p => p.filter(i => i.id !== itemId));
          } else {
            setData(p => p.map(i => i.id === itemId ? { ...i, content: updatedContent } : i));
          }
        } else if (type === 'event') {
          const updatedEvents = item.events.filter((_, i) => i !== idx);
          if (updatedEvents.length === 0 && item.content.length === 0) {
            setData(p => p.filter(i => i.id !== itemId));
          } else {
            setData(p => p.map(i => i.id === itemId ? { ...i, events: updatedEvents } : i));
          }
        }
        alert('✅ 削除しました');
        setSaving(false);
        return;
      }
      
      // Firebaseのドキュメントを処理
      if (type === 'content') {
        const updatedContent = item.content.filter((_, i) => i !== idx);
        if (updatedContent.length === 0 && item.events.length === 0) {
          // コンテンツもイベントもなくなったら削除
          await deleteTimelineItem(itemId);
          setData(p => p.filter(i => i.id !== itemId));
        } else {
          // updateDocで更新
          const docRef = doc(db, 'timeline', itemId);
          await updateDoc(docRef, { content: updatedContent });
          setData(p => p.map(i => i.id === itemId ? { ...i, content: updatedContent } : i));
        }
      } else if (type === 'event') {
        const updatedEvents = item.events.filter((_, i) => i !== idx);
        if (updatedEvents.length === 0 && item.content.length === 0) {
          // コンテンツもイベントもなくなったら削除
          await deleteTimelineItem(itemId);
          setData(p => p.filter(i => i.id !== itemId));
        } else {
          // updateDocで更新
          const docRef = doc(db, 'timeline', itemId);
          await updateDoc(docRef, { events: updatedEvents });
          setData(p => p.map(i => i.id === itemId ? { ...i, events: updatedEvents } : i));
        }
      }
      alert('✅ 削除しました');
    } catch (error) {
      console.error('削除エラー:', error);
      // エラーが出てもローカルからは削除
      if (type === 'content') {
        const updatedContent = data.find(i => i.id === itemId)?.content.filter((_, i) => i !== idx) || [];
        setData(p => p.map(i => i.id === itemId ? { ...i, content: updatedContent } : i).filter(i => i.content.length > 0 || i.events.length > 0));
      } else {
        const updatedEvents = data.find(i => i.id === itemId)?.events.filter((_, i) => i !== idx) || [];
        setData(p => p.map(i => i.id === itemId ? { ...i, events: updatedEvents } : i).filter(i => i.content.length > 0 || i.events.length > 0));
      }
      alert('⚠️ ローカルから削除しました（Firebaseと同期できませんでした）');
    }
    setSaving(false);
  };

  const handleAdminModeToggle = () => {
    if (adminMode) {
      logoutAdmin().then(() => {
        setAdminMode(false);
        // currentUserはuseAuthフックのonAuthStateChangedで自動的にnullになる
      });
    } else {
      setShowPasswordPrompt(true);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setSaving(true);
    
    try {
      await loginAdmin(emailInput, passwordInput);
      setAdminMode(true);
      setShowPasswordPrompt(false);
      setEmailInput('');
      setPasswordInput('');
    } catch (error) {
      console.error('ログインエラー:', error);
      if (error.code === 'auth/invalid-email') {
        setAuthError('メールアドレスの形式が正しくありません');
      } else if (error.code === 'auth/user-not-found') {
        setAuthError('ユーザーが見つかりません');
      } else if (error.code === 'auth/wrong-password') {
        setAuthError('パスワードが間違っています');
      } else if (error.code === 'auth/invalid-credential') {
        setAuthError('メールアドレスまたはパスワードが間違っています');
      } else {
        setAuthError('ログインに失敗しました');
      }
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header 
        page={page}
        navigate={navigate}
        location={location}
        menu={menu}
        setMenu={setMenu}
        historyFilter={historyFilter}
        setHistoryFilter={setHistoryFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        tempCategoryFilter={tempCategoryFilter}
        setTempCategoryFilter={setTempCategoryFilter}
        showCategoryFilter={showCategoryFilter}
        setShowCategoryFilter={setShowCategoryFilter}
        settingTypesFilter={settingTypesFilter}
        setSettingTypesFilter={setSettingTypesFilter}
        showSettingFilter={showSettingFilter}
        setShowSettingFilter={setShowSettingFilter}
      />
      {adminMode && (
        <button onClick={() => setAdmin(true)} className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-lg flex items-center justify-center z-40 hover:scale-110 transition-transform"><Settings className="w-6 h-6 text-white" /></button>
      )}

      <div className="pt-20">
        {page === 'timeline' && (
          <Timeline 
            sortedData={sortedData}
            activeEra={activeEra}
            scroll={scroll}
            historyFilter={historyFilter}
            categoryFilter={categoryFilter}
            settingTypesFilter={settingTypesFilter}
            setSel={setSel}
            setVideoIndex={setVideoIndex}
          />
        )}

        {page === 'about' && (
          <div className="max-w-4xl mx-auto px-4 py-16">
            {/* メインキャッチコピー */}
            <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">物語で旅する、世界と時代。</h1>
            
            {/* イントロダクション */}
            <div className="bg-gray-50 rounded-lg p-8 mb-12 space-y-4 border text-gray-700">
              <p>スクリーンの向こうに広がるのは、さまざまな時代、さまざまな場所。</p>
              <p>歴史の出来事や年号だけでは見えない、その時代の空気、服装、建築、街の音。</p>
              <p>映画を通して見ぬ時代を歩き、遠い世界へ旅をすることで、歴史は記号ではなく、手触りのある体験に変わります。</p>
              <p className="font-bold text-purple-700">CINEchrono TRAVEL は、映画という窓から世界と時代をめぐるための地図です。</p>
              <p>あなたの旅が、ここから始まりますように。</p>
              <p className="text-center text-gray-500 italic pt-4">— 映画は、時代を歩くための地図になる。</p>
            </div>

            {/* 作成者の想い */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-8 mb-12 border border-purple-200">
              <h2 className="text-2xl font-bold mb-4 text-purple-800">📚 このサイトを作った理由</h2>
              <div className="space-y-3 text-gray-700">
                <p>「この王様って、いつの時代の人だっけ？」</p>
                <p>「産業革命とフランス革命、どっちが先？日本だと何時代？」</p>
                <p>中学・高校・大学で歴史を勉強していた頃、年号と出来事の暗記に苦労しました。教科書を読んでも、その時代がどんな世界だったのか、なかなかイメージが湧かない。</p>
                <p>でも、映画を観れば、『グラディエーター』からローマ帝国の壮大さが伝わり、『レ・ミゼラブル』からフランス革命後の混乱が肌で感じられる。</p>
                <p className="font-semibold text-purple-700">「あの頃の自分に、こんなサイトがあったら良かったのに」</p>
                <p>そんな想いから、CINEchrono TRAVELを制作しました！</p>
              </div>
            </div>

            {/* 時代区分図表 */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 text-center">🗺️ 世界史の時代区分</h2>
              <p className="text-center text-gray-600 mb-8">ヨーロッパ史を基準とした5つの時代区分で、歴史の大きな流れを把握できます。</p>
              
              {/* 時代区分バー */}
              <div className="overflow-x-auto">
                <div className="min-w-[600px]">
                  {/* 世紀ラベル */}
                  <div className="flex text-xs text-gray-500 mb-2">
                    <div className="w-[12%] text-center">BC</div>
                    <div className="w-[16%] text-center">1-5世紀</div>
                    <div className="w-[20%] text-center">6-15世紀</div>
                    <div className="w-[18%] text-center">16-18世紀</div>
                    <div className="w-[18%] text-center">19-20世紀</div>
                    <div className="w-[16%] text-center">21世紀</div>
                  </div>
                  
                  {/* メインの時代区分バー */}
                  <div className="flex h-14 rounded-lg overflow-hidden shadow-lg mb-4">
                    <div className="w-[28%] bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold">
                      <span>古代</span>
                    </div>
                    <div className="w-[20%] bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold">
                      <span>中世</span>
                    </div>
                    <div className="w-[18%] bg-gradient-to-r from-cyan-500 to-cyan-600 flex items-center justify-center text-white font-bold">
                      <span>近世</span>
                    </div>
                    <div className="w-[18%] bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                      <span>近代</span>
                    </div>
                    <div className="w-[16%] bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      <span>現代</span>
                    </div>
                  </div>

                  {/* 区切りイベント */}
                  <div className="flex text-xs relative h-16">
                    <div className="w-[28%] flex justify-end pr-1">
                      <div className="text-amber-700 text-center">
                        <div className="border-l-2 border-amber-400 h-4 mx-auto"></div>
                        <span>西ローマ滅亡<br/>(476年)</span>
                      </div>
                    </div>
                    <div className="w-[20%] flex justify-end pr-1">
                      <div className="text-emerald-700 text-center">
                        <div className="border-l-2 border-emerald-400 h-4 mx-auto"></div>
                        <span>大航海時代<br/>(1492年〜)</span>
                      </div>
                    </div>
                    <div className="w-[18%] flex justify-end pr-1">
                      <div className="text-cyan-700 text-center">
                        <div className="border-l-2 border-cyan-400 h-4 mx-auto"></div>
                        <span>フランス革命<br/>(1789年)</span>
                      </div>
                    </div>
                    <div className="w-[18%] flex justify-end pr-1">
                      <div className="text-blue-700 text-center">
                        <div className="border-l-2 border-blue-400 h-4 mx-auto"></div>
                        <span>冷戦終結<br/>(1991年)</span>
                      </div>
                    </div>
                    <div className="w-[16%]"></div>
                  </div>
                </div>
              </div>
            </div>


            {/* 各時代の説明 */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6 text-center">📖 各時代の特徴</h2>
              
              <div className="bg-amber-50 rounded-lg p-6 border border-amber-200">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1 bg-amber-500 text-white rounded-full text-sm font-bold">古代</span>
                  <span className="text-gray-500 text-sm">〜500年</span>
                </div>
                <p className="text-gray-700">古代ギリシャ・古代ローマの時代。西ローマ帝国の滅亡（476年）をもって終了とされます。哲学、民主制、法律など、現代にも続く多くの概念がこの時代に生まれました。</p>
                <p className="text-amber-700 text-sm mt-2">🎬 代表作品：アサシン クリード オリジンズ、ベン・ハー、グラディエーター</p>
              </div>

              <div className="bg-emerald-50 rounded-lg p-6 border border-emerald-200">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1 bg-emerald-500 text-white rounded-full text-sm font-bold">中世</span>
                  <span className="text-gray-500 text-sm">501-1500年</span>
                </div>
                <p className="text-gray-700">封建制を基盤とした時代。西ローマ帝国滅亡後から大航海時代の始まりまで、約1000年間続きました。騎士、城、キリスト教会が社会の中心でした。</p>
                <p className="text-emerald-700 text-sm mt-2">🎬 代表作品：ブレイブハート、キングダム・オブ・ヘブン、チ。-地球の運動について</p>
              </div>

              <div className="bg-cyan-50 rounded-lg p-6 border border-cyan-200">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1 bg-cyan-500 text-white rounded-full text-sm font-bold">近世</span>
                  <span className="text-gray-500 text-sm">1501-1800年</span>
                </div>
                <p className="text-gray-700">中世から近代への移行期。大航海時代の幕開け（1492年）からフランス革命前まで。ルネサンス、宗教改革、絶対王政の時代です。</p>
                <p className="text-cyan-700 text-sm mt-2">🎬 代表作品：ベルサイユのばら、アマデウス、パイレーツ・オブ・カリビアン</p>
              </div>

              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-bold">近代</span>
                  <span className="text-gray-500 text-sm">1801-1945年</span>
                </div>
                <p className="text-gray-700">産業革命・フランス革命から第二次世界大戦終結まで。資本主義が発達し、国民国家が確立された激動の時代。二度の世界大戦を経験しました。</p>
                <p className="text-blue-700 text-sm mt-2">🎬 代表作品：レ・ミゼラブル、黒執事、タイタニック、シンドラーのリスト</p>
              </div>

              <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1 bg-purple-500 text-white rounded-full text-sm font-bold">現代</span>
                  <span className="text-gray-500 text-sm">1945年〜</span>
                </div>
                <p className="text-gray-700">第二次世界大戦後から現在まで。冷戦、グローバル化、デジタル革命を経て、私たちが生きる「今」へと続きます。</p>
                <p className="text-purple-700 text-sm mt-2">🎬 代表作品：フォレスト・ガンプ、コードネーム U.N.C.L.E.、ペンタゴン・ペーパーズ、ゼロ・ダーク・サーティ</p>
              </div>
            </div>

            {/* 締めのメッセージ */}
            <div className="mt-12 text-center">
              <p className="text-gray-600 mb-4">さあ、年表を開いて、時代の旅に出かけましょう。</p>
              <button onClick={() => navigate('/')} className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-bold hover:from-purple-700 hover:to-pink-700 shadow-lg transition-all">
                🎬 年表を見る
              </button>
            </div>
          </div>
        )}

        {page === 'request' && (
          <div className="max-w-4xl mx-auto px-4 py-16">
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              📝 作品リクエスト
            </h1>
            <p className="text-center text-gray-600 mb-8 max-w-xl mx-auto">
              「この作品を追加してほしい！」「この時代の作品が見たい！」など、
              あなたのリクエストをお待ちしています。匿名で送信できます。
            </p>
            <div className="flex justify-center">
              <iframe 
                src="https://docs.google.com/forms/d/e/1FAIpQLSffX8Ix4ET2l0u8_fgwnvM33EbfRQvjE654qvVsiP_EVOGz6g/viewform?embedded=true" 
                width="640" 
                height="1218" 
                frameBorder="0" 
                marginHeight="0" 
                marginWidth="0"
                title="作品リクエストフォーム"
                className="max-w-full rounded-lg shadow-lg"
              >
                読み込んでいます…
              </iframe>
            </div>
            <div className="mt-8 text-center">
              <button onClick={() => navigate('/')} className="px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 font-medium transition-colors">
                ← 年表に戻る
              </button>
            </div>
          </div>
        )}

        {page === 'articles' && <Articles />}
      </div>

      <Footer 
        adminMode={adminMode}
        onAdminModeToggle={handleAdminModeToggle}
      />



      <DetailModal
        sel={sel}
        onClose={() => setSel(null)}
        adminMode={adminMode}
        affiliateEnabled={affiliateEnabled}
        autoThumbnail={autoThumbnail}
        gameInfo={gameInfo}
        gameInfoLoading={gameInfoLoading}
        tmdbInfo={tmdbInfo}
        tmdbInfoLoading={tmdbInfoLoading}
        videoIndex={videoIndex}
        setVideoIndex={setVideoIndex}
        onEdit={editFromModal}
      />


      <AdminPanel
        show={admin}
        onClose={() => { setAdmin(false); resetContentForm(); resetSubEraForm(); }}
        tab={tab}
        setTab={setTab}
        affiliateEnabled={affiliateEnabled}
        toggleAffiliate={toggleAffiliate}
        cf={cf}
        setCf={setCf}
        sf={sf}
        setSf={setSf}
        tf={tf}
        setTf={setTf}
        editMode={editMode}
        editTarget={editTarget}
        saving={saving}
        sortedData={sortedData}
        existingYears={existingYears}
        contentSort={contentSort}
        setContentSort={setContentSort}
        subEraSort={subEraSort}
        setSubEraSort={setSubEraSort}
        triviaSort={triviaSort}
        setTriviaSort={setTriviaSort}
        adminContentFilter={adminContentFilter}
        setAdminContentFilter={setAdminContentFilter}
        adminSubEraFilter={adminSubEraFilter}
        setAdminSubEraFilter={setAdminSubEraFilter}
        adminTriviaFilter={adminTriviaFilter}
        setAdminTriviaFilter={setAdminTriviaFilter}
        onSubmitContent={addC}
        onSubmitSubEra={addSubEra}
        onSubmitTrivia={addT}
        resetContentForm={resetContentForm}
        resetSubEraForm={resetSubEraForm}
        resetTriviaForm={resetTriviaForm}
        startEditContent={startEditContent}
        startEditSubEra={startEditSubEra}
        startEditTrivia={startEditTrivia}
        deleteContent={deleteContent}
        deleteSubEra={deleteSubEra}
        contentFormRef={contentFormRef}
      />

      <LoginModal
        show={showPasswordPrompt}
        onClose={() => { setShowPasswordPrompt(false); setEmailInput(''); setPasswordInput(''); setAuthError(''); }}
        onSubmit={handlePasswordSubmit}
        emailInput={emailInput}
        setEmailInput={setEmailInput}
        passwordInput={passwordInput}
        setPasswordInput={setPasswordInput}
        authError={authError}
        saving={saving}
      />
    </div>
  );
};

export default App;
