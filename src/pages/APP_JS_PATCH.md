# App.js 修正手順書

以下の4箇所を手動で修正してください。

---

## 修正1: インポート文に Articles を追加（1行目の後）

**場所**: ファイルの先頭付近、他のimport文の後

**追加するコード**:
```javascript
import Articles from './pages/Articles';
```

**修正後のイメージ（6行目の後に追加）**:
```javascript
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import Articles from './pages/Articles';  // ← この行を追加
```

---

## 修正2: page判定ロジックに articles を追加

**場所**: 13-15行目付近

**修正前**:
```javascript
  // URLからページを判定
  const page = location.pathname === '/about' ? 'about' 
             : location.pathname === '/request' ? 'request'
             : 'timeline';
```

**修正後**:
```javascript
  // URLからページを判定
  const page = location.pathname === '/about' ? 'about' 
             : location.pathname === '/request' ? 'request'
             : location.pathname.startsWith('/articles') ? 'articles'
             : 'timeline';
```

---

## 修正3: メニューに articles リンクを追加

**場所**: 1494行目付近

**修正前**:
```javascript
{menu && <div className="bg-white border-t">{[['/', '年表と物語'], ['/about', 'CINEchrono TRAVELとは'], ['/request', '📝 作品リクエスト']].map(([path, name]) => ...
```

**修正後**:
```javascript
{menu && <div className="bg-white border-t">{[['/', '年表と物語'], ['/articles', '📚 トピック記事'], ['/about', 'CINEchrono TRAVELとは'], ['/request', '📝 作品リクエスト']].map(([path, name]) => ...
```

**注意**: 配列に `['/articles', '📚 トピック記事']` を追加するだけです。

---

## 修正4: ページ表示部分に Articles を追加

**場所**: 2301行目付近（`{page === 'request' && ...}` の閉じタグ `)}` の後）

**追加するコード**:
```javascript
        {page === 'articles' && <Articles />}
```

**修正後のイメージ**:
```javascript
        {page === 'request' && (
          ... 省略 ...
        )}

        {page === 'articles' && <Articles />}
      </div>

      <footer className="bg-gray-900 ...
```

---

## 修正完了後の確認

1. `npm start` でローカル確認
2. http://localhost:3000/articles にアクセス
3. 記事一覧が表示されることを確認

---

## フォルダ構成（新規作成ファイル）

新しく追加するファイル:
```
src/
├── libs/
│   └── microcms.js     ← 新規作成
└── pages/
    └── Articles.js     ← 新規作成
```

これらのファイルはダウンロードして配置してください。
