
import { Header } from "./Header";
import { Sidebar, SidebarContent, SidebarProvider, SidebarTrigger, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { useFavorites } from "@/providers/FavoritesProvider";
import { Clock, Home, Star, BookOpen } from "lucide-react";
import { Link, Outlet } from "react-router-dom";
import { fetchArticleContent, fetchSheetNames } from "@/services/googleSheetsService";
import { useEffect, useState } from "react";
import { Article } from "@/types/article";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

export function Layout() {
  const { favorites } = useFavorites();
  const [favoriteArticles, setFavoriteArticles] = useState<Article[]>([]);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [recentArticles, setRecentArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch favorite articles content and sheet names
  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        
        // Fetch sheet names
        const names = await fetchSheetNames();
        setSheetNames(names);
        
        // Fetch favorite articles if any
        if (favorites.length > 0) {
          const firstSheet = names.length > 0 ? names[0] : undefined;
          const allArticles = await fetchArticleContent(undefined, firstSheet);
          const favArticles = allArticles.filter(article => 
            favorites.includes(article.number)
          );
          
          setFavoriteArticles(favArticles);
        } else {
          setFavoriteArticles([]);
        }
        
        // Load recent reading history
        const history = JSON.parse(localStorage.getItem('reading-history') || '[]');
        setRecentArticles(history.slice(0, 5)); // Show only 5 most recent
        
        setLoading(false);
      } catch (error) {
        console.error("Error initializing layout:", error);
        setLoading(false);
      }
    };

    initialize();
  }, [favorites]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar 
          favoriteArticles={favoriteArticles} 
          sheetNames={sheetNames}
          recentArticles={recentArticles}
          loading={loading}
        />
        <div className="flex flex-col flex-1">
          <Header />
          <main className="flex-1">
            <div className="container py-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

interface AppSidebarProps {
  favoriteArticles: Article[];
  sheetNames: string[];
  recentArticles: any[];
  loading: boolean;
}

function AppSidebar({ favoriteArticles, sheetNames, recentArticles, loading }: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/">
                    <Home className="h-4 w-4" />
                    <span>Início</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/browse">
                    <BookOpen className="h-4 w-4" />
                    <span>Navegar Artigos</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {loading ? (
          <div className="space-y-2 p-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <>
            {/* Legal Areas */}
            <SidebarGroup>
              <SidebarGroupLabel>Áreas Jurídicas</SidebarGroupLabel>
              <SidebarGroupContent>
                <ScrollArea className="h-[200px]">
                  <SidebarMenu>
                    {sheetNames.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        Carregando áreas...
                      </div>
                    ) : (
                      sheetNames.map((name) => (
                        <SidebarMenuItem key={name}>
                          <SidebarMenuButton asChild>
                            <Link to={`/browse?area=${name}`}>
                              <span>{name}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))
                    )}
                  </SidebarMenu>
                </ScrollArea>
              </SidebarGroupContent>
            </SidebarGroup>
            
            {/* Recent History */}
            <SidebarGroup>
              <SidebarGroupLabel className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                Lidos Recentemente
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {recentArticles.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      Nenhum artigo lido recentemente
                    </div>
                  ) : (
                    recentArticles.map((item, index) => (
                      <SidebarMenuItem key={index}>
                        <SidebarMenuButton asChild>
                          <Link to={`/article/${item.number}`}>
                            <span>Art. {item.number}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              {new Date(item.timestamp).toLocaleDateString()}
                            </span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            
            {/* Favorites */}
            <SidebarGroup>
              <SidebarGroupLabel className="flex items-center">
                <Star className="h-4 w-4 mr-2 text-yellow-400" />
                Favoritos
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {favoriteArticles.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      Nenhum artigo favoritado
                    </div>
                  ) : (
                    favoriteArticles.map(article => (
                      <SidebarMenuItem key={article.number}>
                        <SidebarMenuButton asChild>
                          <Link to={`/article/${article.number}`}>
                            <span>Art. {article.number}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
