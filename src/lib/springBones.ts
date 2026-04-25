/** Shared spring bone identification constants and utilities. */

/** Name prefix used to identify spring bone nodes (case-insensitive). */
export const SPRING_BONE_PREFIX = 'springbone'

/** Returns true if the node name identifies a spring bone (case-insensitive). */
export function isSpringBoneName(name: string): boolean {
  return name.toLowerCase().includes(SPRING_BONE_PREFIX)
}
