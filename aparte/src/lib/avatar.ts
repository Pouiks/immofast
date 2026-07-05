/** Palette d'avatars (fond doux + texte). Choix déterministe par nom. */
const AVATAR_PALETTE: [bg: string, fg: string][] = [
  ["#e8f0ff", "#3b6bff"],
  ["#fde8f0", "#d6317a"],
  ["#ede8ff", "#5b4bff"],
  ["#e6f7f0", "#0d8a52"],
  ["#fff2e6", "#e07a1c"],
  ["#eae6ff", "#6b4bff"],
  ["#e6f4ff", "#1c7ed6"],
];

/** Retourne un couple [fond, texte] stable pour un nom donné. */
export function avatarColors(name: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}
