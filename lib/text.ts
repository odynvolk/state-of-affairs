export const clean = (text: string) => {
  if (!text) return "";

  const match = text.match(/(www|http:|https:)+[^\s]+[\w]\/?\s?/g) ?? [];
  let result = text;
  for (const m of match) {
    result = result.replaceAll(m, "");
  }

  return result.trim();
};
