import { EmployeeRepository } from '@/services/repositories'

declare global {
  interface Window {
    updateHSSEChiefRole: () => void
  }
}

window.updateHSSEChiefRole = () => {
  console.log('🚀 Mise à jour du rôle HSSE_CHIEF...')

  // Force la mise à jour des données d'employés
  const employeeRepo = new EmployeeRepository()
  employeeRepo.init()

  // Force la mise à jour du localStorage pour les comptes démo
  const demoAccounts = localStorage.getItem('demoAccounts')
  if (demoAccounts) {
    try {
      const accounts = JSON.parse(demoAccounts)
      const updatedAccounts = accounts.map((account: any) => {
        if (account.matricule === 'HSE001') {
          return {
            ...account,
            roles: ['HSSE_CHIEF', 'ADMIN', 'HSE', 'COMPLIANCE', 'SECURITE'],
            defaultRoute: '/app/hsse-management',
          }
        }
        return account
      })
      localStorage.setItem('demoAccounts', JSON.stringify(updatedAccounts))
      console.log('✅ Rôle HSSE_CHIEF mis à jour dans localStorage')
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du rôle:', error)
    }
  }

  console.log('✅ Mise à jour terminée. Rechargez la page et connectez-vous avec HSE001.')
  console.log('📋 Nouvelles fonctionnalités disponibles:')
  console.log('   - Dashboard de gestion HSSE: /app/hsse-management')
  console.log('   - Gestion des comptes HSSE: /app/hsse-accounts')
  console.log('   - Statistiques des visites: /app/visits-stats')
  console.log('   - Statistiques des colis: /app/mail-stats')
  console.log('   - Statistiques des équipements: /app/equipment-stats')
}
