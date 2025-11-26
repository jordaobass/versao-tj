export type Zona = 'Código' | 'Fluxo' | 'Script' | 'API'

export interface PjeItem {
  readonly id: string
  readonly tipo: Zona
  readonly descricao: string
  readonly equipe: string
  readonly responsavel: string
  readonly links: readonly string[]
  readonly isSustentacao: boolean
  readonly data: string
}

export interface Metadados {
  readonly rdm: string | null
  readonly janela: string | null
  readonly diserOperacao: string | null
  readonly dibda: string | null
  readonly hasIndisponibilidade: boolean
}

export interface Summary {
  readonly totalItems: number
  readonly porZona: Record<Zona, number>
  readonly itemsComLink: number
  readonly percentualComLink: number
  readonly itemsSustentacao: number
  readonly porData: Record<string, number>
  readonly datas: readonly string[]
}

export interface ItemsPorData {
  readonly [data: string]: readonly PjeItem[]
}

export interface ParsedData {
  readonly metadados: Metadados
  readonly items: readonly PjeItem[]
  readonly summary: Summary
}

export interface GenerateOptions {
  readonly markAllComplete?: boolean
  readonly selectedDatas?: readonly string[]
}
