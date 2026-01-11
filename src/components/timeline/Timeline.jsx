import React from 'react';
import { eras } from '../../constants';
import { parseYear, getCentury, getHistoryCategories, hasHistoryCategory, getStyle, getLabel, getSubEraIcon, getEventIcon } from '../../utils';

/**
 * 年表コンポーネント
 * 時代ごとにコンテンツを表示するタイムライン
 */
const Timeline = ({
  sortedData,
  activeEra,
  scroll,
  historyFilter,
  categoryFilter,
  settingTypesFilter,
  setSel,
  setVideoIndex
}) => {
  // ローカル関数
  const style = getStyle;
  const label = getLabel;
  const subEraIcon = getSubEraIcon;
  const eventIcon = getEventIcon;

  return (
    <div className="px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        映画で旅する世界史の地図
      </h1>
      <p className="text-center text-gray-600 mb-12 text-sm">歴史的瞬間とその時代の作品をチェック</p>
      
      {/* 時代ナビゲーション */}
      <div className="sticky top-20 bg-white/95 backdrop-blur z-40 py-3 mb-8 border-y">
        <div className="flex overflow-x-auto gap-2 px-2">
          {eras.map(e => (
            <button 
              key={e.id} 
              onClick={() => scroll(e.id)} 
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold ${activeEra === e.id ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {e.name}
              <div className="text-xs opacity-75">{e.year}</div>
            </button>
          ))}
        </div>
      </div>
      
      {/* タイムライン本体 */}
      <div className="max-w-4xl mx-auto relative">
        <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 via-pink-500 to-purple-500"></div>
        
        <TimelineContent 
          sortedData={sortedData}
          historyFilter={historyFilter}
          categoryFilter={categoryFilter}
          settingTypesFilter={settingTypesFilter}
          setSel={setSel}
          setVideoIndex={setVideoIndex}
          style={style}
          label={label}
          subEraIcon={subEraIcon}
          eventIcon={eventIcon}
        />
      </div>
    </div>
  );
};

/**
 * 時代設定アイコンを取得
 */
const getSettingTypeIcon = (types) => {
  if (!types || types.length === 0) return null;
  const hasContemporary = types.includes('contemporary');
  const hasFuture = types.includes('future');
  if (hasContemporary && hasFuture) return <span className="text-base">⬇️⏩</span>;
  if (hasContemporary) return <span className="text-base">⬇️</span>;
  if (hasFuture) return <span className="text-base">⏩</span>;
  return null;
};

/**
 * positionParentを取得（後方互換性: parentSubEraもサポート）
 */
const getPositionParent = (content) => {
  return content.positionParent || content.parentSubEra || '';
};

/**
 * タイムラインコンテンツ
 * 各時代のコンテンツをレンダリング
 */
const TimelineContent = ({
  sortedData,
  historyFilter,
  categoryFilter,
  settingTypesFilter,
  setSel,
  setVideoIndex,
  style,
  label,
  subEraIcon,
  eventIcon
}) => {
  // 大区分をまたいで世紀を追跡
  let globalLastCentury = null;
  
  // 歴史フィルター関数
  const passesFilter = (item) => {
    if (historyFilter === 'all') return true;
    return hasHistoryCategory(item, historyFilter);
  };
  
  // カテゴリーフィルター関数（コンテンツ専用）
  const passesCategoryFilter = (content) => {
    if (!content.type) return true;
    if (Object.values(categoryFilter).every(v => v)) return true;
    const contentTypes = Array.isArray(content.type) ? content.type : [content.type];
    return contentTypes.some(t => categoryFilter[t]);
  };
  
  // 時代設定フィルター関数
  const passesSettingTypesFilter = (content) => {
    if (!content.type) return true;
    if (content.type === 'trivia') return true;
    if (settingTypesFilter.length === 3) return true;
    const contentSettingTypes = content.settingTypes || (content.settingType ? [content.settingType] : ['past']);
    return contentSettingTypes.some(t => settingTypesFilter.includes(t));
  };
  
  // 全データから時代区分グループを構築（クロス時代参照用）
  const allSubEraGroups = {};
  sortedData.forEach(item => {
    if (item.subEra && !allSubEraGroups[item.subEra] && passesFilter(item)) {
      allSubEraGroups[item.subEra] = {
        subEra: item.subEra,
        subEraYears: item.subEraYears,
        subEraDesc: item.subEraDesc,
        subEraDetail: item.subEraDetail,
        subEraType: item.subEraType,
        historyCategories: getHistoryCategories(item),
        parentSubEra: item.parentSubEra || '',
        mainEra: item.mainEra,
        startYear: parseYear(item.subEraYears?.split('-')[0] || item.year),
        endYear: parseYear(item.subEraYears?.split('-')[1] || item.subEraYears?.split('-')[0] || item.year),
        items: [],
        childGroups: [],
        childContents: []
      };
    }
  });
  
  // 先に全データからchildContentsを収集（時代をまたいだ参照のため）
  sortedData.forEach(item => {
    const filteredContent = (item.content || []).filter(c => passesFilter(c) && passesCategoryFilter(c) && passesSettingTypesFilter(c));
    
    filteredContent.forEach((c, idx) => {
      const originalIdx = (item.content || []).findIndex(oc => oc === c);
      const posParent = getPositionParent(c);
      
      // positionParentが設定されていて、その親がallSubEraGroupsに存在する場合
      if (posParent && allSubEraGroups[posParent]) {
        // yearが空の場合は親の開始年を使用
        const effectiveYear = item.year || allSubEraGroups[posParent].startYear;
        allSubEraGroups[posParent].childContents.push({
          content: c,
          idx: originalIdx,
          item,
          year: effectiveYear,
          parentStartYear: allSubEraGroups[posParent].startYear
        });
      }
    });
  });

  return eras.map(era => {
    const eraData = sortedData.filter(i => i.mainEra === era.id);
    
    // 時代区分ごとにグループ化
    const subEraGroups = {};
    const childSubEras = {};
    const standaloneItems = []; // 時代区分に属さないアイテム
    
    // 時代区分を収集
    eraData.forEach(item => {
      if (item.subEra && !subEraGroups[item.subEra] && passesFilter(item)) {
        // allSubEraGroupsからchildContentsを取得
        const globalGroup = allSubEraGroups[item.subEra];
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
          endYear: parseYear(item.subEraYears?.split('-')[1] || item.subEraYears?.split('-')[0] || item.year),
          items: [],
          childGroups: [],
          // allSubEraGroupsから収集したchildContentsを使用
          childContents: globalGroup ? [...globalGroup.childContents] : []
        };
        if (item.parentSubEra) {
          childSubEras[item.subEra] = item.parentSubEra;
        }
      }
    });
    
    // アイテムを時代区分グループに追加
    eraData.forEach(item => {
      const filteredContent = (item.content || []).filter(c => passesFilter(c) && passesCategoryFilter(c) && passesSettingTypesFilter(c));
      const filteredEvents = (item.events || []).filter(ev => passesFilter(ev));
      
      if (item.subEra && subEraGroups[item.subEra]) {
        // 時代区分を持つアイテムの場合
        // positionParentが設定されているコンテンツは既にallSubEraGroupsで処理済みなので除外
        const normalContents = filteredContent.filter((c) => {
          const posParent = getPositionParent(c);
          // positionParentが設定されていない、または親が存在しない場合のみ含める
          return !posParent || !allSubEraGroups[posParent];
        }).map((c, idx) => {
          const originalIdx = (item.content || []).findIndex(oc => oc === c);
          return { ...c, _originalIdx: originalIdx };
        });
        
        if (normalContents.length > 0 || filteredEvents.length > 0) {
          const modifiedItem = { ...item, content: normalContents, events: filteredEvents };
          subEraGroups[item.subEra].items.push(modifiedItem);
        }
      } else if (!item.subEra) {
        // 時代区分を持たないアイテムの場合
        // positionParentが設定されているコンテンツは既にallSubEraGroupsで処理済みなので除外
        const normalContents = filteredContent.filter((c) => {
          const posParent = getPositionParent(c);
          // positionParentが設定されていない、または親が存在しない場合のみ含める
          return !posParent || !allSubEraGroups[posParent];
        }).map((c, idx) => {
          const originalIdx = (item.content || []).findIndex(oc => oc === c);
          return { ...c, _originalIdx: originalIdx };
        });
        
        // 残りのコンテンツを standaloneItems に追加
        if (normalContents.length > 0 || filteredEvents.length > 0) {
          const modifiedItem = { ...item, content: normalContents, events: filteredEvents };
          standaloneItems.push(modifiedItem);
        }
      }
    });
    
    // 子時代区分を親に追加
    Object.entries(childSubEras).forEach(([childName, parentName]) => {
      if (subEraGroups[parentName] && subEraGroups[childName]) {
        subEraGroups[parentName].childGroups.push(subEraGroups[childName]);
        delete subEraGroups[childName];
      }
    });
    
    // 各時代区分のchildContentsとchildGroupsを年順にソート
    Object.values(subEraGroups).forEach(group => {
      if (group.childContents && group.childContents.length > 0) {
        group.childContents.sort((a, b) => parseYear(a.year) - parseYear(b.year));
      }
      if (group.childGroups && group.childGroups.length > 0) {
        group.childGroups.sort((a, b) => a.startYear - b.startYear);
      }
    });
    
    // タイムラインアイテムを構築（すべてフラット）
    const timelineItems = [];
    
    // 時代区分は常に表示（コンテンツがなくても歴史的事象として表示）
    Object.values(subEraGroups).forEach(group => {
      timelineItems.push({
        type: 'subEraGroup',
        ...group
      });
    });
    
    standaloneItems.forEach(item => {
      timelineItems.push({
        type: 'item',
        item: item,
        year: parseYear(item.year)
      });
    });
    
    // ソート
    timelineItems.sort((a, b) => {
      const yearA = a.type === 'subEraGroup' ? a.startYear : a.year;
      const yearB = b.type === 'subEraGroup' ? b.startYear : b.year;
      if (yearA !== yearB) return yearA - yearB;
      if (a.type === 'subEraGroup' && b.type !== 'subEraGroup') return -1;
      if (a.type !== 'subEraGroup' && b.type === 'subEraGroup') return 1;
      const idA = a.type === 'subEraGroup' ? a.subEra : (a.item?.id || '');
      const idB = b.type === 'subEraGroup' ? b.subEra : (b.item?.id || '');
      return idA.localeCompare(idB);
    });
    
    // 紀元チェック
    const hasBCItems = era.id === 'ancient' && timelineItems.some(ti => {
      const yr = ti.type === 'subEraGroup' ? ti.startYear : ti.year;
      return yr < 0;
    });
    const hasADItems = era.id === 'ancient' && timelineItems.some(ti => {
      const yr = ti.type === 'subEraGroup' ? ti.startYear : ti.year;
      return yr > 0;
    });
    const showEraLine = hasBCItems && hasADItems;
    
    const currentRealYear = new Date().getFullYear();
    
    return (
      <div key={era.id} id={`era-${era.id}`} className="mb-16 relative">
        <div className="flex items-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center font-bold text-lg shadow-lg z-10 text-white">
            {era.name}
          </div>
          <div className="ml-4 text-gray-500 text-sm">{era.year}</div>
        </div>
        
        {timelineItems.map((ti, tiIdx) => {
          const currentYear = ti.type === 'subEraGroup' ? ti.startYear : parseYear(ti.year || ti.item?.year);
          const prevItem = tiIdx > 0 ? timelineItems[tiIdx - 1] : null;
          const prevYear = prevItem ? (prevItem.type === 'subEraGroup' ? prevItem.startYear : parseYear(prevItem.year || prevItem.item?.year)) : null;
          const showEraDivider = showEraLine && prevYear !== null && prevYear < 0 && currentYear > 0;
          const showNowArrow = currentYear > currentRealYear && (prevYear === null || prevYear <= currentRealYear);
          
          const currentCentury = currentYear ? getCentury(currentYear) : null;
          const prevCentury = prevYear ? getCentury(prevYear) : globalLastCentury;
          const showCenturyMarker = currentCentury && (
            !prevCentury || 
            currentCentury.century !== prevCentury.century || 
            currentCentury.isBC !== prevCentury.isBC
          );
          
          if (currentCentury) {
            globalLastCentury = currentCentury;
          }
          
          if (ti.type === 'subEraGroup') {
            return (
              <SubEraGroup 
                key={`subEraGroup-${ti.subEra}-${tiIdx}`}
                ti={ti}
                tiIdx={tiIdx}
                showEraDivider={showEraDivider}
                showNowArrow={showNowArrow}
                showCenturyMarker={showCenturyMarker}
                currentCentury={currentCentury}
                setSel={setSel}
                setVideoIndex={setVideoIndex}
                style={style}
                label={label}
                subEraIcon={subEraIcon}
                eventIcon={eventIcon}
                sortedData={sortedData}
              />
            );
          } else {
            return (
              <SingleItem
                key={`item-${ti.item?.id || tiIdx}`}
                ti={ti}
                showEraDivider={showEraDivider}
                showNowArrow={showNowArrow}
                showCenturyMarker={showCenturyMarker}
                currentCentury={currentCentury}
                setSel={setSel}
                setVideoIndex={setVideoIndex}
                style={style}
                label={label}
                eventIcon={eventIcon}
              />
            );
          }
        })}
      </div>
    );
  });
};

/**
 * 紀元区切り線コンポーネント
 */
const EraDivider = ({ show }) => {
  if (!show) return null;
  return (
    <div className="flex items-center justify-center my-8">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
      <div className="px-4 py-2 bg-amber-100 rounded-full text-amber-800 font-bold text-sm mx-4">
        紀元
      </div>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
    </div>
  );
};

/**
 * 世紀マーカーコンポーネント
 */
const CenturyMarker = ({ show, currentCentury }) => {
  if (!show || !currentCentury) return null;
  return (
    <div className="flex items-center justify-center my-6">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-green-400 to-transparent border-t border-dashed border-green-400"></div>
      <div className="px-4 py-1.5 bg-green-50 border border-green-300 rounded-full text-green-700 font-bold text-sm mx-4">
        {currentCentury.label}
      </div>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-green-400 to-transparent border-t border-dashed border-green-400"></div>
    </div>
  );
};

/**
 * 現在年矢印コンポーネント
 */
const NowArrow = ({ show }) => {
  if (!show) return null;
  return (
    <div className="flex items-center justify-center my-6">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent"></div>
      <div className="px-4 py-2 bg-purple-100 rounded-full text-purple-800 font-bold text-sm mx-4 flex items-center gap-2">
        <span>↓</span>
        <span>現在</span>
        <span>↓</span>
      </div>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent"></div>
    </div>
  );
};

/**
 * relatedSubErasから関連作品を収集
 * ※ positionParentは配置用のみ、関連作品表示にはrelatedSubErasのみを使用
 */
const collectRelatedContents = (subEraName, sortedData) => {
  const relatedContents = [];
  
  sortedData.forEach(item => {
    (item.content || []).forEach((c, idx) => {
      // relatedSubErasのみをチェック（positionParentは配置用なので関連作品には含めない）
      const related = c.relatedSubEras || [];
      
      // relatedSubErasに含まれている場合のみ
      if (related.includes(subEraName)) {
        relatedContents.push({
          content: c,
          idx,
          item,
          year: item.year,
          itemId: item.id  // Firestore更新用にIDを追加
        });
      }
    });
  });
  
  // 年順にソート
  relatedContents.sort((a, b) => parseYear(a.year) - parseYear(b.year));
  
  return relatedContents;
};

/**
 * 時代区分グループコンポーネント（年号順ソート対応）
 */
const SubEraGroup = ({
  ti,
  showEraDivider,
  showNowArrow,
  showCenturyMarker,
  currentCentury,
  setSel,
  setVideoIndex,
  style,
  label,
  subEraIcon,
  eventIcon,
  sortedData
}) => {
  const seIcon = subEraIcon(ti.subEraType);
  const SeIcon = seIcon.icon;
  const isRed = seIcon.color === 'red';
  const colors = isRed 
    ? { bg: 'bg-red-100', border: 'border-red-300', text: 'text-red-800', subtext: 'text-red-500', line: 'border-red-400', iconColor: 'text-red-600' }
    : { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-800', subtext: 'text-gray-500', line: 'border-gray-400', iconColor: 'text-gray-600' };

  // すべての要素を統合して年号順にソート
  const allElements = [];
  
  // 時代区分内のアイテム（コンテンツ）を追加
  (ti.items || []).forEach(item => {
    const itemYear = parseYear(item.year);
    // イベントを追加
    (item.events || []).forEach((ev, evIdx) => {
      allElements.push({
        type: 'event',
        year: itemYear,
        yearLabel: item.year,
        event: ev,
        evIdx,
        item
      });
    });
    // コンテンツを追加
    (item.content || []).forEach((c, i) => {
      const originalIdx = c._originalIdx !== undefined ? c._originalIdx : i;
      allElements.push({
        type: 'content',
        year: itemYear,
        yearLabel: item.year,
        content: c,
        originalIdx,
        item
      });
    });
  });
  
  // 子コンテンツを追加（positionParentで紐付けられたもの）
  (ti.childContents || []).forEach((pc, pcIdx) => {
    // yearが空の場合は親の開始年を使用
    const parsedYear = parseYear(pc.year);
    const effectiveYear = isNaN(parsedYear) ? ti.startYear : parsedYear;
    allElements.push({
      type: 'childContent',
      year: effectiveYear,
      yearLabel: pc.year || '', // 空の場合は年号ラベルを表示しない
      pc,
      pcIdx
    });
  });
  
  // 子時代区分を追加
  (ti.childGroups || []).forEach((child, childIdx) => {
    allElements.push({
      type: 'childGroup',
      year: child.startYear,
      yearLabel: child.subEraYears,
      child,
      childIdx
    });
  });
  
  // 年号順にソート（同年の場合は子時代区分を先に、yearLabelが空のchildContentを優先）
  allElements.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    // 同年の場合の優先順位: childGroup > event > yearLabelが空のchildContent > content/childContent
    const getPriority = (el) => {
      if (el.type === 'childGroup') return 0;
      if (el.type === 'event') return 1;
      // yearLabelが空のchildContentは親の直下に表示
      if (el.type === 'childContent' && !el.yearLabel) return 1.5;
      return 2;
    };
    return getPriority(a) - getPriority(b);
  });
  
  // 年号ラベル表示のトラッキング
  let lastYearLabel = null;
  
  // 関連作品を収集（モーダル表示用）
  const relatedContents = collectRelatedContents(ti.subEra, sortedData);

  return (
    <React.Fragment>
      <EraDivider show={showEraDivider} />
      <CenturyMarker show={showCenturyMarker} currentCentury={currentCentury} />
      <NowArrow show={showNowArrow} />
      
      {/* 時代区分ヘッダー */}
      <div className="flex items-center ml-12 relative mb-6 mt-4">
        <div className={`absolute left-[-16px] top-5 w-4 border-t-2 border-dashed ${colors.line}`}></div>
        <div 
          className="flex items-center cursor-pointer group"
          onClick={() => setSel({ 
            type: 'subEra', 
            subEraType: ti.subEraType,
            title: ti.subEra, 
            subEraYears: ti.subEraYears,
            desc: ti.subEraDesc,
            detail: ti.subEraDetail,
            mainEra: ti.mainEra,
            subEra: ti.subEra,
            relatedContents: relatedContents  // 関連作品を渡す
          })}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md border-2 z-10 ${colors.bg} ${colors.border} group-hover:scale-110 transition-transform`}>
            <SeIcon className={`w-6 h-6 ${colors.iconColor}`} />
          </div>
          <div className="ml-4">
            <div className={`text-lg font-bold ${colors.text} group-hover:text-purple-600 transition-colors`}>{ti.subEra}</div>
            <div className={`text-sm ${colors.subtext}`}>{ti.subEraYears}</div>
          </div>
        </div>
      </div>
      
      {/* 統合されたコンテンツを年号順に表示 */}
      {allElements.map((elem, elemIdx) => {
        // yearLabelが空でなく、前回と異なる場合のみ表示
        const showYearLabel = elem.yearLabel && elem.yearLabel !== lastYearLabel;
        if (elem.yearLabel) lastYearLabel = elem.yearLabel;
        
        if (elem.type === 'childGroup') {
          // 子時代区分
          return (
            <ChildSubEraGroup 
              key={`child-${elem.child.subEra}-${elem.childIdx}`}
              child={elem.child}
              setSel={setSel}
              setVideoIndex={setVideoIndex}
              style={style}
              label={label}
              subEraIcon={subEraIcon}
              sortedData={sortedData}
            />
          );
        } else if (elem.type === 'event') {
          // イベント
          const evIcon = eventIcon(elem.event.eventType);
          const EvIcon = evIcon.icon;
          return (
            <div key={`ev-${elem.item.id}-${elem.evIdx}`} className="ml-20 mb-4">
              {showYearLabel && <div className="text-lg font-bold text-purple-600 mb-2">{elem.yearLabel}</div>}
              <div 
                onClick={() => setSel({ type: 'event', ...elem.event, year: elem.item.year, itemId: elem.item.id, eventIdx: elem.evIdx })} 
                className="cursor-pointer pl-4 py-3 pr-2 mb-3 border-l-4 border-amber-400 bg-amber-50 rounded-r-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-2">
                  <EvIcon className={`w-4 h-4 ${evIcon.iconColor}`} />
                  <span className="font-bold text-amber-800">{elem.event.title}</span>
                </div>
                {elem.event.location && <div className="text-sm text-amber-600 mt-1">📍 {elem.event.location}</div>}
              </div>
            </div>
          );
        } else if (elem.type === 'content') {
          // 通常コンテンツ
          const s = style(elem.content.type);
          const displayPeriod = elem.content.periodRange || '';
          const types = elem.content.settingTypes || (elem.content.settingType ? [elem.content.settingType] : []);
          return (
            <div key={`c-${elem.item.id}-${elem.originalIdx}`} className="ml-20 mb-4">
              {showYearLabel && <div className="text-lg font-bold text-purple-600 mb-2">{elem.yearLabel}</div>}
              <div 
                onClick={() => { setVideoIndex(0); setSel({ ...elem.content, year: elem.item.year, itemId: elem.item.id, idx: elem.originalIdx }); }} 
                className={`cursor-pointer pl-4 py-3 pr-2 mb-3 border-l-4 ${s.b} ${s.bg} rounded-r-lg hover:shadow-md transition-shadow flex items-center gap-3`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {getSettingTypeIcon(types)}
                    <span className={`font-bold ${s.txt}`}>{elem.content.title}</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{label(elem.content.type)}</div>
                  <div className="text-sm text-gray-500 min-h-[1.25rem]">{displayPeriod}</div>
                </div>
                {elem.content.thumbnail ? (
                  <img src={elem.content.thumbnail} alt="" className="w-16 h-16 object-cover rounded flex-shrink-0" onError={(e) => e.target.style.display='none'} />
                ) : (
                  <div className="w-16 h-16 flex-shrink-0"></div>
                )}
              </div>
            </div>
          );
        } else if (elem.type === 'childContent') {
          // 子コンテンツ（positionParentで紐付け）
          const s = style(elem.pc.content.type);
          const displayPeriod = elem.pc.content.periodRange || '';
          const types = elem.pc.content.settingTypes || (elem.pc.content.settingType ? [elem.pc.content.settingType] : []);
          return (
            <div key={`pc-${elem.pcIdx}`} className="ml-20 mb-4">
              {showYearLabel && <div className="text-lg font-bold text-purple-600 mb-2">{elem.yearLabel}</div>}
              <div 
                onClick={() => { setVideoIndex(0); setSel({ ...elem.pc.content, year: elem.pc.year, itemId: elem.pc.item.id, idx: elem.pc.idx }); }} 
                className={`cursor-pointer pl-4 py-3 pr-2 mb-3 border-l-4 ${s.b} ${s.bg} rounded-r-lg hover:shadow-md transition-shadow flex items-center gap-3`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {getSettingTypeIcon(types)}
                    <span className={`font-bold ${s.txt}`}>{elem.pc.content.title}</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{label(elem.pc.content.type)}</div>
                  <div className="text-sm text-gray-500 min-h-[1.25rem]">{displayPeriod}</div>
                </div>
                {elem.pc.content.thumbnail ? (
                  <img src={elem.pc.content.thumbnail} alt="" className="w-16 h-16 object-cover rounded flex-shrink-0" onError={(e) => e.target.style.display='none'} />
                ) : (
                  <div className="w-16 h-16 flex-shrink-0"></div>
                )}
              </div>
            </div>
          );
        }
        return null;
      })}
    </React.Fragment>
  );
};

/**
 * 子時代区分グループコンポーネント
 */
const ChildSubEraGroup = ({
  child,
  setSel,
  setVideoIndex,
  style,
  label,
  subEraIcon,
  sortedData
}) => {
  const childSeIcon = subEraIcon(child.subEraType);
  const ChildSeIcon = childSeIcon.icon;
  const isChildRed = childSeIcon.color === 'red';
  const childColors = isChildRed 
    ? { bg: 'bg-red-100', border: 'border-red-300', text: 'text-red-800', subtext: 'text-red-500', line: 'border-red-400', iconColor: 'text-red-600' }
    : { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-800', subtext: 'text-gray-500', line: 'border-gray-400', iconColor: 'text-gray-600' };

  // 関連作品を収集
  const relatedContents = collectRelatedContents(child.subEra, sortedData);

  return (
    <div className="mt-2">
      {/* 子時代区分ヘッダー */}
      <div className="flex items-center ml-20 relative mb-4">
        <div className={`absolute left-[-48px] top-4 w-12 border-t-2 border-dashed ${childColors.line}`}></div>
        <div 
          className="flex items-center cursor-pointer group"
          onClick={() => setSel({ 
            type: 'subEra', 
            subEraType: child.subEraType,
            title: child.subEra, 
            subEraYears: child.subEraYears,
            desc: child.subEraDesc,
            detail: child.subEraDetail,
            mainEra: child.mainEra,
            subEra: child.subEra,
            relatedContents: relatedContents  // 関連作品を渡す
          })}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md border-2 z-10 ${childColors.bg} ${childColors.border} group-hover:scale-110 transition-transform`}>
            <ChildSeIcon className={`w-5 h-5 ${childColors.iconColor}`} />
          </div>
          <div className="ml-3">
            <div className={`font-bold ${childColors.text} group-hover:text-purple-600 transition-colors`}>{child.subEra}</div>
            <div className={`text-xs ${childColors.subtext}`}>{child.subEraYears}</div>
          </div>
        </div>
      </div>
      
      {/* 子時代区分内のアイテム */}
      {child.items.map((item, itemIdx) => {
        const prevItem = itemIdx > 0 ? child.items[itemIdx - 1] : null;
        const showYearLabel = !prevItem || prevItem.year !== item.year;
        
        return (
          <div key={item.id} className="ml-20 mb-4">
            {showYearLabel && <div className="text-lg font-bold text-purple-600 mb-2">{item.year}</div>}
            {item.content?.map((c, i) => {
              const s = style(c.type);
              const displayPeriod = c.periodRange || '';
              const originalIdx = c._originalIdx !== undefined ? c._originalIdx : i;
              const types = c.settingTypes || (c.settingType ? [c.settingType] : []);
              
              return (
                <div 
                  key={originalIdx} 
                  onClick={() => { setVideoIndex(0); setSel({ ...c, year: item.year, itemId: item.id, idx: originalIdx }); }} 
                  className={`cursor-pointer pl-4 py-3 pr-2 mb-3 border-l-4 ${s.b} ${s.bg} rounded-r-lg hover:shadow-md transition-shadow flex items-center gap-3`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {getSettingTypeIcon(types)}
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
        );
      })}
    </div>
  );
};

/**
 * 単独アイテムコンポーネント
 */
const SingleItem = ({
  ti,
  showEraDivider,
  showNowArrow,
  showCenturyMarker,
  currentCentury,
  setSel,
  setVideoIndex,
  style,
  label,
  eventIcon
}) => {
  const item = ti.item;
  
  return (
    <React.Fragment>
      <EraDivider show={showEraDivider} />
      <CenturyMarker show={showCenturyMarker} currentCentury={currentCentury} />
      <NowArrow show={showNowArrow} />
      
      <div className="ml-20 mb-4">
        <div className="text-lg font-bold text-purple-600 mb-2">{item.year}</div>
        
        {/* イベント */}
        {item.events?.map((ev, evIdx) => {
          const evIcon = eventIcon(ev.eventType);
          const EvIcon = evIcon.icon;
          return (
            <div 
              key={`ev-${evIdx}`} 
              onClick={() => setSel({ type: 'event', ...ev, year: item.year, itemId: item.id, eventIdx: evIdx })} 
              className="cursor-pointer pl-4 py-3 pr-2 mb-3 border-l-4 border-amber-400 bg-amber-50 rounded-r-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2">
                <EvIcon className={`w-4 h-4 ${evIcon.iconColor}`} />
                <span className="font-bold text-amber-800">{ev.title}</span>
              </div>
              {ev.location && <div className="text-sm text-amber-600 mt-1">📍 {ev.location}</div>}
            </div>
          );
        })}
        
        {/* コンテンツ */}
        {item.content?.map((c, i) => {
          const s = style(c.type);
          const displayPeriod = c.periodRange || '';
          const originalIdx = c._originalIdx !== undefined ? c._originalIdx : i;
          const types = c.settingTypes || (c.settingType ? [c.settingType] : []);
          
          return (
            <div 
              key={originalIdx} 
              onClick={() => { setVideoIndex(0); setSel({ ...c, year: item.year, itemId: item.id, idx: originalIdx }); }} 
              className={`cursor-pointer pl-4 py-3 pr-2 mb-3 border-l-4 ${s.b} ${s.bg} rounded-r-lg hover:shadow-md transition-shadow flex items-center gap-3`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {getSettingTypeIcon(types)}
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
};

export default Timeline;
