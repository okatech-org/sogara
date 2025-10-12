import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Table Employees - Personnel de SOGARA
  employees: defineTable({
    firstName: v.string(),
    lastName: v.string(),
    matricule: v.string(), // Ex: ADM001, HSE001, EMP001
    service: v.string(),
    roles: v.array(v.string()), // ["ADMIN", "HSE", "RECEP", "EMPLOYE", etc.]
    competences: v.array(v.string()),
    habilitations: v.array(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    status: v.string(), // "active" | "inactive"
    stats: v.object({
      visitsReceived: v.number(),
      packagesReceived: v.number(),
      hseTrainingsCompleted: v.number(),
    }),
    equipmentIds: v.array(v.string()),
  })
    .index("by_matricule", ["matricule"])
    .index("by_status", ["status"])
    .index("by_service", ["service"]),

  // Table Visits - Gestion des visites
  visits: defineTable({
    visitorId: v.id("visitors"),
    hostEmployeeId: v.id("employees"),
    scheduledAt: v.number(), // Timestamp
    checkedInAt: v.optional(v.number()),
    checkedOutAt: v.optional(v.number()),
    status: v.string(), // "expected" | "waiting" | "in_progress" | "checked_out"
    purpose: v.string(),
    notes: v.optional(v.string()),
    badgeNumber: v.optional(v.string()),
    qrCode: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_host", ["hostEmployeeId"])
    .index("by_visitor", ["visitorId"])
    .index("by_scheduled", ["scheduledAt"]),

  // Table Visitors - Base de données visiteurs
  visitors: defineTable({
    firstName: v.string(),
    lastName: v.string(),
    company: v.string(),
    idDocument: v.string(), // Numéro CNI/Passeport
    documentType: v.string(), // "cin" | "passport" | "other"
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    photo: v.optional(v.string()),
    nationality: v.optional(v.string()),
    birthDate: v.optional(v.string()), // Format ISO date
  })
    .index("by_idDocument", ["idDocument"])
    .index("by_company", ["company"]),

  // Table Packages - Colis et courriers
  packages: defineTable({
    type: v.string(), // "package" | "mail"
    reference: v.string(), // Code tracking
    sender: v.string(),
    recipientEmployeeId: v.optional(v.id("employees")),
    recipientService: v.optional(v.string()),
    description: v.string(),
    photoUrl: v.optional(v.string()),
    isConfidential: v.boolean(),
    scannedFileUrls: v.optional(v.array(v.string())),
    priority: v.string(), // "normal" | "urgent"
    status: v.string(), // "received" | "stored" | "delivered"
    receivedAt: v.number(),
    deliveredAt: v.optional(v.number()),
    deliveredBy: v.optional(v.string()),
    signature: v.optional(v.string()),
    location: v.optional(v.string()), // Emplacement stockage
    trackingNumber: v.optional(v.string()),
    weight: v.optional(v.number()),
    category: v.optional(v.string()), // "normal" | "fragile" | "valuable" | "confidential" | "medical"
  })
    .index("by_status", ["status"])
    .index("by_recipient", ["recipientEmployeeId"])
    .index("by_service", ["recipientService"])
    .index("by_reference", ["reference"])
    .index("by_priority", ["priority"]),

  // Table Equipment - Équipements et EPI
  equipment: defineTable({
    type: v.string(), // "EPI" | "Tool" | "Vehicle" | etc.
    label: v.string(),
    serialNumber: v.optional(v.string()),
    holderEmployeeId: v.optional(v.id("employees")),
    status: v.string(), // "operational" | "maintenance" | "out_of_service"
    nextCheckDate: v.optional(v.number()),
    description: v.optional(v.string()),
    location: v.optional(v.string()),
    purchaseDate: v.optional(v.string()),
    warrantyExpiryDate: v.optional(v.string()),
    manufacturer: v.optional(v.string()),
    model: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_holder", ["holderEmployeeId"])
    .index("by_type", ["type"])
    .index("by_serial", ["serialNumber"]),

  // Table HSE Incidents
  hseIncidents: defineTable({
    employeeId: v.id("employees"),
    type: v.string(), // Type d'incident
    severity: v.string(), // "low" | "medium" | "high"
    description: v.string(),
    location: v.string(),
    occurredAt: v.number(),
    status: v.string(), // "reported" | "investigating" | "resolved"
    attachments: v.optional(v.array(v.string())),
    reportedBy: v.id("employees"),
    investigatedBy: v.optional(v.id("employees")),
    correctiveActions: v.optional(v.string()),
    rootCause: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_severity", ["severity"])
    .index("by_employee", ["employeeId"])
    .index("by_date", ["occurredAt"]),

  // Table HSE Trainings
  hseTrainings: defineTable({
    code: v.string(), // Ex: HSE-001
    title: v.string(),
    category: v.string(), // "Critique" | "Obligatoire" | "Spécialisée" | etc.
    description: v.string(),
    objectives: v.array(v.string()),
    duration: v.number(),
    durationUnit: v.string(), // "heures" | "minutes" | "jours"
    validityMonths: v.number(),
    requiredForRoles: v.array(v.string()),
    prerequisites: v.array(v.string()),
    content: v.any(), // JSON structure with modules, resources, assessments
    certification: v.object({
      examRequired: v.boolean(),
      passingScore: v.optional(v.number()),
      practicalTest: v.boolean(),
      certificateType: v.string(),
    }),
    maxParticipants: v.number(),
    language: v.array(v.string()),
    deliveryMethods: v.array(v.string()),
    refresherRequired: v.boolean(),
    refresherFrequency: v.optional(v.number()),
  })
    .index("by_code", ["code"])
    .index("by_category", ["category"]),

  // Table Training Progress - Suivi progression formations
  trainingProgress: defineTable({
    employeeId: v.id("employees"),
    trainingId: v.id("hseTrainings"),
    status: v.string(), // "not_started" | "in_progress" | "completed" | "expired"
    currentModule: v.optional(v.string()),
    completedModules: v.array(v.string()),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    certificateIssuedAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    score: v.optional(v.number()),
  })
    .index("by_employee", ["employeeId"])
    .index("by_training", ["trainingId"])
    .index("by_status", ["status"]),

  // Table Posts - SOGARA Connect
  posts: defineTable({
    title: v.string(),
    content: v.string(),
    excerpt: v.string(),
    authorId: v.id("employees"),
    category: v.string(), // "news" | "activity" | "announcement" | "event"
    status: v.string(), // "draft" | "published" | "archived"
    featuredImage: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
    videoUrl: v.optional(v.string()),
    tags: v.array(v.string()),
    publishedAt: v.optional(v.number()),
    views: v.number(),
    likes: v.number(),
  })
    .index("by_author", ["authorId"])
    .index("by_category", ["category"])
    .index("by_status", ["status"])
    .index("by_published", ["publishedAt"]),

  // ============================================
  // GESTION SITES RAFFINERIE
  // ============================================
  sites: defineTable({
    name: v.string(),
    code: v.string(),
    address: v.string(),
    department: v.optional(v.string()),
    minEmployeesDay: v.number(),
    minEmployeesNight: v.number(),
    is24h7: v.boolean(),
  })
    .index("by_code", ["code"])
    .index("by_department", ["department"]),

  // ============================================
  // GESTION VACATIONS
  // ============================================
  vacations: defineTable({
    date: v.number(),
    type: v.string(),
    startTime: v.number(),
    endTime: v.number(),
    status: v.string(),
    employeeId: v.id("employees"),
    siteId: v.string(),
    siteName: v.string(),
    plannedHours: v.number(),
    actualHours: v.optional(v.number()),
    overtimeHours: v.optional(v.number()),
    nightHours: v.optional(v.number()),
    checkInTime: v.optional(v.number()),
    checkOutTime: v.optional(v.number()),
    isValidated: v.boolean(),
    validatedBy: v.optional(v.id("employees")),
    validatedAt: v.optional(v.number()),
    notes: v.optional(v.string()),
  })
    .index("by_employee", ["employeeId"])
    .index("by_site", ["siteId"])
    .index("by_date", ["date"])
    .index("by_status", ["status"]),

  // ============================================
  // GESTION PAIE
  // ============================================
  payslips: defineTable({
    month: v.number(),
    year: v.number(),
    periodStart: v.number(),
    periodEnd: v.number(),
    employeeId: v.id("employees"),
    baseSalary: v.number(),
    grossSalary: v.number(),
    netSalary: v.number(),
    totalHours: v.number(),
    overtimeHours: v.number(),
    nightHours: v.number(),
    overtimePay: v.number(),
    nightPay: v.number(),
    hazardPay: v.number(),
    transportAllowance: v.number(),
    mealAllowance: v.number(),
    otherBonuses: v.optional(v.number()),
    socialSecurity: v.number(),
    incomeTax: v.number(),
    otherDeductions: v.optional(v.number()),
    status: v.string(),
    isValidated: v.boolean(),
    validatedBy: v.optional(v.id("employees")),
    validatedAt: v.optional(v.number()),
    paidAt: v.optional(v.number()),
    pdfUrl: v.optional(v.string()),
  })
    .index("by_employee", ["employeeId"])
    .index("by_period", ["month", "year"])
    .index("by_status", ["status"]),

  payslipItems: defineTable({
    payslipId: v.id("payslips"),
    vacationId: v.optional(v.id("vacations")),
    date: v.number(),
    description: v.string(),
    hours: v.number(),
    rate: v.number(),
    amount: v.number(),
    type: v.string(),
  })
    .index("by_payslip", ["payslipId"])
    .index("by_vacation", ["vacationId"]),

  // ============================================
  // GESTION DISPONIBILITÉS
  // ============================================
  availabilities: defineTable({
    employeeId: v.id("employees"),
    startDate: v.number(),
    endDate: v.number(),
    isAvailable: v.boolean(),
    reason: v.optional(v.string()),
  })
    .index("by_employee", ["employeeId"])
    .index("by_dates", ["startDate", "endDate"]),

  // ============================================
  // GESTION ÉVALUATIONS / TESTS HABILITATION
  // ============================================
  assessments: defineTable({
    title: v.string(),
    description: v.string(),
    type: v.string(),           // PRE_HIRING, HABILITATION, etc.
    category: v.string(),
    duration: v.number(),       // Minutes
    passingScore: v.number(),   // % minimum
    totalPoints: v.number(),
    questions: v.any(),         // Array de questions
    instructions: v.optional(v.string()),
    validityMonths: v.optional(v.number()),
    certificateTemplate: v.optional(v.string()),
    isPublished: v.boolean(),
    createdBy: v.id("employees"),
    // Habilitation automatique
    grantsHabilitation: v.optional(v.string()),
    habilitationCode: v.optional(v.string()),
    habilitationDescription: v.optional(v.string()),
  })
    .index("by_type", ["type"])
    .index("by_category", ["category"])
    .index("by_published", ["isPublished"]),

  assessmentSubmissions: defineTable({
    assessmentId: v.id("assessments"),
    candidateId: v.string(),    // ID candidat (employee, visitor, ou external)
    candidateType: v.string(),  // "employee" | "visitor" | "external"
    status: v.string(),
    answers: v.any(),           // Array de réponses
    assignedAt: v.number(),
    startedAt: v.optional(v.number()),
    submittedAt: v.optional(v.number()),
    correctedAt: v.optional(v.number()),
    score: v.optional(v.number()),
    totalPoints: v.optional(v.number()),
    earnedPoints: v.optional(v.number()),
    isPassed: v.optional(v.boolean()),
    correctorId: v.optional(v.id("employees")),
    correctorComments: v.optional(v.string()),
    questionGrades: v.optional(v.any()),
    certificateUrl: v.optional(v.string()),
    certificateIssuedAt: v.optional(v.number()),
    expiryDate: v.optional(v.number()),
  })
    .index("by_candidate", ["candidateId"])
    .index("by_assessment", ["assessmentId"])
    .index("by_status", ["status"]),

  externalCandidates: defineTable({
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.string(),
    company: v.string(),
    position: v.string(),
    idDocument: v.string(),
    documentType: v.string(),
    purpose: v.string(),
    requestedBy: v.optional(v.id("employees")),
    status: v.string(),
    approvedBy: v.optional(v.id("employees")),
    approvedAt: v.optional(v.number()),
    validUntil: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_company", ["company"])
    .index("by_status", ["status"]),

  // ============================================
  // PARCOURS DE CERTIFICATION (Formation → Évaluation → Habilitation)
  // ============================================
  certificationPaths: defineTable({
    title: v.string(),
    description: v.string(),
    trainingModuleId: v.string(),
    trainingTitle: v.string(),
    trainingDuration: v.number(),
    assessmentId: v.id("assessments"),
    assessmentTitle: v.string(),
    daysBeforeAssessment: v.number(),
    assessmentDuration: v.number(),
    passingScore: v.number(),
    habilitationName: v.string(),
    habilitationCode: v.string(),
    habilitationValidity: v.number(),
    createdBy: v.id("employees"),
    isPublished: v.boolean(),
  })
    .index("by_published", ["isPublished"]),

  certificationPathProgress: defineTable({
    pathId: v.id("certificationPaths"),
    candidateId: v.string(),
    candidateType: v.string(),
    status: v.string(),
    trainingAssignmentId: v.optional(v.string()),
    trainingStartedAt: v.optional(v.number()),
    trainingCompletedAt: v.optional(v.number()),
    trainingScore: v.optional(v.number()),
    assessmentSubmissionId: v.optional(v.string()),
    evaluationAvailableDate: v.optional(v.number()),
    evaluationStartedAt: v.optional(v.number()),
    evaluationSubmittedAt: v.optional(v.number()),
    evaluationCorrectedAt: v.optional(v.number()),
    evaluationScore: v.optional(v.number()),
    evaluationPassed: v.optional(v.boolean()),
    habilitationGrantedAt: v.optional(v.number()),
    habilitationExpiryDate: v.optional(v.number()),
    certificateUrl: v.optional(v.string()),
    assignedBy: v.id("employees"),
    assignedAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_candidate", ["candidateId"])
    .index("by_path", ["pathId"])
    .index("by_status", ["status"]),
});

