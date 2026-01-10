# CINEchrono TRAVEL 引き継ぎ書
## microCMS連携：トピック記事ページ追加（2026/01/10）

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

### 1. microCMSアカウント作成・設定 ⭐新規

| 項目 | 値 |
|------|-----|
| サービス名 | CINEchrono |
| サービスID | cinechrono |
| API名 | ブログ |
| エンドポイント | blogs |
| 管理画面 | https://cinechrono.microcms.io |

### 2. トピック記事ページ実装 ⭐新規

microCMSと連携した記事ページを追加。

#### URL構成

| URL | ページ | 状態 |
|-----|--------|------|
| `https://cinechrono.com/` | 年表（トップ） | ✅ 既存 |
| `https://cinechrono.com/about` | CINEchrono TRAVELとは | ✅ 既存 |
| `https://cinechrono.com/request` | 作品リクエスト | ✅ 既存 |
| `https://cinechrono.com/articles` | トピック記事一覧 | 🆕 ローカル実装済み |
| `https://cinechrono.com/articles/[id]` | 記事詳細 | 🆕 ローカル実装済み |

### 3. UI修正 ⭐新規

#### ヘッダーフィルターの表示制御
- 日本史/世界史切り替えタブとカテゴリフィルターを**年表ページでのみ表示**
- トピック記事、About、リクエストページでは非表示に変更
- 理由：トピック記事のフィルターには使用できないためミスリード防止

#### メニューアイコン追加
| 修正前 | 修正後 |
|--------|--------|
| 年表と物語 | 🕰️ 年表と物語 |
| 📚 トピック記事 | 📚 トピック記事 |
| CINEchrono TRAVELとは | 📝 CINEchrono TRAVELとは |
| 📝 作品リクエスト | 💬 作品リクエスト |

### 4. 新規作成ファイル

```
src/
├── libs/
│   └── microcms.js     ← 🆕 microCMS API接続
├── pages/
│   └── Articles.js     ← 🆕 記事一覧・詳細ページ
├── App.js              ← 修正（ルーティング追加、フィルター表示制御、メニューアイコン）
└── ...
```

### 5. 環境変数設定

#### ローカル環境（.env.local）
```
REACT_APP_MICROCMS_SERVICE_DOMAIN=cinechrono
REACT_APP_MICROCMS_API_KEY=（APIキー）
```

#### Vercel環境変数（設定済み）
| Key | Value | 状態 |
|-----|-------|------|
| `REACT_APP_MICROCMS_SERVICE_DOMAIN` | `cinechrono` | ✅ 設定済み |
| `REACT_APP_MICROCMS_API_KEY` | （APIキー） | ✅ 設定済み |

---

## デプロイ状態

| 環境 | 状態 | 説明 |
|------|------|------|
| ローカル | ✅ 動作確認済み | `npm start` で確認 |
| 本番 | ⏳ 未デプロイ | `git push` で反映される |

### 本番公開手順

準備ができたら以下を実行：

```bash
cd /Users/hiroec/Desktop/cinechrono
git add .
git commit -m "microCMS連携：トピック記事ページ追加"
git push
```

Vercelが自動デプロイし、https://cinechrono.com/articles が公開されます。

---

## microCMSの使い方

### 記事を書く

1. https://cinechrono.microcms.io にアクセス
2. 左メニュー「ブログ」をクリック
3. 右上「+ 追加」をクリック
4. タイトル・本文・アイキャッチ画像を入力
5. 「公開」ボタンをクリック

### 記事のフィールド（標準）

| フィールド | 説明 |
|-----------|------|
| タイトル | 記事タイトル |
| 内容 | 本文（リッチエディタ） |
| アイキャッチ | サムネイル画像 |
| カテゴリ | 記事カテゴリ |

### カスタムフィールド追加（今後）

アフィリエイトリンク用のフィールドを追加する場合：

1. 左メニュー「ブログ」→ 右上「API設定」
2. 「スキーマ」タブ
3. 「フィールドを追加」

例：
- `affiliateLinks`（繰り返しフィールド）
  - `service`（テキスト）：Amazon, U-NEXT など
  - `url`（テキスト）：アフィリエイトURL

### カテゴリ設計（検討中）

記事の分類方法として以下を検討：

| カテゴリ | ID | 内容 |
|---------|-----|------|
| 時代記事 | T | 「1920年代アメリカ」「禁酒法」など時間軸で解説 |
| テーマ記事 | L | 「サンタンジェロ城」など場所・空間軸で横断 |
| 作品紹介 | F | 個別作品の紹介（映画・漫画・ゲーム問わず） |
| 感想・考察 | R | 評論・エッセイ・制作ノート |

※メディア種別（映画/漫画/ゲーム）ではなく「切り口」で分けることで、CINEchronoらしい横断的な記事構成が可能

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
│   ├── libs/               # 🆕
│   │   └── microcms.js     # microCMS API接続
│   └── pages/              # 🆕
│       └── Articles.js     # 記事ページコンポーネント
├── .env.local              # 🆕 環境変数（Git除外）
├── vercel.json             # SPAルーティング設定
├── package.json
├── tailwind.config.js
└── .gitignore              # .env.local追加済み
```

---

## App.jsの変更点

### 1. インポート追加（7行目付近）
```javascript
import Articles from './pages/Articles';
```

### 2. page判定にarticles追加（13-16行目付近）
```javascript
const page = location.pathname === '/about' ? 'about' 
           : location.pathname === '/request' ? 'request'
           : location.pathname.startsWith('/articles') ? 'articles'
           : 'timeline';
```

### 3. メニューにトピック記事追加（1495行目付近）
```javascript
[['/', '年表と物語'], ['/articles', '📚 トピック記事'], ['/about', 'CINEchrono TRAVELとは'], ['/request', '📝 作品リクエスト']]
```

### 4. Articlesページ表示追加（2303行目付近）
```javascript
{page === 'articles' && <Articles />}
```

---

## 今後の拡張案

### 記事機能の拡張
- カテゴリ別フィルター
- タグ機能
- 関連作品へのリンク
- アフィリエイトリンクフィールド追加
- サイドバナー広告

### その他
- SEO対策（メタタグ、OGP）
- 記事のシェアボタン
- 人気記事ランキング

---

## トラブルシューティング

### 「記事の取得に失敗しました」エラー

1. `.env.local`の内容を確認
2. `npm start`を再起動（環境変数読み込み）
3. microCMSのエンドポイントが`blogs`か確認
4. APIキーが正しいか確認

### ローカルで動くが本番で動かない

1. Vercelの環境変数が設定されているか確認
2. Redeployが必要な場合あり

### 新しい記事が表示されない

microCMSで「公開」状態になっているか確認。「下書き」は表示されません。

---

## 関連ドキュメント

- 前回の引き継ぎ書: `20251226_1400_CINEchrono_SearchConsole対応_ドメインリダイレクト設定.md`
- microCMS公式ドキュメント: https://document.microcms.io/

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

---

## 作成日時
2026年1月10日 18:20

## 作成者
Claude（Anthropic）
