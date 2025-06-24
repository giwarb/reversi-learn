/**
 * 評価値を0-100の範囲に正規化する
 * 50が均衡状態、100に近いほど有利、0に近いほど不利
 */
export const normalizeEvaluation = (rawScore: number, player: 'black' | 'white'): number => {
  // 生の評価値の範囲を-200から200と仮定（最大値は盤面と戦略による）
  const MAX_RAW_SCORE = 200;

  // プレイヤー視点での評価値に変換（黒がプラス、白がマイナス）
  const playerScore = player === 'black' ? rawScore : -rawScore;

  // -200〜200 を 0〜100 に変換
  const normalized = ((playerScore + MAX_RAW_SCORE) / (MAX_RAW_SCORE * 2)) * 100;

  // 0〜100の範囲にクランプ
  return Math.max(0, Math.min(100, normalized));
};

/**
 * 両プレイヤーの正規化された評価値を計算
 */
export const getNormalizedScores = (
  blackRawScore: number,
  whiteRawScore: number
): { blackScore: number; whiteScore: number } => {
  // 黒の視点での評価値の差
  const scoreDifference = blackRawScore - whiteRawScore;

  // 差分を0-100スケールに変換（50が中心）
  const blackNormalized = normalizeEvaluation(scoreDifference, 'black');
  const whiteNormalized = normalizeEvaluation(scoreDifference, 'white');

  return {
    blackScore: blackNormalized,
    whiteScore: whiteNormalized,
  };
};

/**
 * 優勢度のテキストを取得（50基準）
 */
export const getAdvantageText = (blackScore: number, whiteScore: number): string => {
  const difference = Math.abs(blackScore - whiteScore);

  if (difference < 5) return '互角';
  if (difference < 15) {
    return blackScore > whiteScore ? '黒やや有利' : '白やや有利';
  }
  if (difference < 30) {
    return blackScore > whiteScore ? '黒有利' : '白有利';
  }
  return blackScore > whiteScore ? '黒優勢' : '白優勢';
};
