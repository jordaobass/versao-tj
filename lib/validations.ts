import { z } from 'zod'

/**
 * Schema para linha do CSV
 * Nota: Zod v4 usa nova API, mas mantém compatibilidade básica
 */
export const csvRowSchema = z.object({
  data: z.string().optional().default(''),
  rdm: z.string().optional().default(''),
  requisicao: z.string().optional().default(''),
  tipoDeclarado: z.string().optional().default(''),
  descricao: z.string().optional().default(''),
  equipe: z.string().optional().default(''),
  responsavel: z.string().optional().default(''),
  migrationScript: z.string().optional().default(''),
  prLink: z.string().optional().default(''),
  implantacaoLink: z.string().optional().default(''),
  aculturamento: z.string().optional().default(''),
  obs: z.string().optional().default(''),
  problemas: z.string().optional().default(''),
  descricaoProblema: z.string().optional().default(''),
  tipo: z.string().optional().default(''),
})

export type CsvRow = z.infer<typeof csvRowSchema>

/**
 * Valida array de rows
 */
export const csvDataSchema = z.array(csvRowSchema)

/**
 * Schema para configuração de Azure DevOps
 */
export const adoConfigSchema = z.object({
  org: z.string().url(),
  project: z.string().min(1),
  pat: z.string().min(1),
})

export type AdoConfig = z.infer<typeof adoConfigSchema>
