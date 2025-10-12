import { mutation } from "./_generated/server";

// SEED DEMO DATA - Données de démonstration complètes
export const seedDemoData = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("🌱 Début du seeding...");

    // 1. CRÉER LES 6 COMPTES DÉMOS
    console.log("👤 Création des employés...");

    const adminId = await ctx.db.insert("employees", {
      firstName: "Pellen",
      lastName: "ASTED",
      matricule: "ADM001",
      service: "ORGANEUS Gabon",
      roles: ["ADMIN"],
      competences: ["Administration systèmes", "Sécurité informatique", "Supervision"],
      habilitations: ["Accès total", "Configuration système"],
      email: "pellen.asted@organeus.ga",
      status: "active",
      stats: { visitsReceived: 3, packagesReceived: 1, hseTrainingsCompleted: 8 },
      equipmentIds: [],
    });

    const hseId = await ctx.db.insert("employees", {
      firstName: "Marie-Claire",
      lastName: "NZIEGE",
      matricule: "HSE001",
      service: "HSE et Conformité",
      roles: ["HSE", "COMPLIANCE", "SECURITE"],
      competences: ["Sécurité industrielle", "Formation HSE", "Audit conformité"],
      habilitations: ["Inspection sécurité", "Formation obligatoire", "Incident management"],
      email: "marie-claire.nziege@sogara.com",
      status: "active",
      stats: { visitsReceived: 8, packagesReceived: 3, hseTrainingsCompleted: 12 },
      equipmentIds: [],
    });

    const recepId = await ctx.db.insert("employees", {
      firstName: "Sylvie",
      lastName: "KOUMBA",
      matricule: "REC001",
      service: "Sécurité",
      roles: ["RECEP"],
      competences: ["Gestion sécurité", "Accueil visiteurs", "Gestion colis"],
      habilitations: ["Badge visiteurs", "Système accès", "Contrôle sécurité"],
      email: "sylvie.koumba@sogara.com",
      status: "active",
      stats: { visitsReceived: 15, packagesReceived: 8, hseTrainingsCompleted: 4 },
      equipmentIds: [],
    });

    const comId = await ctx.db.insert("employees", {
      firstName: "Clarisse",
      lastName: "MBOUMBA",
      matricule: "COM001",
      service: "Communication",
      roles: ["COMMUNICATION"],
      competences: ["Communication interne", "Rédaction", "Réseaux sociaux"],
      habilitations: ["Diffusion information", "Gestion événements"],
      email: "clarisse.mboumba@sogara.com",
      status: "active",
      stats: { visitsReceived: 4, packagesReceived: 2, hseTrainingsCompleted: 5 },
      equipmentIds: [],
    });

    const empId = await ctx.db.insert("employees", {
      firstName: "Pierre",
      lastName: "BEKALE",
      matricule: "EMP001",
      service: "Production",
      roles: ["EMPLOYE"],
      competences: ["Opérateur", "Sécurité niveau 1"],
      habilitations: ["Conduite", "EPI obligatoire"],
      email: "pierre.bekale@sogara.com",
      status: "active",
      stats: { visitsReceived: 5, packagesReceived: 2, hseTrainingsCompleted: 3 },
      equipmentIds: [],
    });

    const dgId = await ctx.db.insert("employees", {
      firstName: "Daniel",
      lastName: "MVOU",
      matricule: "DG001",
      service: "Direction Générale",
      roles: ["DG", "ADMIN"],
      competences: ["Direction générale", "Stratégie", "Management"],
      habilitations: ["Accès total", "Décisions stratégiques"],
      email: "daniel.mvou@sogara.com",
      status: "active",
      stats: { visitsReceived: 10, packagesReceived: 5, hseTrainingsCompleted: 10 },
      equipmentIds: [],
    });

    const drhId = await ctx.db.insert("employees", {
      firstName: "Brigitte",
      lastName: "NGUEMA",
      matricule: "DRH001",
      service: "Ressources Humaines",
      roles: ["DRH", "ADMIN"],
      competences: ["Gestion RH", "Recrutement", "Formation"],
      habilitations: ["Gestion personnel", "Validation formations"],
      email: "brigitte.nguema@sogara.com",
      status: "active",
      stats: { visitsReceived: 7, packagesReceived: 4, hseTrainingsCompleted: 9 },
      equipmentIds: [],
    });

    console.log("✅ 7 employés créés");

    // 2. CRÉER DES VISITEURS DE DÉMONSTRATION
    console.log("👥 Création des visiteurs...");

    const visitor1 = await ctx.db.insert("visitors", {
      firstName: "Jean",
      lastName: "NGUEMA",
      company: "Total Energies",
      idDocument: "CNI-123456",
      documentType: "cin",
      phone: "+241 06 12 34 56",
      email: "j.nguema@total.com",
      nationality: "Gabonaise",
    });

    const visitor2 = await ctx.db.insert("visitors", {
      firstName: "Marie",
      lastName: "OBAME",
      company: "Ministère du Pétrole",
      idDocument: "CNI-789012",
      documentType: "cin",
      phone: "+241 06 98 76 54",
      email: "m.obame@gouv.ga",
      nationality: "Gabonaise",
    });

    const visitor3 = await ctx.db.insert("visitors", {
      firstName: "Paul",
      lastName: "MARTIN",
      company: "Schneider Electric",
      idDocument: "PASS-FR12345",
      documentType: "passport",
      phone: "+33 6 12 34 56 78",
      email: "p.martin@schneider.fr",
      nationality: "Française",
    });

    console.log("✅ 3 visiteurs créés");

    // 3. CRÉER DES VISITES
    console.log("📅 Création des visites...");

    const now = Date.now();
    const yesterday = now - 24 * 60 * 60 * 1000;
    const tomorrow = now + 24 * 60 * 60 * 1000;

    await ctx.db.insert("visits", {
      visitorId: visitor1,
      hostEmployeeId: hseId,
      scheduledAt: yesterday,
      checkedInAt: yesterday + 1000 * 60 * 30,
      checkedOutAt: yesterday + 1000 * 60 * 120,
      status: "checked_out",
      purpose: "Audit sécurité annuel",
      badgeNumber: "BADGE-001",
    });

    await ctx.db.insert("visits", {
      visitorId: visitor2,
      hostEmployeeId: adminId,
      scheduledAt: now,
      checkedInAt: now,
      status: "in_progress",
      purpose: "Réunion ministérielle",
      badgeNumber: "BADGE-002",
    });

    await ctx.db.insert("visits", {
      visitorId: visitor3,
      hostEmployeeId: adminId,
      scheduledAt: tomorrow,
      status: "expected",
      purpose: "Installation équipements électriques",
    });

    console.log("✅ 3 visites créées");

    // 4. CRÉER DES COLIS/COURRIERS
    console.log("📦 Création des colis/courriers...");

    await ctx.db.insert("packages", {
      type: "package",
      reference: "DHL-2024-001",
      sender: "DHL Express",
      recipientEmployeeId: adminId,
      description: "Équipement informatique",
      isConfidential: false,
      priority: "urgent",
      status: "received",
      receivedAt: now,
      trackingNumber: "DHL123456789",
      weight: 5.5,
      category: "normal",
    });

    await ctx.db.insert("packages", {
      type: "mail",
      reference: "MAIL-2024-001",
      sender: "Ministère",
      recipientService: "Direction",
      description: "Courrier officiel",
      isConfidential: true,
      priority: "urgent",
      status: "received",
      receivedAt: now - 3600000,
    });

    await ctx.db.insert("packages", {
      type: "package",
      reference: "FEDEX-2024-002",
      sender: "FedEx",
      recipientEmployeeId: hseId,
      description: "Documentation HSE",
      isConfidential: false,
      priority: "normal",
      status: "delivered",
      receivedAt: yesterday,
      deliveredAt: yesterday + 7200000,
      deliveredBy: recepId,
    });

    console.log("✅ 3 colis/courriers créés");

    // 5. CRÉER DES ÉQUIPEMENTS
    console.log("🔧 Création des équipements...");

    await ctx.db.insert("equipment", {
      type: "EPI",
      label: "Casque de sécurité",
      serialNumber: "CSQ-001",
      holderEmployeeId: empId,
      status: "operational",
      nextCheckDate: now + 30 * 24 * 60 * 60 * 1000,
      description: "Casque jaune standard",
      location: "Zone Production",
    });

    await ctx.db.insert("equipment", {
      type: "EPI",
      label: "Chaussures de sécurité",
      serialNumber: "CHS-001",
      holderEmployeeId: empId,
      status: "operational",
      description: "Chaussures S3",
      location: "Zone Production",
    });

    await ctx.db.insert("equipment", {
      type: "Tool",
      label: "Détecteur de gaz",
      serialNumber: "DET-H2S-001",
      holderEmployeeId: hseId,
      status: "operational",
      nextCheckDate: now + 15 * 24 * 60 * 60 * 1000,
      description: "Détecteur H2S portable",
      location: "Bureau HSE",
    });

    console.log("✅ 3 équipements créés");

    // 6. CRÉER DES INCIDENTS HSE
    console.log("⚠️ Création des incidents HSE...");

    await ctx.db.insert("hseIncidents", {
      employeeId: empId,
      type: "Glissade",
      severity: "low",
      description: "Glissade sur sol humide zone cafétéria",
      location: "Cafétéria",
      occurredAt: yesterday,
      status: "resolved",
      reportedBy: empId,
      investigatedBy: hseId,
      correctiveActions: "Installation de tapis antidérapants",
      rootCause: "Sol mouillé sans signalisation",
    });

    await ctx.db.insert("hseIncidents", {
      employeeId: empId,
      type: "Fuite mineure",
      severity: "medium",
      description: "Petite fuite détectée sur conduite Zone 3",
      location: "Zone Production 3",
      occurredAt: now - 7200000,
      status: "investigating",
      reportedBy: empId,
      investigatedBy: hseId,
    });

    console.log("✅ 2 incidents HSE créés");

    // 7. CRÉER DES FORMATIONS HSE (15 formations)
    console.log("🎓 Création des formations HSE...");

    const formations = [
      {
        code: "HSE-001",
        title: "Induction Sécurité",
        category: "Critique",
        description: "Formation d'induction obligatoire pour tout nouveau personnel",
        duration: 4,
      },
      {
        code: "HSE-002",
        title: "Équipements de Protection Individuelle (EPI)",
        category: "Obligatoire",
        description: "Formation sur l'utilisation correcte des EPI",
        duration: 2,
      },
      {
        code: "HSE-003",
        title: "Lutte Contre l'Incendie",
        category: "Critique",
        description: "Formation sur les procédures anti-incendie",
        duration: 3,
      },
      {
        code: "HSE-004",
        title: "Travail en Espace Confiné",
        category: "Critique",
        description: "Formation spécialisée espaces confinés",
        duration: 8,
      },
      {
        code: "HSE-005",
        title: "Travail en Hauteur",
        category: "Spécialisée",
        description: "Formation travaux en hauteur et harnais",
        duration: 6,
      },
      {
        code: "HSE-006",
        title: "Manipulation Produits Chimiques",
        category: "Critique",
        description: "Formation sur les produits dangereux",
        duration: 5,
      },
      {
        code: "HSE-007",
        title: "Permis de Travail",
        category: "Obligatoire",
        description: "Système de permis de travail",
        duration: 3,
      },
      {
        code: "HSE-008",
        title: "Secourisme",
        category: "Obligatoire",
        description: "Formation premiers secours",
        duration: 16,
      },
      {
        code: "HSE-009",
        title: "Consignation/Déconsignation",
        category: "Critique",
        description: "LOTO - Lockout Tagout",
        duration: 4,
      },
      {
        code: "HSE-010",
        title: "Protection de l'Environnement",
        category: "Obligatoire",
        description: "Sensibilisation environnement",
        duration: 2,
      },
      {
        code: "HSE-011",
        title: "Habilitation Électrique",
        category: "Spécialisée",
        description: "Formation électricité",
        duration: 21,
      },
      {
        code: "HSE-012",
        title: "Investigation Incidents",
        category: "Management",
        description: "Méthodologie d'investigation",
        duration: 4,
      },
      {
        code: "HSE-013",
        title: "Conduite Défensive",
        category: "Obligatoire",
        description: "Sécurité routière",
        duration: 4,
      },
      {
        code: "HSE-014",
        title: "Gestes et Postures",
        category: "Prévention",
        description: "Ergonomie et manutention",
        duration: 2,
      },
      {
        code: "HSE-015",
        title: "Sensibilisation H2S",
        category: "Critique",
        description: "Risques H2S en raffinerie",
        duration: 3,
      },
    ];

    for (const formation of formations) {
      await ctx.db.insert("hseTrainings", {
        code: formation.code,
        title: formation.title,
        category: formation.category,
        description: formation.description,
        objectives: ["Objectif 1", "Objectif 2", "Objectif 3"],
        duration: formation.duration,
        durationUnit: "heures",
        validityMonths: 12,
        requiredForRoles: ["EMPLOYE", "SUPERVISEUR"],
        prerequisites: [],
        content: { modules: [], resources: [], assessments: [] },
        certification: {
          examRequired: true,
          passingScore: 80,
          practicalTest: false,
          certificateType: "Standard",
        },
        maxParticipants: 15,
        language: ["Français"],
        deliveryMethods: ["Présentiel"],
        refresherRequired: true,
        refresherFrequency: 12,
      });
    }

    console.log("✅ 15 formations HSE créées");

    // 8. CRÉER DES POSTS SOGARA CONNECT
    console.log("📰 Création des posts...");

    await ctx.db.insert("posts", {
      title: "Nouvelle certification ISO 14001 obtenue",
      content:
        "SOGARA a obtenu la certification ISO 14001 pour son système de management environnemental...",
      excerpt: "Certification témoignant de notre engagement environnemental",
      authorId: comId,
      category: "news",
      status: "published",
      tags: ["ISO", "Environnement", "Certification"],
      publishedAt: now - 7 * 24 * 60 * 60 * 1000,
      views: 245,
      likes: 34,
    });

    await ctx.db.insert("posts", {
      title: "Journée sécurité - 15 février 2024",
      content:
        "Participez à notre journée dédiée à la sécurité au travail...",
      excerpt: "Formation et sensibilisation sécurité",
      authorId: hseId,
      category: "event",
      status: "published",
      tags: ["Sécurité", "Formation", "HSE"],
      publishedAt: now - 3 * 24 * 60 * 60 * 1000,
      views: 178,
      likes: 56,
    });

    await ctx.db.insert("posts", {
      title: "Résultats exceptionnels du T4 2023",
      content: "SOGARA annonce des résultats record...",
      excerpt: "Performances confirmant la solidité de l'entreprise",
      authorId: adminId,
      category: "announcement",
      status: "published",
      tags: ["Résultats", "Performance"],
      publishedAt: now - 14 * 24 * 60 * 60 * 1000,
      views: 567,
      likes: 89,
    });

    console.log("✅ 3 posts créés");

    console.log("🎉 Seeding terminé avec succès !");
    console.log("📊 Résumé:");
    console.log("  - 7 employés");
    console.log("  - 3 visiteurs");
    console.log("  - 3 visites");
    console.log("  - 3 colis/courriers");
    console.log("  - 3 équipements");
    console.log("  - 2 incidents HSE");
    console.log("  - 15 formations HSE");
    console.log("  - 3 posts SOGARA Connect");

    return { success: true, message: "Seeding terminé !" };
  },
});

