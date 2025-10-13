import { useState } from 'react'
import {
  CheckSquare,
  AlertTriangle,
  Info,
  FileText,
  Play,
  CheckCircle,
  Eye,
  BookOpen,
  Zap,
  Shield,
} from 'lucide-react'
import { HSEIllustrationViewer } from './HSEIllustrationViewer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { HSEContentModule, HSEModuleSection } from '@/types'
import { cn } from '@/lib/utils'

interface HSEModuleContentProps {
  module: HSEContentModule
  onComplete: () => void
  isCompleted: boolean
}

export function HSEModuleContent({ module, onComplete, isCompleted }: HSEModuleContentProps) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [readSections, setReadSections] = useState<Set<string>>(new Set())

  const currentSection = module.content[currentSectionIndex]
  const totalSections = module.content.length

  const handleSectionRead = (sectionId: string) => {
    setReadSections(prev => new Set([...prev, sectionId]))
  }

  const handleNextSection = () => {
    if (currentSection) {
      handleSectionRead(currentSection.id)
    }

    if (currentSectionIndex < totalSections - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1)
    }
  }

  const handlePreviousSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1)
    }
  }

  const canCompleteModule = readSections.size === totalSections

  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'checklist':
        return <CheckSquare className="w-5 h-5 text-blue-500" />
      case 'emergency_protocol':
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      case 'safety_rules':
        return <Shield className="w-5 h-5 text-green-500" />
      case 'procedure':
        return <FileText className="w-5 h-5 text-purple-500" />
      case 'case_study':
        return <BookOpen className="w-5 h-5 text-orange-500" />
      default:
        return <Info className="w-5 h-5 text-gray-500" />
    }
  }

  const getSectionBorderColor = (type: string) => {
    switch (type) {
      case 'emergency_protocol':
        return 'border-l-red-500'
      case 'safety_rules':
        return 'border-l-green-500'
      case 'procedure':
        return 'border-l-purple-500'
      case 'checklist':
        return 'border-l-blue-500'
      case 'case_study':
        return 'border-l-orange-500'
      default:
        return 'border-l-gray-500'
    }
  }

  const formatContent = (content: string) => {
    // Conversion Markdown basique vers JSX
    const lines = content.split('\n')
    const elements: JSX.Element[] = []
    let currentList: string[] = []
    let currentTable: string[][] = []
    let isInCodeBlock = false
    let codeBlockContent = ''

    lines.forEach((line, index) => {
      const trimmedLine = line.trim()

      // Bloc de code
      if (trimmedLine.startsWith('```')) {
        if (isInCodeBlock) {
          elements.push(
            <pre
              key={`code-${index}`}
              className="bg-muted p-3 rounded-md text-sm overflow-x-auto my-3"
            >
              <code>{codeBlockContent}</code>
            </pre>,
          )
          codeBlockContent = ''
          isInCodeBlock = false
        } else {
          isInCodeBlock = true
        }
        return
      }

      if (isInCodeBlock) {
        codeBlockContent += line + '\n'
        return
      }

      // Finaliser liste si nécessaire
      if (currentList.length > 0 && !trimmedLine.startsWith('-') && !trimmedLine.startsWith('•')) {
        elements.push(
          <ul key={`list-${index}`} className="space-y-2 my-3 ml-4">
            {currentList.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(item) }} />
              </li>
            ))}
          </ul>,
        )
        currentList = []
      }

      // Finaliser tableau si nécessaire
      if (currentTable.length > 0 && !trimmedLine.includes('|')) {
        if (currentTable.length > 1) {
          const headers = currentTable[0]
          const rows = currentTable.slice(1)
          elements.push(
            <div key={`table-${index}`} className="overflow-x-auto my-4">
              <table className="w-full border border-border rounded-lg">
                <thead className="bg-muted">
                  <tr>
                    {headers.map((header, i) => (
                      <th
                        key={i}
                        className="p-3 text-left font-medium border-r border-border last:border-r-0"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} className="border-t border-border">
                      {row.map((cell, j) => (
                        <td key={j} className="p-3 border-r border-border last:border-r-0">
                          <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(cell) }} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>,
          )
        }
        currentTable = []
      }

      // Liste
      if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•')) {
        const item = trimmedLine.substring(1).trim()
        currentList.push(item)
        return
      }

      // Tableau
      if (trimmedLine.includes('|') && trimmedLine.split('|').length > 2) {
        const cells = trimmedLine
          .split('|')
          .map(cell => cell.trim())
          .filter(cell => cell)
        if (cells.length > 0) {
          currentTable.push(cells)
        }
        return
      }

      // Titres
      if (trimmedLine.startsWith('####')) {
        const title = trimmedLine.substring(4).trim()
        elements.push(
          <h4 key={`h4-${index}`} className="text-lg font-semibold mt-6 mb-3 text-primary">
            {title}
          </h4>,
        )
        return
      }

      if (trimmedLine.startsWith('###')) {
        const title = trimmedLine.substring(3).trim()
        elements.push(
          <h3 key={`h3-${index}`} className="text-xl font-semibold mt-6 mb-4 text-foreground">
            {title}
          </h3>,
        )
        return
      }

      if (trimmedLine.startsWith('##')) {
        const title = trimmedLine.substring(2).trim()
        elements.push(
          <h2 key={`h2-${index}`} className="text-2xl font-bold mt-8 mb-4 text-foreground">
            {title}
          </h2>,
        )
        return
      }

      // Paragraphe normal
      if (trimmedLine.length > 0) {
        elements.push(
          <p
            key={`p-${index}`}
            className="mb-3 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(trimmedLine) }}
          />,
        )
      } else {
        elements.push(<br key={`br-${index}`} />)
      }
    })

    // Finaliser liste ou tableau restant
    if (currentList.length > 0) {
      elements.push(
        <ul key="final-list" className="space-y-2 my-3 ml-4">
          {currentList.map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(item) }} />
            </li>
          ))}
        </ul>,
      )
    }

    if (currentTable.length > 1) {
      const headers = currentTable[0]
      const rows = currentTable.slice(1)
      elements.push(
        <div key="final-table" className="overflow-x-auto my-4">
          <table className="w-full border border-border rounded-lg">
            <thead className="bg-muted">
              <tr>
                {headers.map((header, i) => (
                  <th
                    key={i}
                    className="p-3 text-left font-medium border-r border-border last:border-r-0"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-t border-border">
                  {row.map((cell, j) => (
                    <td key={j} className="p-3 border-r border-border last:border-r-0">
                      <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(cell) }} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      )
    }

    return elements
  }

  const formatInlineMarkdown = (text: string): string => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/❌/g, '<span class="text-red-500 font-bold">❌</span>')
      .replace(/✅/g, '<span class="text-green-500 font-bold">✅</span>')
      .replace(/⚠️/g, '<span class="text-orange-500 font-bold">⚠️</span>')
      .replace(/🔥/g, '<span class="text-red-500">🔥</span>')
      .replace(/⚡/g, '<span class="text-yellow-500">⚡</span>')
      .replace(/☠️/g, '<span class="text-red-600">☠️</span>')
  }

  return (
    <div className="space-y-6">
      {/* Navigation des sections */}
      <div className="flex items-center gap-2 mb-6">
        {module.content.map((section, index) => (
          <Button
            key={section.id}
            variant={index === currentSectionIndex ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentSectionIndex(index)}
            className={cn(
              'gap-2',
              readSections.has(section.id) && 'bg-green-50 border-green-200 text-green-700',
            )}
          >
            {readSections.has(section.id) ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              getSectionIcon(section.type)
            )}
            {index + 1}. {section.title}
          </Button>
        ))}
      </div>

      {/* Contenu de la section courante */}
      {currentSection && (
        <Card className={cn('border-l-4', getSectionBorderColor(currentSection.type))}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              {getSectionIcon(currentSection.type)}
              {currentSection.title}
              {readSections.has(currentSection.id) && (
                <Badge variant="outline" className="gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Lu
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[60vh]">
              <div className="prose prose-sm max-w-none">
                {formatContent(currentSection.content)}
              </div>

              {/* Illustrations du module */}
              {currentSection.illustrations && currentSection.illustrations.length > 0 && (
                <div className="mt-6 space-y-4">
                  <Separator />
                  <h4 className="font-medium">Illustrations</h4>
                  <HSEIllustrationViewer illustrations={currentSection.illustrations} />
                </div>
              )}

              {/* Éléments interactifs */}
              {currentSection.interactive && currentSection.interactive.length > 0 && (
                <div className="mt-6 space-y-4">
                  <Separator />
                  <h4 className="font-medium">Éléments Interactifs</h4>
                  {currentSection.interactive.map(element => (
                    <Alert key={element.id}>
                      <Play className="h-4 w-4" />
                      <AlertDescription>
                        <strong>{element.title}</strong> - {element.type}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Actions de section */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Section {currentSectionIndex + 1} sur {totalSections}
                </span>
                {readSections.has(currentSection.id) && (
                  <Badge variant="outline" className="gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Lu
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handlePreviousSection}
                  disabled={currentSectionIndex === 0}
                >
                  Précédent
                </Button>

                {!readSections.has(currentSection.id) && (
                  <Button onClick={() => handleSectionRead(currentSection.id)} variant="outline">
                    Marquer comme lu
                  </Button>
                )}

                {currentSectionIndex < totalSections - 1 ? (
                  <Button onClick={handleNextSection}>Suivant</Button>
                ) : (
                  <Button
                    onClick={onComplete}
                    disabled={!canCompleteModule || isCompleted}
                    className="gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {isCompleted ? 'Module terminé' : 'Terminer le module'}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Résumé du module */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{totalSections}</div>
              <div className="text-sm text-muted-foreground">Sections</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{readSections.size}</div>
              <div className="text-sm text-muted-foreground">Lues</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{module.duration}h</div>
              <div className="text-sm text-muted-foreground">Durée estimée</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Message d'achèvement */}
      {isCompleted && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Module terminé !</strong> Vous pouvez passer au module suivant ou revoir le
            contenu.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
