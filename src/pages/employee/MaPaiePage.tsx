import { useState, useMemo, useEffect } from 'react'
import { DollarSign, Download, Calendar, TrendingUp, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/contexts/AppContext'
import { usePayroll } from '@/hooks/usePayroll'
import { useVacations } from '@/hooks/useVacations'
import { payrollCalculator } from '@/services/payroll-calculator.service'

export function MaPaiePage() {
  const { currentUser } = useAuth()
  const { getMyPayslip, generateOrUpdatePayslip } = usePayroll()
  const { getTotalHours } = useVacations()

  const currentDate = new Date()
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const [baseSalary] = useState(500000) // À récupérer depuis employee.position.baseSalary

  const payslip = getMyPayslip(currentUser?.id || '', selectedMonth, selectedYear)
  const hoursWorked = getTotalHours(currentUser?.id || '', selectedMonth, selectedYear)

  useEffect(() => {
    // Générer automatiquement la paie si elle n'existe pas et qu'il y a des heures
    if (!payslip && hoursWorked > 0 && currentUser?.id) {
      generateOrUpdatePayslip(currentUser.id, baseSalary, selectedMonth, selectedYear)
    }
  }, [payslip, hoursWorked, currentUser?.id, selectedMonth, selectedYear])

  const months = [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre',
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            Ma Paie
          </h1>
          <p className="text-muted-foreground mt-2">
            Consultation de mes fiches de paie et heures travaillées
          </p>
        </div>

        {payslip && (
          <Badge
            className={
              payslip.status === 'PAID'
                ? 'bg-green-500'
                : payslip.status === 'VALIDATED'
                  ? 'bg-blue-500'
                  : 'bg-gray-500'
            }
          >
            {payslip.status === 'PAID'
              ? 'Payé'
              : payslip.status === 'VALIDATED'
                ? 'Validé'
                : payslip.status === 'PENDING'
                  ? 'En attente'
                  : 'Brouillon'}
          </Badge>
        )}
      </div>

      {/* Sélection période */}
      <Card className="industrial-card">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Mois</label>
              <Select
                value={selectedMonth.toString()}
                onValueChange={v => setSelectedMonth(parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, index) => (
                    <SelectItem key={index} value={(index + 1).toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Année</label>
              <Select
                value={selectedYear.toString()}
                onValueChange={v => setSelectedYear(parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fiche de paie */}
      {!payslip && hoursWorked === 0 ? (
        <Card className="industrial-card">
          <CardContent className="text-center py-16">
            <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Aucune fiche de paie</h3>
            <p className="text-muted-foreground">
              Aucune vacation n'a été effectuée pour cette période.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="industrial-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">
              Fiche de Paie - {months[selectedMonth - 1]} {selectedYear}
            </CardTitle>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              PDF
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Informations employé */}
            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Employé</p>
                  <p className="font-medium">
                    {currentUser?.firstName} {currentUser?.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Matricule</p>
                  <p className="font-medium">{currentUser?.matricule}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Service</p>
                  <p className="font-medium">{currentUser?.service}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Période</p>
                  <p className="font-medium">
                    {selectedMonth}/{selectedYear}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Heures */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Détail des Heures</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-3 bg-blue-50 rounded">
                  <p className="text-sm text-muted-foreground">Heures travaillées</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {payslip?.totalHours.toFixed(1) || hoursWorked.toFixed(1)}h
                  </p>
                </div>
                <div className="p-3 bg-orange-50 rounded">
                  <p className="text-sm text-muted-foreground">Heures supplémentaires</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {payslip?.overtimeHours.toFixed(1) || '0'}h
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded">
                  <p className="text-sm text-muted-foreground">Heures de nuit</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {payslip?.nightHours.toFixed(1) || '0'}h
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Rémunération */}
            {payslip && (
              <>
                <div>
                  <h3 className="font-semibold text-lg mb-4">Rémunération</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Salaire de base:</span>
                      <span className="font-medium">
                        {payrollCalculator.formatCurrency(payslip.baseSalary)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Prime heures sup:</span>
                      <span className="font-medium">
                        {payrollCalculator.formatCurrency(payslip.overtimePay)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Prime de nuit:</span>
                      <span className="font-medium">
                        {payrollCalculator.formatCurrency(payslip.nightPay)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Prime de risque:</span>
                      <span className="font-medium">
                        {payrollCalculator.formatCurrency(payslip.hazardPay)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Indemnité transport:</span>
                      <span className="font-medium">
                        {payrollCalculator.formatCurrency(payslip.transportAllowance)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Indemnité repas:</span>
                      <span className="font-medium">
                        {payrollCalculator.formatCurrency(payslip.mealAllowance)}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                  <span className="font-semibold text-lg">Salaire Brut:</span>
                  <span className="text-2xl font-bold text-green-600">
                    {payrollCalculator.formatCurrency(payslip.grossSalary)}
                  </span>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold text-lg mb-4">Cotisations et Retenues</h3>
                  <div className="space-y-2 text-sm text-red-600">
                    <div className="flex justify-between">
                      <span>Sécurité sociale (15%):</span>
                      <span className="font-medium">
                        -{payrollCalculator.formatCurrency(payslip.socialSecurity)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Impôt sur le revenu (20%):</span>
                      <span className="font-medium">
                        -{payrollCalculator.formatCurrency(payslip.incomeTax)}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between items-center p-4 bg-green-100 rounded-lg border-2 border-green-500">
                  <span className="font-bold text-xl">NET À PAYER:</span>
                  <span className="text-3xl font-bold text-green-700">
                    {payrollCalculator.formatCurrency(payslip.netSalary)}
                  </span>
                </div>

                <div className="text-xs text-muted-foreground text-center pt-4">
                  <p>Fiche générée le {payslip.generatedAt.toLocaleDateString('fr-FR')}</p>
                  {payslip.validatedAt && (
                    <p>Validée le {payslip.validatedAt.toLocaleDateString('fr-FR')}</p>
                  )}
                </div>
              </>
            )}

            {!payslip && hoursWorked > 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Fiche de paie en cours de génération...
                </p>
                <p className="text-sm text-muted-foreground">
                  {hoursWorked.toFixed(1)}h travaillées ce mois
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
