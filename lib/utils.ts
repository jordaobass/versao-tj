import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/**
 * Normaliza string: remove acentos, trim, lowercase
 */
export function normalize(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

/**
 * Extrai todos os URLs de uma string
 */
export function extractUrls(text: string): string[] {
  const urlRegex = /https?:\/\/\S+/gi
  const matches = text.match(urlRegex)
  return matches ?? []
}

/**
 * Detecta janela de indisponibilidade (ex: "21h - 22h")
 */
export function detectJanela(text: string): string | null {
  const match = text.match(/\b(\d{1,2}h)\s*-\s*(\d{1,2}h)\b/)
  return match ? `${match[1]} - ${match[2]}` : null
}

/**
 * Detecta DISER-OPERAÇÃO com horário
 */
export function detectDiserOperacao(text: string): string | null {
  const match = text.match(/DISER-OPERAÇÃO:\s*(\d{1,2}h)/i)
  return match ? match[1] : null
}

/**
 * Detecta DIBDA com horário
 */
export function detectDibda(text: string): string | null {
  const match = text.match(/DIBDA:\s*(\d{1,2}h)/i)
  return match ? match[1] : null
}

/**
 * Verifica se contém literal "Com indisponibilidade"
 */
export function hasIndisponibilidade(text: string): boolean {
  return /com\s+indisponibilidade/i.test(text)
}
