import { Label } from '@/components/ui/label'
import { Calendar } from 'lucide-react'

interface DateSelectorProps {
  datas: readonly string[]
  selectedDatas: string[]
  onToggle: (data: string) => void
  onSelectAll: () => void
  onDeselectAll: () => void
}

export function DateSelector({
  datas,
  selectedDatas,
  onToggle,
  onSelectAll,
  onDeselectAll,
}: DateSelectorProps) {
  const allSelected = selectedDatas.length === datas.length
  const noneSelected = selectedDatas.length === 0

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Selecionar Datas (dd/MM/yyyy)
        </Label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onSelectAll}
            disabled={allSelected}
            className="text-xs text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Todas
          </button>
          <span className="text-xs text-gray-400">|</span>
          <button
            type="button"
            onClick={onDeselectAll}
            disabled={noneSelected}
            className="text-xs text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Nenhuma
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-md p-3 bg-gray-50">
        {datas.length === 0 ? (
          <p className="text-sm text-gray-500 col-span-2 text-center py-4">
            Nenhuma data disponível
          </p>
        ) : (
          datas.map((data) => {
            const isSelected = selectedDatas.includes(data)
            return (
              <label
                key={data}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded transition-colors"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggle(data)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{data}</span>
              </label>
            )
          })
        )}
      </div>

      {noneSelected && (
        <p className="text-xs text-orange-600">
          ⚠️ Selecione pelo menos uma data
        </p>
      )}

      <p className="text-xs text-gray-500">
        {selectedDatas.length} de {datas.length} data(s) selecionada(s)
      </p>
    </div>
  )
}
