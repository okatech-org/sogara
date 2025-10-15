import { EmployeeRepository } from '@/services/repositories'

declare global {
  interface Window {
    updatePersonalizedURLs: () => void
  }
}

window.updatePersonalizedURLs = () => {
  console.log('🚀 Mise à jour des URLs personnalisées...')

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
          return { ...account, defaultRoute: '/app/hse001' }
        }
        if (account.matricule === 'HSE002') {
          return { ...account, defaultRoute: '/app/hse002' }
        }
        return account
      })
      localStorage.setItem('demoAccounts', JSON.stringify(updatedAccounts))
      console.log('✅ URLs personnalisées mises à jour dans localStorage')
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour des URLs:', error)
    }
  }

  console.log('✅ Mise à jour terminée. Rechargez la page et connectez-vous avec HSE001 ou HSE002.')
  console.log('📋 URLs disponibles:')
  console.log('   - HSE001: /app/hse001 (Administration HSSE)')
  console.log('   - HSE002: /app/hse002 (HSSE Opérationnel)')
}
