import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, LogIn, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { demoAccounts, getAccountBySlug } from '@/data/demoAccounts'

export default function AccountDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()

  const account = slug ? getAccountBySlug(slug) : undefined

  if (!account) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Compte introuvable</h1>
            <p className="text-muted-foreground">
              Le profil demandé n’existe pas. Sélectionnez un compte valide.
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/app/accounts')}>
            Retour au catalogue
          </Button>
        </div>
      </div>
    )
  }

  const Icon = account.icon

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{account.fullName}</h1>
            <p className="text-muted-foreground">{account.jobTitle}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant="outline">{account.matricule}</Badge>
              <Badge variant="secondary">{account.roles.join(', ')}</Badge>
            </div>
          </div>
        </div>
        <Button className="gap-2" onClick={() => navigate('/login')}>
          <LogIn className="w-4 h-4" />
          Se connecter avec ce compte
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
        <Card className="industrial-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 ${account.colorClass} rounded-lg flex items-center justify-center`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <CardTitle>{account.featuredModule}</CardTitle>
                <CardDescription>{account.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm text-foreground">Responsabilités principales</h4>
              <ul className="mt-2 space-y-2 pl-4 text-sm text-muted-foreground list-disc">
                {account.responsibilities.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-muted/40">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Permissions & Accès</CardTitle>
                  <CardDescription>Résumé des modules accessibles</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{account.accessSummary}</p>
                </CardContent>
              </Card>

              {account.loginHint && (
                <Card className="bg-muted/40">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Identifiants démo</CardTitle>
                    <CardDescription>Utilisez ces informations pour tester l’accès</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium text-primary">{account.loginHint}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => navigate(account.defaultRoute)}
              >
                Accéder au module de référence
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={() => navigate('/app/accounts')}
              >
                Voir les autres comptes
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="industrial-card">
          <CardHeader>
            <CardTitle>Profils similaires</CardTitle>
            <CardDescription>Explorez des rôles proches pour compléter vos tests.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {demoAccounts
              .filter(item => item.slug !== account.slug)
              .slice(0, 3)
              .map(item => (
                <Button
                  key={item.id}
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => navigate(`/app/accounts/${item.slug}`)}
                >
                  <span className="flex items-center gap-2">
                    <item.icon className="w-4 h-4" />
                    {item.fullName}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
