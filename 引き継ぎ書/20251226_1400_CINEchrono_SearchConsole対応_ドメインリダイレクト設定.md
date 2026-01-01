# CINEchrono TRAVEL 引き継ぎ書
## Google Search Console対応 & ドメインリダイレクト設定（2025/12/26）

---

## プロジェクト情報

| 項目 | 値 |
|------|-----|
| ローカルパス | `/Users/hiroec/Desktop/cinechrono` |
| GitHub | https://github.com/chiroe203/cinechrono |
| 本番URL | https://cinechrono.com |
| Firebase Project | cinechrono-1c1a8 |
| GA4測定ID | G-Z97NXZ5KV4 |

---

## 今回のセッションで完了した作業

### 1. Google Search Console問題の対応 ⭐

#### 発生した問題
Google Search Consoleから以下の通知を受信：
- 「ページにリダイレクトがあります」
- 「重複しています。ユーザーにより、正規ページとして選択されていません」

#### 原因
`www.cinechrono.com` と `cinechrono.com` の両方が存在し、Googleが重複コンテンツとして検出。

#### 解決策
Vercelダッシュボードで `www` → `non-www` への308リダイレクトを設定。

---

### 2. Vercelドメイン設定 ⭐

#### 最終的な設定状態

| ドメイン | 設定 | 状態 |
|---------|------|------|
| `cinechrono.com` | Production | ✅ メインサイト |
| `www.cinechrono.com` | 308 → cinechrono.com | ✅ リダイレクト |
| `cinechrono-lemon.vercel.app` | Production | ✅ Vercelデフォルト |

#### 設定手順（参考）

1. https://vercel.com/dashboard にログイン
2. cinechronoプロジェクトを選択
3. **Settings** → **Domains** を開く
4. `www.cinechrono.com` の **Edit** をクリック
5. **「Redirect to Another Domain」** を選択
6. リダイレクトタイプ: **308 Permanent**
7. リダイレクト先: **cinechrono.com**
8. **Save** をクリック

---

### 3. vercel.json について

#### ⚠️ 注意事項
vercel.jsonでのリダイレクト設定を試みたが、サイトが表示されなくなる問題が発生。

#### 現在の安全な設定（変更不要）
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

#### 教訓
- wwwリダイレクトはvercel.jsonではなく**Vercelダッシュボード**で設定する
- vercel.jsonはSPAのルーティング用途のみに使用

---

### 4. 前回からの継続: トリビア機能 & 現在年マーカー

#### トリビアの年号の扱い
- 紫色の大きな年号ラベルは**非表示**（時代区分と同じ扱い）
- 年号はトリビアボックス内に概要として表示
- 説明的テキスト対応（例: 「1930年頃の中央アメリカ周辺」）

#### 現在年マーカー
- タイムライン縦線の左側に紫の三角矢印を表示
- 現在年（2025年）を超えた最初のアイテムの前に配置
- 年が変わると自動的に位置が更新される

---

## Search Console検証状況

| 項目 | 状態 |
|------|------|
| 検証開始日 | 2025/12/25 |
| 対応完了日 | 2025/12/26 |
| 検証結果 | 待機中（数日〜2週間） |

Googleの再クロール完了後、自動的に検証が通る見込み。

---

## DNS Change Recommended について

Vercelダッシュボードに表示されている黄色い警告：
- 「DNS Change Recommended」
- これは**機能には影響なし**
- DNSレコードの最適化を推奨しているだけ
- 気になる場合はドメイン管理画面（さくらなど）でAレコードを更新

推奨されるAレコード：
```
Type: A
Name: @
Value: 216.198.79.1
```

---

## 現在のファイル構成

```
cinechrono/
├── public/
│   ├── index.html          # GA4トラッキングコード含む
│   └── favicon.ico
├── src/
│   ├── App.js              # メインコード（約3170行）
│   ├── firebase.js         # Firebase設定
│   ├── index.js            # BrowserRouter設定
│   └── index.css           # Tailwind CSS
├── vercel.json             # SPAルーティング設定のみ
├── package.json
├── tailwind.config.js
└── .gitignore
```

---

## トラブルシューティング

### サイトが真っ白になった場合
1. vercel.jsonを確認
2. 以下のシンプルな設定に戻す：
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```
3. `git add . && git commit -m "fix" && git push`

### Search Consoleで新しいエラーが出た場合
1. エラー内容を確認
2. 該当URLを特定
3. Vercelダッシュボードで対応

---

## 今後の確認事項

- [ ] Search Console検証完了通知を待つ
- [ ] 検証完了後、インデックス登録状況を確認
- [ ] 必要に応じてDNSレコードを最適化

---

## 関連ドキュメント

- 前回の引き継ぎ書: `20251222_0050_CINEchrono_トリビア機能完成_現在年マーカー.md`

---

## 作成日時
2025年12月26日 14:00

## 作成者
Claude（Anthropic）
