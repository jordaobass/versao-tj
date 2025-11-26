'use client'

import { useCallback, useState } from 'react'
import { Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  disabled?: boolean
}

export function FileUpload({ onFileSelect, disabled }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)

      if (disabled) return

      const files = Array.from(e.dataTransfer.files)
      const validFile = files.find(
        (f) => f.name.endsWith('.csv') || f.name.endsWith('.xlsx')
      )

      if (validFile) {
        onFileSelect(validFile)
      }
    },
    [onFileSelect, disabled]
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        onFileSelect(file)
      }
    },
    [onFileSelect]
  )

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={cn(
        'relative border-2 border-dashed rounded-lg p-12 text-center transition-colors',
        isDragging
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 bg-gray-50',
        disabled && 'opacity-50 pointer-events-none'
      )}
    >
      <Upload className="mx-auto h-12 w-12 text-gray-400" />
      <p className="mt-4 text-sm text-gray-600">
        Arraste e solte um arquivo CSV ou Excel aqui, ou
      </p>
      <label className="mt-2 inline-block">
        <span className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-700">
          clique para selecionar
        </span>
        <input
          type="file"
          accept=".csv,.xlsx"
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />
      </label>
      <p className="mt-2 text-xs text-gray-500">
        Formatos aceitos: .csv, .xlsx
      </p>
    </div>
  )
}
