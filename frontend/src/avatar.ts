// Stable per-user avatar gradient so people are tellable-apart at a glance.
export function avatarHueClass(seed: string | undefined | null): string {
  if (!seed) return 'avatar-hue-0'
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  return `avatar-hue-${hash % 6}`
}
