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

# テスト実行
npm test

# ビルド
npm run build

# リント
npm run lint

# フォーマット
npm run format
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

## Claudeの基本原則

### 1. コード生成の制約
- **関数の長さ**: 20行以内に収める
- **循環的複雑度**: 5以下を維持
- **単一責任の原則**: 1関数1目的を徹底
- **純粋関数優先**: 副作用を最小限に

### 2. レスポンスフォーマット
```
1. 要求の理解と確認
2. 実装方針の説明
3. コード生成（小さな単位で）
4. テストコードの提供
5. 次のステップの提案
```

## Issue対応時の振る舞い

### Issueが提示された場合
1. **要求分析**
   - 受け入れ条件の確認
   - 不明確な点の質問
   - 実装範囲の明確化

2. **設計提案**
   - コンポーネント分割案
   - 関数分割案（20行制限を考慮）
   - テスト方針

3. **段階的実装**
   ```typescript
   // 例: ユーザー一覧機能のIssueの場合
   // ステップ1: 型定義
   // ステップ2: ユーティリティ関数（各10行以内）
   // ステップ3: カスタムフック
   // ステップ4: コンポーネント
   // ステップ5: テスト
   ```

## コード生成ルール

### 関数分割の例
```typescript
// ❌ 生成してはいけないコード
function processData(data: Data[]) {
  // 20行を超える処理
  // 複数の責任
  // 高い複雑度
}

// ✅ 生成すべきコード
const validateData = (data: Data): boolean => {
  // 5行以内の検証ロジック
};

const transformData = (data: Data): TransformedData => {
  // 5行以内の変換ロジック
};

const processData = (data: Data[]): Result[] => {
  return data
    .filter(validateData)
    .map(transformData);
};
```

### React コンポーネントの原則
```typescript
// 各コンポーネントは単一の責任を持つ
// Props の型定義を明確に
// カスタムフックで状態管理を分離

interface Props {
  data: Data;
  onAction: (id: string) => void;
}

export const SmallComponent: FC<Props> = ({ data, onAction }) => {
  // 10行以内のレンダリングロジック
};
```

### テストコード生成
```typescript
// 各関数に対して最低2つのテストケース
// エッジケースを含める
// Arrange-Act-Assert パターン

describe('functionName', () => {
  it('正常系の動作', () => {
    // Arrange
    const input = createTestData();
    
    // Act
    const result = functionName(input);
    
    // Assert
    expect(result).toBe(expected);
  });

  it('エッジケース', () => {
    // 境界値、null、空配列などのテスト
  });
});
```

## テスト方針

### UIコンポーネントのテスト
1. **必須テスト項目**
   - レンダリングテスト
   - ユーザーインタラクション（クリック、変更）
   - プロップスの伝播
   - 条件付きレンダリング

2. **GameControlsの教訓**
   - UIの状態制御（disabled属性など）は必ずテストする
   - 統合テストだけでなく、単体テストも作成する

### フックのテスト
1. **状態変更のテスト**
   - 初期状態
   - 状態更新関数の動作
   - 複雑な状態遷移

2. **非同期処理**
   - タイマーを使う場合は`vi.useFakeTimers()`を使用
   - 適切なクリーンアップ

### 統合テストの限界
- 複雑な状態（ゲーム終了など）のシミュレーションは困難
- E2Eテストで補完することを検討

### テストカバレッジ目標
- ユニットテスト: 各関数・コンポーネント
- 統合テスト: 主要なユーザーフロー
- E2Eテスト: クリティカルパス（将来実装）

## Biome設定の遵守

生成するすべてのコードは以下を満たす必要があります：
- インデント: スペース2つ
- 行の長さ: 100文字以内
- クォート: シングルクォート
- セミコロン: 必須
- 末尾カンマ: ES5準拠

## ファイル構造の提案

新しい機能を実装する際は、以下の構造を提案：
```
src/
├── components/
│   └── feature-name/
│       ├── FeatureName.tsx      (20行以内)
│       ├── FeatureName.test.tsx
│       ├── hooks/
│       │   └── useFeature.ts    (15行以内)
│       └── utils/
│           └── helpers.ts        (各関数10行以内)
```

## エラーハンドリング

すべてのコードにおいて：
1. 明示的なエラーハンドリング
2. ユーザーフレンドリーなエラーメッセージ
3. エラー境界の実装提案

```typescript
// エラーハンドリングの例
const safeFetch = async <T>(url: string): Promise<Result<T>> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` };
    }
    return { success: true, data: await response.json() };
  } catch (error) {
    return { success: false, error: 'Network error' };
  }
};
```

## GitHub Pages特有の考慮事項

1. **ルーティング**: 必ずHashRouterを使用
2. **ベースパス**: vite.config.tsでbase設定を確認
3. **静的アセット**: 相対パスの使用

## 段階的な機能追加

大きな機能は必ず分割して提案：
1. **Phase 1**: 基本的なデータ表示
2. **Phase 2**: インタラクション追加
3. **Phase 3**: エラーハンドリングとローディング
4. **Phase 4**: パフォーマンス最適化

## レビュー観点の提供

コード生成後は必ず以下のチェックリストを提供：
- [ ] 関数は20行以内か
- [ ] 複雑度は5以下か
- [ ] テストは書かれているか
- [ ] 型定義は適切か
- [ ] エラーハンドリングは適切か
- [ ] Biomeの規則に準拠しているか

## 継続的な改善

各実装後に必ず質問：
1. 「このコードで不明な点はありますか？」
2. 「さらに分割が必要な部分はありますか？」
3. 「次に実装すべき部分はどこですか？」

## 禁止事項

以下のコードは生成しない：
- 20行を超える関数
- any型の使用（特別な理由なく）
- コメントなしの複雑なロジック
- テストのないユーティリティ関数
- エラーハンドリングのない非同期処理

## プロンプトの例

ユーザーからのプロンプト例と対応：

### 例1: 「ユーザー一覧を表示する機能を作って」
```
1. まず、どのようなユーザー情報を表示しますか？
2. ページネーションは必要ですか？
3. 検索機能は必要ですか？

基本的な実装から始めましょう：
[型定義] → [取得関数] → [表示コンポーネント] → [テスト]
```

### 例2: 「このコードをリファクタリングして」
```
1. 現在のコードの問題点を分析
2. 関数分割の提案（各20行以内）
3. 段階的なリファクタリング手順
4. テストの追加
```

## メタ情報

- **更新時**: プロジェクトの進行に応じて、この仕様書の更新を提案
- **質問**: 不明な技術的決定事項は必ず確認
- **提案**: より良い実装方法があれば積極的に提案