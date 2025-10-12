export interface AIConfig {
  provider: 'openai' | 'anthropic' | 'azure' | 'google' | 'mock';
  apiKey?: string;
  endpoint?: string;
  model?: string;
  maxRetries: number;
  timeout: number;
  confidence: {
    minimum: number;
    warning: number;
    verification: number;
  };
}

export interface ExtractionResult {
  success: boolean;
  confidence: number;
  data: any;
  warnings: string[];
  requiresVerification: boolean;
  processingTime?: number;
  aiProvider?: string;
  extractedFields?: string[];
  metadata?: {
    documentType?: string;
    qualityScore?: number;
    enhancementsApplied?: string[];
  };
}

export class AIExtractionService {
  private config: AIConfig;
  private cache: Map<string, ExtractionResult>;

  constructor(config?: Partial<AIConfig>) {
    const envProvider = import.meta.env.VITE_AI_PROVIDER;
    const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    console.log('🔍 Détection configuration IA:', {
      envProvider,
      hasOpenAIKey: !!openaiKey,
      hasGeminiKey: !!geminiKey
    });
    
    let provider: AIConfig['provider'];
    let apiKey: string | undefined;
    
    if (openaiKey && (!envProvider || envProvider === 'openai')) {
      provider = 'openai';
      apiKey = openaiKey;
    } else if (geminiKey && envProvider === 'google') {
      provider = 'google';
      apiKey = geminiKey;
    } else if (config?.provider && config?.apiKey) {
      provider = config.provider;
      apiKey = config.apiKey;
    } else {
      console.warn('⚠️ Aucune clé API détectée - Mode Mock activé');
      provider = 'mock';
      apiKey = undefined;
    }
    
    this.config = {
      provider,
      apiKey,
      endpoint: config?.endpoint,
      model: config?.model || (provider === 'google' ? 'gemini-1.5-flash' : 'gpt-4o'),
      maxRetries: config?.maxRetries || 3,
      timeout: config?.timeout || 30000,
      confidence: {
        minimum: 0.7,
        warning: 0.85,
        verification: 0.95,
        ...config?.confidence
      }
    };
    this.cache = new Map();
    
    console.log(`🤖 AI Service initialisé - Provider: ${this.config.provider}, Model: ${this.config.model}, API Key présente: ${!!this.config.apiKey}`);
  }

  async extractIdentityDocument(
    imageData: string | File,
    documentType?: 'CNI' | 'passeport' | 'permis'
  ): Promise<ExtractionResult> {
    const startTime = Date.now();
    
    try {
      const processedImage = await this.preprocessImage(imageData);
      
      if (!documentType) {
        documentType = await this.detectDocumentType(processedImage);
      }
      
      let result: ExtractionResult;
      switch (documentType) {
        case 'CNI':
          result = await this.extractCNI(processedImage);
          break;
        case 'passeport':
          result = await this.extractPassport(processedImage);
          break;
        case 'permis':
          result = await this.extractDriverLicense(processedImage);
          break;
        default:
          throw new Error('Type de document non supporté');
      }
      
      result = await this.postProcessResult(result);
      result.processingTime = Date.now() - startTime;
      
      this.cacheResult(String(imageData), result);
      
      return result;
      
    } catch (error: any) {
      console.error('Erreur extraction:', error);
      return {
        success: false,
        confidence: 0,
        data: {},
        warnings: [`Erreur d'extraction: ${error.message}`],
        requiresVerification: true,
        processingTime: Date.now() - startTime
      };
    }
  }

  async extractMailDocument(
    imageData: string | File,
    options?: {
      extractFullText?: boolean;
      generateSummary?: boolean;
      classifyContent?: boolean;
      detectKeywords?: boolean;
    }
  ): Promise<ExtractionResult> {
    const startTime = Date.now();
    
    try {
      const processedImage = await this.preprocessImage(imageData);
      
      if (this.config.provider === 'mock') {
        const result = this.getMockMailResult();
        result.processingTime = Date.now() - startTime;
        return result;
      }
      
      const prompt = `Analysez ce courrier/document et extrayez les informations au format JSON suivant:
{
  "sender": {
    "name": "nom expéditeur",
    "organization": "organisation",
    "address": "adresse complète"
  },
  "recipient": {
    "name": "nom destinataire",
    "department": "service/département",
    "service": "service précis"
  },
  "documentType": "type de document (lettre/facture/contrat/administratif/autre)",
  "subject": "objet du document",
  "documentDate": "date du document au format YYYY-MM-DD",
  "urgency": "normal ou urgent ou tres_urgent",
  "keywords": ["mot1", "mot2", "mot3", "mot4", "mot5"],
  ${options?.extractFullText ? '"fullText": "texte complet du document",' : ''}
  ${options?.generateSummary ? '"summary": "résumé en 2-3 phrases",' : ''}
  ${options?.classifyContent ? '"suggestedCategory": "catégorie suggérée"' : ''}
}
Répondez UNIQUEMENT avec le JSON, sans texte supplémentaire.`;
      
      const result = await this.callAIProvider(processedImage, prompt, 'mail');
      
      if (result.success && result.data.fullText) {
        result.data.confidentiality = this.detectConfidentiality(result.data.fullText);
      }
      
      result.processingTime = Date.now() - startTime;
      return result;
      
    } catch (error: any) {
      console.error('Erreur extraction courrier:', error);
      return {
        success: false,
        confidence: 0,
        data: {},
        warnings: [`Erreur d'extraction: ${error.message}`],
        requiresVerification: true,
        processingTime: Date.now() - startTime
      };
    }
  }

  async extractPackageLabel(
    imageData: string | File,
    options?: {
      extractBarcode?: boolean;
      extractAddress?: boolean;
      extractDimensions?: boolean;
    }
  ): Promise<ExtractionResult> {
    const startTime = Date.now();
    
    try {
      const processedImage = await this.preprocessImage(imageData);
      
      if (this.config.provider === 'mock') {
        const result = this.getMockPackageResult();
        result.processingTime = Date.now() - startTime;
        return result;
      }
      
      const prompt = `Analysez cette étiquette de colis et extrayez les informations au format JSON suivant:
{
  "trackingNumber": "numéro de suivi",
  "barcode": "code-barres si visible",
  "sender": {
    "name": "nom expéditeur",
    "organization": "organisation expéditeur",
    "address": "adresse expéditeur",
    "phone": "téléphone expéditeur"
  },
  "recipient": {
    "name": "nom destinataire",
    "department": "service/département",
    "floor": "étage si visible",
    "office": "bureau si visible"
  },
  "packageCategory": "standard ou fragile ou valuable ou confidential ou medical",
  "weight": "poids avec unité",
  "dimensions": "dimensions format LxlxH",
  "specialInstructions": "instructions spéciales si visibles"
}
Répondez UNIQUEMENT avec le JSON, sans texte supplémentaire.`;
      
      const result = await this.callAIProvider(processedImage, prompt, 'package');
      
      if (options?.extractBarcode && !result.data.barcode) {
        const barcodeData = await this.extractBarcode(processedImage);
        if (barcodeData) {
          result.data.barcode = barcodeData;
        }
      }
      
      result.processingTime = Date.now() - startTime;
      return result;
      
    } catch (error: any) {
      console.error('Erreur extraction colis:', error);
      return {
        success: false,
        confidence: 0,
        data: {},
        warnings: [`Erreur d'extraction: ${error.message}`],
        requiresVerification: true,
        processingTime: Date.now() - startTime
      };
    }
  }

  private detectConfidentiality(text: string): 'normal' | 'confidentiel' | 'tres_confidentiel' {
    const confidentielKeywords = ['confidentiel', 'privé', 'personnel', 'restricted'];
    const tresConfidentielKeywords = ['très confidentiel', 'top secret', 'strictly confidential'];
    
    const lowerText = text.toLowerCase();
    
    if (tresConfidentielKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'tres_confidentiel';
    }
    if (confidentielKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'confidentiel';
    }
    return 'normal';
  }

  private async extractBarcode(imageData: string): Promise<string | null> {
    try {
      if ('BarcodeDetector' in window) {
        const barcodeDetector = new (window as any).BarcodeDetector();
        const img = new Image();
        img.src = imageData;
        
        await new Promise(resolve => { img.onload = resolve; });
        const barcodes = await barcodeDetector.detect(img);
        
        if (barcodes.length > 0) {
          return barcodes[0].rawValue;
        }
      }
      
      return null;
      
    } catch (error) {
      console.error('Erreur extraction code-barres:', error);
      return null;
    }
  }

  private async preprocessImage(imageData: string | File): Promise<string> {
    if (typeof imageData === 'string') {
      // Si c'est déjà une data URL
      if (imageData.startsWith('data:')) {
        // Vérifier si c'est un PDF
        if (imageData.startsWith('data:application/pdf')) {
          console.log('📄 PDF détecté, conversion en image...');
          const { pdfConverter } = await import('./pdf-converter.service');
          const arrayBuffer = this.dataURLToArrayBuffer(imageData);
          const imageResult = await pdfConverter.convertFirstPageToImage(arrayBuffer);
          return imageResult;
        }
        return imageData;
      }
      return imageData;
    }
    
    // Si c'est un fichier
    if (imageData.type === 'application/pdf') {
      console.log('📄 Fichier PDF détecté, conversion en image...');
      const { pdfConverter } = await import('./pdf-converter.service');
      const arrayBuffer = await this.fileToArrayBuffer(imageData);
      const imageResult = await pdfConverter.convertFirstPageToImage(arrayBuffer);
      return imageResult;
    }
    
    // Pour les images, conversion normale en data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(imageData);
    });
  }
  
  private dataURLToArrayBuffer(dataURL: string): ArrayBuffer {
    const base64 = dataURL.split(',')[1];
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    
    return bytes.buffer;
  }
  
  private fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result instanceof ArrayBuffer) {
          resolve(e.target.result);
        } else {
          reject(new Error('Échec de la lecture du fichier'));
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  private async detectDocumentType(imageData: string): Promise<'CNI' | 'passeport' | 'permis'> {
    if (this.config.provider === 'mock') {
      const types: ('CNI' | 'passeport' | 'permis')[] = ['CNI', 'passeport', 'permis'];
      return types[Math.floor(Math.random() * types.length)];
    }
    
    return 'CNI';
  }

  private async extractCNI(imageData: string): Promise<ExtractionResult> {
    if (this.config.provider === 'mock') {
      return this.getMockCNIResult();
    }
    
    const prompt = `Analysez cette Carte Nationale d'Identité (CNI) gabonaise et extrayez UNIQUEMENT les informations suivantes au format JSON:
{
  "firstName": "prénom exact",
  "lastName": "nom de famille exact",
  "idNumber": "numéro de la CNI",
  "idType": "CNI",
  "nationality": "nationalité",
  "birthDate": "date de naissance au format YYYY-MM-DD",
  "issueDate": "date d'émission au format YYYY-MM-DD",
  "expiryDate": "date d'expiration au format YYYY-MM-DD",
  "birthPlace": "lieu de naissance"
}
Répondez UNIQUEMENT avec le JSON, sans texte supplémentaire.`;
    
    return this.callAIProvider(imageData, prompt, 'cni');
  }

  private async extractPassport(imageData: string): Promise<ExtractionResult> {
    if (this.config.provider === 'mock') {
      return this.getMockPassportResult();
    }
    
    const prompt = `Analysez ce passeport et extrayez UNIQUEMENT les informations suivantes au format JSON:
{
  "firstName": "prénom exact",
  "lastName": "nom de famille exact",
  "passportNumber": "numéro de passeport",
  "idType": "passeport",
  "nationality": "nationalité",
  "birthDate": "date de naissance au format YYYY-MM-DD",
  "issueDate": "date d'émission au format YYYY-MM-DD",
  "expiryDate": "date d'expiration au format YYYY-MM-DD",
  "birthPlace": "lieu de naissance"
}
Répondez UNIQUEMENT avec le JSON, sans texte supplémentaire.`;
    
    return this.callAIProvider(imageData, prompt, 'passport');
  }

  private async extractDriverLicense(imageData: string): Promise<ExtractionResult> {
    if (this.config.provider === 'mock') {
      return this.getMockDriverLicenseResult();
    }
    
    const prompt = `Analysez ce permis de conduire et extrayez UNIQUEMENT les informations suivantes au format JSON:
{
  "firstName": "prénom exact",
  "lastName": "nom de famille exact",
  "licenseNumber": "numéro de permis",
  "idType": "permis",
  "birthDate": "date de naissance au format YYYY-MM-DD",
  "issueDate": "date d'émission au format YYYY-MM-DD",
  "expiryDate": "date d'expiration au format YYYY-MM-DD",
  "categories": ["catégories séparées"]
}
Répondez UNIQUEMENT avec le JSON, sans texte supplémentaire.`;
    
    return this.callAIProvider(imageData, prompt, 'license');
  }

  private async callAIProvider(
    imageData: string,
    prompt: string,
    documentType: string
  ): Promise<ExtractionResult> {
    const startTime = Date.now();
    
    try {
      console.log(`🔍 Extraction ${documentType} avec ${this.config.provider}...`);
      
      let extractedData: any;
      let confidence = 0;
      
      if (this.config.provider === 'openai') {
        const result = await this.callOpenAI(imageData, prompt);
        extractedData = result.data;
        confidence = result.confidence;
      } else if (this.config.provider === 'google') {
        const result = await this.callGemini(imageData, prompt);
        extractedData = result.data;
        confidence = result.confidence;
      } else {
        throw new Error(`Provider ${this.config.provider} non implémenté`);
      }
      
      const warnings = this.generateWarnings(extractedData);
      const processingTime = Date.now() - startTime;
      
      console.log(`✅ Extraction réussie en ${processingTime}ms - Confiance: ${Math.round(confidence * 100)}%`);
      
      return {
        success: true,
        confidence,
        data: extractedData,
        warnings,
        requiresVerification: confidence < this.config.confidence.verification || warnings.length > 0,
        processingTime,
        aiProvider: this.config.provider,
        extractedFields: Object.keys(extractedData).filter(k => extractedData[k])
      };
      
    } catch (error: any) {
      console.error(`❌ Erreur extraction ${documentType}:`, error);
      return {
        success: false,
        confidence: 0,
        data: {},
        warnings: [`Erreur API: ${error.message}`],
        requiresVerification: true,
        processingTime: Date.now() - startTime,
        aiProvider: this.config.provider
      };
    }
  }

  private async callOpenAI(imageData: string, prompt: string): Promise<{ data: any; confidence: number }> {
    if (!this.config.apiKey) {
      throw new Error('Clé API OpenAI manquante');
    }
    
    console.log('🌐 Envoi requête à OpenAI GPT-4o...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en extraction de données depuis des documents. Tu dois répondre UNIQUEMENT avec du JSON valide, sans texte supplémentaire avant ou après.'
          },
          {
            role: 'user',
            content: [
              { 
                type: 'text', 
                text: prompt 
              },
              { 
                type: 'image_url', 
                image_url: { 
                  url: imageData,
                  detail: 'high'
                } 
              }
            ]
          }
        ],
        max_tokens: 800,
        temperature: 0.1,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const result = await response.json();
    let rawContent: any = result?.choices?.[0]?.message?.content ?? null;

    // Normaliser les réponses éventuelles en blocs (certains modèles retournent un tableau de blocs)
    if (Array.isArray(rawContent)) {
      const textBlock = rawContent.find((block: any) =>
        typeof block?.text === 'string' || block?.type === 'text'
      );
      rawContent = textBlock?.text ?? null;
    }

    // Fallback: certains retours peuvent utiliser des tool_calls avec des arguments JSON
    if ((rawContent === null || rawContent === undefined || (typeof rawContent === 'string' && rawContent.trim() === '')) &&
        result?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments) {
      const args = result.choices[0].message.tool_calls[0].function.arguments;
      try {
        const data = typeof args === 'string' ? JSON.parse(args) : args;
        const confidence = this.calculateConfidence(data);
        return { data, confidence };
      } catch {}
    }

    if (typeof rawContent !== 'string' || rawContent.trim() === '') {
      throw new Error('Réponse du modèle vide ou non textuelle');
    }

    console.log('📝 Réponse OpenAI brute:', rawContent);

    // Tenter un parsing direct, sinon extraire le JSON avec regex
    try {
      const directData = JSON.parse(rawContent);
      const directConfidence = this.calculateConfidence(directData);
      return { data: directData, confidence: directConfidence };
    } catch {
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error(`Aucun JSON trouvé dans la réponse. Contenu reçu: ${rawContent.substring(0, 200)}`);
      }
      const data = JSON.parse(jsonMatch[0]);
      const confidence = this.calculateConfidence(data);
      return { data, confidence };
    }
  }

  private async callGemini(imageData: string, prompt: string): Promise<{ data: any; confidence: number }> {
    if (!this.config.apiKey) {
      throw new Error('Clé API Gemini manquante');
    }
    
    const base64Data = imageData.split(',')[1];
    const mimeType = imageData.match(/data:(.*?);/)?.[1] || 'image/jpeg';
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.config.model}:generateContent?key=${this.config.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Data
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 500
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Gemini API error: ${error.error?.message || response.statusText}`);
    }

    const result = await response.json();
    const content = result.candidates[0].content.parts[0].text;
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Aucun JSON trouvé dans la réponse');
    }
    
    const data = JSON.parse(jsonMatch[0]);
    const confidence = this.calculateConfidence(data);
    
    return { data, confidence };
  }

  private calculateConfidence(data: any): number {
    const fields = Object.keys(data);
    const filledFields = fields.filter(key => data[key] && data[key] !== '').length;
    
    if (fields.length === 0) return 0;
    
    return Math.min(0.7 + (filledFields / fields.length) * 0.3, 0.99);
  }

  private generateWarnings(data: any): string[] {
    const warnings: string[] = [];
    
    if (data.expiryDate) {
      const expiry = new Date(data.expiryDate);
      const today = new Date();
      const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExpiry < 0) {
        warnings.push('Document expiré');
      } else if (daysUntilExpiry < 90) {
        warnings.push(`Document expire dans ${daysUntilExpiry} jours`);
      }
    }
    
    return warnings;
  }

  private async postProcessResult(result: ExtractionResult): Promise<ExtractionResult> {
    if (result.data.firstName) {
      result.data.firstName = this.capitalizeFirstLetter(result.data.firstName);
    }
    if (result.data.lastName) {
      result.data.lastName = result.data.lastName.toUpperCase();
    }
    
    result.requiresVerification = 
      result.confidence < this.config.confidence.verification ||
      result.warnings.length > 0;
    
    result.extractedFields = Object.keys(result.data).filter(key => result.data[key]);
    
    result.metadata = {
      documentType: result.data.idType || result.data.documentType,
      qualityScore: result.confidence,
      enhancementsApplied: ['normalization', 'validation']
    };
    
    return result;
  }

  private capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  private cacheResult(key: string, result: ExtractionResult): void {
    const cacheKey = key.substring(0, 50);
    this.cache.set(cacheKey, result);
    
    if (this.cache.size > 100) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
  }

  private getMockCNIResult(): ExtractionResult {
    const mockData = {
      firstName: 'Jean',
      lastName: 'NGUEMA',
      idNumber: `CNI${Math.floor(Math.random() * 1000000000)}`,
      idType: 'CNI',
      nationality: 'Gabonaise',
      birthDate: '1990-05-15',
      issueDate: '2020-01-15',
      expiryDate: '2030-01-15',
      birthPlace: 'Libreville'
    };
    
    const confidence = 0.85 + Math.random() * 0.14;
    
    return {
      success: true,
      confidence,
      data: mockData,
      warnings: confidence < 0.95 ? ['Vérification manuelle recommandée'] : [],
      requiresVerification: confidence < 0.95,
      aiProvider: 'mock',
      extractedFields: Object.keys(mockData)
    };
  }

  private getMockPassportResult(): ExtractionResult {
    const mockData = {
      firstName: 'Marie',
      lastName: 'OBAME',
      passportNumber: `GA${Math.floor(Math.random() * 10000000)}`,
      idType: 'passeport',
      nationality: 'Gabonaise',
      birthDate: '1985-03-20',
      issueDate: '2019-06-10',
      expiryDate: '2029-06-10',
      birthPlace: 'Port-Gentil'
    };
    
    const confidence = 0.90 + Math.random() * 0.09;
    
    return {
      success: true,
      confidence,
      data: mockData,
      warnings: [],
      requiresVerification: false,
      aiProvider: 'mock',
      extractedFields: Object.keys(mockData)
    };
  }

  private getMockDriverLicenseResult(): ExtractionResult {
    const mockData = {
      firstName: 'Paul',
      lastName: 'NZAMBA',
      licenseNumber: `PC${Math.floor(Math.random() * 100000000)}`,
      idType: 'permis',
      birthDate: '1975-11-30',
      categories: ['B', 'C'],
      issueDate: '2020-09-15',
      expiryDate: '2025-09-15'
    };
    
    const confidence = 0.88 + Math.random() * 0.11;
    
    return {
      success: true,
      confidence,
      data: mockData,
      warnings: confidence < 0.92 ? ['Document peu net - Vérification conseillée'] : [],
      requiresVerification: confidence < 0.92,
      aiProvider: 'mock',
      extractedFields: Object.keys(mockData)
    };
  }

  private getMockMailResult(): ExtractionResult {
    const mockData = {
      sender: {
        name: 'Ministère des Finances',
        organization: 'République Gabonaise',
        address: 'BP 165, Libreville, Gabon'
      },
      recipient: {
        name: 'Direction Générale',
        department: 'Service Fiscal',
        service: 'Contrôle et Recouvrement'
      },
      documentType: 'lettre administrative',
      subject: 'Mise à jour des procédures fiscales',
      documentDate: '2024-01-15',
      urgency: 'urgent',
      keywords: ['fiscal', 'procédure', 'mise à jour', 'réglementation', 'conformité'],
      summary: 'Communication officielle concernant les nouvelles procédures fiscales à mettre en œuvre à partir du 1er février 2024.',
      suggestedCategory: 'Réglementation',
      confidentiality: 'normal'
    };
    
    const confidence = 0.92 + Math.random() * 0.07;
    
    return {
      success: true,
      confidence,
      data: mockData,
      warnings: [],
      requiresVerification: false,
      aiProvider: 'mock',
      extractedFields: Object.keys(mockData)
    };
  }

  private getMockPackageResult(): ExtractionResult {
    const mockData = {
      trackingNumber: `GA${Date.now()}`,
      barcode: `${Math.floor(Math.random() * 1000000000000)}`,
      sender: {
        name: 'Société ABC',
        organization: 'ABC Corp',
        address: 'BP 123, Libreville, Gabon',
        phone: '+241 01 23 45 67'
      },
      recipient: {
        name: 'Jean MBENG',
        department: 'Service Informatique',
        floor: '3ème étage',
        office: 'Bureau 305'
      },
      packageCategory: 'fragile',
      weight: '2.5 kg',
      dimensions: '30x20x15 cm',
      specialInstructions: 'Fragile - Matériel informatique'
    };
    
    const confidence = 0.92 + Math.random() * 0.07;
    
    return {
      success: true,
      confidence,
      data: mockData,
      warnings: [],
      requiresVerification: false,
      aiProvider: 'mock',
      extractedFields: Object.keys(mockData)
    };
  }
}

const getDefaultAIConfig = (): AIConfig => {
  const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const envProvider = import.meta.env.VITE_AI_PROVIDER;
  
  console.log('🔍 Configuration détectée:', {
    envProvider,
    openaiKeyLength: openaiKey?.length || 0,
    geminiKeyLength: geminiKey?.length || 0,
    import_meta_env: import.meta.env
  });
  
  if (openaiKey && openaiKey.startsWith('sk-')) {
    console.log('✅ Clé OpenAI détectée - Activation mode OPENAI');
    return {
      provider: 'openai',
      apiKey: openaiKey,
      model: 'gpt-4o',
      maxRetries: 3,
      timeout: 30000,
      confidence: {
        minimum: 0.7,
        warning: 0.85,
        verification: 0.95
      }
    };
  }
  
  if (geminiKey && geminiKey.startsWith('AIza')) {
    console.log('✅ Clé Gemini détectée - Activation mode GOOGLE');
    return {
      provider: 'google',
      apiKey: geminiKey,
      model: 'gemini-1.5-flash',
      maxRetries: 3,
      timeout: 30000,
      confidence: {
        minimum: 0.7,
        warning: 0.85,
        verification: 0.95
      }
    };
  }
  
  console.warn('⚠️ Aucune clé API configurée - Mode Mock actif');
  console.warn('💡 Pour activer l\'API réelle, ajoutez VITE_OPENAI_API_KEY dans .env.local et redémarrez');
  
  return {
    provider: 'mock',
    maxRetries: 3,
    timeout: 30000,
    confidence: {
      minimum: 0.7,
      warning: 0.85,
      verification: 0.95
    }
  };
};

// Charger depuis le fichier de config en priorité (garantit l'activation)
import { getAIConfig } from '@/config/ai-config';

const aiConfig = getAIConfig();

export const aiExtractionService = new AIExtractionService(aiConfig);

