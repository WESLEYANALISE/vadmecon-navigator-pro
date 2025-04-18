
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchArticleContent } from "@/services/googleSheetsService";
import { Article } from "@/types/article";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { getArticleExplanation } from "@/services/geminiService";
import { Star, ChevronLeft, ChevronRight, Bookmark, Play, Download, Pencil } from "lucide-react";
import { useFavorites } from "@/providers/FavoritesProvider";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ArticleViewer() {
  const { articleNumber } = useParams<{ articleNumber: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [allArticleNumbers, setAllArticleNumbers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [explaining, setExplaining] = useState(false);
  const [explanation, setExplanation] = useState<{ formal: string; technical: string; example: string } | null>(null);
  const [notes, setNotes] = useState<string>("");
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  useEffect(() => {
    const loadArticle = async () => {
      setLoading(true);
      try {
        const articles = await fetchArticleContent();
        
        // Extract all article numbers for navigation
        const numbers = articles
          .filter(a => a.number)
          .map(a => a.number);
        setAllArticleNumbers(numbers);
        
        // Find the requested article
        const foundArticle = articles.find(a => a.number === articleNumber);
        setArticle(foundArticle || null);
        
        // Load saved notes if any
        const savedNotes = localStorage.getItem(`notes-${articleNumber}`);
        if (savedNotes) {
          setNotes(savedNotes);
        } else {
          setNotes("");
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error loading article:", error);
        setLoading(false);
        toast.error("Erro ao carregar o artigo");
      }
    };

    loadArticle();
  }, [articleNumber]);

  const handleExplain = async () => {
    if (!article) return;
    
    setExplaining(true);
    try {
      const response = await getArticleExplanation(article.number, article.content);
      if (response) {
        setExplanation(response);
      }
    } catch (error) {
      console.error("Error explaining article:", error);
      toast.error("Erro ao explicar o artigo");
    } finally {
      setExplaining(false);
    }
  };

  const handleSaveNotes = () => {
    if (!articleNumber) return;
    localStorage.setItem(`notes-${articleNumber}`, notes);
    toast.success("Anotações salvas com sucesso!");
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (!articleNumber || allArticleNumbers.length === 0) return;
    
    const currentIndex = allArticleNumbers.indexOf(articleNumber);
    if (currentIndex === -1) return;
    
    let newIndex;
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : allArticleNumbers.length - 1;
    } else {
      newIndex = currentIndex < allArticleNumbers.length - 1 ? currentIndex + 1 : 0;
    }
    
    navigate(`/article/${allArticleNumbers[newIndex]}`);
  };

  const toggleFavorite = () => {
    if (!articleNumber) return;
    
    if (isFavorite(articleNumber)) {
      removeFavorite(articleNumber);
      toast.success("Removido dos favoritos");
    } else {
      addFavorite(articleNumber);
      toast.success("Adicionado aos favoritos");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-[100px]" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold mb-4">Artigo não encontrado</h2>
        <p className="text-muted-foreground mb-6">O artigo solicitado não existe ou não foi encontrado.</p>
        <Button onClick={() => navigate("/")}>Voltar para o início</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => handleNavigate('prev')} title="Artigo anterior">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => handleNavigate('next')} title="Próximo artigo">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <Button
          variant="outline"
          size="icon"
          onClick={toggleFavorite}
          className={isFavorite(article.number) ? "text-yellow-400 hover:text-yellow-500" : ""}
          title={isFavorite(article.number) ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        >
          <Star className="h-4 w-4" fill={isFavorite(article.number) ? "currentColor" : "none"} />
        </Button>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-4">
          {article.number ? `Artigo ${article.number}` : ""}
        </h2>
        <div className="text-lg leading-relaxed whitespace-pre-wrap">
          {article.content}
        </div>
      </div>
      
      <Tabs defaultValue="explanation" className="w-full">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="explanation">Explicação</TabsTrigger>
          <TabsTrigger value="example">Exemplo Prático</TabsTrigger>
          <TabsTrigger value="notes">Anotações</TabsTrigger>
        </TabsList>
        
        <TabsContent value="explanation" className="space-y-4">
          {!explanation && !explaining ? (
            <div className="text-center py-8">
              <p className="mb-4 text-muted-foreground">Clique no botão abaixo para obter uma explicação detalhada deste artigo</p>
              <Button onClick={handleExplain}>Explicar Artigo</Button>
            </div>
          ) : explaining ? (
            <div className="space-y-4 py-8">
              <p className="text-center text-muted-foreground">Gerando explicação...</p>
              <div className="flex justify-center">
                <div className="animate-pulse h-4 w-1/2 bg-muted rounded"></div>
              </div>
              <div className="flex justify-center">
                <div className="animate-pulse h-4 w-2/3 bg-muted rounded"></div>
              </div>
              <div className="flex justify-center">
                <div className="animate-pulse h-4 w-1/3 bg-muted rounded"></div>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Explicação Formal</CardTitle>
                  <CardDescription>Linguagem clara e didática</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{explanation?.formal}</p>
                  <Button variant="outline" size="sm" className="mt-4">
                    <Play className="h-4 w-4 mr-2" />
                    Ouvir
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Explicação Técnica</CardTitle>
                  <CardDescription>Linguagem jurídica especializada</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{explanation?.technical}</p>
                  <Button variant="outline" size="sm" className="mt-4">
                    <Play className="h-4 w-4 mr-2" />
                    Ouvir
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="example">
          {!explanation && !explaining ? (
            <div className="text-center py-8">
              <p className="mb-4 text-muted-foreground">Clique no botão abaixo para obter um exemplo prático deste artigo</p>
              <Button onClick={handleExplain}>Gerar Exemplo</Button>
            </div>
          ) : explaining ? (
            <div className="space-y-4 py-8">
              <p className="text-center text-muted-foreground">Gerando exemplo prático...</p>
              <div className="flex justify-center">
                <div className="animate-pulse h-4 w-1/2 bg-muted rounded"></div>
              </div>
              <div className="flex justify-center">
                <div className="animate-pulse h-4 w-2/3 bg-muted rounded"></div>
              </div>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Exemplo Prático</CardTitle>
                <CardDescription>Aplicação em situações reais</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{explanation?.example}</p>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm">
                    <Play className="h-4 w-4 mr-2" />
                    Ouvir
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Pencil className="h-4 w-4 mr-2" />
                Minhas Anotações
              </CardTitle>
              <CardDescription>Suas notas pessoais sobre este artigo</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Digite suas anotações aqui..."
                className="min-h-[200px] mb-4"
              />
              <div className="flex gap-2">
                <Button onClick={handleSaveNotes}>
                  <Bookmark className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
                <Button variant="outline">
                  <Play className="h-4 w-4 mr-2" />
                  Ouvir
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
