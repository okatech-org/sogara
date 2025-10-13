import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight, LogIn } from 'lucide-react'
import { Link } from 'react-router-dom'
import { demoAccounts } from '@/data/demoAccounts'
import type { DemoAccount } from '@/data/demoAccounts'

function AccountCard({ account }: { account: DemoAccount }) {
  const Icon = account.icon

  return (
    <Card className="industrial-card">
      <CardHeader className="space-y-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 ${account.colorClass} rounded-lg flex items-center justify-center`}
          >
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <CardTitle className="text-lg">{account.fullName}</CardTitle>
            <CardDescription>{account.jobTitle}</CardDescription>
          </div>
        </div>
        <Badge variant="outline" className="w-fit">
          {account.matricule}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium text-sm text-foreground">Résumé du rôle</h4>
          <p className="text-sm text-muted-foreground mt-1">{account.description}</p>
        </div>

        <div>
          <h4 className="font-medium text-sm text-foreground">Responsabilités</h4>
          <ul className="mt-2 space-y-1 pl-4 text-sm text-muted-foreground list-disc">
            {account.responsibilities.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
          <p className="text-sm font-medium text-primary">Accès : {account.accessSummary}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Module conseillé : {account.featuredModule}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            to={account.defaultRoute}
            className="inline-flex items-center gap-2 text-sm text-primary underline underline-offset-4"
          >
            Ouvrir le module par défaut
            <ArrowRight className="w-4 h-4" />
          </Link>
          {account.loginHint && (
            <div className="text-xs text-muted-foreground">{account.loginHint}</div>
          )}
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link to="/login">
              <LogIn className="w-4 h-4" />
              Se connecter avec ce compte
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AccountHub() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Comptes de démonstration</h1>
          <p className="text-muted-foreground">
            Sélectionnez un profil métier pour explorer l’application depuis son point de vue.
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link to="/login">
            <LogIn className="w-4 h-4" />
            Aller à la connexion
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="adm001" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 w-full">
          {demoAccounts.map(account => (
            <TabsTrigger key={account.id} value={account.slug} className="text-xs md:text-sm">
              {account.matricule}
            </TabsTrigger>
          ))}
        </TabsList>

        {demoAccounts.map(account => (
          <TabsContent key={account.id} value={account.slug} className="space-y-6">
            <AccountCard account={account} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
