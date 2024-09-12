function pluralize(word: string, count: number) {
  return count === 1 ? word : `${word}s`;
}

export function marbleText(count: number) {
  return `${count} ${pluralize("marble", count)}`;
}
