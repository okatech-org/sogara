export {
  AIExtractionService,
  aiExtractionService,
  type AIConfig,
  type ExtractionResult,
} from './ai-extraction.service'

export {
  VisitorManagementService,
  visitorService,
  type VisitorExtended,
} from './visitor-management.service'

export {
  PackageManagementService,
  packageService,
  type PackageItem,
} from './package-management.service'

export { MailManagementService, mailService, type Mail } from './mail-management.service'

export const aiServices = {
  extraction: aiExtractionService,
  visitors: visitorService,
  packages: packageService,
  mails: mailService,
}

export default aiServices
