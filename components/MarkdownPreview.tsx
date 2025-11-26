import { useMemo } from 'react'

interface MarkdownPreviewProps {
  markdown: string
}

export function MarkdownPreview({ markdown }: MarkdownPreviewProps) {
  const html = useMemo(() => {
    // Conversão simples de Markdown para HTML
    let result = markdown

    // Headings
    result = result.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-blue-700 mt-6 mb-4 border-b-2 border-blue-700 pb-2">$1</h1>')
    result = result.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-blue-600 mt-5 mb-3">$1</h2>')
    result = result.replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-gray-700 mt-3 mb-2 ml-4">$1</h3>')

    // Bold
    result = result.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>')

    // Links
    result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')

    // Checkboxes
    result = result.replace(/- \[x\] /g, '<div class="flex items-start gap-2 mb-2"><input type="checkbox" checked disabled class="mt-1 h-4 w-4 rounded border-gray-300" /><span>')
    result = result.replace(/- \[ \] /g, '<div class="flex items-start gap-2 mb-2"><input type="checkbox" disabled class="mt-1 h-4 w-4 rounded border-gray-300" /><span>')

    // Unordered lists (que não são checkboxes)
    result = result.replace(/^- ([^\[].*$)/gim, '<li class="ml-4 mb-1">$1</li>')

    // Line breaks
    result = result.replace(/\n\n/g, '</span></div><div class="mb-3">')
    result = result.replace(/  \n/g, '<br />')
    result = result.replace(/\n/g, '<br />')

    // Fechar divs de checkbox
    result = result.replace(/<\/span><\/div><div class="mb-3">(<div class="flex items-start)/g, '</span></div>$1')

    return result
  }, [markdown])

  return (
    <div
      className="prose prose-sm max-w-none p-6 bg-white rounded-lg border border-gray-200"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
