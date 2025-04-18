
import { useEffect, useState } from "react";
import { fetchArticleContent } from "@/services/googleSheetsService";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Article } from "@/types/article";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const HomePage = () => {
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArticles = async () => {
      setLoading(true);
      try {
        const articles = await fetchArticleContent();
        const filtered = articles.filter(a => a.number && !a.isTitle).slice(0, 6);
        setRecentArticles(filtered);
      } catch (error) {
        console.error("Error loading recent articles:", error);
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold mb-6">VadmeconPremio2025</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Sua ferramenta completa para estudo e análise da legislação brasileira
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-full">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">Comece a explorar</h2>
                <p className="text-muted-foreground">
                  Navegue por artigos, salve seus favoritos, adicione anotações e muito mais
                </p>
              </div>
              <Button asChild size="lg">
                <Link to="/browse">
                  Explorar Artigos
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="col-span-full">
          <h2 className="text-2xl font-bold mb-4">Artigos Recentes</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              Array(6).fill(0).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-6">
                      <Skeleton className="h-6 w-24 mb-2" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3 mt-2" />
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex justify-end">
                    <Skeleton className="h-9 w-24" />
                  </CardFooter>
                </Card>
              ))
            ) : (
              recentArticles.map((article) => (
                <Card key={article.number} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-6">
                      <h3 className="font-bold mb-2">Artigo {article.number}</h3>
                      <p className="line-clamp-3 text-sm text-muted-foreground">
                        {article.content}
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 bg-muted/50">
                    <Button asChild variant="ghost" className="ml-auto">
                      <Link to={`/article/${article.number}`}>
                        Ler mais
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
