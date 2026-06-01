# AI Character Chat — 実装TODO

## フェーズ 0: 事前準備（実装前に必ず決める）

- [x] キャラクターの名前・性格・口調・設定を決める（あかり / お姉さん系 / 丁寧語）
- [x] キャラクターのアイコン画像を用意し `public/avatar.svg` に配置する（プレースホルダー済み・要差し替え）
- [x] キャラクターが扱うトピックの制限をシステムプロンプトに明記する（雑談・趣味おすすめ）
- [x] `ANTHROPIC_API_KEY` を取得し `.env.local` に記入する

---

## フェーズ 1: プロジェクトセットアップ

- [x] `npx create-next-app@latest` でプロジェクト生成
  - TypeScript: Yes
  - Tailwind CSS: Yes
  - App Router: Yes
  - src/ ディレクトリ: Yes
  - import alias: Yes（`@/*`）
- [x] 不要なボイラープレートを削除（`app/page.tsx` のデフォルト内容、`globals.css` のサンプルスタイル）
- [x] `.env.local` を作成し `ANTHROPIC_API_KEY` を設定する
- [x] `.gitignore` に `.env.local` が含まれていることを確認する
- [x] `@anthropic-ai/sdk` をインストールする（`npm install @anthropic-ai/sdk`）

---

## フェーズ 2: 型定義とキャラクター設定

- [x] `src/types/chat.ts` を作成する
  - `Role` 型（`"user" | "assistant"`）
  - `Message` インターフェース（`id`, `role`, `content`）
- [x] `src/lib/character.ts` を作成する
  - `CHARACTER` オブジェクト（`name`, `avatarPath`, `systemPrompt`）
  - フェーズ0で決めた内容を反映する

---

## フェーズ 3: API Route Handler

- [x] `src/app/api/chat/route.ts` を作成する
  - `Anthropic` クライアントの初期化
  - `POST` ハンドラの実装
  - リクエストボディから `messages` を受け取る
  - `CHARACTER.systemPrompt` をシステムプロンプトとして設定
  - `client.messages.stream()` でストリーミングAPIを呼び出す
  - `stream.toReadableStream()` をそのままレスポンスとして返す
  - エラーハンドリング（APIエラー時に適切なHTTPステータスを返す）

---

## フェーズ 4: UIコンポーネント実装

### `CharacterAvatar.tsx`
- [x] キャラクターのアイコン画像（`next/image`）を表示する
- [x] `CHARACTER.name` をalt属性に使う
- [x] 丸型アイコンスタイルをTailwindで実装する

### `MessageBubble.tsx`
- [x] `Message` 型のpropsを受け取る
- [x] `role` に応じてユーザー側・キャラクター側で吹き出しの位置・色を切り替える
- [x] キャラクターのメッセージにはアイコンを横に表示する（`CharacterAvatar` を呼ぶ）
- [x] ストリーミング中の末尾カーソル表示（例：`▍`）に対応する

### `ChatWindow.tsx`
- [x] `Message[]` をpropsで受け取り一覧表示する
- [x] 最新メッセージへ自動スクロールする（`useEffect` + `scrollIntoView`）
- [x] メッセージが0件のときの初期表示（キャラクターの挨拶など）を出す

### `InputForm.tsx`
- [x] テキスト入力フォームを実装する
- [x] 送信ボタンを実装する
- [x] `isStreaming` フラグを受け取り、ストリーミング中は入力・送信を無効化する
- [x] `Enter` キーで送信できるようにする（`Shift+Enter` は改行）
- [x] 送信後に入力フィールドをクリアする

---

## フェーズ 5: メインページ（チャットロジック）

- [x] `src/app/page.tsx` を実装する
  - `messages` ステート（`Message[]`）を初期化する
  - `isStreaming` ステート（`boolean`）を管理する
  - `sendMessage` 関数を実装する
    - ユーザーメッセージを `messages` に追加する
    - `POST /api/chat` を fetch する
    - レスポンスの `ReadableStream` を `getReader()` で読み取る
    - チャンクを受け取るたびにアシスタントメッセージを逐次更新する（ストリーミング表示）
    - ストリーム完了後に `isStreaming` を `false` に戻す
  - `ChatWindow`, `InputForm` を配置する
  - ページ全体のレイアウトをTailwindで実装する（高さ100vh、フレックスカラム）

---

## フェーズ 6: スタイリングと仕上げ

- [x] `src/app/globals.css` でベーススタイルを設定する（フォント、背景色など）
- [x] `src/app/layout.tsx` でメタデータ（title、description）を設定する
- [x] モバイル・デスクトップのレスポンシブ表示を確認・調整する（`MessageBubble` の `max-w` をモバイル `82%` / デスクトップ `75%` に調整）
- [x] ダークモード対応が必要な場合は Tailwind の `dark:` クラスを追加する（全コンポーネントに `dark:` クラスを付与）
- [x] `globals.css` の `font-family: Arial` を削除し、`layout.tsx` で設定済みの Geist フォント変数（`var(--font-geist-sans)`）に統一する

---

## フェーズ 7: 動作確認

- [x] `npm run dev` でローカル起動する
- [x] ブラウザで `localhost:3000` を開きチャットが動作することを確認する
- [x] ストリーミングで文字がリアルタイムに流れることを確認する
- [x] ストリーミング中に送信ボタンが無効になることを確認する
- [x] ページをリロードすると会話がリセットされることを確認する（`useState` のみで管理・永続化なし。コードで保証済み）
- [x] モバイルサイズで表示崩れがないことを確認する
- [x] `npm run build` でビルドエラーがないことを確認する
- [x] `npm run lint` でLintエラーがないことを確認する

---

## フェーズ 8: 未実装・改善タスク（コードレビューで発見）

### エラーハンドリング
- [x] `page.tsx` — API エラー時にユーザーへフィードバックを表示する
  - catch ブロックでアシスタントメッセージを `isError: true` + エラー文言に更新
  - `MessageBubble` でエラーバブルを赤系スタイルで描画

### UX 改善
- [x] `InputForm.tsx` — textarea の自動高さ調整（auto-resize）を実装する
  - `useRef` + `onChange` で `height: auto` → `scrollHeight` にセット、送信後にリセット
- [x] `MessageBubble.tsx` — ファーストトークン受信前の「考え中」インジケーターを表示する
  - `isStreaming && content === ""` のとき3点バウンスアニメーションを表示
- [x] `page.tsx` — 会話リセットボタンを追加する
  - ヘッダー右端にゴミ箱アイコンボタンを配置、ストリーミング中・メッセージ0件は無効化

### バリデーション強化
- [x] `route.ts` — 各メッセージの `role` と `content` フィールドを検証する
  - `role` が `"user" | "assistant"`、`content` が空でない文字列であることを確認してから API へ渡す
