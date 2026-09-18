const KEY = 'court-lineup:last-name'

/**
 * A prefilled default in an editable box, not a claim of ownership. ADR-0001
 * rejected localStorage as a basis for *authority* over names; this is convenience.
 * It can throw or come back empty in private mode, which is fine.
 */
export function rememberedName(): string {
  try {
    return localStorage.getItem(KEY) ?? ''
  } catch {
    return ''
  }
}

export function rememberName(name: string): void {
  try {
    localStorage.setItem(KEY, name)
  } catch {
    // private mode, blocked site data: the box just opens empty next time
  }
}
