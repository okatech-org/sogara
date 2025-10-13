declare module 'pdfjs-dist' {
  export interface PDFDocumentProxy {
    numPages: number
    getPage(pageNumber: number): Promise<PDFPageProxy>
  }

  export interface PDFPageProxy {
    getViewport(params: { scale: number }): PDFPageViewport
    render(params: RenderParameters): RenderTask
  }

  export interface PDFPageViewport {
    width: number
    height: number
  }

  export interface RenderParameters {
    canvasContext: CanvasRenderingContext2D
    viewport: PDFPageViewport
  }

  export interface RenderTask {
    promise: Promise<void>
  }

  export interface GlobalWorkerOptions {
    workerSrc: string
  }

  export const GlobalWorkerOptions: GlobalWorkerOptions
  export const version: string

  export function getDocument(
    src: string | ArrayBuffer | Uint8Array | { data: Uint8Array } | { url: string },
  ): PDFDocumentLoadingTask

  export interface PDFDocumentLoadingTask {
    promise: Promise<PDFDocumentProxy>
  }
}
