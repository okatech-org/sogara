/**
 * Service de conversion PDF vers images pour l'extraction IA
 * Utilise pdf.js pour extraire les pages et les convertir en base64
 */

import * as pdfjsLib from 'pdfjs-dist';

// Configuration du worker PDF.js - utiliser le fichier local
// Le worker est copié depuis node_modules vers public/
// Version correspondante: 5.4.149
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

console.log('📄 PDF.js configuré avec worker local v' + pdfjsLib.version);

export interface PDFPage {
  pageNumber: number;
  imageData: string; // Base64 image
  width: number;
  height: number;
}

export class PDFConverterService {
  /**
   * Convertit un fichier PDF en images (une par page)
   */
  async convertPDFToImages(pdfData: string | ArrayBuffer): Promise<PDFPage[]> {
    try {
      console.log('📄 Début conversion PDF vers images...');
      
      // S'assurer que le worker est configuré
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
      }
      
      // Charger le document PDF
      const loadingTask = pdfjsLib.getDocument(pdfData);
      const pdfDoc = await loadingTask.promise;
      
      console.log(`📄 PDF chargé: ${pdfDoc.numPages} page(s)`);
      
      const pages: PDFPage[] = [];
      
      // Convertir chaque page
      for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        const imageData = await this.renderPageToImage(page, pageNum);
        pages.push(imageData);
      }
      
      console.log(`✅ Conversion terminée: ${pages.length} page(s) extraite(s)`);
      return pages;
      
    } catch (error) {
      console.error('❌ Erreur conversion PDF:', error);
      throw new Error(`Impossible de convertir le PDF: ${error}`);
    }
  }

  /**
   * Convertit seulement la première page du PDF (pour les documents d'identité)
   */
  async convertFirstPageToImage(pdfData: string | ArrayBuffer): Promise<string> {
    try {
      console.log('📄 Extraction de la première page du PDF...');
      
      // S'assurer que le worker est configuré
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
      }
      
      const loadingTask = pdfjsLib.getDocument(pdfData);
      const pdfDoc = await loadingTask.promise;
      
      if (pdfDoc.numPages === 0) {
        throw new Error('Le PDF ne contient aucune page');
      }
      
      const page = await pdfDoc.getPage(1);
      const result = await this.renderPageToImage(page, 1);
      
      console.log('✅ Première page extraite avec succès');
      return result.imageData;
      
    } catch (error) {
      console.error('❌ Erreur extraction première page:', error);
      throw new Error(`Impossible d'extraire la première page: ${error}`);
    }
  }

  /**
   * Rend une page PDF en image base64
   */
  private async renderPageToImage(page: any, pageNumber: number): Promise<PDFPage> {
    const scale = 2.0; // Augmenter la résolution pour une meilleure OCR
    const viewport = page.getViewport({ scale });
    
    // Créer un canvas pour le rendu
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      throw new Error('Impossible de créer le contexte canvas');
    }
    
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    // Rendre la page PDF sur le canvas
    const renderContext = {
      canvasContext: context,
      viewport: viewport
    };
    
    await page.render(renderContext).promise;
    
    // Convertir le canvas en base64
    const imageData = canvas.toDataURL('image/jpeg', 0.95);
    
    console.log(`📄 Page ${pageNumber} rendue: ${Math.round(canvas.width)}x${Math.round(canvas.height)}px`);
    
    return {
      pageNumber,
      imageData,
      width: canvas.width,
      height: canvas.height
    };
  }

  /**
   * Fusionne plusieurs pages en une seule image (utile pour documents multi-pages)
   */
  async mergePagesToSingleImage(pages: PDFPage[]): Promise<string> {
    if (pages.length === 0) {
      throw new Error('Aucune page à fusionner');
    }
    
    if (pages.length === 1) {
      return pages[0].imageData;
    }
    
    console.log(`🔀 Fusion de ${pages.length} pages...`);
    
    // Calculer la taille totale
    const totalHeight = pages.reduce((sum, page) => sum + page.height, 0);
    const maxWidth = Math.max(...pages.map(page => page.width));
    
    // Créer un grand canvas pour toutes les pages
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      throw new Error('Impossible de créer le contexte canvas');
    }
    
    canvas.width = maxWidth;
    canvas.height = totalHeight;
    
    // Dessiner chaque page
    let currentY = 0;
    for (const page of pages) {
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = page.imageData;
      });
      
      // Centrer horizontalement si la page est plus petite
      const x = (maxWidth - page.width) / 2;
      context.drawImage(img, x, currentY, page.width, page.height);
      currentY += page.height;
    }
    
    const mergedImage = canvas.toDataURL('image/jpeg', 0.9);
    console.log('✅ Pages fusionnées avec succès');
    
    return mergedImage;
  }

  /**
   * Détermine si un fichier est un PDF
   */
  static isPDF(file: File | string): boolean {
    if (typeof file === 'string') {
      // Check if it's a data URL
      return file.startsWith('data:application/pdf') || file.includes('pdf');
    }
    return file.type === 'application/pdf';
  }

  /**
   * Convertit un File PDF en ArrayBuffer
   */
  static async fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
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

  /**
   * Convertit une data URL PDF en ArrayBuffer
   */
  static dataURLToArrayBuffer(dataURL: string): ArrayBuffer {
    const base64 = dataURL.split(',')[1];
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    
    return bytes.buffer;
  }
}

// Export singleton
export const pdfConverter = new PDFConverterService();

