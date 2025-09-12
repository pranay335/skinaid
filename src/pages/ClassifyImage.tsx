import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

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

    await new Promise(resolve => setTimeout(resolve, 3000));

    const mockResult: ClassificationResult = {
      condition: "Melanocytic Nevus (Mole)",
      confidence: 87.3,
      description:
        "A common benign skin lesion composed of melanocytes. Generally harmless but should be monitored for changes.",
      recommendations: [
        "Monitor for any changes in size, color, or shape",
        "Protect from excessive sun exposure",
        "Consider regular dermatological check-ups",
        "Take photos to track any evolution over time",
      ],
      severity: "high",
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
      case "low":
        return "bg-green-500/20 text-green-600 border border-green-500/40";
      case "medium":
        return "bg-yellow-500/20 text-yellow-600 border border-yellow-500/40";
      case "high":
        return "bg-red-500/20 text-red-600 border border-red-500/40";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-background/95 backdrop-blur sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer hover:scale-105 transition" onClick={() => navigate("/")}> 
            <Stethoscope className="w-8 h-8 text-primary animate-pulse" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              SkinAid
            </span>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="transition-transform duration-200 hover:scale-105 "
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 animate-fade-in">
            <h1 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Skin Condition Classification
            </h1>
            <p className="text-lg text-muted-foreground">
              Upload an image to get AI-powered analysis of skin conditions
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <Card className="card-medical shadow-lg hover:shadow-xl transition rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Upload className="w-5 h-5 mr-2 text-primary" />
                  Upload Image
                </CardTitle>
                <CardDescription>
                  Select or drag & drop a clear image of the skin area
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                    dragActive
                      ? "border-primary bg-primary/5 scale-[1.01]"
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
                        className="max-w-full max-h-64 mx-auto rounded-lg shadow-md hover:scale-105 transition"
                      />
                      <p className="text-sm text-muted-foreground font-medium">
                        {selectedFile?.name}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-fade-in">
                      <Camera className="w-16 h-16 text-muted-foreground mx-auto animate-bounce" />
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
                    className="btn-medical flex-1 transition-transform hover:scale-105"
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
                      className="hover:bg-muted/50 transition"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Results Section */}
            <Card className="card-medical shadow-lg hover:shadow-xl transition rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <CheckCircle className="w-5 h-5 mr-2 text-secondary" />
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
                      <div className="w-16 h-16 bg-primary/20 rounded-full mx-auto mb-4 animate-ping"></div>
                      <p className="text-lg font-medium">Analyzing image...</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Processing with advanced AI algorithms
                      </p>
                    </div>
                    <Progress value={75} className="w-full" />
                  </div>
                ) : result ? (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold text-primary">{result.condition}</h3>
                        <Badge className={`${getSeverityColor(result.severity)} px-3 py-1 rounded-full text-xs font-semibold` }>
                          {result.severity.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="text-sm text-muted-foreground">Confidence:</span>
                        <Progress value={result.confidence} className="flex-1" />
                        <span className="text-sm font-medium">{result.confidence}%</span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{result.description}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3 flex items-center text-secondary">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Recommendations
                      </h4>
                      <ul className="space-y-2">
                        {result.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start group">
                            <CheckCircle className="w-4 h-4 text-secondary mr-2 mt-0.5 flex-shrink-0 group-hover:scale-110 transition" />
                            <span className="text-sm group-hover:text-foreground transition">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg border border-border/50">
                      <p className="text-xs text-muted-foreground">
                        <strong>Disclaimer:</strong> This AI analysis is for educational purposes only. Always consult with a qualified dermatologist for professional medical advice.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 animate-fade-in">
                    <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Upload an image to see analysis results</p>
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
