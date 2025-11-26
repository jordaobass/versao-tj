import { AlertCircle, AlertTriangle } from 'lucide-react'
import type { ValidationIssue } from '@/lib/validations-items'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ValidationCardProps {
  issues: readonly ValidationIssue[]
}

export function ValidationCard({ issues }: ValidationCardProps) {
  if (issues.length === 0) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-700 flex items-center gap-2">
            ✅ Validação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-600">
            Todos os itens estão corretos! Nenhum problema encontrado.
          </p>
        </CardContent>
      </Card>
    )
  }

  const errors = issues.filter((i) => i.severity === 'error')
  const warnings = issues.filter((i) => i.severity === 'warning')

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="text-red-700 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Validação - {issues.length} problema(s) encontrado(s)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {errors.length > 0 && (
          <div>
            <h3 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Erros ({errors.length})
            </h3>
            <div className="space-y-2">
              {errors.map((issue, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white rounded border border-red-200"
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-sm text-red-900">
                        <strong>{issue.itemId}</strong> ({issue.tipo})
                      </p>
                      <p className="text-sm text-gray-700 mt-1">
                        {issue.descricao}
                      </p>
                      <p className="text-xs text-red-600 mt-1">
                        ⚠️ {issue.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {warnings.length > 0 && (
          <div>
            <h3 className="font-semibold text-orange-700 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Avisos ({warnings.length})
            </h3>
            <div className="space-y-2">
              {warnings.map((issue, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white rounded border border-orange-200"
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-sm text-orange-900">
                        <strong>{issue.itemId}</strong> ({issue.tipo})
                      </p>
                      <p className="text-sm text-gray-700 mt-1">
                        {issue.descricao}
                      </p>
                      <p className="text-xs text-orange-600 mt-1">
                        ⚠️ {issue.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
