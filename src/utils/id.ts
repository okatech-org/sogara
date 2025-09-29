/**
 * Générateur d'identifiants uniques
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Générateur d'ID court pour les formations
 */
export function generateShortId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/**
 * Générateur d'ID avec préfixe
 */
export function generateIdWithPrefix(prefix: string): string {
  return `${prefix}-${generateShortId()}`;
}
