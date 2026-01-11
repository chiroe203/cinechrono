import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * グローバル設定を管理するカスタムフック
 * @returns {Object} 設定と操作関数
 */
export const useSettings = () => {
  const [affiliateEnabled, setAffiliateEnabled] = useState(false);

  // Firestoreから設定を取得
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, 'settings', 'global'));
        if (settingsDoc.exists()) {
          setAffiliateEnabled(settingsDoc.data().affiliateEnabled ?? false);
        }
      } catch (error) {
        console.error('設定読み込みエラー:', error);
      }
    };
    loadSettings();
  }, []);

  // アフィリエイト設定をトグル
  const toggleAffiliate = async () => {
    const newValue = !affiliateEnabled;
    setAffiliateEnabled(newValue);
    try {
      await setDoc(doc(db, 'settings', 'global'), { affiliateEnabled: newValue }, { merge: true });
      console.log('アフィリエイト設定を更新:', newValue ? '公開' : '非公開');
    } catch (error) {
      console.error('設定保存エラー:', error);
      alert('設定の保存に失敗しました。Firestoreのセキュリティルールを確認してください。');
      setAffiliateEnabled(!newValue); // エラー時は元に戻す
    }
  };

  return {
    affiliateEnabled,
    toggleAffiliate
  };
};
