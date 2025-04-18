
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { searchArticles } from "@/services/googleSheetsService";
import { Article } from "@/types/article";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronRight, Search as SearchIcon } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const performSearch = async () => {
      if (!query) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const searchResults = await searchArticles(query);
        setResults(searchResults);
      } catch (error) {
        console.error("Error during search:", error);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Resultados da Busca</h1>
        <p className="text-muted-foreground mb-6 flex items-center gap-2">
          <SearchIcon className="h-4 w-4" />
          <span>Termo pesquisado: "{query}"</span>
        </p>
      </div>
      
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array(6).fill(0).map((_, i) => (
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
          ))}
        </div>
      ) : results.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {results.map((article) => (
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
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Nenhum resultado encontrado</h2>
          <p className="text-muted-foreground mb-6">
            Tente buscar por outro termo ou número de artigo
          </p>
          <Button asChild>
            <Link to="/browse">Navegar todos os artigos</Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
