/**
 * 評価値を0-100の範囲に正規化する
 * 50が均衡状態、100に近いほど白有利、0に近いほど黒有利
 * （評価値システム：マイナス=黒有利、プラス=白有利）
 */
export const normalizeEvaluation = (rawScore: number): number => {
  // 生の評価値の範囲を-200から200と仮定（最大値は盤面と戦略による）
  const MAX_RAW_SCORE = 200;

  // -200〜200 を 0〜100 に変換
  const normalized = ((rawScore + MAX_RAW_SCORE) / (MAX_RAW_SCORE * 2)) * 100;

  // 0〜100の範囲にクランプ
  return Math.max(0, Math.min(100, normalized));
};

/**
 * 両プレイヤーの正規化された評価値を計算
 */
export const getNormalizedScores = (
  rawScore: number
): { blackScore: number; whiteScore: number } => {
  // 評価値を0-100スケールに変換
  const normalized = normalizeEvaluation(rawScore);

  // 黒と白で逆の値にする（黒有利=0、白有利=100）
  return {
    blackScore: 100 - normalized,
    whiteScore: normalized,
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
