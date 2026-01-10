# CINEchrono TRAVEL 引き継ぎ書
## RAWG・TMDB API連携 & ひとことTips機能（2026/01/10）

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

### 1. RAWG API連携（ゲーム情報自動取得）⭐

英語タイトルを入力すると、ゲームのプラットフォーム・リリース日を自動取得して表示。

| 項目 | 値 |
|------|-----|
| API | RAWG Video Games Database |
| APIキー | `1fd507dc8cf84472a682eb0f6c1ad2f6` |
| 取得情報 | プラットフォーム、初リリース日 |
| 無料枠 | 月20,000リクエスト |

### 2. TMDB API連携（映画・ドラマ・アニメ情報自動取得）⭐

タイトルを入力すると、作品情報を自動取得して表示。

| 項目 | 値 |
|------|-----|
| API | The Movie Database (TMDB) |
| APIキー | `93f9dffd23f8e06c020b3f5f0d7d187d` |
| 無料枠 | 無制限（個人利用） |

#### TMDB対応カテゴリと取得情報

| カテゴリ | 取得情報 |
|---------|---------|
| 🎬 映画 | 公開日、上映時間、監督、あらすじ |
| 📺 ドラマ | 初回放送日、シーズン数、話数、1話あたりの時間、クリエイター、あらすじ |
| 📺 アニメ | 初回放送日、シーズン数、話数、1話あたりの時間、クリエイター、あらすじ |

### 3. 英語タイトルの扱い

| カテゴリ | 英語タイトル | 動作 |
|---------|-------------|------|
| 🎮 ゲーム | **必須** | 英語タイトルでRAWG検索 |
| 🎬 映画 | 任意 | 英語があれば英語で、なければ日本語タイトルでTMDB検索 |
| 📺 ドラマ | 任意 | 同上 |
| 📺 アニメ | 任意 | 同上 |

### 4. 監督名での絞り込み機能（映画のみ）

同名映画がある場合（例：ロビン・フッド）、監督名を入力することで正しい作品を特定可能。

### 5. 「ひとことTips」機能

| フィールド | 表示名 | 用途 |
|-----------|--------|------|
| 手動入力（synopsis） | 💡 ひとことTips | 自分で書いた補足・見どころ・関連情報など |
| TMDB自動取得（overview） | あらすじ | 映画・ドラマ・アニメの公式あらすじ |

---

## 表示イメージ

### 映画の場合
```
┌─────────────────────────────────────┐
│ ロビン・フッド (2010年の映画)       │
│ 英語タイトル: Robin Hood            │
│                                     │
│ [YouTube埋め込み]                   │
│                                     │
│ あらすじ                            │
│ 12世紀のイングランド。十字軍の...    │  ← TMDB自動取得
│                                     │
│ 💡 ひとことTips                     │
│ 同リドリー・スコット監督の...        │  ← 手動入力
│                                     │
│ 📅 公開日：2010年5月12日            │
│ ⏱️ 上映時間：2時間20分              │
│ 🎬 監督：リドリー・スコット          │
└─────────────────────────────────────┘
```

### アニメの場合
```
┌─────────────────────────────────────┐
│ 進撃の巨人                          │
│                                     │
│ あらすじ                            │
│ 人類は突如現れた「巨人」により...    │  ← TMDB自動取得
│                                     │
│ 💡 ひとことTips                     │
│ 原作漫画の1巻〜8巻相当...            │  ← 手動入力
│                                     │
│ 📅 初回放送：2013年4月7日            │
│ 📺 シーズン数：4シーズン（全87話）   │
│ ⏱️ 1話あたり：約24分                │
└─────────────────────────────────────┘
```

### ゲームの場合
```
┌─────────────────────────────────────┐
│ アサシン クリード オデッセイ        │
│ 英語タイトル: Assassin's Creed...   │
│                                     │
│ 💡 ひとことTips                     │
│ 古代ギリシアを舞台にした...          │  ← 手動入力のみ
│                                     │
│ 📅 初リリース日：2018年10月5日       │
│ 🎮 プラットフォーム：PC、Xbox...     │
└─────────────────────────────────────┘
```

---

## ファイル構成

```
cinechrono/
├── src/
│   ├── App.js              # メインコード
│   ├── firebase.js         # Firebase設定
│   ├── index.js            # BrowserRouter設定
│   ├── index.css           # Tailwind CSS
│   ├── libs/               
│   │   ├── microcms.js     # microCMS API接続
│   │   ├── rawg.js         # RAWG API接続（ゲーム）
│   │   └── tmdb.js         # TMDB API接続（映画・ドラマ・アニメ）
│   └── pages/              
│       └── Articles.js     # 記事ページ
├── .env.local              # 環境変数（Git除外）
├── vercel.json             # SPAルーティング設定
└── ...
```

---

## 環境変数設定

### .env.local（ローカル）
```
# microCMS
REACT_APP_MICROCMS_SERVICE_DOMAIN=cinechrono
REACT_APP_MICROCMS_API_KEY=（microCMS APIキー）

# RAWG API（ゲーム情報）
REACT_APP_RAWG_API_KEY=1fd507dc8cf84472a682eb0f6c1ad2f6

# TMDB API（映画・ドラマ・アニメ情報）
REACT_APP_TMDB_API_KEY=93f9dffd23f8e06c020b3f5f0d7d187d
```

### Vercel環境変数（本番）
| Key | Value | Note |
|-----|-------|------|
| `REACT_APP_MICROCMS_SERVICE_DOMAIN` | `cinechrono` | microCMS |
| `REACT_APP_MICROCMS_API_KEY` | （APIキー） | microCMS |
| `REACT_APP_RAWG_API_KEY` | `1fd507dc8cf84472a682eb0f6c1ad2f6` | ゲーム情報 |
| `REACT_APP_TMDB_API_KEY` | `93f9dffd23f8e06c020b3f5f0d7d187d` | 映画・ドラマ・アニメ情報 |

---

## 管理画面フォームの変更点

### カテゴリ別入力欄

| カテゴリ選択 | 表示される入力欄 |
|-------------|----------------|
| 🎮 ゲーム | 英語タイトル（黄色枠・必須） |
| 🎬 映画 | 英語タイトル（青枠・任意）、監督名（グレー枠・任意） |
| 📺 ドラマ | 英語タイトル（青枠・任意） |
| 📺 アニメ | 英語タイトル（青枠・任意） |
| 📚 漫画 | なし |

### テキストエリアの変更
- 変更前：`あらすじ ※任意`
- 変更後：`💡 ひとことTips（任意）映画・ドラマ・アニメはTMDBからあらすじを自動取得します`

---

## 使い方

### 映画を登録する場合
1. 管理画面 → 作品タブ
2. 「🎬 映画」にチェック
3. タイトルを入力（日本語OK）
4. 英語タイトルは任意（日本語で見つからない場合に入力）
5. 同名映画がある場合は監督名を入力
6. 💡 ひとことTips に補足情報を入力（任意）
7. 保存 → モーダルであらすじ・公開日等が自動表示

### アニメ・ドラマを登録する場合
1. 管理画面 → 作品タブ
2. 「📺 アニメ」or「📺 ドラマ」にチェック
3. タイトルを入力（日本語OK）
4. 保存 → モーダルであらすじ・放送情報等が自動表示

### ゲームを登録する場合
1. 管理画面 → 作品タブ
2. 「🎮 ゲーム」にチェック
3. タイトル、**英語タイトル（必須）**を入力
4. 💡 ひとことTips にあらすじ・補足を入力（手動）
5. 保存 → モーダルでプラットフォーム情報が自動表示

---

## デプロイ手順

```bash
cd /Users/hiroec/Desktop/cinechrono

# 変更を確認
git status

# コミット
git add .
git commit -m "RAWG・TMDB API連携、ひとことTips機能追加"

# プッシュ（Vercelが自動デプロイ）
git push
```

---

## トラブルシューティング

### 作品情報が取得できない場合

1. **npm startを再起動したか確認**
   - 環境変数は再起動しないと読み込まれない

2. **タイトルが正しいか確認**
   - TMDBで検索して正しいタイトルを確認
   - 日本語で見つからない場合は英語タイトルを追加

3. **ブラウザのConsoleでエラー確認**
   - F12 → Consoleタブ

### 同名作品で違う作品が表示される場合（映画）

監督名を入力して絞り込む
- 例：「Robin Hood」+ 「Ridley Scott」

---

## API管理画面

| API | 管理画面URL |
|-----|-------------|
| RAWG | https://rawg.io/apidocs |
| TMDB | https://www.themoviedb.org/settings/api |

---

## 今後の拡張案

- 漫画情報API連携（AniList等）
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
2026年1月10日 20:10

## 作成者
Claude（Anthropic）
