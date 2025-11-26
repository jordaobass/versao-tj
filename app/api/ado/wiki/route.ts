import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const requestSchema = z.object({
  markdown: z.string().min(1),
})

/**
 * POST /api/ado/wiki
 * Publica checklist no Azure DevOps Wiki
 */
export async function POST(request: NextRequest) {
  try {
    // Validar variáveis de ambiente
    const adoOrg = process.env.ADO_ORG
    const adoProject = process.env.ADO_PROJECT
    const adoPat = process.env.ADO_PAT

    if (!adoOrg || !adoProject || !adoPat) {
      return NextResponse.json(
        {
          error:
            'Azure DevOps não configurado. Defina as variáveis ADO_ORG, ADO_PROJECT e ADO_PAT.',
        },
        { status: 500 }
      )
    }

    // Parse body
    const body = await request.json()
    const { markdown } = requestSchema.parse(body)

    // Gerar nome da página com data atual
    const today = new Date().toISOString().split('T')[0] // yyyy-mm-dd
    const pagePath = `/Releases/${today}`

    // Endpoint Azure DevOps Wiki API
    const wikiUrl = `${adoOrg}/${adoProject}/_apis/wiki/wikis/${adoProject}.wiki/pages?path=${encodeURIComponent(pagePath)}&api-version=7.0`

    // Criar/atualizar página no Wiki
    const response = await fetch(wikiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`:${adoPat}`).toString('base64')}`,
      },
      body: JSON.stringify({
        content: markdown,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Azure DevOps API error:', errorText)
      return NextResponse.json(
        {
          error: `Erro ao publicar no Wiki: ${response.status} ${response.statusText}`,
          details: errorText,
        },
        { status: response.status }
      )
    }

    const result = await response.json()

    return NextResponse.json({
      success: true,
      url: result.remoteUrl,
      page: pagePath,
    })
  } catch (err) {
    console.error('Error publishing to Wiki:', err)

    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: err.errors },
        { status: 400 }
      )
    }

    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
