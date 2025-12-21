# CINEchrono TRAVEL 開発引き継ぎドキュメント

## 📋 プロジェクト概要

| 項目 | 内容 |
|------|------|
| プロジェクト名 | CINEchrono TRAVEL |
| ドメイン | cinechrono.com |
| 本番URL | https://cinechrono.com |
| Vercel URL | https://cinechrono-lemon.vercel.app |
| 目的 | 歴史的瞬間と映画・漫画・ゲームを年表で繋ぐWebアプリ |
| ターゲット | 中高生（世界史学習者） |
| ローカルパス | `/Users/hiroec/Desktop/cinechrono` |
| GitHub | https://github.com/chiroe203/cinechrono |

---

## ✅ 完了した作業

### Phase 1-7: 以前完了
- ✅ Node.js・React・Tailwind CSS 環境構築
- ✅ GitHubリポジトリ作成・連携
- ✅ Firebase Authentication・Firestore連携
- ✅ Vercelデプロイ・カスタムドメイン設定
- ✅ サムネイル画像機能
- ✅ 世紀区切り線・紀元区切り線
- ✅ 紀元前（BC）対応
- ✅ Aboutページ作成
- ✅ アフィリエイトリンクシステム拡張
- ✅ イベントシステム再設計
- ✅ アフィリエイト表示オン/オフ機能
- ✅ Google Analytics 4 導入
- ✅ 電子書籍サービス拡充
- ✅ 親子関係機能実装
- ✅ parseYear関数改善
- ✅ Google Search Console設定

### Phase 9: 今回の作業 🆕

#### 1. 年号入力サジェスト機能
- ✅ 既存の年号リストを自動抽出
- ✅ `<datalist>`による入力補完
- ✅ 入力しながら既存年号を選択可能に

#### 2. 編集ボタンのバグ修正
- ✅ カテゴリフィルター使用時のインデックスずれを修正
- ✅ `_originalIdx`を使用して正しいアイテムを編集

#### 3. その他イベントカテゴリ追加
- ✅ 📌 その他イベント（グレー）を追加
- ✅ 東京オリンピック等の重大でないイベント用

#### 4. URLルーティング導入 ⭐重要
- ✅ react-router-dom インストール・設定
- ✅ index.js に BrowserRouter 追加
- ✅ vercel.json でSPAルーティング対応
- ✅ 記事一覧ページを削除

---

## 🌐 URL構成

| URL | ページ | 状態 |
|-----|--------|------|
| `https://cinechrono.com/` | 年表（トップ） | ✅ 実装済み |
| `https://cinechrono.com/about` | CINEchrono TRAVELとは | ✅ 実装済み |
| `https://cinechrono.com/articles` | トピック記事 | ⏳ 今後実装予定 |

---

## 📂 現在のファイル構成

```
cinechrono/
├── public/
│   ├── index.html          # GA4トラッキングコード含む
│   └── favicon.ico
├── src/
│   ├── App.js              # メインコード（2719行）
│   ├── firebase.js         # Firebase設定ファイル
│   ├── index.js            # BrowserRouter設定 🆕
│   └── index.css           # Tailwind CSS
├── vercel.json             # SPAルーティング設定 🆕
├── node_modules/
├── package.json
├── tailwind.config.js
└── .gitignore
```

---

## 🔧 ルーティング実装詳細

### index.js
```jsx
import { BrowserRouter } from 'react-router-dom';

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

### App.js（ページ判定部分）
```jsx
import { useLocation, useNavigate } from 'react-router-dom';

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // URLからページを判定
  const page = location.pathname === '/about' ? 'about' : 'timeline';
  
  // ナビゲーション例
  navigate('/');        // トップへ
  navigate('/about');   // Aboutへ
};
```

### vercel.json（SPAルーティング）
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

---

## 🚀 新規ページ追加方法（今後の参考）

### 方法1: App.js内に追加（簡単）
```jsx
// 1. ページ判定を追加
const page = location.pathname === '/about' ? 'about' 
           : location.pathname === '/articles' ? 'articles'
           : 'timeline';

// 2. メニューに追加
{[['/', '年表と物語'], ['/about', 'CINEchrono TRAVELとは'], ['/articles', 'トピック記事']].map(...)}

// 3. 表示部分を追加
{page === 'articles' && (
  <div>トピック記事ページの内容</div>
)}
```

### 方法2: 別ファイルに分離（推奨）
```
src/
├── App.js
├── pages/
│   ├── Timeline.js      # 年表ページ
│   ├── About.js         # Aboutページ
│   └── Articles.js      # トピック記事ページ 🆕
└── firebase.js
```

**Articles.js の例:**
```jsx
import React from 'react';

const Articles = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        トピック記事
      </h1>
      {/* 記事一覧 */}
    </div>
  );
};

export default Articles;
```

**App.js でインポート:**
```jsx
import Articles from './pages/Articles';

// 表示部分
{page === 'articles' && <Articles />}
```

---

## 🔥 Firebase 設定情報

### プロジェクト情報
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDyJ6IhfEAf6Bsf7LTQ5YByG8T-ou6cXwE",
  authDomain: "cinechrono-1c1a8.firebaseapp.com",
  projectId: "cinechrono-1c1a8",
  storageBucket: "cinechrono-1c1a8.firebasestorage.app",
  messagingSenderId: "1029924381560",
  appId: "1:1029924381560:web:5c36f1b9ac2ed2f7a09e8d"
};
```

### Firebase Console
- URL: https://console.firebase.google.com/project/cinechrono-1c1a8

### 管理者アカウント
- メールアドレス: `hi6.chi.330018@gmail.com`

### Firestoreコレクション
| コレクション | 用途 |
|-------------|------|
| `timeline` | 年表データ（作品・時代区分・イベント） |
| `settings` | グローバル設定（アフィリエイト表示等） |

---

## 📊 Google Analytics 4 設定

| 項目 | 値 |
|------|-----|
| アカウント | cinechrono (378013636) |
| プロパティ | CINEchrono (516865667) |
| 測定ID | G-Z97NXZ5KV4 |
| ダッシュボード | https://analytics.google.com |

---

## 🔍 Google Search Console 設定

| 項目 | 値 |
|------|-----|
| プロパティ | cinechrono.com（ドメイン） |
| 所有権確認方法 | DNS TXTレコード |
| TXTレコード | `google-site-verification=kuJMSdVpnTkWQFVWU9CCpvZBDay8NvQ3W5F3JZUpzOQ` |
| ダッシュボード | https://search.google.com/search-console |

---

## 🎯 時代区分・イベントタイプ一覧

| タイプ | ID | アイコン | 色 |
|--------|-----|---------|-----|
| 時代区分 | normal | 🕐 | グレー |
| 戦争・紛争 | war | ⚔️ | 赤 |
| 事件 | incident | ❗ | 赤 |
| 疫病・災害 | plague | 💀 | グレー |
| 条約・宣言 | treaty | 📜 | グレー |
| その他イベント | event | 📌 | グレー 🆕 |

---

## 🔄 更新フロー

### コード更新時
```bash
# 1. ファイルを編集
# 2. ローカルで確認
cd /Users/hiroec/Desktop/cinechrono
npm start

# 3. Gitにコミット・プッシュ
git add .
git commit -m "機能追加: ○○"
git push

# 4. Vercelが自動デプロイ（1-2分）
```

### パッケージ追加時
```bash
npm install パッケージ名
```

---

## 🚀 次のステップ

### 直近のタスク
- ⏳ GA4とSearch Consoleの連携
- ⏳ プライバシーポリシーページ作成
- ⏳ アフィリエイトプログラム申請

### 今後の機能追加案
- トピック記事ページ（/articles）
- 検索機能
- お気に入り機能
- ファイル分割（App.jsの軽量化）

---

## 🛠️ トラブルシューティング

### よくあるエラー

**1. `npm start` でエラー**
```bash
rm -rf node_modules package-lock.json
npm install
npm start
```

**2. Gitプッシュでエラー（HTTP 400）**
```bash
git config http.postBuffer 524288000
git push
```

**3. /about でページが表示されない（本番環境）**
- vercel.json が正しく配置されているか確認
- Vercelの再デプロイを試す

**4. Module not found: react-router-dom**
```bash
npm install react-router-dom
```

---

## 📞 次のチャットで伝えること

「CINEchrono TRAVELの開発を続けたい。引き継ぎドキュメントがある。URLルーティング導入・年号サジェスト機能完了済み。次は○○をしたい。」

と伝えれば、Claudeがスムーズに対応します！

---

## 📝 重要なメモ

| 項目 | 内容 |
|------|------|
| ローカルパス | `/Users/hiroec/Desktop/cinechrono` |
| GitHub | https://github.com/chiroe203/cinechrono |
| Firebase Project ID | `cinechrono-1c1a8` |
| 管理者メール | hi6.chi.330018@gmail.com |
| Firebase Console | https://console.firebase.google.com/project/cinechrono-1c1a8 |
| Vercel URL | https://cinechrono-lemon.vercel.app |
| 本番ドメイン | https://cinechrono.com |
| ドメイン管理 | さくらインターネット |
| GA4測定ID | G-Z97NXZ5KV4 |
| Search Console | https://search.google.com/search-console |

---

## 🎊 現在の進捗: 99%

- ✅ プロジェクト作成
- ✅ コード実装
- ✅ GitHub 連携
- ✅ Firebase データベース連携
- ✅ Vercel デプロイ
- ✅ ドメイン接続
- ✅ アフィリエイトリンクシステム拡張
- ✅ イベントシステム再設計
- ✅ アフィリエイト表示設定機能
- ✅ 年表ソートロジック修正
- ✅ アフィリエイトUI改善
- ✅ Google Analytics 4 導入
- ✅ 電子書籍サービス拡充
- ✅ 親子関係機能実装
- ✅ parseYear関数改善
- ✅ Google Search Console設定
- ✅ URLルーティング導入 🆕
- ✅ 年号入力サジェスト機能 🆕
- ✅ 編集ボタンバグ修正 🆕
- ✅ その他イベントカテゴリ追加 🆕
- ⏳ コンテンツ充実
- ⏳ アフィリエイトプログラム申請

---

## 📅 更新履歴

| 日時 | 内容 |
|------|------|
| 2024/12/18 | プロジェクト作成、GitHub連携完了 |
| 2024/12/18 23:30 | Firebase Authentication・Firestore連携完了 |
| 2024/12/19 10:30 | サムネイル機能・世紀区切り線追加、Vercelデプロイ完了 |
| 2024/12/19 23:45 | アフィリエイト拡張、イベント統合、表示設定機能追加 |
| 2024/12/20 01:30 | 年表ソートロジック修正、アフィリエイトUI全面リデザイン |
| 2024/12/20 18:30 | GA4導入、電子書籍サービス拡充、親子関係機能実装、parseYear改善 |
| 2024/12/21 01:30 | Search Console設定、Aboutページ更新、App.js構文修正 |
| 2024/12/21 19:00 | URLルーティング導入、年号サジェスト、編集バグ修正、その他イベント追加 🆕 |

---

## ✨ 完成イメージ

```
ユーザー
  ↓
cinechrono.com にアクセス（URLベースのナビゲーション）
  ↓
年表を閲覧 or Aboutページ
  ↓
作品クリック → アフィリエイトリンク
  ↓
購入 → 収益発生

管理者（あなた）
  ↓
フッター歯車 → ログイン
  ↓
管理画面 → 年号入力時にサジェスト表示
  ↓
作品追加・編集
  ↓
Firebase に保存
  ↓
全ユーザーに即反映
```

---

頑張ってください！🚀
