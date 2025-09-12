import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Stethoscope, 
  Send, 
  History, 
  FileText, 
  User, 
  LogOut, 
  PlusCircle,
  Camera,
  Bot
} from "lucide-react";
import { useAuth } from "@/App";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  image?: string;
}

interface ChatSession {
  id: string;
  title: string;
  lastMessage: Date;
}

const ChatbotInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm your AI dermatology assistant. I can help you analyze skin conditions, answer questions about dermatology, and provide medical insights. How can I assist you today?",
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [chatSessions] = useState<ChatSession[]>([
    { id: "1", title: "Melanoma Analysis", lastMessage: new Date() },
    { id: "2", title: "Acne Treatment Options", lastMessage: new Date(Date.now() - 86400000) },
    { id: "3", title: "Eczema Consultation", lastMessage: new Date(Date.now() - 172800000) },
  ]);
  
  const { logout } = useAuth();
  const { toast } = useToast();

  const handleSendMessage = async () => {
    if (!inputValue.trim() && !selectedImage) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
      image: selectedImage ? URL.createObjectURL(selectedImage) : undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setSelectedImage(null);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: generateAIResponse(inputValue),
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1500);
  };

  const generateAIResponse = (input: string): string => {
    const responses = [
      "Based on the information provided, I can help you understand the skin condition better. For a more accurate analysis, I recommend uploading a clear image of the affected area.",
      "This appears to be a common dermatological concern. I would suggest monitoring the area for any changes and consulting with a dermatologist if symptoms persist or worsen.",
      "Thank you for the image. Based on the visual analysis, this looks like it could be a benign condition, but I recommend professional medical evaluation for proper diagnosis.",
      "Here are some general care recommendations for this type of skin condition: keep the area clean and dry, avoid irritants, and apply a gentle moisturizer as needed.",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      toast({
        title: "Image selected",
        description: "Image ready to send with your message.",
      });
    }
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 bg-muted/30 border-r border-border/50 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center space-x-2 mb-4">
            <Stethoscope className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            AI CHAT
            </span>
          </div>
          <Button className="w-full btn-medical">
            <PlusCircle className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-hidden">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center">
              <History className="w-4 h-4 mr-2" />
              Recent Chats
            </h3>
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {chatSessions.map((session) => (
                  <Card key={session.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardContent className="p-3">
                      <p className="text-sm font-medium truncate">{session.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {session.lastMessage.toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="p-4 border-t border-border/50 space-y-2">
          <Button variant="ghost" className="w-full justify-start">
            <FileText className="w-4 h-4 mr-3" />
            Reports
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <User className="w-4 h-4 mr-3" />
            Profile
          </Button>
          <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-3" />
            Logout
          </Button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-border/50 bg-background/95 backdrop-blur">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src="/placeholder-avatar.jpg" />
              <AvatarFallback>AI</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold">AI Dermatology Assistant</h2>
              <p className="text-sm text-muted-foreground">Online • Ready to help</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[70%] ${message.isUser ? "order-2" : "order-1"}`}>
                  <div
                    className={`rounded-lg p-4 ${
                      message.isUser
                        ? "bg-primary text-primary-foreground ml-auto"
                        : "bg-muted"
                    }`}
                  >
                    {message.image && (
                      <img
                        src={message.image}
                        alt="Uploaded"
                        className="max-w-full max-h-48 rounded mb-2"
                      />
                    )}
                    <p className="text-sm">{message.content}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 px-1">
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
                <Avatar className={`${message.isUser ? "order-1 ml-3" : "order-2 mr-3"}`}>
                  <AvatarFallback>
                    {message.isUser ? "ME" : <Bot className="w-4 h-4" />}
                  </AvatarFallback>
                </Avatar>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t border-border/50 bg-background/95 backdrop-blur">
          <div className="max-w-4xl mx-auto">
            {selectedImage && (
              <div className="mb-3 p-3 bg-muted rounded-lg flex items-center space-x-3">
                <img
                  src={URL.createObjectURL(selectedImage)}
                  alt="Selected"
                  className="w-12 h-12 object-cover rounded"
                />
                <span className="text-sm text-muted-foreground">
                  {selectedImage.name}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedImage(null)}
                >
                  ✕
                </Button>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button variant="outline" size="sm">
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              <Input
                placeholder="Ask about skin conditions, upload images for analysis..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} className="btn-medical">
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              AI can make mistakes. Always consult with qualified healthcare professionals.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotInterface;