import type { PjeItem } from '@/types'

export interface ValidationIssue {
  readonly itemId: string
  readonly tipo: string
  readonly descricao: string
  readonly severity: 'error' | 'warning'
  readonly message: string
}

/**
 * Valida se itens de Código e Script têm links obrigatórios
 */
export function validateItems(items: readonly PjeItem[]): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  for (const item of items) {
    // Validação: Código sem link de PR
    if (item.tipo === 'Código' && item.links.length === 0) {
      issues.push({
        itemId: item.id,
        tipo: item.tipo,
        descricao: item.descricao,
        severity: 'error',
        message: 'Item de Código sem link de Pull Request',
      })
    }

    // Validação: Script sem link
    if (item.tipo === 'Script' && item.links.length === 0) {
      issues.push({
        itemId: item.id,
        tipo: item.tipo,
        descricao: item.descricao,
        severity: 'error',
        message: 'Item de Script sem link de documentação/implantação',
      })
    }

    // Validação: API sem link (warning, não error)
    if (item.tipo === 'API' && item.links.length === 0) {
      issues.push({
        itemId: item.id,
        tipo: item.tipo,
        descricao: item.descricao,
        severity: 'warning',
        message: 'Item de API sem link de Pull Request',
      })
    }
  }

  return issues
}

/**
 * Agrupa issues por severidade
 */
export function groupIssuesBySeverity(issues: readonly ValidationIssue[]) {
  const errors = issues.filter((i) => i.severity === 'error')
  const warnings = issues.filter((i) => i.severity === 'warning')

  return { errors, warnings }
}
