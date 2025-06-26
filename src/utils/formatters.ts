/**
 * Format a score with one decimal place
 */
export const formatScore = (score: number): string => {
  return score.toFixed(1);
};

/**
 * Format a percentile (e.g., "Top 20%")
 */
export const formatPercentile = (percentile: number): string => {
  if (percentile <= 10) return `Top ${percentile.toFixed(0)}%`;
  if (percentile <= 20) return `Top ${percentile.toFixed(0)}%`;
  return `Top ${Math.round(percentile)}%`;
};

/**
 * Format normalized scores for display
 */
export const formatNormalizedScores = (
  blackScore: number,
  whiteScore: number,
  playerColor: 'black' | 'white'
): string => {
  const playerScore = playerColor === 'black' ? blackScore : whiteScore;
  const aiScore = playerColor === 'black' ? whiteScore : blackScore;
  return `あなた: ${formatScore(playerScore)} vs AI: ${formatScore(aiScore)}`;
};

/**
 * Format a move position (e.g., "a1")
 */
export const formatPosition = (row: number, col: number): string => {
  const colLetter = String.fromCharCode('a'.charCodeAt(0) + col);
  const rowNumber = row + 1;
  return `${colLetter}${rowNumber}`;
};
