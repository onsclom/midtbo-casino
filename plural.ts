export function pluralize(word: string, count: number) {
  return `${count} ${Math.abs(count) === 1 ? word : `${word}s`}`;
}

export function marbleText(count: number) {
  return `${pluralize("marble", count)}`;
}
