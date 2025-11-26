import type { ParsedData, GenerateOptions, PjeItem } from '@/types'
import { groupItemsByDate } from './summary'
import { compareDates } from './date-utils'

/**
 * Gera checkbox markdown (completo ou não)
 */
function checkbox(complete: boolean): string {
  return complete ? '- [x]' : '- [ ]'
}

/**
 * Gera seção de item do checklist
 */
function generateItem(item: PjeItem, markComplete: boolean): string {
  const check = checkbox(markComplete)
  let line = `${check} **${item.id}** | ${item.descricao}`

  // Adicionar equipe/responsável
  const pessoa = item.responsavel || item.equipe
  if (pessoa) {
    line += `  \n  👤 ${pessoa}`
  }

  // Adicionar links
  if (item.links.length > 0) {
    const linkStr = item.links.map((url) => `[Link](${url})`).join(' • ')
    line += ` | 🔗 ${linkStr}`
  }

  // Marcar sustentação
  if (item.isSustentacao) {
    line += ' **[Sustentação]**'
  }

  return line
}

/**
 * Gera seção de zona
 */
function generateZonaSection(
  zona: string,
  items: readonly PjeItem[],
  markComplete: boolean
): string {
  if (items.length === 0) return ''

  let section = `\n## ${zona}\n\n`
  for (const item of items) {
    section += generateItem(item, markComplete) + '\n'
  }

  return section
}

/**
 * Gera seção de indisponibilidade programada
 */
function generateIndisponibilidade(data: ParsedData): string {
  const { metadados } = data
  const hasAnyMeta =
    metadados.janela ||
    metadados.rdm ||
    metadados.diserOperacao ||
    metadados.dibda ||
    metadados.hasIndisponibilidade

  if (!hasAnyMeta) return ''

  let section = '## 🚨 Indisponibilidade Programada\n\n'

  if (metadados.janela) {
    section += `- **Janela:** ${metadados.janela}\n`
  }
  if (metadados.rdm) {
    section += `- **RDM:** ${metadados.rdm}\n`
  }
  if (metadados.diserOperacao) {
    section += `- **DISER-OPERAÇÃO:** ${metadados.diserOperacao}\n`
  }
  if (metadados.dibda) {
    section += `- **DIBDA:** ${metadados.dibda}\n`
  }
  if (metadados.hasIndisponibilidade) {
    section += `- ⚠️ **Com indisponibilidade**\n`
  }

  return section + '\n'
}

/**
 * Gera sumário estatístico
 */
function generateSummarySection(data: ParsedData): string {
  const { summary } = data

  let section = '## 📊 Resumo\n\n'
  section += `- **Total de itens:** ${summary.totalItems}\n`
  section += `- **Itens com link de PR/Implantação:** ${summary.itemsComLink} (${summary.percentualComLink}%)\n`
  section += `- **Itens em Sustentação:** ${summary.itemsSustentacao}\n\n`
  section += '**Por Zona:**\n'
  section += `- Código: ${summary.porZona.Código}\n`
  section += `- Fluxo: ${summary.porZona.Fluxo}\n`
  section += `- Script: ${summary.porZona.Script}\n`
  section += `- API: ${summary.porZona.API}\n`

  return section + '\n'
}

/**
 * Gera checklist fixo de ações
 */
function generateChecklistAcoes(markComplete: boolean): string {
  const check = checkbox(markComplete)

  return `
# ✅ Checklist de Ações da Versão

${check} Todos os PRs aprovados?
${check} Fluxos pré-cadastrados?
${check} Solicitado usuário Flyway?
${check} Executado pipeline das APIs?
${check} Itens em Sustentação revisados?
${check} Executado pipeline do PJE?
${check} Executados Testes PBF?
${check} Executados testes unitários?
${check} Link da release enviado?
${check} Infra aprovou PJE?
${check} Rodou pipeline pós-deploy?
${check} Avisado nos grupos de RDM e Versões?
${check} Documentação atualizada?
`
}

/**
 * Gera Markdown completo
 */
export function generateMarkdown(
  data: ParsedData,
  options: GenerateOptions = {}
): string {
  const markComplete = options.markAllComplete ?? false
  const selectedDatas = options.selectedDatas

  let md = '# 📋 Checklist de Implantação PJe\n\n'

  // Indisponibilidade
  md += generateIndisponibilidade(data)

  // Sumário (filtrado se houver seleção de datas)
  if (selectedDatas && selectedDatas.length > 0) {
    const filteredItems = data.items.filter((item) => {
      const itemData = item.data || 'Sem data'
      return selectedDatas.includes(itemData)
    })

    const filteredSummary = {
      ...data.summary,
      totalItems: filteredItems.length,
      itemsComLink: filteredItems.filter((i) => i.links.length > 0).length,
      itemsSustentacao: filteredItems.filter((i) => i.isSustentacao).length,
    }

    const filteredData = { ...data, items: filteredItems, summary: filteredSummary }
    md += generateSummarySection(filteredData)
  } else {
    md += generateSummarySection(data)
  }

  // Agrupar itens por data
  const itemsPorData = groupItemsByDate(data.items)

  // Ordenar datas usando comparação de datas brasileiras
  let datas = Object.keys(itemsPorData).sort(compareDates)

  // Filtrar datas se houver seleção
  if (selectedDatas && selectedDatas.length > 0) {
    datas = datas.filter((d) => selectedDatas.includes(d))
  }

  md += '# 📝 Itens da Versão\n\n'

  // Para cada data, agrupar por zona
  for (const data of datas) {
    const itemsData = itemsPorData[data] ?? []

    // Título da data
    md += `## 📅 ${data}\n\n`

    // Itens por zona dentro desta data
    const itemsPorZona = {
      Código: itemsData.filter((i) => i.tipo === 'Código'),
      Fluxo: itemsData.filter((i) => i.tipo === 'Fluxo'),
      Script: itemsData.filter((i) => i.tipo === 'Script'),
      API: itemsData.filter((i) => i.tipo === 'API'),
    }

    // Gerar seções de zona (com ### para ficar subseção)
    if (itemsPorZona.Código.length > 0) {
      md += `### Código\n\n`
      for (const item of itemsPorZona.Código) {
        md += generateItem(item, markComplete) + '\n'
      }
      md += '\n'
    }

    if (itemsPorZona.Fluxo.length > 0) {
      md += `### Fluxo\n\n`
      for (const item of itemsPorZona.Fluxo) {
        md += generateItem(item, markComplete) + '\n'
      }
      md += '\n'
    }

    if (itemsPorZona.Script.length > 0) {
      md += `### Script\n\n`
      for (const item of itemsPorZona.Script) {
        md += generateItem(item, markComplete) + '\n'
      }
      md += '\n'
    }

    if (itemsPorZona.API.length > 0) {
      md += `### API\n\n`
      for (const item of itemsPorZona.API) {
        md += generateItem(item, markComplete) + '\n'
      }
      md += '\n'
    }
  }

  // Checklist de ações
  md += generateChecklistAcoes(markComplete)

  return md
}

/**
 * Converte Markdown para HTML (usando marked)
 */
export async function markdownToHtml(markdown: string): Promise<string> {
  const { marked } = await import('marked')

  const html = await marked.parse(markdown, {
    gfm: true,
    breaks: true,
  })

  // Wrapper HTML básico
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Checklist PJe</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      max-width: 900px;
      margin: 40px auto;
      padding: 0 20px;
      line-height: 1.6;
      color: #333;
    }
    h1 { color: #2563eb; border-bottom: 3px solid #2563eb; padding-bottom: 10px; }
    h2 { color: #1e40af; margin-top: 30px; }
    input[type="checkbox"] { margin-right: 8px; }
    code { background: #f3f4f6; padding: 2px 6px; border-radius: 3px; }
    a { color: #2563eb; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
${html}
</body>
</html>
  `.trim()
}
