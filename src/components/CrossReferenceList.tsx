
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ExternalLink } from "lucide-react";

interface CrossReferenceProps {
  articleNumber: string;
  sheetName?: string;
}

export function CrossReferenceList({ articleNumber, sheetName }: CrossReferenceProps) {
  const [references, setReferences] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // For this first version, we'll use mock data
    // In a real implementation, this would fetch actual cross-references from a backend
    
    const mockReferences = [
      {
        toArticle: "7",
        type: "related",
        description: "Direitos relacionados aos citados neste artigo",
        sheetName: sheetName
      },
      {
        toArticle: "14",
        type: "complementary",
        description: "Complementa os direitos previstos neste artigo",
        sheetName: sheetName
      }
    ];
    
    // Only set mock references for certain article numbers
    if (["5", "6", "8", "10"].includes(articleNumber)) {
      setReferences(mockReferences);
    } else {
      setReferences([]);
    }
    
  }, [articleNumber, sheetName]);
  
  if (references.length === 0) {
    return null;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <ArrowRight className="h-4 w-4 mr-2" />
          Referências Cruzadas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {references.map((ref, index) => (
            <div key={index} className="flex items-center justify-between p-2 border rounded hover:bg-accent transition-colors">
              <div>
                <span className="font-medium">Artigo {ref.toArticle}</span>
                <p className="text-sm text-muted-foreground">{ref.description}</p>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link to={`/article/${ref.toArticle}`}>
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
