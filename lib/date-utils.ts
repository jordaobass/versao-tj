/**
 * Formata data para dd/MM/yyyy
 * Aceita diversos formatos de entrada
 */
export function formatDate(dateStr: string): string {
  if (!dateStr || dateStr.trim() === '') {
    return 'Sem data'
  }

  const cleaned = dateStr.trim()

  // Já está no formato dd/MM/yyyy
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(cleaned)) {
    return cleaned
  }

  // Formato yyyy-MM-dd ou yyyy/MM/dd
  const isoMatch = cleaned.match(/^(\d{4})[-/](\d{2})[-/](\d{2})/)
  if (isoMatch) {
    const [, year, month, day] = isoMatch
    return `${day}/${month}/${year}`
  }

  // Formato dd-MM-yyyy ou dd.MM.yyyy
  const reverseMatch = cleaned.match(/^(\d{2})[-.](\d{2})[-.](\d{4})/)
  if (reverseMatch) {
    const [, day, month, year] = reverseMatch
    return `${day}/${month}/${year}`
  }

  // Formato d/M/yyyy (sem zeros à esquerda)
  const shortMatch = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (shortMatch) {
    const [, day, month, year] = shortMatch
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`
  }

  // Formato d/M/yy ou M/d/yy (ano com 2 dígitos)
  const shortYearMatch = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/)
  if (shortYearMatch) {
    const [, part1, part2, year] = shortYearMatch
    // Expandir ano: 00-99 -> 2000-2099
    const fullYear = `20${year}`
    // Assumir que part1 é dia e part2 é mês (formato brasileiro)
    return `${part1.padStart(2, '0')}/${part2.padStart(2, '0')}/${fullYear}`
  }

  // Se não conseguiu parsear, retorna original
  return cleaned
}

/**
 * Converte dd/MM/yyyy para Date object
 */
export function parseDate(dateStr: string): Date | null {
  const match = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!match) return null

  const [, day, month, year] = match
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
}

/**
 * Compara duas datas no formato dd/MM/yyyy
 */
export function compareDates(a: string, b: string): number {
  if (a === 'Sem data') return 1
  if (b === 'Sem data') return -1

  const dateA = parseDate(a)
  const dateB = parseDate(b)

  if (!dateA || !dateB) {
    return a.localeCompare(b)
  }

  return dateA.getTime() - dateB.getTime()
}
