import * as XLSX from 'xlsx'
import { normalize } from './utils'
import { formatDate } from './date-utils'

export interface TagItem {
  data: string
  requisicoes: string[]
  descricoes: string[]
}

export interface TagData {
  data: string
  tag: string
  nacional: string
  descricao: string
  observacao: string
  imagemProducao: string
  imagemSustentacao: string
  imagemTreinamento: string
}

export interface TagsResult {
  items: TagItem[]
  tags: TagData[]
}

interface RawRow {
  data: string
  rdm: string
  requisicao: string
  tipoDeclarado: string
  descricao: string
  equipe: string
  responsavel: string
  migrationScript: string
  prLink: string
  implantacaoLink: string
  aculturamento: string
  obs: string
  problemas: string
  descricaoProblema: string
  tipo: string
}

/**
 * Mapeia nomes de colunas do CSV
 */
function mapColumnNames(headers: string[]): Record<string, number> {
  const mapping: Record<string, number> = {}

  mapping.data = 0
  mapping.tipoDeclarado = 3

  const patterns: Record<string, RegExp> = {
    rdm: /^rdm$/i,
    requisicao: /^requisi[çc][ãa]o.*incidente/i,
    descricao: /^descri[çc][ãa]o$/i,
    equipe: /^equipe$/i,
    responsavel: /^respons[áa]vel.*implantar/i,
    migrationScript: /^migration.*script/i,
    prLink: /^pje.*fluxo.*api.*pull.*request/i,
    implantacaoLink: /^link.*implanta[çc][ãa]o/i,
    aculturamento: /^aculturamento$/i,
    obs: /^obs$/i,
    problemas: /^problemas$/i,
    descricaoProblema: /^descri[çc][ãa]o.*problema/i,
    tipo: /^tipo$/i,
  }

  headers.forEach((header, idx) => {
    const normalized = normalize(header)
    for (const [key, pattern] of Object.entries(patterns)) {
      if (pattern.test(normalized)) {
        mapping[key] = idx
        break
      }
    }
  })

  return mapping
}

/**
 * Parse arquivo Excel/CSV para itens agrupados por data
 */
export async function parseTagsFile(file: File): Promise<TagsResult> {
  const arrayBuffer = await file.arrayBuffer()
  const workbook = XLSX.read(arrayBuffer, { type: 'array' })

  const firstSheetName = workbook.SheetNames[0]
  if (!firstSheetName) {
    throw new Error('Arquivo não contém planilhas')
  }
  const firstSheet = workbook.Sheets[firstSheetName]
  if (!firstSheet) {
    throw new Error('Arquivo não contém planilhas')
  }

  const rawData = XLSX.utils.sheet_to_json<string[]>(firstSheet, {
    header: 1,
    defval: '',
    raw: false,
  })

  if (rawData.length < 2) {
    throw new Error('Arquivo não contém dados suficientes')
  }

  const headers = rawData[0] as string[]
  const mapping = mapColumnNames(headers)

  // Agrupar por data
  const itemsByDate: Record<string, { requisicoes: Set<string>; descricoes: string[] }> = {}
  let currentData = ''

  for (let i = 1; i < rawData.length; i++) {
    const rawRow = rawData[i] as string[]
    if (!rawRow || rawRow.every((cell) => !cell || cell.trim() === '')) {
      continue
    }

    const row: RawRow = {
      data: rawRow[mapping.data ?? -1] ?? '',
      rdm: rawRow[mapping.rdm ?? -1] ?? '',
      requisicao: rawRow[mapping.requisicao ?? -1] ?? '',
      tipoDeclarado: rawRow[mapping.tipoDeclarado ?? -1] ?? '',
      descricao: rawRow[mapping.descricao ?? -1] ?? '',
      equipe: rawRow[mapping.equipe ?? -1] ?? '',
      responsavel: rawRow[mapping.responsavel ?? -1] ?? '',
      migrationScript: rawRow[mapping.migrationScript ?? -1] ?? '',
      prLink: rawRow[mapping.prLink ?? -1] ?? '',
      implantacaoLink: rawRow[mapping.implantacaoLink ?? -1] ?? '',
      aculturamento: rawRow[mapping.aculturamento ?? -1] ?? '',
      obs: rawRow[mapping.obs ?? -1] ?? '',
      problemas: rawRow[mapping.problemas ?? -1] ?? '',
      descricaoProblema: rawRow[mapping.descricaoProblema ?? -1] ?? '',
      tipo: rawRow[mapping.tipo ?? -1] ?? '',
    }

    // Forward fill da data
    if (row.data && row.data.trim() !== '') {
      currentData = formatDate(row.data.trim())
    }

    if (!currentData) continue

    // Pular linhas sem requisição
    if (!row.requisicao || row.requisicao.trim() === '') continue

    // Filtrar apenas itens do tipo "Código"
    const tipoNorm = normalize(row.tipoDeclarado)
    if (!tipoNorm.includes('codigo') && tipoNorm !== 'codigo') continue

    // Inicializar data se não existir
    if (!itemsByDate[currentData]) {
      itemsByDate[currentData] = { requisicoes: new Set(), descricoes: [] }
    }

    const dateEntry = itemsByDate[currentData]
    if (!dateEntry) continue

    const reqId = row.requisicao.trim()
    const desc = row.descricao.trim()

    // Adicionar requisição (evitar duplicatas)
    dateEntry.requisicoes.add(reqId)

    // Adicionar descrição se existir (somente a descrição, sem o ID)
    if (desc) {
      dateEntry.descricoes.push(desc)
    }
  }

  // Converter para array de TagItem
  const items: TagItem[] = Object.entries(itemsByDate)
    .map(([data, { requisicoes, descricoes }]) => ({
      data,
      requisicoes: Array.from(requisicoes),
      descricoes,
    }))
    .sort((a, b) => {
      // Ordenar por data (DD/MM/YYYY)
      const [dA, mA, yA] = a.data.split('/')
      const [dB, mB, yB] = b.data.split('/')
      const dateA = new Date(Number(yA), Number(mA) - 1, Number(dA))
      const dateB = new Date(Number(yB), Number(mB) - 1, Number(dB))
      return dateA.getTime() - dateB.getTime()
    })

  // Criar tags com valores padrão para cada data
  const tags: TagData[] = items.map((item) => ({
    data: item.data,
    tag: 'TJRJ_TAG_',
    nacional: '2.2.0.5',
    descricao: item.descricoes.map((d, i) => `${i + 1}) ${d}`).join(' <br> '),
    observacao: '',
    imagemProducao: '-tjrj',
    imagemSustentacao: '-tjrj',
    imagemTreinamento: '',
  }))

  return { items, tags }
}

/**
 * Gera markdown no formato de tabela de tags
 */
export function generateTagsMarkdown(tags: TagData[]): string {
  let md = '| DATA | TAG | Nacional | Descrição | Observação | Imagem Produção | Imagem Sustentação | Imagem Treinamento |\n'
  md += '|--|--|--|--|--|--|--|--|\n'

  for (const tag of tags) {
    const tagLink = tag.tag
      ? `[${tag.tag}](https://dev.azure.com/pjerj/PJe/_git/PJe?path=%2F&version=GT${tag.tag.replace('TJRJ_TAG_', '')})`
      : ''

    md += `|${tag.data}| ${tagLink} |${tag.nacional}| ${tag.descricao} | ${tag.observacao} | ${tag.imagemProducao} | ${tag.imagemSustentacao} | ${tag.imagemTreinamento}\n`
  }

  return md
}
