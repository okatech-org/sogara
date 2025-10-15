/**
 * Script de mise à jour forcée du compte HSE001
 * À exécuter dans la console du navigateur pour mettre à jour immédiatement les données
 */

export const forceHSE001Update = () => {
  try {
    const employeesKey = 'sogara_employees'
    const storedData = localStorage.getItem(employeesKey)

    if (!storedData) {
      console.log('❌ Aucune donnée trouvée dans le localStorage')
      return
    }

    const employees = JSON.parse(storedData, (key, value) => {
      if (key.includes('At') || key.includes('Date')) {
        return new Date(value)
      }
      return value
    })

    let updated = false
    const updatedEmployees = employees.map((emp: any) => {
      if (emp.matricule === 'HSE001') {
        updated = true
        console.log('🔄 Mise à jour du compte HSE001...')
        console.log('Ancien rôles:', emp.roles)
        console.log('Anciennes compétences:', emp.competences)
        console.log('Anciennes habilitations:', emp.habilitations)

        return {
          ...emp,
          roles: ['ADMIN', 'HSE', 'COMPLIANCE', 'SECURITE'],
          competences: [
            'Sécurité industrielle',
            'Formation HSSE',
            'Audit conformité',
            'Gestion sécurité',
            'Conformité réglementaire',
            'Management équipes HSSE',
            'Gestion des comptes',
          ],
          habilitations: [
            'Inspection sécurité',
            'Formation obligatoire',
            'Incident management',
            'Gestion réception',
            'Administration HSSE',
            'Création comptes HSSE',
          ],
          updatedAt: new Date(),
        }
      }
      return emp
    })

    if (updated) {
      localStorage.setItem(employeesKey, JSON.stringify(updatedEmployees))
      console.log('✅ Compte HSE001 mis à jour avec succès!')
      console.log(
        'Nouveaux rôles:',
        updatedEmployees.find((e: any) => e.matricule === 'HSE001')?.roles,
      )
      console.log(
        'Nouvelles compétences:',
        updatedEmployees.find((e: any) => e.matricule === 'HSE001')?.competences,
      )
      console.log(
        'Nouvelles habilitations:',
        updatedEmployees.find((e: any) => e.matricule === 'HSE001')?.habilitations,
      )
      console.log('🔄 Rechargez la page pour voir les changements')
      return true
    } else {
      console.log('❌ Compte HSE001 non trouvé')
      return false
    }
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error)
    return false
  }
}

// Rendre disponible globalement
if (typeof window !== 'undefined') {
  ;(window as any).forceHSE001Update = forceHSE001Update
}
