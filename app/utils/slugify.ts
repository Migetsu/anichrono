export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-zа-я0-9\s]/gi, '')
    .trim()
    .replace(/\s+/g, '_')
}