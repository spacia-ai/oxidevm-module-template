/** Reads exactly two 32-bit signed integers from text; `undefined` when there are not exactly two valid ones. */
export function parseOperands(args: readonly string[]): readonly [number, number] | undefined {
  const [left, right, ...rest] = args;
  if (left === undefined || right === undefined || rest.length > 0) return undefined;
  const first = parseInteger(left), second = parseInteger(right);
  return first === undefined || second === undefined ? undefined : [first, second];
}

function parseInteger(text: string): number | undefined {
  if (!/^-?\d{1,10}$/u.test(text)) return undefined;
  const value = Number(text);
  return value >= -2147483648 && value <= 2147483647 ? value : undefined;
}
