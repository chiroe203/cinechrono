import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

/**
 * Firebase認証状態を管理するカスタムフック
 * @returns {Object} 認証状態
 * - currentUser: 現在のユーザー（null = 未ログイン）
 * - adminMode: 管理者モードかどうか
 * - setAdminMode: 管理者モードを設定する関数
 * - isAuthenticated: ログイン済みかどうか
 */
export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [adminMode, setAdminMode] = useState(false);

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

  return {
    currentUser,
    adminMode,
    setAdminMode,
    isAuthenticated: !!currentUser
  };
};
