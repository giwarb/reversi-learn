# リバーシ学習アプリ

リバーシ（オセロ）をプレイしながら、悪手を検出して改善点を学習できるアプリケーションです。

## 機能

- 🎮 **リバーシゲーム**: 本格的なリバーシゲームをブラウザで楽しめます
- 🤖 **AI対戦**: 6段階の難易度から選べるAIと対戦できます
- 📊 **悪手検出**: プレイヤーが悪手を打った時に自動的に検出します
- 💡 **理由説明**: なぜその手が悪手なのか、日本語でわかりやすく説明します
- 🎯 **最善手提示**: AIが推奨する最善手を表示します

## 技術スタック

- **Frontend**: React + TypeScript
- **Build Tool**: Vite
- **Styling**: CSS
- **Testing**: Vitest + React Testing Library
- **Linting/Formatting**: Biome
- **AI**: ミニマックス法（アルファベータ枝刈り付き）

## 開発環境のセットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# テストの実行
npm test

# ビルド
npm run build

# リント
npm run lint

# フォーマット
npm run format
```

## プロジェクト構造

```
src/
├── ai/                  # AI関連のロジック
│   ├── ai.ts           # AIクラス
│   ├── evaluation.ts   # 評価関数
│   ├── minimax.ts      # ミニマックス法の実装
│   └── moveAnalyzer.ts # 手の分析
├── game/               # ゲームロジック
│   ├── board.ts        # ボード管理
│   ├── rules.ts        # ゲームルール
│   ├── gameState.ts    # ゲーム状態管理
│   └── badMoveDetector.ts # 悪手検出
├── components/         # Reactコンポーネント
│   └── game/          # ゲーム関連コンポーネント
└── hooks/             # カスタムフック
```

## 評価理由の類型

AIは以下の観点から手を評価し、悪手の理由を説明します：

- **位置評価**: 角、辺、X打ち、C打ちなどの位置による評価
- **着手可能数**: 自分と相手の着手可能な手の数の差
- **確定石**: ひっくり返されない石の数
- **ゲーム進行度**: 序盤・中盤・終盤で評価の重みを変更

## ライセンス

MIT
