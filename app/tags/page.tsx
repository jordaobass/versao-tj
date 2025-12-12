'use client'

import { useState } from 'react'
import { Download, Eye, Code, Copy, Check, Calendar } from 'lucide-react'
import { AppLayout } from '@/components/AppLayout'
import { FileUpload } from '@/components/FileUpload'
import { MarkdownPreview } from '@/components/MarkdownPreview'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { parseTagsFile, generateTagsMarkdown, type TagData } from '@/lib/tags-generator'

function TagsContent() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [allTags, setAllTags] = useState<TagData[]>([])
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [markdown, setMarkdown] = useState('')
  const [previewMode, setPreviewMode] = useState<'formatted' | 'raw'>('raw')
  const [copied, setCopied] = useState(false)

  // Tag selecionada (filtrada por data)
  const selectedTag = allTags.find((t) => t.data === selectedDate)

  const handleFileSelect = async (file: File) => {
    setError(null)
    setLoading(true)

    try {
      const result = await parseTagsFile(file)
      setAllTags(result.tags)

      // Extrair datas disponíveis
      const dates = result.tags.map((t) => t.data)
      setAvailableDates(dates)

      // Selecionar primeira data por padrão
      const firstDate = dates[0]
      if (firstDate) {
        setSelectedDate(firstDate)
        const filteredTags = result.tags.filter((t) => t.data === firstDate)
        setMarkdown(generateTagsMarkdown(filteredTags))
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao processar arquivo'
      setError(message)
      setAllTags([])
      setAvailableDates([])
      setSelectedDate('')
      setMarkdown('')
    } finally {
      setLoading(false)
    }
  }

  const handleDateChange = (date: string) => {
    setSelectedDate(date)
    const filteredTags = allTags.filter((t) => t.data === date)
    setMarkdown(generateTagsMarkdown(filteredTags))
  }

  const updateTag = (field: keyof TagData, value: string) => {
    const newTags = allTags.map((t) =>
      t.data === selectedDate ? { ...t, [field]: value } : t
    )
    setAllTags(newTags)
    const filteredTags = newTags.filter((t) => t.data === selectedDate)
    setMarkdown(generateTagsMarkdown(filteredTags))
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
    const filename = selectedDate
      ? `pje-versao-${selectedDate.replace(/\//g, '-')}.md`
      : 'pje-versao.md'
    downloadFile(markdown, filename, 'text/markdown')
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="py-8 px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gerar Doc da Versão
          </h1>
          <p className="text-gray-600">
            Gera documentação da versão no formato Wiki do Azure DevOps
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

        {availableDates.length > 0 && (
          <>
            {/* Seletor de Data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Selecionar Data da Versão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {availableDates.map((date) => (
                    <button
                      key={date}
                      onClick={() => handleDateChange(date)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        selectedDate === date
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {date}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Editor de Tag */}
            {selectedTag && (
              <Card>
                <CardHeader>
                  <CardTitle>Dados da Versão - {selectedDate}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tag">Tag</Label>
                      <input
                        id="tag"
                        type="text"
                        value={selectedTag.tag}
                        onChange={(e) => updateTag('tag', e.target.value)}
                        placeholder="TJRJ_TAG_X.X.X"
                        className="w-full px-3 py-2 border rounded-md text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nacional">Nacional</Label>
                      <input
                        id="nacional"
                        type="text"
                        value={selectedTag.nacional}
                        onChange={(e) => updateTag('nacional', e.target.value)}
                        placeholder="2.2.0.4"
                        className="w-full px-3 py-2 border rounded-md text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="observacao">Observação</Label>
                      <input
                        id="observacao"
                        type="text"
                        value={selectedTag.observacao}
                        onChange={(e) => updateTag('observacao', e.target.value)}
                        placeholder=""
                        className="w-full px-3 py-2 border rounded-md text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="imagemProducao">Imagem Produção</Label>
                      <input
                        id="imagemProducao"
                        type="text"
                        value={selectedTag.imagemProducao}
                        onChange={(e) => updateTag('imagemProducao', e.target.value)}
                        placeholder="61383-tjrj"
                        className="w-full px-3 py-2 border rounded-md text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="imagemSustentacao">Imagem Sustentação</Label>
                      <input
                        id="imagemSustentacao"
                        type="text"
                        value={selectedTag.imagemSustentacao}
                        onChange={(e) => updateTag('imagemSustentacao', e.target.value)}
                        placeholder="61386-tjrj"
                        className="w-full px-3 py-2 border rounded-md text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="imagemTreinamento">Imagem Treinamento</Label>
                      <input
                        id="imagemTreinamento"
                        type="text"
                        value={selectedTag.imagemTreinamento}
                        onChange={(e) => updateTag('imagemTreinamento', e.target.value)}
                        placeholder=""
                        className="w-full px-3 py-2 border rounded-md text-sm"
                      />
                    </div>
                  </div>

                  {/* Descrições (readonly) */}
                  <div className="pt-4 border-t">
                    <Label className="font-medium">Itens da Versão</Label>
                    <div className="mt-2 p-4 bg-gray-50 rounded-lg max-h-60 overflow-y-auto">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {selectedTag.descricao.replace(/ <br> /g, '\n')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Preview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Preview do Markdown</CardTitle>
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
                  <div className="max-h-[300px] overflow-y-auto">
                    <MarkdownPreview markdown={markdown} />
                  </div>
                ) : (
                  <textarea
                    readOnly
                    value={markdown}
                    className="w-full h-[300px] p-4 font-mono text-sm border rounded-md bg-gray-50 resize-none"
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
              <Button onClick={handleCopy} variant="outline">
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copiar Markdown
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function TagsPage() {
  return (
    <AppLayout>
      <TagsContent />
    </AppLayout>
  )
}
