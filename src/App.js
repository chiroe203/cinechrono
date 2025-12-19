import React, { useState, useEffect, useRef } from 'react';
import { Film, X, Gamepad2, BookMarked, Settings, Clock, Menu, ExternalLink, LogOut, Loader2, Pencil, Swords, ScrollText, MapPin, ChevronLeft, ChevronRight, Tv } from 'lucide-react';
import { db, auth, fetchTimelineData, addTimelineItem, deleteTimelineItem, loginAdmin, logoutAdmin } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';

const App = () => {
  const [sel, setSel] = useState(null);
  const [activeEra, setActiveEra] = useState(null);

  const [admin, setAdmin] = useState(false);
  const [tab, setTab] = useState('content');
  const [page, setPage] = useState('timeline');
  const [menu, setMenu] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [authError, setAuthError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  
  // 編集モード用state
  const [editMode, setEditMode] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  
  // 動画カルーセル用state
  const [videoIndex, setVideoIndex] = useState(0);
  
  // フォームへのスクロール用ref
  const contentFormRef = useRef(null);
  const eventFormRef = useRef(null);
  
  // サンプルデータ
  const sampleData = [
    { 
      id: 'sample1',
      mainEra: 'ancient', 
      subEra: 'ローマ帝国', 
      subEraYears: '紀元前27-476年', 
      year: '180年', 
      events: [{ type: 'history', eventType: 'other', title: 'カエサル暗殺', desc: 'ユリウス・カエサルが元老院で暗殺される', detail: 'ユリウス・カエサルは紀元前44年3月15日、ローマ元老院にて暗殺された。', topic: { title: 'ローマ帝国の栄光と滅亡を描く作品たち', url: 'https://note.com/cinechrono/n/xxxxx' } }], 
      content: [{ type: 'movie', title: 'グラディエーター', periodRange: '180年頃', synopsis: 'ローマ帝国の将軍マキシマスが、皇帝に裏切られ奴隷剣闘士となり、復讐を誓う', links: [{ service: 'Amazon Prime', url: 'https://amazon.co.jp' }], topic: { title: 'ローマ帝国の栄光と滅亡を描く作品たち', url: 'https://note.com/cinechrono/n/xxxxx' } }] 
    }
  ];

  const [data, setData] = useState([]);

  const eras = [
    { id: 'ancient', name: '古代', year: '〜500' }, 
    { id: 'medieval', name: '中世', year: '501-1500' }, 
    { id: 'early-modern', name: '近世', year: '1501-1800' }, 
    { id: 'modern', name: '近代', year: '1801-1945' }, 
    { id: 'contemporary', name: '現代', year: '1945-' }
  ];
  
  const [cf, setCf] = useState({ categories: ['movie'], historyCategories: ['world'], title: '', mainEra: 'modern', subEra: '', subEraYears: '', parentSubEra: '', year: '', periodRange: '', synopsis: '', thumbnail: '', youtubeUrls: [''], links: [{ service: '', url: '' }], topic: { title: '', url: '' } });
  const [ef, setEf] = useState({ eventType: 'other', historyCategories: ['world'], title: '', mainEra: 'modern', subEra: '', subEraYears: '', year: '', desc: '', detail: '', topic: { title: '', url: '' } });
  const [sf, setSf] = useState({ mainEra: 'modern', subEra: '', subEraType: 'normal', subEraYears: '', parentSubEra: '', historyCategories: ['world'], desc: '', detail: '' });
  const [contentSort, setContentSort] = useState('year'); // year, title, created
  const [eventSort, setEventSort] = useState('year');
  const [subEraSort, setSubEraSort] = useState('year');
  const [historyFilter, setHistoryFilter] = useState('all'); // all, japan, world
  // 管理画面用フィルター
  const [adminContentFilter, setAdminContentFilter] = useState('all');
  const [adminEventFilter, setAdminEventFilter] = useState('all');
  const [adminSubEraFilter, setAdminSubEraFilter] = useState('all');

  // historyCategory/historyCategoriesの正規化ヘルパー
  const getHistoryCategories = (item) => {
    if (item?.historyCategories && Array.isArray(item.historyCategories)) {
      return item.historyCategories;
    }
    if (item?.historyCategory) {
      return [item.historyCategory];
    }
    return ['world'];
  };
  
  const hasHistoryCategory = (item, category) => {
    const cats = getHistoryCategories(item);
    return cats.includes(category);
  };

  // 年代文字列を数値に変換（ソート用）
  const parseYear = (yearStr) => {
    if (!yearStr) return 0;
    const str = String(yearStr);
    // 紀元前またはBC形式に対応
    if (str.includes('紀元前') || str.toUpperCase().includes('BC')) {
      // ハイフン区切りの場合は最初の数値を使用
      const firstPart = str.split(/[-〜~]/)[0];
      const num = parseInt(firstPart.replace(/[^0-9]/g, '')) || 0;
      return -num;
    }
    if (str.includes('世紀')) {
      const match = str.match(/(\d+)/);
      if (match) {
        const century = parseInt(match[1]);
        return century * 100;
      }
    }
    // ハイフン区切りの場合は最初の数値を使用（1701-1722頃 → 1701）
    const firstPart = str.split(/[-〜~]/)[0];
    const num = parseInt(firstPart.replace(/[^0-9]/g, '')) || 0;
    return num;
  };

  // 年から世紀を計算
  const getCentury = (year) => {
    if (year === 0) return null;
    if (year > 0) {
      const century = Math.ceil(year / 100);
      return { century, label: `${century}世紀`, isBC: false };
    } else {
      const century = Math.ceil(Math.abs(year) / 100);
      return { century, label: `BC${century}世紀`, isBC: true };
    }
  };

  // 年号から大区分を自動判定
  const detectMainEra = (yearStr) => {
    const year = parseYear(yearStr);
    if (year <= 500) return 'ancient';
    if (year <= 1500) return 'medieval';
    if (year <= 1800) return 'early-modern';
    if (year <= 1945) return 'modern';
    return 'contemporary';
  };

  const sortedData = [...data].sort((a, b) => {
    const yearDiff = parseYear(a.year) - parseYear(b.year);
    if (yearDiff !== 0) return yearDiff;
    // 同じ年の場合はIDでソート（安定化）
    return (a.id || '').localeCompare(b.id || '');
  });

  // Firebase認証状態の監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        setAdminMode(true);
      }
    });
    return () => unsubscribe();
  }, []);

  // Firebaseからデータを取得
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const firebaseData = await fetchTimelineData();
        if (firebaseData.length > 0) {
          setData(firebaseData);
        } else {
          setData(sampleData);
        }
      } catch (error) {
        console.error('データ読み込みエラー:', error);
        setData(sampleData);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  // 単一タイプのスタイル
  const styleBase = { 
    movie: { b: 'border-blue-500', txt: 'text-blue-700', ic: Film, icc: 'text-blue-600', bg: 'bg-blue-50' }, 
    manga: { b: 'border-green-500', txt: 'text-green-700', ic: BookMarked, icc: 'text-green-600', bg: 'bg-green-50' }, 
    anime: { b: 'border-green-500', txt: 'text-green-700', ic: Tv, icc: 'text-green-600', bg: 'bg-green-50' },
    game: { b: 'border-yellow-500', txt: 'text-yellow-700', ic: Gamepad2, icc: 'text-yellow-600', bg: 'bg-yellow-50' }
  };
  
  // typeが配列または文字列に対応
  const getTypes = (t) => {
    if (!t) return ['movie'];
    if (Array.isArray(t)) return t;
    return [t];
  };
  
  const style = (t) => {
    const types = getTypes(t);
    // 最初のタイプでスタイルを決定（緑系は manga/anime 共通）
    const primary = types.includes('manga') || types.includes('anime') ? 'manga' : types[0];
    return styleBase[primary] || styleBase.movie;
  };
  
  const labelBase = { movie: '🎬 映画', manga: '📚 漫画', anime: '📺 アニメ', game: '🎮 ゲーム' };
  
  const label = (t) => {
    const types = getTypes(t);
    return types.map(type => labelBase[type] || '').filter(Boolean).join('・') || '';
  };
  
  // 複数カテゴリのアイコンを取得
  const getTypeIcons = (t) => {
    const types = getTypes(t);
    return types.map(type => {
      switch(type) {
        case 'movie': return { icon: Film, color: 'text-blue-600' };
        case 'manga': return { icon: BookMarked, color: 'text-green-600' };
        case 'anime': return { icon: Tv, color: 'text-green-600' };
        case 'game': return { icon: Gamepad2, color: 'text-yellow-600' };
        default: return { icon: Film, color: 'text-blue-600' };
      }
    });
  };
  
  const eventIcon = (eventType) => {
    switch(eventType) {
      case 'war': return { icon: Swords, label: '⚔️ 戦争・紛争' };
      case 'treaty': return { icon: ScrollText, label: '📜 条約・宣言・思想' };
      default: return { icon: MapPin, label: '📍 出来事' };
    }
  };
  
  const subEraIcon = (subEraType) => {
    // 全て統一カラー（時計アイコンと同じグレー系）
    return { icon: Clock, label: '🕐 時代区分', color: 'gray' };
  };
  
  // YouTube URLから動画IDを抽出
  const getYoutubeId = (url) => {
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
    setCf({ categories: ['movie'], historyCategories: ['world'], title: '', mainEra: 'modern', subEra: '', subEraYears: '', parentSubEra: '', year: '', periodRange: '', synopsis: '', thumbnail: '', youtubeUrls: [''], links: [{ service: '', url: '' }], topic: { title: '', url: '' } });
    setEditMode(false);
    setEditTarget(null);
  };

  const resetEventForm = () => {
    setEf({ eventType: 'other', historyCategories: ['world'], title: '', mainEra: 'modern', subEra: '', subEraYears: '', year: '', desc: '', detail: '', topic: { title: '', url: '' } });
    setEditMode(false);
    setEditTarget(null);
  };

  const resetSubEraForm = () => {
    setSf({ mainEra: 'modern', subEra: '', subEraType: 'normal', subEraYears: '', parentSubEra: '', historyCategories: ['world'], desc: '', detail: '' });
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
      mainEra: item.mainEra,
      subEra: item.subEra || '',
      subEraYears: item.subEraYears || '',
      parentSubEra: content.parentSubEra || '',
      year: item.year,
      periodRange: content.periodRange || (content.year ? String(content.year) : ''),
      synopsis: content.synopsis || '',
      thumbnail: content.thumbnail || '',
      youtubeUrls: urls,
      links: content.links?.length > 0 ? content.links : [{ service: '', url: '' }],
      topic: content.topic || { title: '', url: '' }
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

  // コンテンツ追加・更新（Firebase連携）
  const addC = async (e) => {
    e.preventDefault();
    if (cf.categories.length === 0) {
      alert('カテゴリを1つ以上選択してください');
      return;
    }
    setSaving(true);
    
    const nc = { 
      type: cf.categories.length === 1 ? cf.categories[0] : cf.categories, 
      historyCategories: cf.historyCategories || ['world'],
      title: cf.title, 
      periodRange: cf.periodRange || '',
      parentSubEra: cf.parentSubEra || '',
      synopsis: cf.synopsis || '', 
      thumbnail: cf.thumbnail || '',
      youtubeUrls: cf.youtubeUrls.filter(url => url.trim() !== ''),
      links: cf.links.filter(l => l.service && l.url), 
      topic: cf.topic.title && cf.topic.url ? cf.topic : null 
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
            const subEraData = data.find(x => x.mainEra === cf.mainEra && x.subEra === cf.subEra);
            const newData = { 
              mainEra: cf.mainEra, 
              subEra: cf.subEra || '', 
              subEraType: subEraData?.subEraType || item.subEraType || 'normal',
              subEraYears: cf.subEraYears || subEraData?.subEraYears || '', 
              year: cf.year, 
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
                mainEra: cf.mainEra,
                subEra: cf.subEra || '',
                subEraYears: cf.subEraYears || '',
                year: cf.year,
                content: updatedContent
              };
              await updateDoc(docRef, updateData);
              setData(p => p.map(i => i.id === editTarget.itemId ? { ...i, ...updateData } : i));
            } catch (updateError) {
              // ドキュメントが存在しない場合は新規作成
              if (updateError.code === 'not-found' || updateError.message.includes('No document to update')) {
                const subEraData = data.find(x => x.mainEra === cf.mainEra && x.subEra === cf.subEra);
                const newData = { 
                  mainEra: cf.mainEra, 
                  subEra: cf.subEra || '', 
                  subEraType: subEraData?.subEraType || 'normal',
                  subEraYears: cf.subEraYears || subEraData?.subEraYears || '', 
                  year: cf.year, 
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
        const existingItem = data.find(x => x.mainEra === cf.mainEra && x.subEra === cf.subEra && x.year === cf.year && !x.id?.startsWith('sample'));
        
        if (existingItem) {
          // 既存のFirebaseドキュメントにコンテンツを追加
          const updatedContent = [...(existingItem.content || []), nc];
          const docRef = doc(db, 'timeline', existingItem.id);
          await updateDoc(docRef, { content: updatedContent });
          setData(p => p.map(item => item.id === existingItem.id ? { ...item, content: updatedContent } : item));
        } else {
          // 新しいドキュメントを追加（時代区分から取得）
          const subEraData = data.find(x => x.mainEra === cf.mainEra && x.subEra === cf.subEra);
          const newData = { 
            mainEra: cf.mainEra, 
            subEra: cf.subEra || '', 
            subEraType: subEraData?.subEraType || 'normal',
            subEraYears: cf.subEraYears || subEraData?.subEraYears || '', 
            year: cf.year, 
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
        setCurrentUser(null);
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
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur z-50 shadow-md border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent cursor-pointer" onClick={() => setPage('timeline')}>CINEchrono TRAVEL</h1>
          {/* 歴史フィルター */}
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
          <button onClick={() => setMenu(!menu)} className="p-2 hover:bg-gray-100 rounded-lg"><Menu className="w-6 h-6" /></button>
        </div>
        {menu && <div className="bg-white border-t">{[['timeline', '年表と物語'], ['about', 'CINEchrono TRAVELとは'], ['articles', '記事一覧']].map(([p, n]) => <button key={p} onClick={() => { setPage(p); setMenu(false); }} className={`w-full text-left px-4 py-3 hover:bg-gray-50 ${page === p ? 'bg-purple-50 text-purple-700 font-semibold' : ''}`}>{n}</button>)}</div>}
      </header>

      {adminMode && (
        <button onClick={() => setAdmin(true)} className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-lg flex items-center justify-center z-40 hover:scale-110 transition-transform"><Settings className="w-6 h-6 text-white" /></button>
      )}

      <div className="pt-20">
        {page === 'timeline' && (
          <div className="px-4 py-8">
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">映画で旅する世界史の地図</h1>
            <p className="text-center text-gray-600 mb-12 text-sm">歴史的瞬間とその時代の作品をチェック</p>
            <div className="sticky top-20 bg-white/95 backdrop-blur z-40 py-3 mb-8 border-y">
              <div className="flex overflow-x-auto gap-2 px-2">
                {eras.map(e => <button key={e.id} onClick={() => scroll(e.id)} className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold ${activeEra === e.id ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{e.name}<div className="text-xs opacity-75">{e.year}</div></button>)}
              </div>
            </div>
            <div className="max-w-4xl mx-auto relative">
              <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 via-pink-500 to-purple-500"></div>
              {(() => {
                // 大区分をまたいで世紀を追跡
                let globalLastCentury = null;
                
                return eras.map(era => {
                // この時代のデータ
                const eraData = sortedData.filter(i => i.mainEra === era.id);
                
                // 歴史フィルター関数
                const passesFilter = (item) => {
                  if (historyFilter === 'all') return true;
                  return hasHistoryCategory(item, historyFilter);
                };
                
                // 時代区分ごとにグループ化（親子関係を考慮）
                const subEraGroups = {};
                const childSubEras = {}; // 親を持つ時代区分
                const childContents = {}; // 親時代区分を持つコンテンツ
                const noSubEraItems = [];
                
                // まず全ての時代区分を収集（フィルター適用）
                eraData.forEach(item => {
                  if (item.subEra && !subEraGroups[item.subEra] && passesFilter(item)) {
                    subEraGroups[item.subEra] = {
                      subEra: item.subEra,
                      subEraYears: item.subEraYears,
                      subEraDesc: item.subEraDesc,
                      subEraDetail: item.subEraDetail,
                      subEraType: item.subEraType,
                      historyCategories: getHistoryCategories(item),
                      parentSubEra: item.parentSubEra || '',
                      mainEra: item.mainEra,
                      startYear: parseYear(item.subEraYears?.split('-')[0] || item.year),
                      items: [],
                      childGroups: [], // 子となる時代区分グループ
                      childContents: [] // 子となるコンテンツ
                    };
                    // 親を持つものを記録
                    if (item.parentSubEra) {
                      childSubEras[item.subEra] = item.parentSubEra;
                    }
                  }
                });
                
                // アイテムを時代区分グループに追加（parentSubEraを持つコンテンツは別途処理、フィルター適用）
                eraData.forEach(item => {
                  // フィルターを通過したコンテンツとイベントのみ
                  const filteredContent = (item.content || []).filter(c => passesFilter(c));
                  const filteredEvents = (item.events || []).filter(ev => passesFilter(ev));
                  
                  const hasContent = filteredContent.length > 0;
                  const hasEvents = filteredEvents.length > 0;
                  
                  if (item.subEra && subEraGroups[item.subEra]) {
                    // コンテンツをチェックしてparentSubEraを持つものを分離
                    const normalContents = [];
                    const parentedContents = [];
                    
                    filteredContent.forEach((c, idx) => {
                      const originalIdx = (item.content || []).findIndex(oc => oc === c);
                      if (c.parentSubEra && subEraGroups[c.parentSubEra]) {
                        parentedContents.push({ content: c, idx: originalIdx, item, year: item.year });
                      } else {
                        normalContents.push({ ...c, _originalIdx: originalIdx });
                      }
                    });
                    
                    // parentSubEraを持つコンテンツを親グループのchildContentsに追加
                    parentedContents.forEach(pc => {
                      subEraGroups[pc.content.parentSubEra].childContents.push(pc);
                    });
                    
                    // 通常のコンテンツがあればグループに追加
                    if (normalContents.length > 0 || filteredEvents.length > 0) {
                      const modifiedItem = { ...item, content: normalContents, events: filteredEvents };
                      subEraGroups[item.subEra].items.push(modifiedItem);
                    }
                  } else if (!item.subEra) {
                    // 時代区分なしのアイテムでもparentSubEraを持つコンテンツを処理
                    const normalContents = [];
                    const parentedContents = [];
                    
                    filteredContent.forEach((c, idx) => {
                      const originalIdx = (item.content || []).findIndex(oc => oc === c);
                      if (c.parentSubEra && subEraGroups[c.parentSubEra]) {
                        parentedContents.push({ content: c, idx: originalIdx, item, year: item.year });
                      } else {
                        normalContents.push({ ...c, _originalIdx: originalIdx });
                      }
                    });
                    
                    parentedContents.forEach(pc => {
                      subEraGroups[pc.content.parentSubEra].childContents.push(pc);
                    });
                    
                    if (normalContents.length > 0 || filteredEvents.length > 0) {
                      const modifiedItem = { ...item, content: normalContents, events: filteredEvents };
                      noSubEraItems.push(modifiedItem);
                    }
                  }
                });
                
                // 時代区分グループ内のアイテムを年順にソート（安定化）
                Object.values(subEraGroups).forEach(group => {
                  group.items.sort((a, b) => {
                    const yearDiff = parseYear(a.year) - parseYear(b.year);
                    if (yearDiff !== 0) return yearDiff;
                    return (a.id || '').localeCompare(b.id || '');
                  });
                  group.childContents.sort((a, b) => {
                    const yearDiff = parseYear(a.year) - parseYear(b.year);
                    if (yearDiff !== 0) return yearDiff;
                    return (a.item?.id || '').localeCompare(b.item?.id || '');
                  });
                });
                
                // 子時代区分を親にマージ
                Object.entries(childSubEras).forEach(([childName, parentName]) => {
                  if (subEraGroups[parentName] && subEraGroups[childName]) {
                    subEraGroups[parentName].childGroups.push(subEraGroups[childName]);
                  }
                });
                
                // 親グループ内の子グループを年順にソート
                Object.values(subEraGroups).forEach(group => {
                  group.childGroups.sort((a, b) => a.startYear - b.startYear);
                });
                
                // タイムラインアイテムを構築（親を持たない時代区分グループ + 時代区分なし）
                const timelineItems = [];
                
                // 親を持たない時代区分グループを追加
                Object.values(subEraGroups).forEach(group => {
                  if (!childSubEras[group.subEra]) {
                    timelineItems.push({
                      type: 'subEraGroup',
                      ...group
                    });
                  }
                });
                
                // 時代区分なしのアイテムを追加
                noSubEraItems.forEach(item => {
                  const firstContent = item.content?.[0];
                  const sortYear = parseYear(firstContent?.periodRange?.split('-')[0] || item.year);
                  timelineItems.push({
                    type: 'item',
                    item: item,
                    year: sortYear
                  });
                });
                
                // 年代順にソート（安定化）
                timelineItems.sort((a, b) => {
                  const yearA = a.type === 'subEraGroup' ? a.startYear : a.year;
                  const yearB = b.type === 'subEraGroup' ? b.startYear : b.year;
                  if (yearA !== yearB) return yearA - yearB;
                  // 同じ年の場合は識別子でソート
                  const idA = a.type === 'subEraGroup' ? a.subEra : (a.item?.id || '');
                  const idB = b.type === 'subEraGroup' ? b.subEra : (b.item?.id || '');
                  return idA.localeCompare(idB);
                });
                
                // 紀元を跨ぐかチェック（古代のみ）
                const hasBCItems = era.id === 'ancient' && timelineItems.some(ti => {
                  const yr = ti.type === 'subEraGroup' ? ti.startYear : ti.year;
                  return yr < 0;
                });
                const hasADItems = era.id === 'ancient' && timelineItems.some(ti => {
                  const yr = ti.type === 'subEraGroup' ? ti.startYear : ti.year;
                  return yr > 0;
                });
                const showEraLine = hasBCItems && hasADItems;
                
                return (
                <div key={era.id} id={`era-${era.id}`} className="mb-16">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center font-bold text-lg shadow-lg z-10 text-white">{era.name}</div>
                    <div className="ml-4 text-gray-500 text-sm">{era.year}</div>
                  </div>
                  {timelineItems.map((ti, tiIdx) => {
                    // 紀元の区切り線を表示するかチェック
                    const currentYear = ti.type === 'subEraGroup' ? ti.startYear : ti.year;
                    const prevItem = tiIdx > 0 ? timelineItems[tiIdx - 1] : null;
                    const prevYear = prevItem ? (prevItem.type === 'subEraGroup' ? prevItem.startYear : prevItem.year) : null;
                    const showEraDivider = showEraLine && prevYear !== null && prevYear < 0 && currentYear > 0;
                    
                    // 世紀マーカーを表示するかチェック（大区分をまたいでも追跡）
                    const currentCentury = getCentury(currentYear);
                    const prevCentury = prevYear !== null ? getCentury(prevYear) : globalLastCentury;
                    const showCenturyMarker = currentCentury && (
                      !prevCentury || 
                      currentCentury.century !== prevCentury.century || 
                      currentCentury.isBC !== prevCentury.isBC
                    );
                    
                    // グローバル世紀を更新
                    if (currentCentury) {
                      globalLastCentury = currentCentury;
                    }
                    
                    // 世紀マーカーコンポーネント（紀元と同じ形式で薄紫）
                    const CenturyMarker = () => showCenturyMarker ? (
                      <div className="flex items-center ml-12 my-6">
                        <div className="flex-1 border-t-2 border-dashed border-purple-300"></div>
                        <div className="px-3 py-1 bg-purple-100 text-purple-600 font-bold text-sm rounded-full mx-3">{currentCentury.label}</div>
                        <div className="flex-1 border-t-2 border-dashed border-purple-300"></div>
                      </div>
                    ) : null;
                    
                    if (ti.type === 'subEraGroup') {
                      // 時代区分グループ（ヘッダー + 中のアイテム + 子グループ）
                      const seIcon = subEraIcon(ti.subEraType);
                      const SeIcon = seIcon.icon;
                      const colors = { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-800', subtext: 'text-gray-500', line: 'border-gray-400', iconColor: 'text-gray-600' };
                      return (
                        <React.Fragment key={`subEraGroup-${ti.subEra}-${tiIdx}`}>
                          {/* 紀元の区切り線 */}
                          {showEraDivider && (
                            <div className="flex items-center ml-20 my-8">
                              <div className="flex-1 border-t-2 border-dashed border-amber-400"></div>
                              <div className="px-4 py-1 bg-amber-100 text-amber-700 font-bold text-sm rounded-full mx-4">紀元</div>
                              <div className="flex-1 border-t-2 border-dashed border-amber-400"></div>
                            </div>
                          )}
                          {/* 世紀マーカー */}
                          <CenturyMarker />
                          <div className="mb-6">
                          {/* 時代区分ヘッダー */}
                          <div className="flex items-center ml-20 relative mb-4">
                            <div className={`absolute left-[-48px] top-5 w-12 border-t-2 border-dashed ${colors.line}`}></div>
                            <div 
                              className="flex items-center cursor-pointer group"
                              onClick={() => setSel({ 
                                type: 'subEra', 
                                title: ti.subEra, 
                                subEraYears: ti.subEraYears,
                                desc: ti.subEraDesc,
                                detail: ti.subEraDetail,
                                mainEra: ti.mainEra,
                                subEra: ti.subEra
                              })}
                            >
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md border-2 z-10 ${colors.bg} ${colors.border} group-hover:scale-110 transition-transform`}>
                                <SeIcon className={`w-5 h-5 ${colors.iconColor}`} />
                              </div>
                              <div className="ml-3">
                                <div className={`font-bold ${colors.text} group-hover:text-purple-600 transition-colors`}>{ti.subEra}</div>
                                <div className={`text-xs ${colors.subtext}`}>{ti.subEraYears}</div>
                              </div>
                            </div>
                          </div>
                          {/* 時代区分内のアイテム */}
                          {ti.items.map(item => (
                            <div key={item.id} className="ml-20 mb-4">
                              <div className="text-lg font-bold text-purple-600 mb-2">{item.year}</div>
                              {item.events?.map((ev, i) => {
                                const evStyle = eventIcon(ev.eventType);
                                const EvIcon = evStyle.icon;
                                return (
                                  <div key={i} onClick={() => { setVideoIndex(0); setSel({ ...ev, year: item.year, itemId: item.id, idx: i }); }} className="cursor-pointer p-4 mb-3 border-l-4 border-red-500 bg-red-50 rounded-r-lg hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-2 mb-1">
                                      <EvIcon className="w-4 h-4 text-red-600" />
                                      <span className="font-bold text-red-700">{ev.title}</span>
                                    </div>
                                    <div className="text-sm text-red-600">{ev.desc}</div>
                                  </div>
                                );
                              })}
                              {item.content?.map((c, i) => {
                                const s = style(c.type);
                                const icons = getTypeIcons(c.type);
                                const displayPeriod = c.periodRange || '';
                                return (
                                  <div key={i} onClick={() => { setVideoIndex(0); setSel({ ...c, year: item.year, itemId: item.id, idx: i }); }} className={`cursor-pointer pl-4 py-3 pr-2 mb-3 border-l-4 ${s.b} ${s.bg} rounded-r-lg hover:shadow-md transition-shadow flex items-center gap-3`}>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        {icons.map((ic, idx) => {
                                          const IconComp = ic.icon;
                                          return <IconComp key={idx} className={`w-4 h-4 ${ic.color}`} />;
                                        })}
                                        <span className={`font-bold ${s.txt}`}>{c.title}</span>
                                      </div>
                                      <div className="text-sm text-gray-600 mt-1">{label(c.type)}</div>
                                      <div className="text-sm text-gray-500 min-h-[1.25rem]">{displayPeriod}</div>
                                    </div>
                                    {c.thumbnail ? (
                                      <img src={c.thumbnail} alt="" className="w-16 h-16 object-cover rounded flex-shrink-0" onError={(e) => e.target.style.display='none'} />
                                    ) : (
                                      <div className="w-16 h-16 flex-shrink-0"></div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ))}
                          {/* 子時代区分グループ（終点となる条約など） */}
                          {ti.childGroups?.map((child, childIdx) => {
                            const childSeIcon = subEraIcon(child.subEraType);
                            const ChildSeIcon = childSeIcon.icon;
                            return (
                              <div key={`child-${child.subEra}-${childIdx}`}>
                                {/* 子時代区分ヘッダー */}
                                <div className="flex items-center ml-20 relative mb-4">
                                  <div className={`absolute left-[-48px] top-5 w-12 border-t-2 border-dashed ${colors.line}`}></div>
                                  <div 
                                    className="flex items-center cursor-pointer group"
                                    onClick={() => setSel({ 
                                      type: 'subEra', 
                                      title: child.subEra, 
                                      subEraYears: child.subEraYears,
                                      desc: child.subEraDesc,
                                      detail: child.subEraDetail,
                                      mainEra: child.mainEra,
                                      subEra: child.subEra
                                    })}
                                  >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md border-2 z-10 ${colors.bg} ${colors.border} group-hover:scale-110 transition-transform`}>
                                      <ChildSeIcon className={`w-5 h-5 ${colors.iconColor}`} />
                                    </div>
                                    <div className="ml-3">
                                      <div className={`font-bold ${colors.text} group-hover:text-purple-600 transition-colors`}>{child.subEra}</div>
                                      <div className={`text-xs ${colors.subtext}`}>{child.subEraYears}</div>
                                    </div>
                                  </div>
                                </div>
                                {/* 子時代区分内のアイテム */}
                                {child.items.map(item => (
                                  <div key={item.id} className="ml-20 mb-4">
                                    <div className="text-lg font-bold text-purple-600 mb-2">{item.year}</div>
                                    {item.events?.map((ev, i) => {
                                      const evStyle = eventIcon(ev.eventType);
                                      const EvIcon = evStyle.icon;
                                      return (
                                        <div key={i} onClick={() => { setVideoIndex(0); setSel({ ...ev, year: item.year, itemId: item.id, idx: i }); }} className="cursor-pointer p-4 mb-3 border-l-4 border-red-500 bg-red-50 rounded-r-lg hover:shadow-md transition-shadow">
                                          <div className="flex items-center gap-2 mb-1">
                                            <EvIcon className="w-4 h-4 text-red-600" />
                                            <span className="font-bold text-red-700">{ev.title}</span>
                                          </div>
                                          <div className="text-sm text-red-600">{ev.desc}</div>
                                        </div>
                                      );
                                    })}
                                    {item.content?.map((c, i) => {
                                      const s = style(c.type);
                                      const icons = getTypeIcons(c.type);
                                      const displayPeriod = c.periodRange || '';
                                      return (
                                        <div key={i} onClick={() => { setVideoIndex(0); setSel({ ...c, year: item.year, itemId: item.id, idx: i }); }} className={`cursor-pointer pl-4 py-3 pr-2 mb-3 border-l-4 ${s.b} ${s.bg} rounded-r-lg hover:shadow-md transition-shadow flex items-center gap-3`}>
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                              {icons.map((ic, idx) => {
                                                const IconComp = ic.icon;
                                                return <IconComp key={idx} className={`w-4 h-4 ${ic.color}`} />;
                                              })}
                                              <span className={`font-bold ${s.txt}`}>{c.title}</span>
                                            </div>
                                            <div className="text-sm text-gray-600 mt-1">{label(c.type)}</div>
                                            <div className="text-sm text-gray-500 min-h-[1.25rem]">{displayPeriod}</div>
                                          </div>
                                          {c.thumbnail ? (
                                            <img src={c.thumbnail} alt="" className="w-16 h-16 object-cover rounded flex-shrink-0" onError={(e) => e.target.style.display='none'} />
                                          ) : (
                                            <div className="w-16 h-16 flex-shrink-0"></div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                ))}
                              </div>
                            );
                          })}
                          {/* 親時代区分を持つコンテンツ */}
                          {ti.childContents?.map((pc, pcIdx) => {
                            const s = style(pc.content.type);
                            const icons = getTypeIcons(pc.content.type);
                            const displayPeriod = pc.content.periodRange || '';
                            return (
                              <div key={`pc-${pcIdx}`} className="ml-20 mb-4">
                                <div className="text-lg font-bold text-purple-600 mb-2">{pc.year}</div>
                                <div onClick={() => { setVideoIndex(0); setSel({ ...pc.content, year: pc.year, itemId: pc.item.id, idx: pc.idx }); }} className={`cursor-pointer pl-4 py-3 pr-2 mb-3 border-l-4 ${s.b} ${s.bg} rounded-r-lg hover:shadow-md transition-shadow flex items-center gap-3`}>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      {icons.map((ic, idx) => {
                                        const IconComp = ic.icon;
                                        return <IconComp key={idx} className={`w-4 h-4 ${ic.color}`} />;
                                      })}
                                      <span className={`font-bold ${s.txt}`}>{pc.content.title}</span>
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">{label(pc.content.type)}</div>
                                    <div className="text-sm text-gray-500 min-h-[1.25rem]">{displayPeriod}</div>
                                  </div>
                                  {pc.content.thumbnail ? (
                                    <img src={pc.content.thumbnail} alt="" className="w-16 h-16 object-cover rounded flex-shrink-0" onError={(e) => e.target.style.display='none'} />
                                  ) : (
                                    <div className="w-16 h-16 flex-shrink-0"></div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        </React.Fragment>
                      );
                    } else {
                      // 時代区分なしの単独アイテム
                      const item = ti.item;
                      return (
                        <React.Fragment key={item.id}>
                          {/* 紀元の区切り線 */}
                          {showEraDivider && (
                            <div className="flex items-center ml-20 my-8">
                              <div className="flex-1 border-t-2 border-dashed border-amber-400"></div>
                              <div className="px-4 py-1 bg-amber-100 text-amber-700 font-bold text-sm rounded-full mx-4">紀元</div>
                              <div className="flex-1 border-t-2 border-dashed border-amber-400"></div>
                            </div>
                          )}
                          {/* 世紀マーカー */}
                          <CenturyMarker />
                          <div className="ml-20 mb-6">
                          <div className="text-lg font-bold text-purple-600 mb-2">{item.year}</div>
                          {item.events?.map((ev, i) => {
                            const evStyle = eventIcon(ev.eventType);
                            const EvIcon = evStyle.icon;
                            return (
                              <div key={i} onClick={() => { setVideoIndex(0); setSel({ ...ev, year: item.year, itemId: item.id, idx: i }); }} className="cursor-pointer p-4 mb-3 border-l-4 border-red-500 bg-red-50 rounded-r-lg hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-2 mb-1">
                                  <EvIcon className="w-4 h-4 text-red-600" />
                                  <span className="font-bold text-red-700">{ev.title}</span>
                                </div>
                                <div className="text-sm text-red-600">{ev.desc}</div>
                              </div>
                            );
                          })}
                          {item.content?.map((c, i) => {
                            const s = style(c.type);
                            const icons = getTypeIcons(c.type);
                            const displayPeriod = c.periodRange || '';
                            return (
                              <div key={i} onClick={() => { setVideoIndex(0); setSel({ ...c, year: item.year, itemId: item.id, idx: i }); }} className={`cursor-pointer pl-4 py-3 pr-2 mb-3 border-l-4 ${s.b} ${s.bg} rounded-r-lg hover:shadow-md transition-shadow flex items-center gap-3`}>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    {icons.map((ic, idx) => {
                                      const IconComp = ic.icon;
                                      return <IconComp key={idx} className={`w-4 h-4 ${ic.color}`} />;
                                    })}
                                    <span className={`font-bold ${s.txt}`}>{c.title}</span>
                                  </div>
                                  <div className="text-sm text-gray-600 mt-1">{label(c.type)}</div>
                                  <div className="text-sm text-gray-500 min-h-[1.25rem]">{displayPeriod}</div>
                                </div>
                                {c.thumbnail ? (
                                  <img src={c.thumbnail} alt="" className="w-16 h-16 object-cover rounded flex-shrink-0" onError={(e) => e.target.style.display='none'} />
                                ) : (
                                  <div className="w-16 h-16 flex-shrink-0"></div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        </React.Fragment>
                      );
                    }
                  })}
                </div>
              );})})()}
            </div>
          </div>
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
        <p>「カエサルって、いつの時代の人だっけ？」</p>
        <p>「産業革命とフランス革命、どっちが先？」</p>
        <p>中学・高校・大学で歴史を勉強していた頃、年号と出来事の暗記に苦労しました。教科書を読んでも、その時代がどんな世界だったのか、なかなかイメージが湧かない。</p>
        <p>でも、映画を観ると違いました。『グラディエーター』を観ればローマ帝国の壮大さが伝わり、『レ・ミゼラブル』を観ればフランス革命後の混乱が肌で感じられる。</p>
        <p className="font-semibold text-purple-700">「あの頃の自分に、こんなサイトがあったら良かったのに」</p>
        <p>そんな想いから、CINEchrono TRAVELは生まれました。</p>
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
          <div className="flex text-xs relative h-8">
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
        <p className="text-amber-700 text-sm mt-2">🎬 代表作品：グラディエーター、ベン・ハー、300〈スリーハンドレッド〉</p>
      </div>

      <div className="bg-emerald-50 rounded-lg p-6 border border-emerald-200">
        <div className="flex items-center gap-3 mb-3">
          <span className="px-3 py-1 bg-emerald-500 text-white rounded-full text-sm font-bold">中世</span>
          <span className="text-gray-500 text-sm">501-1500年</span>
        </div>
        <p className="text-gray-700">封建制を基盤とした時代。西ローマ帝国滅亡後から大航海時代の始まりまで、約1000年間続きました。騎士、城、キリスト教会が社会の中心でした。</p>
        <p className="text-emerald-700 text-sm mt-2">🎬 代表作品：ブレイブハート、キングダム・オブ・ヘブン、ジャンヌ・ダルク</p>
      </div>

      <div className="bg-cyan-50 rounded-lg p-6 border border-cyan-200">
        <div className="flex items-center gap-3 mb-3">
          <span className="px-3 py-1 bg-cyan-500 text-white rounded-full text-sm font-bold">近世</span>
          <span className="text-gray-500 text-sm">1501-1800年</span>
        </div>
        <p className="text-gray-700">中世から近代への移行期。大航海時代の幕開け（1492年）からフランス革命前まで。ルネサンス、宗教改革、絶対王政の時代です。</p>
        <p className="text-cyan-700 text-sm mt-2">🎬 代表作品：エリザベス、アマデウス、パイレーツ・オブ・カリビアン</p>
      </div>

      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center gap-3 mb-3">
          <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-bold">近代</span>
          <span className="text-gray-500 text-sm">1801-1945年</span>
        </div>
        <p className="text-gray-700">産業革命・フランス革命から第二次世界大戦終結まで。資本主義が発達し、国民国家が確立された激動の時代。二度の世界大戦を経験しました。</p>
        <p className="text-blue-700 text-sm mt-2">🎬 代表作品：レ・ミゼラブル、1917、シンドラーのリスト</p>
      </div>

      <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
        <div className="flex items-center gap-3 mb-3">
          <span className="px-3 py-1 bg-purple-500 text-white rounded-full text-sm font-bold">現代</span>
          <span className="text-gray-500 text-sm">1945年〜</span>
        </div>
        <p className="text-gray-700">第二次世界大戦後から現在まで。冷戦、グローバル化、デジタル革命を経て、私たちが生きる「今」へと続きます。</p>
        <p className="text-purple-700 text-sm mt-2">🎬 代表作品：グッドナイト&グッドラック、ペンタゴン・ペーパーズ、ゼロ・ダーク・サーティ</p>
      </div>
    </div>

    {/* 締めのメッセージ */}
    <div className="mt-12 text-center">
      <p className="text-gray-600 mb-4">さあ、年表を開いて、時代の旅に出かけましょう。</p>
      <button onClick={() => setPage('timeline')} className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-bold hover:from-purple-700 hover:to-pink-700 shadow-lg transition-all">
        🎬 年表を見る
      </button>
    </div>
  </div>
)}

        {page === 'articles' && (
          <div className="max-w-4xl mx-auto px-4 py-16">
            <h1 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">記事一覧</h1>
            <div className="bg-gray-50 rounded-lg p-6 border">
              <iframe src="https://note.com/cinechrono/embed" className="w-full h-screen border-0 rounded-lg" title="Note記事"></iframe>
            </div>
          </div>
        )}
      </div>

      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-6">
              <a href="https://twitter.com/cinechrono" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://note.com/cinechrono" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors font-bold">note</a>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleAdminModeToggle} className={`p-2 rounded-lg transition-colors ${adminMode ? 'bg-pink-600 hover:bg-pink-700' : 'hover:bg-gray-800'}`} title={adminMode ? "ログアウト" : "管理者ログイン"}>
                {adminMode ? <LogOut className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
              </button>
              <p className="text-sm text-gray-400">© 2024 CINEchrono TRAVEL</p>
            </div>
          </div>
        </div>
      </footer>

      {sel && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white p-4 flex justify-between items-center border-b">
              <h2 className="text-xl font-bold">{sel.type === 'history' ? eventIcon(sel.eventType).label : sel.type === 'subEra' ? '🕐 時代区分' : label(sel.type)}</h2>
              <div className="flex items-center gap-2">
                {adminMode && (
                  <button 
                    onClick={editFromModal} 
                    className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-bold hover:from-purple-700 hover:to-pink-700 flex items-center gap-1"
                  >
                    <Pencil className="w-4 h-4" />
                    編集
                  </button>
                )}
                <button onClick={() => setSel(null)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"><X className="w-5 h-5" /></button>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{sel.title}</h3>
              {sel.type === 'subEra' ? (
                <>
                  {sel.subEraYears && <div className="mb-4"><div className="text-sm text-gray-500 mb-1">期間</div><div className="text-lg font-semibold">{sel.subEraYears}</div></div>}
                  {sel.desc && <div className="mb-4"><div className="text-sm text-gray-500 mb-2">概要</div><p className="text-gray-700 whitespace-pre-wrap">{sel.desc}</p></div>}
                  {sel.detail && <div className="mb-4 pt-4 border-t"><div className="text-sm text-gray-500 mb-2">詳細</div><p className="text-gray-700 whitespace-pre-wrap">{sel.detail}</p></div>}
                  {!sel.desc && !sel.detail && (
                    <p className="text-gray-500 text-center py-8">詳細情報はまだ登録されていません</p>
                  )}
                </>
              ) : sel.type !== 'history' ? (
                <>
                  <div className="mb-4">
                    <div className="text-sm text-gray-500 mb-1">主な時代</div>
                    <div className="text-lg font-semibold text-purple-600">{sel.year}</div>
                    {sel.periodRange && (
                      <div className="text-sm text-gray-600 mt-1">大体の時期: {sel.periodRange}</div>
                    )}
                  </div>
                  {(() => {
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
                  })()}
                  {/* YouTube動画がない場合にサムネイル画像を表示 */}
                  {sel.thumbnail && !(sel.youtubeUrls?.length > 0 || sel.youtubeUrl) && (
                    <div className="mb-4">
                      <img src={sel.thumbnail} alt={sel.title} className="w-full max-w-xs mx-auto rounded-lg shadow-md" onError={(e) => e.target.style.display='none'} />
                    </div>
                  )}
                  {sel.synopsis && <div className="mb-4"><div className="text-sm text-gray-500 mb-2">あらすじ</div><p className="text-gray-700">{sel.synopsis}</p></div>}
                  {sel.links?.length > 0 && <div className="space-y-2 mt-6">{sel.links.map((l, i) => <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" className="block w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-center font-bold">{l.service}で見る</a>)}</div>}
                  {sel.topic && (
                    <div className="mt-6 pt-6 border-t">
                      <div className="text-sm text-gray-500 mb-2">📖 関連記事</div>
                      <a href={sel.topic.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100">
                        <span className="font-semibold text-purple-700">{sel.topic.title}</span>
                        <ExternalLink className="w-5 h-5 text-purple-600" />
                      </a>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="mb-4"><div className="text-sm text-gray-500 mb-1">年代</div><div className="text-lg font-semibold">{sel.year}</div></div>
                  {sel.desc && <div className="mb-4"><div className="text-sm text-gray-500 mb-2">概要</div><p className="text-gray-700">{sel.desc}</p></div>}
                  {sel.detail && <div className="mb-4 pt-4 border-t"><div className="text-sm text-gray-500 mb-2">詳細</div><p className="text-gray-700">{sel.detail}</p></div>}
                  {sel.topic && (
                    <div className="mt-6 pt-6 border-t">
                      <div className="text-sm text-gray-500 mb-2">📖 関連記事</div>
                      <a href={sel.topic.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100">
                        <span className="font-semibold text-purple-700">{sel.topic.title}</span>
                        <ExternalLink className="w-5 h-5 text-purple-600" />
                      </a>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {admin && (
        <div className="fixed inset-0 bg-black/80 z-50 overflow-y-auto">
          <div className="min-h-screen p-4 py-8">
            <div className="max-w-3xl mx-auto bg-white rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">✏️ 管理画面</h2>
                <button onClick={() => { setAdmin(false); resetContentForm(); resetEventForm(); }} className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"><X className="w-6 h-6" /></button>
              </div>
              <div className="flex gap-2 mb-6">
                {[['content', '🎬 作品'], ['event', '📚 イベント'], ['subEra', '🏛️ 時代区分']].map(([t, l]) => <button key={t} onClick={() => { setTab(t); if (t === 'content') { resetEventForm(); resetSubEraForm(); } else if (t === 'event') { resetContentForm(); resetSubEraForm(); } else { resetContentForm(); resetEventForm(); } }} className={`flex-1 py-3 rounded-lg font-bold ${tab === t ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{l}</button>)}
              </div>
              {tab === 'content' && (
                <form ref={contentFormRef} onSubmit={addC} className="bg-gray-50 rounded-lg p-6 border space-y-4">
                  {editMode && editTarget?.type === 'content' && (
                    <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400 rounded-lg p-4 mb-4 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <Pencil className="w-5 h-5 text-yellow-700" />
                        <p className="text-yellow-800 font-bold text-lg">編集モード</p>
                      </div>
                      <p className="text-yellow-700 text-sm mb-2">「{cf.title}」を編集中です。内容を変更して「更新」ボタンを押してください。</p>
                      <button type="button" onClick={resetContentForm} className="text-sm text-yellow-700 hover:text-yellow-900 underline font-semibold">✕ キャンセルして新規追加に戻る</button>
                    </div>
                  )}
                  <div className="bg-white border rounded-lg p-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">カテゴリ（複数選択可）</label>
                    <div className="flex flex-wrap gap-4">
                      {[
                        { id: 'movie', label: '🎬 映画', color: 'blue' },
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
                  <input list="s1" value={cf.subEra} onChange={e => setCf(p => ({ ...p, subEra: e.target.value }))} placeholder="時代区分（例: ローマ帝国）※任意" className="w-full px-4 py-3 bg-white border rounded-lg" />
                  <datalist id="s1">{[...new Set(sortedData.filter(i => i.subEra).map(i => i.subEra))].map((s, i) => <option key={i} value={s} />)}</datalist>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">🔗 親となる時代区分（任意）</label>
                    <select 
                      value={cf.parentSubEra} 
                      onChange={e => setCf(p => ({ ...p, parentSubEra: e.target.value }))} 
                      className="w-full px-4 py-3 bg-white border rounded-lg"
                    >
                      <option value="">なし</option>
                      {[...new Set(sortedData.filter(i => i.subEra && i.subEra !== cf.subEra).map(i => i.subEra))].map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500">例：ポーツマス条約関連の作品を「日露戦争」グループ内に表示したい場合に選択</p>
                  </div>
                  <input value={cf.title} onChange={e => setCf(p => ({ ...p, title: e.target.value }))} placeholder="タイトル ※必須" className="w-full px-4 py-3 bg-white border rounded-lg" required />
                  <div className="space-y-2">
                    <input value={cf.year} onChange={e => setCf(p => ({ ...p, year: e.target.value, mainEra: detectMainEra(e.target.value) }))} placeholder="主な時代（例: 1907）※必須・ソート基準" className="w-full px-4 py-3 bg-white border rounded-lg border-purple-300" required />
                    <p className="text-xs text-purple-600">↑ 紫色で表示され、年表の並び順に使用されます（大区分は自動判定）</p>
                  </div>
                  <div className="space-y-2">
                    <input value={cf.periodRange} onChange={e => setCf(p => ({ ...p, periodRange: e.target.value }))} placeholder="大体の時期（例: 1904-1907）※任意" className="w-full px-4 py-3 bg-white border rounded-lg" />
                    <p className="text-xs text-gray-500">↑ 回想シーン等も含めた期間を入力（黒字で表示）</p>
                  </div>
                  <textarea value={cf.synopsis} onChange={e => setCf(p => ({ ...p, synopsis: e.target.value }))} placeholder="あらすじ ※任意" className="w-full px-4 py-3 bg-white border rounded-lg h-24" />
                  <div className="space-y-2">
                    <input value={cf.thumbnail} onChange={e => setCf(p => ({ ...p, thumbnail: e.target.value }))} placeholder="サムネイル画像URL ※任意" className="w-full px-4 py-3 bg-white border rounded-lg" />
                    <p className="text-xs text-gray-500">↑ Google検索で画像を右クリック →「画像アドレスをコピー」で取得</p>
                    {cf.thumbnail && (
                      <div className="flex items-center gap-2">
                        <img src={cf.thumbnail} alt="プレビュー" className="w-16 h-16 object-cover rounded border" onError={(e) => e.target.style.display='none'} />
                        <span className="text-xs text-green-600">✓ プレビュー</span>
                      </div>
                    )}
                  </div>
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
                    <button type="button" onClick={() => setCf(p => ({ ...p, youtubeUrls: [...p.youtubeUrls, ''] }))} className="text-purple-600 text-sm font-semibold">+ 動画を追加</button>
                    <p className="text-xs text-gray-500 mt-1">予告編や名シーンなど、複数の動画を登録できます</p>
                  </div>
                  {cf.links.map((l, i) => <div key={i} className="flex gap-2"><input value={l.service} onChange={e => { const nl = [...cf.links]; nl[i].service = e.target.value; setCf(p => ({ ...p, links: nl })); }} placeholder="サービス名 ※任意" className="flex-1 px-4 py-2 bg-white border rounded-lg" /><input value={l.url} onChange={e => { const nl = [...cf.links]; nl[i].url = e.target.value; setCf(p => ({ ...p, links: nl })); }} placeholder="URL" className="flex-1 px-4 py-2 bg-white border rounded-lg" /></div>)}
                  <button type="button" onClick={() => setCf(p => ({ ...p, links: [...p.links, { service: '', url: '' }] }))} className="text-purple-600 text-sm font-semibold">+ リンクを追加</button>
                  <div className="pt-4 border-t">
                    <label className="block font-semibold mb-2">📖 トピック記事（任意）</label>
                    <input value={cf.topic.title} onChange={e => setCf(p => ({ ...p, topic: { ...p.topic, title: e.target.value }}))} placeholder="記事タイトル" className="w-full px-4 py-2 bg-white border rounded-lg mb-2" />
                    <input value={cf.topic.url} onChange={e => setCf(p => ({ ...p, topic: { ...p.topic, url: e.target.value }}))} placeholder="記事URL" className="w-full px-4 py-2 bg-white border rounded-lg" />
                  </div>
                  <button type="submit" disabled={saving} className={`w-full py-3 ${editMode ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600' : 'bg-gradient-to-r from-purple-600 to-pink-600'} text-white rounded-lg font-bold disabled:opacity-50 flex items-center justify-center gap-2`}>
                    {saving && <Loader2 className="w-5 h-5 animate-spin" />}
                    {editMode ? '✓ 更新する' : '追加'}
                  </button>

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
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {(() => {
                        // コンテンツを抽出
                        const allContent = sortedData.flatMap(item => 
                          item.content.map((c, idx) => ({ item, content: c, idx }))
                        );
                        // フィルター適用
                        const filtered = adminContentFilter === 'all' 
                          ? allContent 
                          : allContent.filter(({ content: c }) => hasHistoryCategory(c, adminContentFilter));
                        // 並び替え
                        const sorted = [...filtered].sort((a, b) => {
                          if (contentSort === 'year') {
                            return parseYear(a.item.year) - parseYear(b.item.year);
                          } else if (contentSort === 'title') {
                            return (a.content.title || '').localeCompare(b.content.title || '', 'ja');
                          } else {
                            // 登録日順（idが新しいものが上）
                            return (b.item.id || '').localeCompare(a.item.id || '');
                          }
                        });
                        return sorted.map(({ item, content: c, idx }) => {
                          const displayPeriod = c.periodRange || (c.year ? `${c.year}年頃` : '');
                          const cats = getHistoryCategories(c);
                          return (
                            <div key={`${item.id}-c-${idx}`} className={`flex items-center justify-between p-3 bg-white border rounded-lg ${editMode && editTarget?.itemId === item.id && editTarget?.idx === idx && editTarget?.type === 'content' ? 'ring-2 ring-yellow-400 bg-yellow-50' : ''}`}>
                              <div className="flex-1">
                                <div className="font-semibold flex items-center gap-2">
                                  {c.title}
                                  {cats.includes('japan') && <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">🇯🇵</span>}
                                  {cats.includes('world') && cats.includes('japan') && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">🌐</span>}
                                  {c.parentSubEra && (
                                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">→ {c.parentSubEra}</span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-500">{label(c.type)} • <span className="text-purple-600">{item.year}</span>{displayPeriod && ` • ${displayPeriod}`}</div>
                              </div>
                              <div className="flex gap-1">
                                <button type="button" onClick={() => startEditContent(item.id, idx)} disabled={saving} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50" title="編集">
                                  <Pencil className="w-5 h-5" />
                                </button>
                                <button type="button" onClick={() => deleteContent(item.id, 'content', idx)} disabled={saving} className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50" title="削除">
                                  <X className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </form>
              )}
              {tab === 'event' && (
                <form ref={eventFormRef} onSubmit={addE} className="bg-gray-50 rounded-lg p-6 border space-y-4">
                  {editMode && editTarget?.type === 'event' && (
                    <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400 rounded-lg p-4 mb-4 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <Pencil className="w-5 h-5 text-yellow-700" />
                        <p className="text-yellow-800 font-bold text-lg">編集モード</p>
                      </div>
                      <p className="text-yellow-700 text-sm mb-2">「{ef.title}」を編集中です。内容を変更して「更新」ボタンを押してください。</p>
                      <button type="button" onClick={resetEventForm} className="text-sm text-yellow-700 hover:text-yellow-900 underline font-semibold">✕ キャンセルして新規追加に戻る</button>
                    </div>
                  )}
                  <select value={ef.eventType} onChange={e => setEf(p => ({ ...p, eventType: e.target.value }))} className="w-full px-4 py-3 bg-white border rounded-lg" required>
                    <option value="other">📍 出来事（暗殺、革命など）</option>
                    <option value="war">⚔️ 戦争・紛争</option>
                    <option value="treaty">📜 条約・宣言・思想</option>
                  </select>
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
                            checked={ef.historyCategories?.includes(cat.id)}
                            onChange={() => setEf(p => {
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
                  <input list="s2" value={ef.subEra} onChange={e => setEf(p => ({ ...p, subEra: e.target.value }))} placeholder="時代区分（例: ローマ帝国）※任意" className="w-full px-4 py-3 bg-white border rounded-lg" />
                  <datalist id="s2">{[...new Set(sortedData.filter(i => i.subEra).map(i => i.subEra))].map((s, i) => <option key={i} value={s} />)}</datalist>
                  <input value={ef.title} onChange={e => setEf(p => ({ ...p, title: e.target.value }))} placeholder="イベント名 ※必須" className="w-full px-4 py-3 bg-white border rounded-lg" required />
                  <div className="space-y-2">
                    <input value={ef.year} onChange={e => setEf(p => ({ ...p, year: e.target.value, mainEra: detectMainEra(e.target.value) }))} placeholder="年代（例: 紀元前44年）※必須" className="w-full px-4 py-3 bg-white border rounded-lg border-purple-300" required />
                    <p className="text-xs text-purple-600">↑ 大区分は自動判定されます</p>
                  </div>
                  <textarea value={ef.desc} onChange={e => setEf(p => ({ ...p, desc: e.target.value }))} placeholder="概要 ※任意" className="w-full px-4 py-3 bg-white border rounded-lg h-20" />
                  <textarea value={ef.detail} onChange={e => setEf(p => ({ ...p, detail: e.target.value }))} placeholder="詳細 ※任意" className="w-full px-4 py-3 bg-white border rounded-lg h-32" />
                  <div className="pt-4 border-t">
                    <label className="block font-semibold mb-2">📖 トピック記事（任意）</label>
                    <input value={ef.topic.title} onChange={e => setEf(p => ({ ...p, topic: { ...p.topic, title: e.target.value }}))} placeholder="記事タイトル" className="w-full px-4 py-2 bg-white border rounded-lg mb-2" />
                    <input value={ef.topic.url} onChange={e => setEf(p => ({ ...p, topic: { ...p.topic, url: e.target.value }}))} placeholder="記事URL" className="w-full px-4 py-2 bg-white border rounded-lg" />
                  </div>
                  <button type="submit" disabled={saving} className={`w-full py-3 ${editMode ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600' : 'bg-gradient-to-r from-purple-600 to-pink-600'} text-white rounded-lg font-bold disabled:opacity-50 flex items-center justify-center gap-2`}>
                    {saving && <Loader2 className="w-5 h-5 animate-spin" />}
                    {editMode ? '✓ 更新する' : '追加'}
                  </button>

                  <div className="mt-8 pt-8 border-t">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold">📋 登録済みイベント</h3>
                      <div className="flex gap-1 flex-wrap">
                        <button type="button" onClick={() => setAdminEventFilter('all')} className={`px-3 py-1 text-xs rounded-full ${adminEventFilter === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>すべて</button>
                        <button type="button" onClick={() => setAdminEventFilter('japan')} className={`px-3 py-1 text-xs rounded-full ${adminEventFilter === 'japan' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>🇯🇵日本史</button>
                        <button type="button" onClick={() => setAdminEventFilter('world')} className={`px-3 py-1 text-xs rounded-full ${adminEventFilter === 'world' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>🌐世界史</button>
                        <span className="border-l mx-1"></span>
                        <button type="button" onClick={() => setEventSort('year')} className={`px-3 py-1 text-xs rounded-full ${eventSort === 'year' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>年代順</button>
                        <button type="button" onClick={() => setEventSort('title')} className={`px-3 py-1 text-xs rounded-full ${eventSort === 'title' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>五十音順</button>
                        <button type="button" onClick={() => setEventSort('created')} className={`px-3 py-1 text-xs rounded-full ${eventSort === 'created' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>登録日順</button>
                      </div>
                    </div>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {(() => {
                        const allEvents = sortedData.flatMap(item => 
                          item.events.map((ev, idx) => ({ item, event: ev, idx }))
                        );
                        // フィルター適用
                        const filtered = adminEventFilter === 'all' 
                          ? allEvents 
                          : allEvents.filter(({ event: ev }) => hasHistoryCategory(ev, adminEventFilter));
                        const sorted = [...filtered].sort((a, b) => {
                          if (eventSort === 'year') {
                            return parseYear(a.item.year) - parseYear(b.item.year);
                          } else if (eventSort === 'title') {
                            return (a.event.title || '').localeCompare(b.event.title || '', 'ja');
                          } else {
                            return (b.item.id || '').localeCompare(a.item.id || '');
                          }
                        });
                        return sorted.map(({ item, event: ev, idx }) => {
                          const evStyle = eventIcon(ev.eventType);
                          const cats = getHistoryCategories(ev);
                          return (
                            <div key={`${item.id}-e-${idx}`} className={`flex items-center justify-between p-3 bg-white border rounded-lg ${editMode && editTarget?.itemId === item.id && editTarget?.idx === idx && editTarget?.type === 'event' ? 'ring-2 ring-yellow-400 bg-yellow-50' : ''}`}>
                              <div className="flex-1">
                                <div className="font-semibold flex items-center gap-2">
                                  <evStyle.icon className="w-4 h-4 text-red-600" />
                                  {ev.title}
                                  {cats.includes('japan') && <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">🇯🇵</span>}
                                  {cats.includes('world') && cats.includes('japan') && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">🌐</span>}
                                </div>
                                <div className="text-sm text-gray-500">{evStyle.label} • {item.year}</div>
                              </div>
                              <div className="flex gap-1">
                                <button type="button" onClick={() => startEditEvent(item.id, idx)} disabled={saving} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50" title="編集">
                                  <Pencil className="w-5 h-5" />
                                </button>
                                <button type="button" onClick={() => deleteContent(item.id, 'event', idx)} disabled={saving} className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50" title="削除">
                                  <X className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </form>
              )}
              {tab === 'subEra' && (
                <form onSubmit={addSubEra} className="bg-gray-50 rounded-lg p-6 border space-y-4">
                  {editMode && editTarget?.type === 'subEra' && (
                    <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400 rounded-lg p-4 mb-4 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <Pencil className="w-5 h-5 text-yellow-700" />
                        <p className="text-yellow-800 font-bold text-lg">編集モード</p>
                      </div>
                      <p className="text-yellow-700 text-sm mb-2">「{sf.subEra}」を編集中です。内容を変更して「更新」ボタンを押してください。</p>
                      <button type="button" onClick={resetSubEraForm} className="text-sm text-yellow-700 hover:text-yellow-900 underline font-semibold">✕ キャンセルして新規追加に戻る</button>
                    </div>
                  )}
                  <input 
                    value={sf.subEra} 
                    onChange={e => setSf(p => ({ ...p, subEra: e.target.value }))} 
                    placeholder="時代区分名（例: 第二次世界大戦）※必須" 
                    className="w-full px-4 py-3 bg-white border rounded-lg" 
                    required 
                  />
                  <div className="space-y-2">
                    <input 
                      value={sf.subEraYears} 
                      onChange={e => setSf(p => ({ ...p, subEraYears: e.target.value, mainEra: detectMainEra(e.target.value.split('-')[0] || e.target.value) }))} 
                      placeholder="期間（例: 1939-1945）※必須・大区分判定に使用" 
                      className="w-full px-4 py-3 bg-white border rounded-lg border-purple-300" 
                      required
                    />
                    <p className="text-xs text-purple-600">↑ 期間の開始年から大区分が自動判定されます</p>
                  </div>
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
                  <textarea 
                    value={sf.desc} 
                    onChange={e => setSf(p => ({ ...p, desc: e.target.value }))} 
                    placeholder="概要（クリック時に表示）※任意" 
                    className="w-full px-4 py-3 bg-white border rounded-lg h-20" 
                  />
                  <textarea 
                    value={sf.detail} 
                    onChange={e => setSf(p => ({ ...p, detail: e.target.value }))} 
                    placeholder="詳細（クリック時に表示）※任意" 
                    className="w-full px-4 py-3 bg-white border rounded-lg h-32" 
                  />
                  <button type="submit" disabled={saving} className={`w-full py-3 ${editMode ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600' : 'bg-gradient-to-r from-purple-600 to-pink-600'} text-white rounded-lg font-bold disabled:opacity-50 flex items-center justify-center gap-2`}>
                    {saving && <Loader2 className="w-5 h-5 animate-spin" />}
                    {editMode ? '✓ 更新する' : '追加'}
                  </button>

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
                      {(() => {
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
                        const sorted = [...filtered].sort((a, b) => {
                          if (subEraSort === 'year') {
                            return parseYear(a.item?.subEraYears?.split('-')[0] || a.item?.year) - parseYear(b.item?.subEraYears?.split('-')[0] || b.item?.year);
                          } else if (subEraSort === 'title') {
                            return (a.subEra || '').localeCompare(b.subEra || '', 'ja');
                          } else {
                            return (b.item?.id || '').localeCompare(a.item?.id || '');
                          }
                        });
                        return sorted.map(({ key, mainEra, subEra, item }) => {
                          const seIcon = subEraIcon(item?.subEraType);
                          const SeIcon = seIcon.icon;
                          const eraName = eras.find(e => e.id === mainEra)?.name || mainEra;
                          const cats = getHistoryCategories(item);
                          return (
                            <div key={key} className={`flex items-center justify-between p-3 bg-white border rounded-lg ${editMode && editTarget?.type === 'subEra' && editTarget?.mainEra === mainEra && editTarget?.subEra === subEra ? 'ring-2 ring-yellow-400 bg-yellow-50' : ''}`}>
                              <div className="flex-1">
                                <div className="font-semibold flex items-center gap-2">
                                  <SeIcon className="w-4 h-4" />
                                  {subEra}
                                  {cats.includes('japan') && <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">🇯🇵</span>}
                                  {cats.includes('world') && cats.includes('japan') && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">🌐</span>}
                                  {item?.parentSubEra && (
                                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">→ {item.parentSubEra}</span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-500">{eraName} • {item?.subEraYears || '期間未設定'}</div>
                              </div>
                              <div className="flex gap-1">
                                <button type="button" onClick={() => startEditSubEra(mainEra, subEra)} disabled={saving} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50" title="編集">
                                  <Pencil className="w-5 h-5" />
                                </button>
                                <button type="button" onClick={() => deleteSubEra(mainEra, subEra)} disabled={saving} className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50" title="削除">
                                  <X className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {showPasswordPrompt && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">🔒 管理者ログイン</h2>
              <button onClick={() => { setShowPasswordPrompt(false); setEmailInput(''); setPasswordInput(''); setAuthError(''); }} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handlePasswordSubmit}>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="メールアドレス"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                autoFocus
                required
              />
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="パスワード"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
              {authError && (
                <p className="text-red-600 text-sm mb-4">{authError}</p>
              )}
              <button type="submit" disabled={saving} className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 flex items-center justify-center gap-2">
                {saving && <Loader2 className="w-5 h-5 animate-spin" />}
                ログイン
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
