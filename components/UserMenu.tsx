'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export function UserMenu() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  if (!user) return null

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-600">
        {user.email}
      </span>
      <Button variant="outline" size="sm" onClick={handleLogout}>
        <LogOut className="w-4 h-4" />
        Sair
      </Button>
    </div>
  )
}
