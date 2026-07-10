# Gemini画像自動生成スクリプト — Gold Home HP

## 🗂️ .env ファイルの保存場所

**必ず以下のパスに保存してください**：

```
C:\Users\takum\Documents\作業フォルダ\SourceTree\goldhome.hp_official\scripts\.env
```

同じフォルダにある `.env.example` をコピーして名前を `.env` に変えるのが一番簡単です。

### 保存手順（Windows エクスプローラー）

1. エクスプローラーで以下のフォルダを開く：
   `C:\Users\takum\Documents\作業フォルダ\SourceTree\goldhome.hp_official\scripts\`
2. `.env.example` を右クリック → 「コピー」
3. 同じフォルダで右クリック → 「貼り付け」
4. コピー後のファイル（`.env.example - コピー` 等）を右クリック → 「名前の変更」
5. 名前を **`.env`**（先頭ドット、拡張子なし）に変更
   - もし「拡張子を変更しますか」と聞かれたら「はい」
6. `.env` をメモ帳で開く
7. `GEMINI_API_KEY=` の後に、AI Studio で取得したキー（`AIzaSy...`）を貼り付け
8. 上書き保存（メモ帳で保存時、文字コードは UTF-8 で保存）

### 保存後の中身の例（表示イメージ）

```
GEMINI_API_KEY=AIzaSyABC123...（実際のキー）
GEMINI_MODEL=gemini-2.5-flash-image-preview
```

## 🔑 APIキーの取得手順

1. https://aistudio.google.com/apikey にアクセス
2. Google アカウントでログイン
3. 「Create API key」→ 新規プロジェクトで作成
4. 表示された `AIzaSy...` から始まる文字列をコピー
5. 上記手順で `.env` に貼り付け

## ✅ 保存完了したら

**Claude Code のチャットで「.env設定した」とお伝えください。**
私が動作確認 → スクリプト実行 → 全18枚の生成 → HP差し替え → GitHub反映まで対応します。

## 🔒 セキュリティ

- `.env` は `.gitignore` に登録済み → **GitHub には絶対にアップされません**
- キーは絶対に Chatwork/メール/チャットに貼らないでください
- キーが漏れた場合は AI Studio でキーを再生成してください

## 📋 このフォルダの構成

```
scripts/
├─ .env.example              テンプレート（コミット可・現在の状態）
├─ .env                       ← あなたが作成するファイル（Git無視）
├─ README.md                  この説明書
├─ requirements.txt           Python依存パッケージ（後から追加）
├─ prompts.json               18枚分のプロンプト（後から追加）
└─ generate_images.py         生成スクリプト本体（後から追加）
```

`.env` 以外のファイルは、貴社が .env を設定完了後に私が作成・実行します。
