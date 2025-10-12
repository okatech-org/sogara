/**
 * Utilitaire de nettoyage du cache localStorage
 * À utiliser après mise à jour des données de démonstration
 */

export function clearAllCache(): void {
  console.log('🧹 Nettoyage du cache localStorage...');
  
  const keysToRemove = [
    'sogara_employees',
    'sogara_visitors',
    'sogara_visits',
    'sogara_packages',
    'sogara_equipment',
    'sogara_hse_incidents',
    'sogara_hse_trainings',
    'sogara_posts',
    'sogara_notifications',
    'userId',
    'matricule'
  ];

  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`  ✅ Supprimé: ${key}`);
  });

  console.log('✅ Cache nettoyé ! Rechargement de la page...');
  window.location.reload();
}

export function clearUserCache(): void {
  console.log('🧹 Nettoyage du cache utilisateur...');
  
  localStorage.removeItem('userId');
  localStorage.removeItem('matricule');
  
  console.log('✅ Cache utilisateur nettoyé !');
}

export function forceClearEmployeeCache(): void {
  console.log('🧹 Nettoyage forcé du cache employés...');
  
  localStorage.removeItem('sogara_employees');
  
  console.log('✅ Cache employés supprimé ! Rechargement...');
  window.location.reload();
}

// Fonction appelable depuis la console pour débugger
if (typeof window !== 'undefined') {
  (window as any).clearSogaraCache = clearAllCache;
  (window as any).clearUserCache = clearUserCache;
  (window as any).forceClearEmployees = forceClearEmployeeCache;
  
  console.log('🔧 Commandes disponibles dans la console:');
  console.log('  clearSogaraCache() - Nettoie tout le cache');
  console.log('  clearUserCache() - Nettoie seulement l\'utilisateur');
  console.log('  forceClearEmployees() - Force le rechargement des employés');
}

