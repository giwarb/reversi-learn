# Duplicate Code Patterns Report

## Summary
This report identifies duplicate and similar code patterns in the reversi-learn codebase that could be refactored for better maintainability and code reuse.

## 1. Board Rendering Logic

### Duplicate Column and Row Labels
**Files affected:**
- `/src/components/game/Board.tsx` (lines 28-29)
- `/src/components/game/BadMoveDialog.tsx` (lines 119-120)

**Pattern:**
```typescript
const columnLabels = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const rowLabels = ['1', '2', '3', '4', '5', '6', '7', '8'];
```

**Recommendation:** Extract to a shared constants file or utility module.

### Board Grid Rendering Pattern
The board rendering logic is duplicated in multiple places within `BadMoveDialog.tsx`:
- Lines 183-194 (initial board)
- Lines 223-243 (player move board)
- Lines 293-313 (AI recommendation board)

**Pattern:**
```tsx
{board.map((row, rowIndex) => (
  <div key={rowIndex} className="board-row">
    {row.map((cell, colIndex) => (
      <div key={`${rowIndex}-${colIndex}`} className="board-cell">
        {cell && <div className={`stone ${cell}`} />}
      </div>
    ))}
  </div>
))}
```

**Recommendation:** Create a reusable `MiniBoard` component.

## 2. Evaluation Score Formatting

### toFixed(1) Pattern
**Files affected:**
- `/src/components/game/EvaluationDisplay.tsx` (lines 45, 49)
- `/src/components/game/BadMoveDialog.tsx` (lines 252, 322, 389)
- `/src/game/badMoveDetector.ts` (multiple occurrences)

**Pattern:**
```typescript
${score.toFixed(1)}
```

**Recommendation:** Create a `formatScore` utility function.

### Score Display Pattern
The pattern of displaying "あなた vs AI" scores is repeated:
- `BadMoveDialog.tsx` lines 252-253
- `BadMoveDialog.tsx` lines 322-323

**Pattern:**
```typescript
`あなた: ${playerScore.toFixed(1)} vs AI: ${aiScore.toFixed(1)}`
```

## 3. Score Normalization

### getNormalizedScores Usage
**Files affected:**
- `/src/components/game/EvaluationDisplay.tsx` (line 22)
- `/src/components/game/BadMoveDialog.tsx` (lines 249, 319, 364)

**Pattern:**
```typescript
const { blackScore, whiteScore } = getNormalizedScores(evaluation);
const playerScore = playerColor === 'black' ? blackScore : whiteScore;
const aiScore = playerColor === 'black' ? whiteScore : blackScore;
```

**Recommendation:** Create a utility function `getPlayerAIScores(evaluation, playerColor)`.

## 4. CSS Duplication

### Stone Styling
**Files affected:**
- `/src/components/game/Board.css`
- `/src/components/game/BadMoveDialog.css`
- `/src/components/game/PlayerColorDialog.css`

**Duplicate patterns:**
```css
.stone {
  width: [varies];
  height: [varies];
  border-radius: 50%;
}

.stone.black {
  background: [varies];
}

.stone.white {
  background: [varies];
}
```

**Recommendation:** Create a shared CSS module for stone styling with size variants.

## 5. biome-ignore Comments

### Array Index Key Pattern
**Files affected:**
- `/src/components/game/Board.tsx` (line 53)
- `/src/components/game/BadMoveDialog.tsx` (lines 184, 187, 224, 228, 294, 298)

**Pattern:**
```typescript
// biome-ignore lint/suspicious/noArrayIndexKey: 固定サイズ(8x8)のゲームボードで行の順序は不変
```

**Recommendation:** Consider creating a board rendering utility that handles this pattern consistently.

## 6. Board Manipulation

### makeMove/getValidMove Pattern
These functions are imported and used in multiple files:
- `/src/components/game/BadMoveDialog.tsx`
- `/src/ai/minimax.ts`
- `/src/ai/badMoveAnalyzer.ts`
- `/src/game/gameState.ts`

**Common pattern:**
```typescript
const validMove = getValidMove(board, position, player);
if (!validMove) return board;
return makeMove(board, validMove, player);
```

**Recommendation:** Create a `tryMakeMove` utility function that encapsulates this pattern.

## 7. Board Evaluation Display

### Evaluation Explanation Pattern
**Files affected:**
- `/src/components/game/EvaluationDisplay.tsx` (lines 87-95)
- `/src/components/game/BadMoveDialog.tsx` (lines 258-263, 328-333)

**Pattern:**
```tsx
const explanation = explainBoardEvaluation(board, playerColor);
const brief = getBriefExplanation(explanation);
return (
  <>
    <div className="overall-assessment">{explanation.overallAssessment}</div>
    <pre className="explanation-details">{brief}</pre>
  </>
);
```

**Recommendation:** Create a reusable `BoardEvaluationDisplay` component.

## 8. Mini Board Label Structure

### Board Label Grid Pattern
The mini board with labels structure is repeated multiple times in `BadMoveDialog.tsx`:
- Lines 166-195 (initial board)
- Lines 206-244 (player move board)  
- Lines 276-314 (AI recommendation board)

**Pattern:**
```tsx
<div className="mini-board-with-labels">
  <div className="mini-corner-space" />
  <div className="mini-column-labels">
    {columnLabels.map((label) => (
      <div key={label} className="mini-label">{label}</div>
    ))}
  </div>
  <div className="mini-row-labels">
    {rowLabels.map((label) => (
      <div key={label} className="mini-label">{label}</div>
    ))}
  </div>
  <div className="board-grid">
    {/* board rendering */}
  </div>
</div>
```

**Recommendation:** Extract to a `BoardWithLabels` component that can be reused.

## 9. Percentile Formatting

### toFixed(0) for Percentile Pattern
**Files affected:**
- `/src/components/game/MoveRankingDisplay.tsx` (line 42)
- `/src/components/game/BadMoveDialog.tsx` (line 156)
- `/src/game/badMoveDetector.ts`
- `/src/ai/moveAnalyzer.ts` (multiple occurrences)

**Pattern:**
```typescript
`（上位${percentile.toFixed(0)}%）`
```

**Recommendation:** Create a `formatPercentile(percentile: number)` utility function.

## Refactoring Priorities

1. **High Priority**: 
   - Extract board rendering components and utilities (affects user experience and maintainability)
   - Create reusable mini board components (significant code duplication)

2. **Medium Priority**: 
   - Consolidate score formatting and normalization utilities
   - Extract evaluation display components
   - Create board manipulation utilities

3. **Low Priority**: 
   - CSS consolidation (requires careful testing for visual regression)
   - Percentile formatting utilities

## Proposed New Files

1. `/src/game/boardConstants.ts` - For column/row labels and board-related constants
2. `/src/components/game/MiniBoard.tsx` - Reusable mini board component
3. `/src/components/game/BoardWithLabels.tsx` - Board with coordinate labels component
4. `/src/components/game/BoardEvaluationDisplay.tsx` - Reusable evaluation display component
5. `/src/utils/scoreFormatter.ts` - Score and percentile formatting utilities
6. `/src/utils/boardManipulation.ts` - Board manipulation utilities (tryMakeMove, etc.)
7. `/src/styles/shared/stone.css` - Shared stone styling

## Implementation Guidelines

1. Start with the highest impact refactorings that reduce the most duplication
2. Ensure backward compatibility by keeping existing interfaces
3. Add unit tests for all new utility functions
4. Update affected components incrementally to use the new shared code
5. Consider using TypeScript generics for board rendering components to handle different sizes/styles