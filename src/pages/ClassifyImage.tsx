import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Stethoscope, Upload, Camera, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ClassificationResult {
  condition: string;
  confidence: number;
  description: string;
  recommendations: string[];
  severity: "low" | "medium" | "high";
}

const ClassifyImage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setResult(null);
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    
    // Simulate API call with loading
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Mock result - in real app, this would be from your ML API
    const mockResult: ClassificationResult = {
      condition: "Melanocytic Nevus (Mole)",
      confidence: 87.3,
      description: "A common benign skin lesion composed of melanocytes. Generally harmless but should be monitored for changes.",
      recommendations: [
        "Monitor for any changes in size, color, or shape",
        "Protect from excessive sun exposure", 
        "Consider regular dermatological check-ups",
        "Take photos to track any evolution over time"
      ],
      severity: "low"
    };

    setResult(mockResult);
    setIsAnalyzing(false);

    toast({
      title: "Analysis Complete",
      description: "Your skin condition has been successfully analyzed.",
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low": return "bg-secondary text-secondary-foreground";
      case "medium": return "bg-yellow-500 text-white";
      case "high": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Stethoscope className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              DermAI
            </span>
          </Link>
          <Link to="/">
            <Button variant="ghost">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 animate-slide-up">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Skin Condition Classification
            </h1>
            <p className="text-xl text-muted-foreground">
              Upload an image to get AI-powered analysis of skin conditions
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <Card className="card-medical">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Image
                </CardTitle>
                <CardDescription>
                  Select or drag & drop a clear image of the skin area
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
                    dragActive 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/50"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {previewUrl ? (
                    <div className="space-y-4">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-w-full max-h-64 mx-auto rounded-lg shadow-md"
                      />
                      <p className="text-sm text-muted-foreground">
                        {selectedFile?.name}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Camera className="w-16 h-16 text-muted-foreground mx-auto" />
                      <div>
                        <p className="text-lg font-medium">Drop image here or click to browse</p>
                        <p className="text-sm text-muted-foreground">
                          Supports JPG, PNG, WebP up to 10MB
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                  />
                </div>

                <div className="mt-6 flex gap-3">
                  <Button
                    onClick={handleSubmit}
                    disabled={!selectedFile || isAnalyzing}
                    className="btn-medical flex-1"
                  >
                    {isAnalyzing ? "Analyzing..." : "Analyze Image"}
                  </Button>
                  {selectedFile && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl("");
                        setResult(null);
                      }}
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Results Section */}
            <Card className="card-medical">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Analysis Results
                </CardTitle>
                <CardDescription>
                  AI-powered classification results will appear here
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isAnalyzing ? (
                  <div className="space-y-4 animate-pulse">
                    <div className="text-center">
                      <div className="pulse-medical w-16 h-16 bg-primary/20 rounded-full mx-auto mb-4"></div>
                      <p className="text-lg font-medium">Analyzing image...</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Processing with advanced AI algorithms
                      </p>
                    </div>
                    <Progress value={75} className="w-full" />
                  </div>
                ) : result ? (
                  <div className="space-y-6 animate-slide-up">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold">{result.condition}</h3>
                        <Badge className={getSeverityColor(result.severity)}>
                          {result.severity.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="text-sm text-muted-foreground">Confidence:</span>
                        <Progress value={result.confidence} className="flex-1" />
                        <span className="text-sm font-medium">{result.confidence}%</span>
                      </div>
                      <p className="text-muted-foreground">{result.description}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Recommendations
                      </h4>
                      <ul className="space-y-2">
                        {result.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="w-4 h-4 text-secondary mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        <strong>Disclaimer:</strong> This AI analysis is for educational purposes only. 
                        Always consult with a qualified dermatologist for professional medical advice.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Upload an image to see analysis results
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassifyImage;