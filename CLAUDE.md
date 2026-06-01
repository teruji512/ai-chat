# AI Character Chat — CLAUDE.md

## プロジェクト概要

固定キャラクターと会話するエンターテインメント向けのAIチャットアプリケーション。
Claude APIを使いキャラクターがリアルタイムで応答するシンプルなWebチャットUI。

## 技術スタック

| 項目 | 技術 |
|------|------|
| フレームワーク | Next.js (App Router) |
| UI | React + Tailwind CSS |
| AI API | Anthropic Claude API (`claude-sonnet-4-6`) |
| 言語 | TypeScript |
| デプロイ | ローカル開発のみ |

## アーキテクチャ方針

- **App Router** を使用する（`src/app/` 以下に配置）
- **サーバーアクション / Route Handler** でClaude APIを呼び出す（APIキーをクライアントに露出させない）
- 会話履歴は **Reactステート（useState）で管理**し、セッション外には保存しない
- ストリーミングレスポンスは `ReadableStream` + `useEffect` で受け取り、文字を逐次描画する

## 主要機能

### キャラクターチャット
- 固定の1キャラクターと会話する
- キャラクターのアイコン画像をチャット画面に表示する
- システムプロンプトでキャラクターの性格・口調・設定を定義する

### ストリーミング表示
- Claude APIのストリーミングAPIを使い、文字がリアルタイムで流れる演出にする
- Next.js Route Handler（`app/api/chat/route.ts`）でストリームをパイプスルーする

### シンプルUI
- ミニマルなデザイン、Tailwind CSSのみでスタイリング
- 余分なライブラリは使わない
- レスポンシブ対応（モバイル・デスクトップ）

## ディレクトリ構成

```
src/
├── app/
│   ├── page.tsx              # チャット画面（メインページ）
│   ├── layout.tsx
│   └── api/
│       └── chat/
│           └── route.ts      # Claude APIへのストリーミングルートハンドラ
├── components/
│   ├── ChatWindow.tsx        # メッセージ一覧表示
│   ├── MessageBubble.tsx     # 1件のメッセージ（ユーザー/キャラクター）
│   ├── InputForm.tsx         # テキスト入力フォーム
│   └── CharacterAvatar.tsx   # キャラクターアイコン
├── lib/
│   └── character.ts          # キャラクター設定（システムプロンプト・名前・アイコンパス）
└── types/
    └── chat.ts               # Message型など共通型定義
```

## キャラクター設定

`src/lib/character.ts` でキャラクターの情報を一元管理する。

```ts
export const CHARACTER = {
  name: "キャラクター名",
  avatarPath: "/avatar.png",      // public/ 以下に配置
  systemPrompt: `
    あなたは〇〇です。
    性格: ...
    口調: ...
    禁止事項: ...
  `,
} as const;
```

キャラクターを変更する場合はこのファイルだけ編集する。

## Claude API 統合

### Route Handler の実装方針

`app/api/chat/route.ts` でAnthropicクライアントを初期化し、ストリームをそのままレスポンスとして返す。

```ts
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic(); // ANTHROPIC_API_KEY は .env.local から自動読み込み

export async function POST(req: Request) {
  const { messages } = await req.json();
  const stream = await client.messages.stream({ ... });
  return new Response(stream.toReadableStream());
}
```

### 使用モデル

`claude-sonnet-4-6`（デフォルト）。変更する場合はRoute Handlerの `model` フィールドを書き換える。

### メッセージ型

```ts
// src/types/chat.ts
export type Role = "user" | "assistant";

export interface Message {
  id: string;
  role: Role;
  content: string;
}
```

## 環境変数

`.env.local` に以下を設定する（リポジトリにはコミットしない）。

```
ANTHROPIC_API_KEY=sk-ant-...
```

## 開発コマンド

```bash
npm install          # 依存インストール
npm run dev          # 開発サーバー起動 (localhost:3000)
npm run build        # プロダクションビルド
npm run lint         # ESLint 実行
```

## コーディングルール

- コメントは書かない。型名・変数名でコードの意図を表現する
- `any` 型は禁止。型が不明な場合は `unknown` を使い適切にナローイングする
- `console.log` はデバッグ後に必ず削除する
- クライアントコンポーネントに `ANTHROPIC_API_KEY` を渡さない。APIキーはRoute Handlerのみで使う
- `shadcn/ui` など追加UIライブラリは導入しない（Tailwind CSSのみ）
- ストリーミング受信中は送信ボタンを無効化し二重送信を防ぐ

## 未定事項（実装前に決める）

- [ ] キャラクターの名前・性格・口調・設定
- [ ] アイコン画像の用意（`public/avatar.png` に配置）
- [ ] キャラクターが扱うトピックの制限（システムプロンプトに明記）
