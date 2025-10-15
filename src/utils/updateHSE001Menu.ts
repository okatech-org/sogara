import { EmployeeRepository } from '@/services/repositories'

declare global {
  interface Window {
    updateHSE001Menu: () => void
  }
}

window.updateHSE001Menu = () => {
  console.log('🚀 Mise à jour du menu HSE001...')

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
      console.log('✅ Menu HSE001 mis à jour dans localStorage')
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du menu:', error)
    }
  }

  console.log('✅ Mise à jour terminée. Rechargez la page et connectez-vous avec HSE001.')
  console.log('📋 Menu HSE001 disponible:')
  console.log('   - Tableau de bord: /app/dashboard')
  console.log('   - Gestion HSSE: /app/hsse-management (page principale)')
  console.log('   - Comptes HSSE: /app/hsse-accounts')
  console.log('   - Administration HSSE: /app/hse001')
  console.log('   - Statistiques Visites: /app/visits-stats')
  console.log('   - Statistiques Colis: /app/mail-stats')
  console.log('   - Statistiques Équipements: /app/equipment-stats')
  console.log('   - SOGARA Connect: /app/connect')
  console.log('   - Mon Planning: /app/mon-planning')
}
