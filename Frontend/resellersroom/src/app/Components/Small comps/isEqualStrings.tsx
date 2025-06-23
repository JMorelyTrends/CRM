export const isEqualStrings = (a: string, b: string): boolean => {
  // Example logic: ignore leading "+"
  if (a.startsWith('+')) {
    const trimmedA = a.slice(3);
    const trimmedB=b.slice(1);
    return trimmedA === trimmedB ;
  } else {
    return a === b;
  }
};
