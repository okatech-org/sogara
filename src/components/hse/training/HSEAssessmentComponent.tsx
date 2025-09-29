import { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Award,
  RotateCcw,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { HSEAssessment, HSEQuestion, HSEAssessmentResult } from '@/types';

interface HSEAssessmentComponentProps {
  assessments: HSEAssessment[];
  onComplete: (result: Omit<HSEAssessmentResult, 'completedAt'>) => void;
  onCancel: () => void;
}

export function HSEAssessmentComponent({ assessments, onComplete, onCancel }: HSEAssessmentComponentProps) {
  const [currentAssessmentIndex, setCurrentAssessmentIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, string>>(new Map());
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [showResults, setShowResults] = useState(false);
  const [assessmentResults, setAssessmentResults] = useState<any[]>([]);

  const currentAssessment = assessments[currentAssessmentIndex];
  const currentQuestion = currentAssessment?.questions[currentQuestionIndex];
  const totalQuestions = currentAssessment?.questions.length || 0;

  useEffect(() => {
    if (currentAssessment) {
      setTimeRemaining(currentAssessment.duration * 60); // Convertir en secondes
    }
  }, [currentAssessment]);

  useEffect(() => {
    if (timeRemaining > 0 && !showResults) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && !showResults) {
      handleFinishAssessment();
    }
  }, [timeRemaining, showResults]);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => new Map(prev.set(questionId, answer)));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleFinishAssessment = () => {
    if (!currentAssessment) return;

    // Calculer le score
    let correctAnswers = 0;
    const detailedResults: any[] = [];

    currentAssessment.questions.forEach(question => {
      const userAnswer = answers.get(question.id) || '';
      const isCorrect = Array.isArray(question.correctAnswer) 
        ? question.correctAnswer.includes(userAnswer)
        : question.correctAnswer === userAnswer;
      
      if (isCorrect) correctAnswers++;

      detailedResults.push({
        questionId: question.id,
        question: question.text,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation
      });
    });

    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = score >= currentAssessment.passingScore;

    const result = {
      assessmentId: currentAssessment.id,
      score,
      passed,
      attempts: 1,
      answers: detailedResults
    };

    setAssessmentResults([result]);
    setShowResults(true);

    // Si c'est le dernier assessment et qu'il est réussi
    if (currentAssessmentIndex === assessments.length - 1 && passed) {
      onComplete(result);
    }
  };

  const handleRetryAssessment = () => {
    setAnswers(new Map());
    setCurrentQuestionIndex(0);
    setTimeRemaining(currentAssessment.duration * 60);
    setShowResults(false);
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getQuestionIcon = (type: string) => {
    switch (type) {
      case 'multiple_choice': return '📝';
      case 'true_false': return '✓/✗';
      case 'open': return '💭';
      default: return '❓';
    }
  };

  if (!currentAssessment) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">Aucune évaluation disponible</p>
      </div>
    );
  }

  if (showResults) {
    const result = assessmentResults[0];
    const isPassed = result?.passed;

    return (
      <div className="space-y-6">
        <Card className={`border-2 ${isPassed ? 'border-green-500' : 'border-red-500'}`}>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              {isPassed ? (
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              ) : (
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
              )}
            </div>
            <CardTitle className={isPassed ? 'text-green-600' : 'text-red-600'}>
              {isPassed ? 'Évaluation Réussie !' : 'Évaluation Non Réussie'}
            </CardTitle>
            <div className="text-3xl font-bold">
              {result?.score || 0}%
            </div>
            <p className="text-muted-foreground">
              {result?.score >= currentAssessment.passingScore 
                ? `Score supérieur au minimum requis (${currentAssessment.passingScore}%)`
                : `Score inférieur au minimum requis (${currentAssessment.passingScore}%)`
              }
            </p>
          </CardHeader>
          <CardContent>
            {/* Détail des réponses */}
            <div className="space-y-4">
              <h4 className="font-medium">Détail des réponses :</h4>
              {result?.answers.map((answer: any, index: number) => (
                <div key={index} className={`p-3 rounded-lg border ${
                  answer.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-start gap-2">
                    {answer.isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{answer.question}</p>
                      <p className="text-sm mt-1">
                        <span className="font-medium">Votre réponse :</span> {answer.userAnswer}
                      </p>
                      {!answer.isCorrect && (
                        <p className="text-sm mt-1">
                          <span className="font-medium text-green-600">Réponse correcte :</span> {answer.correctAnswer}
                        </p>
                      )}
                      {answer.explanation && (
                        <p className="text-sm mt-2 text-muted-foreground italic">
                          {answer.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <Button variant="outline" onClick={onCancel}>
                Retour
              </Button>
              <div className="flex gap-2">
                {!isPassed && (
                  <Button onClick={handleRetryAssessment} className="gap-2">
                    <RotateCcw className="w-4 h-4" />
                    Reprendre l'évaluation
                  </Button>
                )}
                {isPassed && (
                  <Badge className="bg-green-100 text-green-800 border-green-200 px-4 py-2">
                    <Award className="w-4 h-4 mr-2" />
                    Évaluation réussie
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête de l'évaluation */}
      <Card className="industrial-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                {currentAssessment.title}
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                Type: {currentAssessment.type === 'qcm' ? 'QCM' : 'Pratique'} • 
                Score minimum: {currentAssessment.passingScore}%
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {formatTime(timeRemaining)}
              </div>
              <div className="text-sm text-muted-foreground">Temps restant</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Question {currentQuestionIndex + 1} sur {totalQuestions}</span>
              <span>{Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}%</span>
            </div>
            <Progress value={((currentQuestionIndex + 1) / totalQuestions) * 100} />
          </div>
        </CardHeader>
      </Card>

      {/* Question courante */}
      {currentQuestion && (
        <Card className="industrial-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-lg">{getQuestionIcon(currentQuestion.type)}</span>
              Question {currentQuestionIndex + 1}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-lg leading-relaxed">
                {currentQuestion.text}
              </div>

              {/* Illustration de la question */}
              {currentQuestion.illustration && (
                <div className="border rounded-lg p-4 bg-muted/50">
                  <div className="aspect-video bg-white rounded-md flex items-center justify-center mb-3">
                    <div className="text-center text-muted-foreground">
                      <Eye className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">{currentQuestion.illustration.title}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {currentQuestion.illustration.description}
                  </p>
                </div>
              )}

              {/* Réponses selon le type */}
              <div className="space-y-4">
                {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
                  <RadioGroup
                    value={answers.get(currentQuestion.id) || ''}
                    onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                  >
                    {currentQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                        <RadioGroupItem value={option} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {currentQuestion.type === 'true_false' && (
                  <RadioGroup
                    value={answers.get(currentQuestion.id) || ''}
                    onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                  >
                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                      <RadioGroupItem value="true" id="true" />
                      <Label htmlFor="true" className="flex-1 cursor-pointer">
                        ✅ Vrai
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                      <RadioGroupItem value="false" id="false" />
                      <Label htmlFor="false" className="flex-1 cursor-pointer">
                        ❌ Faux
                      </Label>
                    </div>
                  </RadioGroup>
                )}

                {currentQuestion.type === 'open' && (
                  <div className="space-y-2">
                    <Label htmlFor="open-answer">Votre réponse :</Label>
                    <Textarea
                      id="open-answer"
                      placeholder="Saisissez votre réponse détaillée..."
                      value={answers.get(currentQuestion.id) || ''}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      rows={4}
                    />
                  </div>
                )}
              </div>

              {/* Navigation des questions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Précédent
                </Button>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {answers.size} / {totalQuestions} réponses
                  </span>
                </div>

                {currentQuestionIndex < totalQuestions - 1 ? (
                  <Button
                    onClick={handleNextQuestion}
                    className="gap-2"
                  >
                    Suivant
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleFinishAssessment}
                    disabled={answers.size < totalQuestions}
                    className="gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Terminer l'évaluation
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Panneau de navigation rapide */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <h4 className="font-medium mb-3">Navigation rapide</h4>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {currentAssessment?.questions.map((question, index) => (
              <Button
                key={question.id}
                variant={index === currentQuestionIndex ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentQuestionIndex(index)}
                className={`relative ${answers.has(question.id) ? 'bg-green-50 border-green-200' : ''}`}
              >
                {index + 1}
                {answers.has(question.id) && (
                  <CheckCircle className="w-3 h-3 absolute -top-1 -right-1 text-green-600" />
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Aide et instructions */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Instructions :</strong> Répondez à toutes les questions. 
          Vous pouvez naviguer entre les questions et modifier vos réponses avant de terminer.
          Score minimum requis : {currentAssessment.passingScore}%.
        </AlertDescription>
      </Alert>

      {/* Actions générales */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onCancel}>
          Annuler l'évaluation
        </Button>
        <div className="flex gap-2">
          <Badge variant="outline" className="gap-1">
            <Clock className="w-3 h-3" />
            {currentAssessment.duration} minutes
          </Badge>
          <Badge variant="outline">
            {totalQuestions} questions
          </Badge>
        </div>
      </div>
    </div>
  );
}
