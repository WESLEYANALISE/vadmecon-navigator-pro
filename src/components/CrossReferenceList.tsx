
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ExternalLink, Plus } from "lucide-react";
import { ArticleCrossReference } from "@/types/article";
import { fetchCrossReferences } from "@/services/crossReferenceService";
import { Skeleton } from "@/components/ui/skeleton";

interface CrossReferenceProps {
  articleNumber: string;
  sheetName?: string;
}

export function CrossReferenceList({ articleNumber, sheetName }: CrossReferenceProps) {
  const [references, setReferences] = useState<ArticleCrossReference[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadReferences = async () => {
      setLoading(true);
      try {
        const refs = await fetchCrossReferences(articleNumber, sheetName);
        setReferences(refs);
      } catch (error) {
        console.error("Erro ao carregar referências cruzadas:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadReferences();
  }, [articleNumber, sheetName]);
  
  if (loading) {
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
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (references.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <ArrowRight className="h-4 w-4 mr-2" />
            Referências Cruzadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-4">
            <p>Nenhuma referência cruzada encontrada para este artigo.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center">
            <ArrowRight className="h-4 w-4 mr-2" />
            Referências Cruzadas
          </div>
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <Plus className="h-3.5 w-3.5" />
            <span className="sr-md:inline sr-only">Adicionar</span>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {references.map((ref, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between p-2 border rounded hover:bg-accent transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            >
              <div>
                <span className="font-medium">Artigo {ref.toArticle}</span>
                {ref.sheetName && ref.sheetName !== sheetName && (
                  <span className="text-xs ml-2 text-muted-foreground">
                    ({ref.sheetName})
                  </span>
                )}
                <p className="text-sm text-muted-foreground">{ref.description}</p>
                <div className="mt-1">
                  <span 
                    className={`text-xs rounded-full px-2 py-0.5 
                      ${ref.type === 'related' ? 'bg-blue-500/10 text-blue-500' : 
                      ref.type === 'complementary' ? 'bg-green-500/10 text-green-500' :
                      ref.type === 'revoked' ? 'bg-red-500/10 text-red-500' : 
                      'bg-amber-500/10 text-amber-500'}`}
                  >
                    {ref.type === 'related' ? 'Relacionado' : 
                     ref.type === 'complementary' ? 'Complementar' :
                     ref.type === 'revoked' ? 'Revogado' : 'Alterado'}
                  </span>
                </div>
              </div>
              <Button asChild variant="ghost" size="sm" className="hover:scale-105 transition-transform">
                <Link to={`/article/${ref.toArticle}${ref.sheetName ? `?sheetName=${encodeURIComponent(ref.sheetName)}` : ''}`}>
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
