# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

リバーシ学習アプリ - 悪手を検出して改善点を学習できるリバーシゲーム

## プロジェクト前提条件
- **技術スタック**: TypeScript, React, Vite, Vitest, React Router (Hash-based), Biome
- **デプロイ先**: GitHub Pages
- **開発手法**: GitHub Issue駆動開発

## 主要コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# リント
npm run lint

# フィックス（リントエラーの自動修正＋フォーマット）
npm run fix

# テスト実行
npm run test
```

## アーキテクチャ

### ゲームロジック (src/game/)
- `board.ts`: ボード管理（8x8配列）
- `rules.ts`: ゲームルール（有効手判定、石の反転）
- `gameState.ts`: ゲーム状態管理
- `badMoveDetector.ts`: 悪手検出機能

### AI実装 (src/ai/)
- `minimax.ts`: ミニマックス法（アルファベータ枝刈り付き）
- `evaluation.ts`: 評価関数（位置評価、着手可能数、石数）
- `evaluationReasons.ts`: 評価理由の類型化
- `moveAnalyzer.ts`: 手の分析機能

### UI/UX (src/components/game/)
- `Board.tsx`: ゲームボード表示
- `Game.tsx`: メインゲームコンポーネント
- `BadMoveDialog.tsx`: 悪手説明ダイアログ
- `GameInfo.tsx`: ゲーム情報表示
- `GameControls.tsx`: ゲームコントロール

### 重要な設計判断
1. **探索深さ**: AIレベル1-6（探索深さ1-6）
2. **悪手判定**: 評価値差50点以上を悪手と判定
3. **評価理由**: 日本語で類型化された説明を提供


## 開発ワークフロー

### Issue駆動開発（必須）
修正指示を受けたら以下を実行：

```bash
# Issue作成
ISSUE_NUMBER=$(gh issue create --title "$TITLE" --body "$BODY" --assignee "@me" --json number -q '.number')

# ブランチ作成・切り替え
git checkout -b "feature/issue-${ISSUE_NUMBER}"

# 初回コミット
git commit --allow-empty -m "Start work on issue #${ISSUE_NUMBER}"
git push -u origin "feature/issue-${ISSUE_NUMBER}"

# PR作成（自動リンク）
gh pr create \
  --title "Fix: #${ISSUE_NUMBER} - $TITLE" \
  --body "Closes #${ISSUE_NUMBER}" \
  --draft
```

### 設計プロセス
実装前に必ず設計を完了：

1. **アーキテクチャ設計** ("ultrathink")
   - 主要コンポーネント識別
   - データフロー設計
   - 型定義

2. **詳細設計**
   - 関数仕様
   - エラーハンドリング
   - テスト戦略

### TDD実装
**ALWAYS**: テストを先に実装

1. テストファイル作成: `src/components/${NAME}/${NAME}.test.tsx`
2. Red → Green → Refactor の順守

### 品質保証
ファイル変更時に順次実行: lint → fix → test → build

### PR完了
品質チェック通過後: `gh pr ready && gh pr merge --auto --squash --delete-branch`

## 重要ルール

### 🚫 禁止
- mainブランチ直接コミット
- テストなし実装

### ✅ 必須
- Issue → ブランチ → PR → マージの順守
- テストファースト
- カバレッジ90%以上


## 最重要指示

**YOU MUST**: Issue作成 → 設計 → テスト → 実装 → 品質チェック → マージ

この順序を厳守する。違反時は即座に正しい手順に戻る。

