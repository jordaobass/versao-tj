import * as XLSX from 'xlsx'
import type { CsvRow } from './validations'
import { csvDataSchema } from './validations'
import type { PjeItem, Metadados, Zona } from '@/types'
import {
  normalize,
  extractUrls,
  detectJanela,
  detectDiserOperacao,
  detectDibda,
  hasIndisponibilidade,
} from './utils'
import { formatDate } from './date-utils'

/**
 * Mapeia nomes de colunas do CSV (case-insensitive, tolerante a espaços)
 * Colunas fixas do Excel:
 * - Coluna A (índice 0) = Data
 * - Coluna D (índice 3) = Código/Fluxo/API (tipo da tarefa)
 */
function mapColumnNames(headers: string[]): Record<string, number> {
  const mapping: Record<string, number> = {}

  // Coluna A (índice 0) sempre é Data
  mapping.data = 0

  // Coluna D (índice 3) sempre é Código/Fluxo/API
  mapping.tipoDeclarado = 3

  const patterns = {
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
 * Detecta zona do item baseado nas regras de prioridade
 */
function detectZona(row: CsvRow): Zona {
  // Normalizar coluna Migration/Script
  const migration = (row.migrationScript || '').trim()
  const migrationNorm = normalize(migration)

  // Normalizar coluna D (tipoDeclarado)
  const tipoOriginal = row.tipoDeclarado || ''
  const tipoNorm = normalize(tipoOriginal)

  // Regra 1: Se Migration/Script indica tipo Script/Migration, usar Script
  // Mas só se NÃO for "Não" ou variações
  const isMigrationIndicator =
    migration &&
    migrationNorm !== 'nao' &&
    migrationNorm !== 'não' &&
    migrationNorm !== 'no' &&
    migrationNorm !== 'n' &&
    (migrationNorm.includes('script') ||
      migrationNorm.includes('migration') ||
      migrationNorm.includes('sim') ||
      migrationNorm.includes('.sql'))

  // Regra 2: Se coluna D diz "Script" ou "Migration", sempre usar Script
  if (tipoNorm.includes('script') || tipoNorm.includes('migration')) {
    return 'Script'
  }

  // Regra 3: Se Migration tem indicador válido, usar Script
  if (isMigrationIndicator) {
    return 'Script'
  }

  // Regra 4: Usar coluna D para outros tipos
  if (tipoNorm.includes('codigo') || tipoNorm === 'codigo') {
    return 'Código'
  }
  if (tipoNorm.includes('fluxo') || tipoNorm === 'fluxo') {
    return 'Fluxo'
  }
  if (tipoNorm.includes('api') || tipoNorm === 'api') {
    return 'API'
  }
  if (tipoNorm.includes('conector')) {
    return 'API' // Conector é tratado como API
  }

  // Default: Código
  return 'Código'
}

/**
 * Detecta se item é de Sustentação
 */
function isSustentacao(row: CsvRow): boolean {
  const equipeNorm = normalize(row.equipe)
  const tipoNorm = normalize(row.tipo)
  return equipeNorm.includes('sustentacao') || tipoNorm.includes('sustentacao')
}

/**
 * Extrai links (prioriza PR, fallback para implantação)
 */
function extractLinks(row: CsvRow): string[] {
  const prUrls = extractUrls(row.prLink)
  if (prUrls.length > 0) return prUrls

  const implUrls = extractUrls(row.implantacaoLink)
  return implUrls
}

/**
 * Extrai metadados de indisponibilidade de todas as linhas
 */
function extractMetadados(rows: CsvRow[]): Metadados {
  let rdm: string | null = null
  let janela: string | null = null
  let diserOperacao: string | null = null
  let dibda: string | null = null
  let hasIndisp = false

  for (const row of rows) {
    // RDM: primeiro valor não vazio
    if (!rdm && row.rdm && row.rdm.trim() !== '') {
      rdm = row.rdm.trim()
    }

    // Processar Obs
    if (row.obs) {
      if (!janela) {
        const j = detectJanela(row.obs)
        if (j) janela = j
      }

      if (!diserOperacao) {
        const d = detectDiserOperacao(row.obs)
        if (d) diserOperacao = d
      }

      if (!dibda) {
        const db = detectDibda(row.obs)
        if (db) dibda = db
      }

      if (!hasIndisp && hasIndisponibilidade(row.obs)) {
        hasIndisp = true
      }
    }
  }

  return {
    rdm,
    janela,
    diserOperacao,
    dibda,
    hasIndisponibilidade: hasIndisp,
  }
}

/**
 * Parse de arquivo CSV/Excel para estrutura tipada
 */
export async function parseFile(file: File): Promise<{
  rows: CsvRow[]
  metadados: Metadados
}> {
  const arrayBuffer = await file.arrayBuffer()
  const workbook = XLSX.read(arrayBuffer, { type: 'array' })

  // Pegar primeira planilha
  const firstSheetName = workbook.SheetNames[0]
  if (!firstSheetName) {
    throw new Error('Arquivo não contém planilhas')
  }
  const firstSheet = workbook.Sheets[firstSheetName]
  if (!firstSheet) {
    throw new Error('Arquivo não contém planilhas')
  }

  // Converter para array de arrays
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

  // Verificar colunas essenciais
  const essentialCols = ['requisicao', 'descricao', 'equipe']
  const missing = essentialCols.filter((col) => mapping[col] === undefined)
  if (missing.length > 0) {
    throw new Error(
      `Colunas essenciais não encontradas: ${missing.join(', ')}. ` +
        `Verifique se o arquivo está no formato correto.`
    )
  }

  // Parse rows com forward fill da data
  const rows: CsvRow[] = []
  let currentData = '' // Última data encontrada

  for (let i = 1; i < rawData.length; i++) {
    const rawRow = rawData[i] as string[]
    if (!rawRow || rawRow.every((cell) => !cell || cell.trim() === '')) {
      continue // Pular linhas vazias
    }

    const row: CsvRow = {
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

    // Forward fill: se linha tem data, atualizar currentData
    if (row.data && row.data.trim() !== '') {
      currentData = row.data.trim()
    } else if (currentData) {
      // Se linha não tem data, usar a última data encontrada
      row.data = currentData
    } else {
      // Se ainda não temos nenhuma data, pular linha
      continue
    }

    // Pular linhas que não têm requisição/incidente
    if (!row.requisicao || row.requisicao.trim() === '') {
      continue
    }

    rows.push(row)
  }

  // Validar com Zod
  const validated = csvDataSchema.parse(rows)

  // Extrair metadados
  const metadados = extractMetadados(validated)

  return { rows: validated, metadados }
}

/**
 * Converte rows para PjeItems
 */
export function rowsToItems(rows: CsvRow[]): PjeItem[] {
  return rows
    .filter((row) => row.requisicao && row.requisicao.trim() !== '')
    .map((row) => ({
      id: row.requisicao.trim(),
      tipo: detectZona(row),
      descricao: row.descricao.trim(),
      equipe: row.equipe.trim(),
      responsavel: row.responsavel.trim(),
      links: extractLinks(row),
      isSustentacao: isSustentacao(row),
      data: formatDate(row.data),
    }))
}
