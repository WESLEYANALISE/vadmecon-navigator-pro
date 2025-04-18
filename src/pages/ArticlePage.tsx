
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ArticleViewer } from "@/components/ArticleViewer";
import { fetchSheetNames } from "@/services/googleSheetsService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const ArticlePage = () => {
  const { articleNumber } = useParams<{ articleNumber: string }>();
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [activeSheet, setActiveSheet] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSheets = async () => {
      try {
        const names = await fetchSheetNames();
        setSheetNames(names);
        
        // Set the first sheet as active by default
        if (names.length > 0 && !activeSheet) {
          setActiveSheet(names[0]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error loading sheet names:", error);
        toast.error("Erro ao carregar áreas jurídicas");
        setLoading(false);
      }
    };

    loadSheets();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // No sheet names found
  if (sheetNames.length === 0) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold mb-4">Nenhuma área jurídica encontrada</h2>
        <p className="text-muted-foreground">
          Não foi possível carregar as áreas jurídicas. Por favor, tente novamente mais tarde.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs 
        value={activeSheet || sheetNames[0]} 
        onValueChange={setActiveSheet}
        className="w-full"
      >
        <div className="border-b">
          <div className="overflow-x-auto">
            <TabsList className="inline-flex w-auto">
              {sheetNames.map((name) => (
                <TabsTrigger 
                  key={name} 
                  value={name}
                  className="whitespace-nowrap"
                >
                  {name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </div>
        
        {sheetNames.map((name) => (
          <TabsContent key={name} value={name} className="mt-6">
            <ArticleViewer sheetName={name} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ArticlePage;
