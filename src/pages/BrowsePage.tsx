
import { useEffect, useState } from "react";
import { fetchArticleContent } from "@/services/googleSheetsService";
import { Article } from "@/types/article";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const BrowsePage = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArticles = async () => {
      setLoading(true);
      try {
        const fetchedArticles = await fetchArticleContent();
        setArticles(fetchedArticles);
      } catch (error) {
        console.error("Error loading articles:", error);
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, []);

  const renderArticleItem = (article: Article) => {
    if (article.isTitle) {
      return (
        <div key={`title-${article.content.substring(0, 20)}`} className="col-span-full">
          <h2 className="title text-xl md:text-2xl">{article.content}</h2>
        </div>
      );
    }

    return (
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
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-4">Navegar Artigos</h1>
        <p className="text-muted-foreground mb-6">
          Explore todos os artigos da constituição
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array(9).fill(0).map((_, i) => (
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
          articles.map(article => renderArticleItem(article))
        )}
      </div>
    </div>
  );
};

export default BrowsePage;
