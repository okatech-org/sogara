import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AppContext'
import { repositories } from '@/services/repositories'

const SUPER_ADMIN_EMAIL = 'superadmin@sogara.pro'
const SUPER_ADMIN_PASSWORD = '011282*'

interface SuperAdminLoginProps {
  isOpen: boolean
  onClose: () => void
}

export function SuperAdminLoginDialog({ isOpen, onClose }: SuperAdminLoginProps) {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (password === SUPER_ADMIN_PASSWORD) {
        const superAdmin = repositories.employees
          .getAll()
          .find(emp => emp.email === SUPER_ADMIN_EMAIL)

        if (superAdmin) {
          login(superAdmin)

          toast({
            title: '🔐 Accès Super Admin',
            description: `Bienvenue ${superAdmin.firstName} ${superAdmin.lastName}`,
          })

          onClose()
          setTimeout(() => {
            navigate('/app/admin')
          }, 200)
        } else {
          toast({
            title: 'Erreur',
            description: 'Compte Super Admin introuvable.',
            variant: 'destructive',
          })
        }
      } else {
        toast({
          title: 'Accès refusé',
          description: "Code d'authentification incorrect.",
          variant: 'destructive',
        })
      }
    } finally {
      setLoading(false)
      setPassword('')
    }
  }

  const handleForgotPassword = () => {
    toast({
      title: 'Mot de passe oublié',
      description: "Contactez l'administrateur système pour réinitialiser votre code d'accès.",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Accès Super Admin
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="super-admin-password">Code d'authentification</Label>
            <Input
              id="super-admin-password"
              type="password"
              placeholder="Entrez votre code à 6 chiffres + caractère spécial"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading}
              className="text-center font-mono text-lg tracking-wider"
            />
            <p className="text-xs text-muted-foreground text-center">
              Format attendu : 6 chiffres + 1 caractère spécial
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Button type="submit" className="w-full gradient-primary" disabled={loading}>
              {loading ? 'Vérification...' : 'Se connecter'}
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleForgotPassword}
              className="text-xs text-muted-foreground hover:text-primary"
            >
              Mot de passe oublié ?
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface SuperAdminLockProps {
  className?: string
}

export function SuperAdminLock({ className = '' }: SuperAdminLockProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [clickCount, setClickCount] = useState(0)
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null)

  const handleClick = () => {
    setClickCount(prev => prev + 1)

    if (clickTimeout) {
      clearTimeout(clickTimeout)
    }

    const timeout = setTimeout(() => {
      setClickCount(0)
    }, 500)

    setClickTimeout(timeout)

    if (clickCount + 1 === 2) {
      setIsOpen(true)
      setClickCount(0)
      if (clickTimeout) {
        clearTimeout(clickTimeout)
      }
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        className={`text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors ${className}`}
        aria-label="Accès Super Admin"
      >
        <Lock className="w-3 h-3" />
      </button>

      <SuperAdminLoginDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
