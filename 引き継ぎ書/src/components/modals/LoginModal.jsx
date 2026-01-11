import React from 'react';
import { X, Loader2 } from 'lucide-react';

/**
 * 管理者ログインモーダル
 * @param {Object} props
 * @param {boolean} props.show - モーダルを表示するか
 * @param {Function} props.onClose - 閉じるボタンのコールバック
 * @param {Function} props.onSubmit - フォーム送信のコールバック
 * @param {string} props.emailInput - メールアドレス入力値
 * @param {Function} props.setEmailInput - メールアドレス設定関数
 * @param {string} props.passwordInput - パスワード入力値
 * @param {Function} props.setPasswordInput - パスワード設定関数
 * @param {string} props.authError - 認証エラーメッセージ
 * @param {boolean} props.saving - 送信中かどうか
 */
const LoginModal = ({
  show,
  onClose,
  onSubmit,
  emailInput,
  setEmailInput,
  passwordInput,
  setPasswordInput,
  authError,
  saving
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">🔒 管理者ログイン</h2>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={onSubmit}>
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
          <button 
            type="submit" 
            disabled={saving} 
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 className="w-5 h-5 animate-spin" />}
            ログイン
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
