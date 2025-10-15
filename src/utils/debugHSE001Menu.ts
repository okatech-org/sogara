import { EmployeeRepository } from '@/services/repositories'

declare global {
  interface Window {
    debugHSE001Menu: () => void
    forceHSE001Menu: () => void
  }
}

window.debugHSE001Menu = () => {
  console.log('🔍 Debug du menu HSE001...')

  // Vérifier les données dans localStorage
  const demoAccounts = localStorage.getItem('demoAccounts')
  const employees = localStorage.getItem('employees')

  console.log('📋 Données localStorage:')
  console.log('demoAccounts:', demoAccounts ? JSON.parse(demoAccounts) : 'Non trouvé')
  console.log('employees:', employees ? JSON.parse(employees) : 'Non trouvé')

  // Vérifier les données d'employés
  const employeeRepo = new EmployeeRepository()
  employeeRepo.init()

  console.log('👤 Employés chargés:', employeeRepo.getAll())

  // Vérifier le compte HSE001 spécifiquement
  const hse001Employee = employeeRepo.getAll().find(emp => emp.matricule === 'HSE001')
  console.log('🎯 HSE001 trouvé:', hse001Employee)

  if (hse001Employee) {
    console.log('✅ Rôles HSE001:', hse001Employee.roles)
    console.log('✅ Contient HSSE_CHIEF:', hse001Employee.roles.includes('HSSE_CHIEF'))
  } else {
    console.log('❌ HSE001 non trouvé dans les employés')
  }
}

window.forceHSE001Menu = () => {
  console.log("🚀 Force l'application du menu HSE001...")

  // Force la mise à jour des données d'employés
  const employeeRepo = new EmployeeRepository()
  employeeRepo.init()

  // Mettre à jour HSE001 avec le rôle HSSE_CHIEF
  const employees = employeeRepo.getAll()
  const hse001Index = employees.findIndex(emp => emp.matricule === 'HSE001')

  if (hse001Index !== -1) {
    employees[hse001Index] = {
      ...employees[hse001Index],
      roles: ['HSSE_CHIEF', 'ADMIN', 'HSE', 'COMPLIANCE', 'SECURITE'],
    }

    // Sauvegarder les modifications
    localStorage.setItem('employees', JSON.stringify(employees))
    console.log('✅ HSE001 mis à jour avec le rôle HSSE_CHIEF')
  }

  // Mettre à jour les comptes démo
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
      console.log('✅ Comptes démo mis à jour')
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour des comptes démo:', error)
    }
  }

  console.log('✅ Menu HSE001 forcé. Rechargez la page maintenant.')
  console.log('📋 Commandes disponibles:')
  console.log('   - window.debugHSE001Menu() : Debug des données')
  console.log('   - window.forceHSE001Menu() : Force le menu HSE001')
}
