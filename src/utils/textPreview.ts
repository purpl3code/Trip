// Find the longest prefix that fits, stopping only after a complete word.
export function fitWholeWords(text: string, fits: (candidate: string) => boolean): string {
  const ends = [0, ...Array.from(text.matchAll(/\S+/gu), match => match.index + match[0].length)];
  let low = 0;
  let high = ends.length - 1;
  while (low < high) {
    const middle = Math.ceil((low + high) / 2);
    if (fits(text.slice(0,ends[middle]))) low = middle;
    else high = middle - 1;
  }
  return text.slice(0,ends[low]).trimEnd();
}
