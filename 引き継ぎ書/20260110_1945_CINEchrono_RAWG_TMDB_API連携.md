# CINEchrono TRAVEL 引き継ぎ書
## RAWG API・TMDB API連携：ゲーム＆映画情報自動取得（2026/01/10）

---

## プロジェクト情報

| 項目 | 値 |
|------|-----|
| ローカルパス | `/Users/hiroec/Desktop/cinechrono` |
| GitHub | https://github.com/chiroe203/cinechrono |
| 本番URL | https://cinechrono.com |
| Firebase Project | cinechrono-1c1a8 |
| GA4測定ID | G-Z97NXZ5KV4 |
| microCMS | https://cinechrono.microcms.io |

---

## 今回のセッションで完了した作業

### 1. RAWG API連携（ゲーム情報自動取得）⭐新規

英語タイトルを入力すると、ゲームのプラットフォーム・リリース日を自動取得して表示。

| 項目 | 値 |
|------|-----|
| API | RAWG Video Games Database |
| APIキー | `1fd507dc8cf84472a682eb0f6c1ad2f6` |
| 取得情報 | プラットフォーム、初リリース日 |
| 無料枠 | 月20,000リクエスト |

#### 表示例
```
📅 初リリース日：2018年10月5日
🎮 プラットフォーム：PC、Xbox One、PlayStation 4、Nintendo Switch
```

### 2. TMDB API連携（映画情報自動取得）⭐新規

英語タイトルを入力すると、映画の公開日・上映時間・監督を自動取得して表示。

| 項目 | 値 |
|------|-----|
| API | The Movie Database (TMDB) |
| APIキー | `93f9dffd23f8e06c020b3f5f0d7d187d` |
| 取得情報 | 公開日、上映時間、監督 |
| 無料枠 | 無制限（個人利用） |

#### 表示例
```
📅 公開日：2000年5月5日
⏱️ 上映時間：2時間35分
🎬 監督：Ridley Scott
```

### 3. 英語タイトルフィールド追加

管理画面の作品追加フォームに「英語タイトル」入力欄を追加。

| カテゴリ | 入力欄の色 | 検索API |
|---------|-----------|---------|
| 🎮 ゲーム | 黄色枠 | RAWG |
| 🎬 映画 | 青色枠 | TMDB |

#### 動作フロー
```
管理画面で作品登録
  ↓
カテゴリで「ゲーム」or「映画」を選択
  ↓
英語タイトル入力欄が表示される
  ↓
英語タイトルを入力して保存
  ↓
詳細モーダルを開く
  ↓
API自動取得 → 情報表示
```

---

## 新規作成ファイル

```
src/
├── libs/
│   ├── microcms.js     ← 既存
│   ├── rawg.js         ← 🆕 RAWG API接続
│   └── tmdb.js         ← 🆕 TMDB API接続
├── pages/
│   └── Articles.js     ← 既存
├── App.js              ← 修正（API連携追加）
└── ...
```

### rawg.js
- `searchGame(gameName)` - ゲーム検索＆情報取得
- `formatReleaseDate(dateStr)` - 日付フォーマット

### tmdb.js
- `searchMovie(movieName)` - 映画検索＆情報取得
- `formatMovieReleaseDate(dateStr)` - 日付フォーマット
- `formatRuntime(minutes)` - 上映時間フォーマット

---

## 環境変数設定

### .env.local（ローカル）
```
# microCMS
REACT_APP_MICROCMS_SERVICE_DOMAIN=cinechrono
REACT_APP_MICROCMS_API_KEY=（microCMS APIキー）

# RAWG API（ゲーム情報）
REACT_APP_RAWG_API_KEY=1fd507dc8cf84472a682eb0f6c1ad2f6

# TMDB API（映画情報）
REACT_APP_TMDB_API_KEY=93f9dffd23f8e06c020b3f5f0d7d187d
```

### Vercel環境変数（本番）
| Key | Value | Note |
|-----|-------|------|
| `REACT_APP_MICROCMS_SERVICE_DOMAIN` | `cinechrono` | microCMS |
| `REACT_APP_MICROCMS_API_KEY` | （APIキー） | microCMS |
| `REACT_APP_RAWG_API_KEY` | `1fd507dc8cf84472a682eb0f6c1ad2f6` | ゲーム情報 |
| `REACT_APP_TMDB_API_KEY` | `93f9dffd23f8e06c020b3f5f0d7d187d` | 映画情報 |

---

## App.jsの主な変更点

### 1. インポート追加
```javascript
import { searchGame, formatReleaseDate } from './libs/rawg';
import { searchMovie, formatMovieReleaseDate, formatRuntime } from './libs/tmdb';
```

### 2. State追加
```javascript
// ゲーム情報
const [gameInfo, setGameInfo] = useState(null);
const [gameInfoLoading, setGameInfoLoading] = useState(false);

// 映画情報
const [movieInfo, setMovieInfo] = useState(null);
const [movieInfoLoading, setMovieInfoLoading] = useState(false);
```

### 3. cfフォームにenglishTitle追加
```javascript
const [cf, setCf] = useState({ 
  categories: ['movie'], 
  historyCategories: ['world'], 
  title: '', 
  englishTitle: '',  // 追加
  ...
});
```

### 4. useEffectで選択時にAPI取得
```javascript
// ゲーム情報取得
useEffect(() => {
  if (sel && sel.type includes 'game' && sel.englishTitle) {
    fetchGameInfo(sel.englishTitle);
  }
}, [sel]);

// 映画情報取得
useEffect(() => {
  if (sel && sel.type includes 'movie' && sel.englishTitle) {
    fetchMovieInfo(sel.englishTitle);
  }
}, [sel]);
```

---

## ファイル構成（更新後）

```
cinechrono/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── App.js              # メインコード（修正済み）
│   ├── firebase.js         # Firebase設定
│   ├── index.js            # BrowserRouter設定
│   ├── index.css           # Tailwind CSS
│   ├── libs/               
│   │   ├── microcms.js     # microCMS API接続
│   │   ├── rawg.js         # 🆕 RAWG API接続
│   │   └── tmdb.js         # 🆕 TMDB API接続
│   └── pages/              
│       └── Articles.js     # 記事ページ
├── .env.local              # 環境変数（Git除外）
├── vercel.json             # SPAルーティング設定
├── package.json
├── tailwind.config.js
└── .gitignore
```

---

## デプロイ手順

```bash
cd /Users/hiroec/Desktop/cinechrono

# 変更を確認
git status

# コミット
git add .
git commit -m "RAWG・TMDB API連携：ゲーム＆映画情報自動取得"

# プッシュ（Vercelが自動デプロイ）
git push
```

---

## 使い方

### ゲームに英語タイトルを追加
1. 管理画面 → 作品タブ
2. 既存のゲームを編集、または新規追加
3. カテゴリで「🎮 ゲーム」にチェック
4. 黄色枠の「英語タイトル」欄に英語名を入力
   - 例：`Assassin's Creed Odyssey`
5. 保存
6. 詳細モーダルでプラットフォーム情報が表示される

### 映画に英語タイトルを追加
1. 管理画面 → 作品タブ
2. 既存の映画を編集、または新規追加
3. カテゴリで「🎬 映画」にチェック
4. 青色枠の「英語タイトル」欄に英語名を入力
   - 例：`Gladiator`
5. 保存
6. 詳細モーダルで公開日・上映時間・監督が表示される

---

## トラブルシューティング

### 情報が取得できない場合

1. **npm startを再起動したか確認**
   - 環境変数は再起動しないと読み込まれない

2. **英語タイトルが正しいか確認**
   - RAWGやTMDBで検索して正しい英語名を確認
   - 例：「アサシンクリード」ではなく「Assassin's Creed Odyssey」

3. **ブラウザのConsoleでエラー確認**
   - F12 → Consoleタブ

### 本番で動かない場合

1. Vercelの環境変数が設定されているか確認
2. 設定後、Redeployが必要な場合あり

---

## API管理画面

| API | 管理画面URL |
|-----|-------------|
| RAWG | https://rawg.io/apidocs |
| TMDB | https://www.themoviedb.org/settings/api |

---

## 今後の拡張案

### API連携の拡張
- ドラマ情報（TMDB TV API対応）
- 漫画・アニメ情報（AniList API等）

### その他
- トピック記事ページの公開
- 検索機能
- お気に入り機能

---

## 重要なメモ

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
| microCMS管理画面 | https://cinechrono.microcms.io |
| microCMSサービスID | cinechrono |
| RAWG APIキー | 1fd507dc8cf84472a682eb0f6c1ad2f6 |
| TMDB APIキー | 93f9dffd23f8e06c020b3f5f0d7d187d |

---

## 関連ドキュメント

- 前回の引き継ぎ書: `20260110_1820_CINEchrono_microCMS連携_トピック記事ページ.md`

---

## 作成日時
2026年1月10日 19:45

## 作成者
Claude（Anthropic）
