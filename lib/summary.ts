import type { PjeItem, Summary, Zona, ItemsPorData } from '@/types'
import { compareDates } from './date-utils'

/**
 * Calcula métricas e estatísticas dos itens parseados
 */
export function calculateSummary(items: readonly PjeItem[]): Summary {
  const totalItems = items.length
  const itemsComLink = items.filter((item) => item.links.length > 0).length
  const itemsSustentacao = items.filter((item) => item.isSustentacao).length

  const porZona: Record<Zona, number> = {
    Código: 0,
    Fluxo: 0,
    Script: 0,
    API: 0,
  }

  const porData: Record<string, number> = {}
  const datasSet = new Set<string>()

  for (const item of items) {
    porZona[item.tipo]++

    const data = item.data || 'Sem data'
    porData[data] = (porData[data] || 0) + 1
    datasSet.add(data)
  }

  // Ordenar datas usando comparação de datas brasileiras
  const datas = Array.from(datasSet).sort(compareDates)

  const percentualComLink = totalItems > 0 ? (itemsComLink / totalItems) * 100 : 0

  return {
    totalItems,
    porZona,
    itemsComLink,
    percentualComLink: Math.round(percentualComLink * 10) / 10,
    itemsSustentacao,
    porData,
    datas,
  }
}

/**
 * Agrupa itens por data
 */
export function groupItemsByDate(items: readonly PjeItem[]): ItemsPorData {
  const grouped: Record<string, PjeItem[]> = {}

  for (const item of items) {
    const data = item.data || 'Sem data'
    if (!grouped[data]) {
      grouped[data] = []
    }
    grouped[data].push(item)
  }

  return grouped
}
