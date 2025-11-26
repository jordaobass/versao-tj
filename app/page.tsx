'use client'

import { useState } from 'react'
import { Download, Send, FileText, Eye, Code } from 'lucide-react'
import { FileUpload } from '@/components/FileUpload'
import { SummaryCard } from '@/components/SummaryCard'
import { ValidationCard } from '@/components/ValidationCard'
import { MarkdownPreview } from '@/components/MarkdownPreview'
import { DateSelector } from '@/components/DateSelector'
import { AppLayout } from '@/components/AppLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { parseFile, rowsToItems } from '@/lib/parse'
import { calculateSummary } from '@/lib/summary'
import { generateMarkdown, markdownToHtml } from '@/lib/generateMd'
import { validateItems, type ValidationIssue } from '@/lib/validations-items'
import type { ParsedData } from '@/types'

function HomeContent() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<ParsedData | null>(null)
  const [markdown, setMarkdown] = useState('')
  const [markAllComplete, setMarkAllComplete] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([])
  const [previewMode, setPreviewMode] = useState<'formatted' | 'raw'>('formatted')
  const [selectedDatas, setSelectedDatas] = useState<string[]>([])

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile)
    setError(null)
    setLoading(true)

    try {
      const { rows, metadados } = await parseFile(selectedFile)
      const items = rowsToItems(rows)
      const summary = calculateSummary(items)

      const parsedData: ParsedData = {
        metadados,
        items,
        summary,
      }

      setData(parsedData)

      // Validar itens
      const issues = validateItems(items)
      setValidationIssues(issues)

      // Selecionar todas as datas por padrão
      setSelectedDatas(summary.datas.slice())

      const md = generateMarkdown(parsedData, {
        markAllComplete,
        selectedDatas: summary.datas.slice()
      })
      setMarkdown(md)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao processar arquivo'
      setError(message)
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleComplete = (checked: boolean) => {
    setMarkAllComplete(checked)
    if (data) {
      const md = generateMarkdown(data, {
        markAllComplete: checked,
        selectedDatas
      })
      setMarkdown(md)
    }
  }

  const handleToggleData = (dataStr: string) => {
    const newSelected = selectedDatas.includes(dataStr)
      ? selectedDatas.filter((d) => d !== dataStr)
      : [...selectedDatas, dataStr]

    setSelectedDatas(newSelected)

    if (data) {
      const md = generateMarkdown(data, {
        markAllComplete,
        selectedDatas: newSelected,
      })
      setMarkdown(md)
    }
  }

  const handleSelectAllDatas = () => {
    if (data) {
      setSelectedDatas(data.summary.datas.slice())
      const md = generateMarkdown(data, {
        markAllComplete,
        selectedDatas: data.summary.datas.slice(),
      })
      setMarkdown(md)
    }
  }

  const handleDeselectAllDatas = () => {
    setSelectedDatas([])
    if (data) {
      const md = generateMarkdown(data, {
        markAllComplete,
        selectedDatas: [],
      })
      setMarkdown(md)
    }
  }

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleDownloadMd = () => {
    downloadFile(markdown, 'pje-checklist.md', 'text/markdown')
  }

  const handleDownloadJson = () => {
    if (!data) return
    const json = JSON.stringify(data, null, 2)
    downloadFile(json, 'pje-checklist.json', 'application/json')
  }

  const handleDownloadHtml = async () => {
    const html = await markdownToHtml(markdown)
    downloadFile(html, 'pje-checklist.html', 'text/html')
  }

  const handlePublishWiki = async () => {
    setPublishing(true)
    try {
      const response = await fetch('/api/ado/wiki', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao publicar no Wiki')
      }

      alert('Checklist publicado no Azure DevOps Wiki com sucesso!')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao publicar'
      alert(`Erro: ${message}`)
    } finally {
      setPublishing(false)
    }
  }

  // Verificar se Azure DevOps está configurado
  const hasAdoConfig =
    typeof window !== 'undefined' &&
    process.env.NEXT_PUBLIC_ADO_ORG &&
    process.env.NEXT_PUBLIC_ADO_PROJECT

  return (
    <div className="py-8 px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Checklist de Implantação
          </h1>
          <p className="text-gray-600">
            Gerador de checklist para versões PJe a partir de CSV/Excel
          </p>
        </div>

        {/* Upload */}
        <FileUpload onFileSelect={handleFileSelect} disabled={loading} />

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Processando arquivo...</p>
          </div>
        )}

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-700">Erro</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {data && (
          <>
            {/* Controls */}
            <Card>
              <CardHeader>
                <CardTitle>⚙️ Configurações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="mark-complete"
                    checked={markAllComplete}
                    onCheckedChange={handleToggleComplete}
                  />
                  <Label htmlFor="mark-complete">
                    Marcar todas as ações como concluídas
                  </Label>
                </div>

                <div className="border-t pt-4">
                  <DateSelector
                    datas={data.summary.datas}
                    selectedDatas={selectedDatas}
                    onToggle={handleToggleData}
                    onSelectAll={handleSelectAllDatas}
                    onDeselectAll={handleDeselectAllDatas}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <SummaryCard summary={data.summary} />

            {/* Validation */}
            <ValidationCard issues={validationIssues} />

            {/* Preview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>👁️ Preview do Checklist</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={previewMode === 'formatted' ? 'default' : 'outline'}
                      onClick={() => setPreviewMode('formatted')}
                    >
                      <Eye className="w-4 h-4" />
                      Formatado
                    </Button>
                    <Button
                      size="sm"
                      variant={previewMode === 'raw' ? 'default' : 'outline'}
                      onClick={() => setPreviewMode('raw')}
                    >
                      <Code className="w-4 h-4" />
                      Código
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {previewMode === 'formatted' ? (
                  <div className="max-h-[600px] overflow-y-auto">
                    <MarkdownPreview markdown={markdown} />
                  </div>
                ) : (
                  <textarea
                    readOnly
                    value={markdown}
                    className="w-full h-[600px] p-4 font-mono text-sm border rounded-md bg-gray-50 resize-none"
                  />
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleDownloadMd}>
                <Download className="w-4 h-4" />
                Baixar .md
              </Button>
              <Button onClick={handleDownloadJson} variant="outline">
                <FileText className="w-4 h-4" />
                Baixar .json
              </Button>
              <Button onClick={handleDownloadHtml} variant="outline">
                <FileText className="w-4 h-4" />
                Baixar .html
              </Button>
              {hasAdoConfig && (
                <Button
                  onClick={handlePublishWiki}
                  disabled={publishing}
                  variant="secondary"
                >
                  <Send className="w-4 h-4" />
                  {publishing ? 'Publicando...' : 'Publicar no Azure DevOps Wiki'}
                </Button>
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 pt-8">
          <p>
            Desenvolvido para PJe RJ •{' '}
            <a
              href="https://github.com"
              className="text-blue-600 hover:underline"
            >
              Documentação
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <AppLayout>
      <HomeContent />
    </AppLayout>
  )
}
