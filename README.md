# Gold Home 株式会社 コーポレートサイト

兵庫県尼崎市の内装リフォーム施工会社「Gold Home 株式会社」のコーポレートサイト（HP）です。

## サイト構成（13ページ）

| ページ | ファイル | 内容 |
|-------|---------|------|
| TOP | `index.html` | 玄関ページ |
| 私たちについて | `about.html` | 会社概要・代表挨拶・沿革・アクセス |
| サービス | `service.html` | 住宅リフォーム／店舗内装 |
| 施工事例 | `works.html` | 事例ギャラリー（フィルタ付） |
| 選ばれる理由 | `reason.html` | 3つの強み詳細 |
| 施工の流れ | `flow.html` | 8ステップ詳細 |
| 料金・費用 | `price.html` | 参考価格レンジ |
| お客様の声 | `voice.html` | Google口コミ連携 |
| よくある質問 | `faq.html` | 10問FAQ |
| お知らせ・ブログ | `blog.html` | 一覧 |
| お問い合わせ | `contact.html` | フォーム・LINE・電話 |
| プライバシーポリシー | `privacy.html` | 法務 |
| 特定商取引法に基づく表記 | `tokutei.html` | 法務＋クーリング・オフ |

## 技術構成

- 純粋な HTML + CSS + 一部 JavaScript（ビルド不要）
- レスポンシブ対応（880px でハンバーガー化・スマホは追従CTAバー）
- Google Fonts（Noto Sans JP / Noto Serif JP）
- 案A「実績重厚型」デザイン（ダークネイビー #0e1b2a × ゴールド #b8924f）

## フォルダ構成

```
goldhome.hp/
├─ index.html        （TOP）
├─ about.html 〜 tokutei.html （下層12ページ）
├─ css/
│   └─ common.css    （全ページ共通スタイル）
└─ images/
    ├─ 01_hero/            Hero背景 3点
    ├─ 02_works_住宅/      住宅事例 5点
    ├─ 03_works_店舗/      店舗事例 4点
    ├─ 04_service/         サービスカード 2点
    ├─ 05_flow_meeting/    施工の流れ 5点
    ├─ 06_representative/  代表挨拶 1点
    └─ 07_contact/         CTAブロック背景 1点
```

## デプロイ

このリポジトリは GitHub Pages でのホスティングを想定しています。
`.nojekyll` を配置しているため、Jekyll 処理はスキップされます。

## 画像について

現在の画像はすべてイメージ写真（ストック相当）です。<br>
今後、実案件の実写に順次差し替えていきます。各画像には「※イメージ写真」の注記を付けています。

## 制作

- 制作：ハウスインフォ IT事業部
- 担当：福永拓光
- 公開予定：2026年8月上旬
