import { useState, useEffect, useMemo } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db, fetchTimelineData } from '../firebase';
import { sampleData } from '../constants';
import { parseYear } from '../utils';

/**
 * タイムラインデータを管理するカスタムフック
 * @returns {Object} データと操作関数
 */
export const useTimelineData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Firebaseからデータを取得
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const firebaseData = await fetchTimelineData();
        if (firebaseData.length > 0) {
          // === マイグレーション処理: 1945年以降で親なしの作品を現代に移動 ===
          // このコードは一度実行後に削除可能
          const migrateData = async () => {
            for (const item of firebaseData) {
              if (!item.id?.startsWith('sample')) {
                // parseYear関数のローカル版
                const parseYearLocal = (str) => {
                  if (!str) return 9999;
                  const s = String(str).trim();
                  const bcMatch = s.match(/(?:紀元前|BC)\s*(\d+)/i);
                  if (bcMatch) return -parseInt(bcMatch[1], 10);
                  const centuryMatch = s.match(/(\d+)\s*世紀/);
                  if (centuryMatch) {
                    const century = parseInt(centuryMatch[1], 10);
                    return (century - 1) * 100 + 1;
                  }
                  const yearMatch = s.match(/(\d{3,4})/);
                  if (yearMatch) return parseInt(yearMatch[1], 10);
                  return 9999;
                };
                
                // コンテンツを持つアイテムで、mainEraが'modern'のものをチェック
                if (item.content && item.content.length > 0 && item.mainEra === 'modern') {
                  const year = parseYearLocal(item.year);
                  // 1945年以降で、コンテンツに親(parentSubEra)がないものを更新
                  const hasNoParent = item.content.every(c => !c.parentSubEra);
                  if (year >= 1945 && hasNoParent) {
                    console.log('マイグレーション: ', item.year, item.content.map(c => c.title).join(', '));
                    try {
                      await updateDoc(doc(db, 'timeline', item.id), { mainEra: 'contemporary' });
                    } catch (e) {
                      console.error('マイグレーションエラー:', e);
                    }
                  }
                }
              }
            }
          };
          await migrateData();
          // マイグレーション後にデータを再読み込み
          const updatedData = await fetchTimelineData();
          setData(updatedData);
          // === マイグレーション処理ここまで ===
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

  // ソート済みデータ
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const yearDiff = parseYear(a.year) - parseYear(b.year);
      if (yearDiff !== 0) return yearDiff;
      // 同じ年の場合はIDでソート（安定化）
      return (a.id || '').localeCompare(b.id || '');
    });
  }, [data]);

  // 既存の年号リストを抽出（入力補完用）
  const existingYears = useMemo(() => {
    const years = new Set();
    sortedData.forEach(item => {
      if (item.year) years.add(item.year);
      // 時代区分の年代も追加
      if (item.subEraYears) years.add(item.subEraYears);
    });
    return [...years].sort((a, b) => parseYear(a) - parseYear(b));
  }, [sortedData]);

  return {
    data,
    setData,
    sortedData,
    existingYears,
    loading
  };
};
