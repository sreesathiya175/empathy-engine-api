import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  CATEGORIES, 
  CATEGORY_ICONS, 
  type GrievanceCategory,
  generateTicketId,
  getSentimentFromAnalysis,
  getPriorityFromSentiment
} from "@/types/grievance";
import { PriorityBadge } from "@/components/grievance/PriorityBadge";
import { SentimentBadge } from "@/components/grievance/SentimentBadge";
import { 
  FileUp, 
  Send, 
  Brain, 
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

// Simple sentiment analysis simulation (will be replaced with real AI)
function analyzeSentiment(text: string): { sentiment: ReturnType<typeof getSentimentFromAnalysis>, score: number } {
  const negativeWords = ['terrible', 'awful', 'horrible', 'worst', 'angry', 'furious', 'unacceptable', 'disgusting', 'outraged', 'extremely', 'severely', 'urgent', 'immediately'];
  const mildNegativeWords = ['bad', 'poor', 'disappointing', 'frustrated', 'annoying', 'problem', 'issue', 'delay', 'slow'];
  const positiveWords = ['great', 'excellent', 'wonderful', 'amazing', 'happy', 'pleased', 'satisfied', 'thank', 'appreciate', 'helpful', 'good'];
  
  const lowerText = text.toLowerCase();
  let score = 0;
  
  negativeWords.forEach(word => {
    if (lowerText.includes(word)) score -= 0.3;
  });
  
  mildNegativeWords.forEach(word => {
    if (lowerText.includes(word)) score -= 0.15;
  });
  
  positiveWords.forEach(word => {
    if (lowerText.includes(word)) score += 0.25;
  });
  
  // Clamp score between -1 and 1
  score = Math.max(-1, Math.min(1, score));
  
  return { sentiment: getSentimentFromAnalysis(score), score };
}

export default function SubmitGrievance() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<GrievanceCategory | "">("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ReturnType<typeof analyzeSentiment> | null>(null);
  const [ticketId, setTicketId] = useState<string | null>(null);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    setAnalysisResult(null);
  };

  const handleAnalyzeSentiment = async () => {
    if (!description.trim()) {
      toast({
        title: "Description required",
        description: "Please enter a description to analyze sentiment.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const result = analyzeSentiment(description);
    setAnalysisResult(result);
    setIsAnalyzing(false);

    toast({
      title: "Sentiment Analyzed",
      description: `Your grievance has been classified as ${result.sentiment.replace('_', ' ')}.`,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB.",
          variant: "destructive"
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !category || !description) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    // Analyze sentiment if not already done
    if (!analysisResult) {
      const result = analyzeSentiment(description);
      setAnalysisResult(result);
    }

    // Simulate submission delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const newTicketId = generateTicketId();
    setTicketId(newTicketId);
    setIsSubmitting(false);

    toast({
      title: "Grievance Submitted Successfully!",
      description: `Your ticket ID is ${newTicketId}. You will receive updates via email.`,
    });
  };

  if (ticketId) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header isAuthenticated={true} userName="John Doe" onLogout={() => {}} />
        
        <main className="flex-1 container py-16 flex items-center justify-center">
          <Card className="max-w-md w-full text-center">
            <CardContent className="pt-8 pb-8">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-priority-low/20">
                <CheckCircle2 className="h-8 w-8 text-priority-low" />
              </div>
              <h2 className="font-display text-2xl font-bold mb-2">Grievance Submitted!</h2>
              <p className="text-muted-foreground mb-6">
                Your grievance has been successfully submitted and is now being processed.
              </p>
              
              <div className="rounded-lg bg-muted p-4 mb-6">
                <p className="text-sm text-muted-foreground mb-1">Your Ticket ID</p>
                <p className="font-mono text-lg font-bold text-primary">{ticketId}</p>
              </div>

              {analysisResult && (
                <div className="flex items-center justify-center gap-2 mb-6">
                  <SentimentBadge sentiment={analysisResult.sentiment} />
                  <PriorityBadge priority={getPriorityFromSentiment(analysisResult.sentiment)} />
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Button onClick={() => navigate("/dashboard")}>
                  View Dashboard
                </Button>
                <Button variant="outline" onClick={() => {
                  setTicketId(null);
                  setTitle("");
                  setCategory("");
                  setDescription("");
                  setFile(null);
                  setAnalysisResult(null);
                }}>
                  Submit Another Grievance
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header isAuthenticated={true} userName="John Doe" onLogout={() => {}} />
      
      <main className="flex-1 container py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold">Submit a Grievance</h1>
            <p className="text-muted-foreground mt-1">
              Describe your concern and we'll analyze it using AI to ensure proper prioritization.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Grievance Details</CardTitle>
              <CardDescription>
                Please provide detailed information about your concern
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Brief summary of your grievance"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={category} onValueChange={(v) => setCategory(v as GrievanceCategory)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          <span className="flex items-center gap-2">
                            <span>{CATEGORY_ICONS[cat]}</span>
                            <span>{cat}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide detailed information about your grievance. Be specific about the issue, when it occurred, and how it affects you."
                    value={description}
                    onChange={(e) => handleDescriptionChange(e.target.value)}
                    rows={6}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum 20 characters. Be descriptive for better analysis.
                  </p>
                </div>

                {/* Sentiment Analysis */}
                <div className="rounded-lg border border-border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-primary" />
                      <span className="font-medium">AI Sentiment Analysis</span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAnalyzeSentiment}
                      disabled={isAnalyzing || !description.trim()}
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        "Analyze"
                      )}
                    </Button>
                  </div>
                  
                  {analysisResult ? (
                    <div className="flex items-center gap-3 pt-2">
                      <SentimentBadge sentiment={analysisResult.sentiment} />
                      <span className="text-muted-foreground">→</span>
                      <PriorityBadge priority={getPriorityFromSentiment(analysisResult.sentiment)} />
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Click "Analyze" to see the sentiment classification and priority level.
                    </p>
                  )}
                </div>

                {/* File Upload */}
                <div className="space-y-2">
                  <Label htmlFor="file">Attachment (Optional)</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                    <input
                      id="file"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label htmlFor="file" className="cursor-pointer">
                      <FileUp className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      {file ? (
                        <p className="text-sm font-medium">{file.name}</p>
                      ) : (
                        <>
                          <p className="text-sm font-medium">Click to upload</p>
                          <p className="text-xs text-muted-foreground">
                            Images or PDF (max 10MB)
                          </p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {/* Info Box */}
                <div className="flex items-start gap-3 rounded-lg bg-accent/50 p-4">
                  <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">What happens next?</p>
                    <p className="text-muted-foreground mt-1">
                      After submission, your grievance will be automatically analyzed for sentiment, 
                      assigned a priority level, and routed to the appropriate department. 
                      You'll receive email updates on progress.
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Submit Grievance
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}