import type { Summary } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface SummaryCardProps {
  summary: Summary
}

export function SummaryCard({ summary }: SummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>📊 Resumo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Total de itens</p>
            <p className="text-2xl font-bold">{summary.totalItems}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Com links</p>
            <p className="text-2xl font-bold">
              {summary.itemsComLink}{' '}
              <span className="text-sm text-gray-500">
                ({summary.percentualComLink}%)
              </span>
            </p>
          </div>
        </div>

        <div className="pt-4 border-t">
          <p className="text-sm font-medium mb-2">Por Zona:</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Código:</span>
              <span className="font-medium">{summary.porZona.Código}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Fluxo:</span>
              <span className="font-medium">{summary.porZona.Fluxo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Script:</span>
              <span className="font-medium">{summary.porZona.Script}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">API:</span>
              <span className="font-medium">{summary.porZona.API}</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <p className="text-sm font-medium mb-2">Por Data:</p>
          <div className="grid grid-cols-1 gap-1 text-sm max-h-32 overflow-y-auto">
            {summary.datas.map((data) => (
              <div key={data} className="flex justify-between">
                <span className="text-gray-600">{data}:</span>
                <span className="font-medium">{summary.porData[data]}</span>
              </div>
            ))}
          </div>
        </div>

        {summary.itemsSustentacao > 0 && (
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Itens em Sustentação:
              </span>
              <span className="text-lg font-bold text-orange-600">
                {summary.itemsSustentacao}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
