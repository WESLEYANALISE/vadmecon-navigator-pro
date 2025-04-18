
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { askQuestion } from "@/services/geminiService";
import { toast } from "sonner";
import { MessageCircle, Send } from "lucide-react";

interface QAChatProps {
  articleContent: string;
  articleNumber: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function QAChat({ articleContent, articleNumber }: QAChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    const userMessage = {
      role: "user" as const,
      content: newMessage.trim()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setNewMessage("");
    setLoading(true);
    
    try {
      const response = await askQuestion(articleNumber, articleContent, userMessage.content);
      
      const assistantMessage = {
        role: "assistant" as const,
        content: response || "Desculpe, não consegui processar sua pergunta."
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Erro ao processar sua pergunta");
      
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Desculpe, ocorreu um erro ao processar sua pergunta. Por favor, tente novamente."
      }]);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="flex flex-col h-[500px]">
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <MessageCircle className="h-12 w-12 mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium">Tire suas dúvidas</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Faça perguntas sobre este artigo e obtenha respostas claras e precisas.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg max-w-[80%] ${
                  message.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            ))}
            {loading && (
              <div className="p-3 rounded-lg max-w-[80%] bg-muted">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0.2s" }} />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0.4s" }} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
        <Input
          placeholder="Digite sua pergunta..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={loading}
          className="flex-1"
        />
        <Button type="submit" disabled={loading || !newMessage.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </Card>
  );
}
