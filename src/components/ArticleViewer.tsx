
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchArticleContent } from "@/services/googleSheetsService";
import { Article } from "@/types/article";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { getArticleExplanation, summarizeArticle } from "@/services/geminiService";
import { Star, ChevronLeft, ChevronRight, Bookmark, Play, Download, Pencil, Tag, History, MessageCircle } from "lucide-react";
import { useFavorites } from "@/providers/FavoritesProvider";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CrossReferenceList } from "@/components/CrossReferenceList";
import { QAChat } from "@/components/QAChat";

interface ArticleViewerProps {
  sheetName?: string;
}

export function ArticleViewer({ sheetName }: ArticleViewerProps) {
  const { articleNumber } = useParams<{ articleNumber: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [allArticleNumbers, setAllArticleNumbers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [explaining, setExplaining] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [explanation, setExplanation] = useState<{ formal: string; technical: string; example: string; summary?: string } | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [activeTab, setActiveTab] = useState("explanation");
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  // Load article and relevant data
  useEffect(() => {
    const loadArticle = async () => {
      setLoading(true);
      try {
        const articles = await fetchArticleContent(undefined, sheetName);
        
        // Extract all article numbers for navigation
        const numbers = articles
          .filter(a => a.number)
          .map(a => a.number);
        setAllArticleNumbers(numbers);
        
        // Find the requested article
        const foundArticle = articles.find(a => a.number === articleNumber);
        setArticle(foundArticle || null);
        
        // Load saved notes if any
        const savedNotes = localStorage.getItem(`notes-${sheetName}-${articleNumber}`);
        if (savedNotes) {
          setNotes(savedNotes);
        } else {
          setNotes("");
        }

        // Load saved tags if any
        const savedTags = localStorage.getItem(`tags-${sheetName}-${articleNumber}`);
        if (savedTags) {
          setTags(JSON.parse(savedTags));
        } else {
          setTags([]);
        }

        // Save to reading history
        if (foundArticle) {
          saveToReadingHistory(foundArticle);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error loading article:", error);
        setLoading(false);
        toast.error("Erro ao carregar o artigo");
      }
    };

    loadArticle();
  }, [articleNumber, sheetName]);

  // Save to reading history
  const saveToReadingHistory = (currentArticle: Article) => {
    try {
      const now = Date.now();
      const history = JSON.parse(localStorage.getItem('reading-history') || '[]');
      
      // Add current article with timestamp
      const updatedHistory = [
        { 
          number: currentArticle.number, 
          content: currentArticle.content.substring(0, 100) + '...', 
          timestamp: now,
          sheetName 
        },
        ...history.filter((item: any) => 
          !(item.number === currentArticle.number && item.sheetName === sheetName)
        )
      ].slice(0, 20); // Keep only 20 most recent

      localStorage.setItem('reading-history', JSON.stringify(updatedHistory));
    } catch (e) {
      console.error('Error saving to reading history:', e);
    }
  };

  // Handle explanation
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

  // Handle summarization
  const handleSummarize = async () => {
    if (!article) return;
    
    setSummarizing(true);
    try {
      const summary = await summarizeArticle(article.number, article.content);
      if (summary) {
        setExplanation(prev => ({
          ...prev,
          summary
        }));
        setActiveTab('summary');
      }
    } catch (error) {
      console.error("Error summarizing article:", error);
      toast.error("Erro ao resumir o artigo");
    } finally {
      setSummarizing(false);
    }
  };

  // Save notes
  const handleSaveNotes = () => {
    if (!articleNumber || !sheetName) return;
    localStorage.setItem(`notes-${sheetName}-${articleNumber}`, notes);
    toast.success("Anotações salvas com sucesso!");
  };

  // Add tag
  const handleAddTag = () => {
    if (newTag.trim() === '' || tags.includes(newTag.trim())) return;
    
    const updatedTags = [...tags, newTag.trim()];
    setTags(updatedTags);
    setNewTag('');
    
    // Save tags
    if (articleNumber && sheetName) {
      localStorage.setItem(`tags-${sheetName}-${articleNumber}`, JSON.stringify(updatedTags));
      toast.success("Tag adicionada com sucesso!");
    }
  };

  // Remove tag
  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(t => t !== tagToRemove);
    setTags(updatedTags);
    
    // Save updated tags
    if (articleNumber && sheetName) {
      localStorage.setItem(`tags-${sheetName}-${articleNumber}`, JSON.stringify(updatedTags));
    }
  };

  // Navigate between articles
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

  // Toggle favorite
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

  // Loading state
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

  // Article not found
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
      {/* Navigation and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => handleNavigate('prev')} title="Artigo anterior">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => handleNavigate('next')} title="Próximo artigo">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSummarize}
            disabled={summarizing}
          >
            {summarizing ? "Resumindo..." : "Resumir"}
          </Button>
          
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
      </div>
      
      {/* Article Content */}
      <div>
        <h2 className="text-2xl font-bold mb-2">
          {article.number ? `Artigo ${article.number}` : ""}
          {article.sheetName && <span className="text-sm text-muted-foreground ml-2">({article.sheetName})</span>}
        </h2>
        
        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map(tag => (
              <Badge 
                key={tag} 
                variant="secondary"
                className="flex items-center gap-1"
              >
                {tag}
                <button 
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        )}
        
        {/* Article Text */}
        <div className="text-lg leading-relaxed whitespace-pre-wrap mb-6">
          {article.content}
        </div>
        
        {/* Add Tag Input */}
        <div className="flex gap-2 mb-6">
          <Input
            placeholder="Adicionar tag..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
            className="max-w-xs"
          />
          <Button variant="outline" size="sm" onClick={handleAddTag}>
            <Tag className="h-4 w-4 mr-2" />
            Adicionar Tag
          </Button>
        </div>
      </div>
      
      {/* Cross References */}
      <CrossReferenceList articleNumber={article.number} sheetName={sheetName} />
      
      {/* Tabs for different content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5">
          <TabsTrigger value="summary">Resumo</TabsTrigger>
          <TabsTrigger value="explanation">Explicação</TabsTrigger>
          <TabsTrigger value="example">Exemplo Prático</TabsTrigger>
          <TabsTrigger value="notes">Anotações</TabsTrigger>
          <TabsTrigger value="qa">Perguntas</TabsTrigger>
        </TabsList>
        
        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-4">
          {!explanation?.summary && !summarizing ? (
            <div className="text-center py-8">
              <p className="mb-4 text-muted-foreground">Clique no botão "Resumir" para obter um resumo deste artigo</p>
              <Button onClick={handleSummarize}>Resumir Artigo</Button>
            </div>
          ) : summarizing ? (
            <div className="space-y-4 py-8">
              <p className="text-center text-muted-foreground">Gerando resumo...</p>
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
                <CardTitle>Resumo do Artigo</CardTitle>
                <CardDescription>Os pontos principais em 3-5 linhas</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{explanation?.summary}</p>
              </CardContent>
              <CardFooter>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Play className="h-4 w-4 mr-2" />
                    Ouvir
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar PDF
                  </Button>
                </div>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
        
        {/* Explanation Tab */}
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
        
        {/* Example Tab */}
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
        
        {/* Notes Tab */}
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
        
        {/* Q&A Tab */}
        <TabsContent value="qa">
          <QAChat articleContent={article.content} articleNumber={article.number} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
