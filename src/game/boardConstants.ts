export const COL_LABELS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
export const ROW_LABELS = ['1', '2', '3', '4', '5', '6', '7', '8'] as const;

export const positionToNotation = (row: number, col: number): string => {
  return `${COL_LABELS[col]}${ROW_LABELS[row]}`;
};

export const notationToPosition = (notation: string): { row: number; col: number } | null => {
  if (notation.length !== 2) return null;

  const col = COL_LABELS.indexOf(notation[0] as (typeof COL_LABELS)[number]);
  const row = ROW_LABELS.indexOf(notation[1] as (typeof ROW_LABELS)[number]);

  if (col === -1 || row === -1) return null;

  return { row, col };
};
