export const slugify = (text: string) => {
  return text
    .toLowerCase()
    .normalize("NFD") // tách dấu tiếng Việt
    .replace(/[\u0300-\u036f]/g, "") // remove diacritics
    .replace(/[^a-z0-9\s-]/g, "") // remove special chars
    .trim()
    .replace(/\s+/g, "-") // space → hyphen
    .replace(/-+/g, "-"); // remove multiple hyphens
};
