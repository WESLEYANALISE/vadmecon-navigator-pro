
import { Header } from "./Header";
import { Sidebar, SidebarContent, SidebarProvider, SidebarTrigger, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { useFavorites } from "@/providers/FavoritesProvider";
import { Home, Star, BookOpen } from "lucide-react";
import { Link, Outlet } from "react-router-dom";
import { fetchArticleContent } from "@/services/googleSheetsService";
import { useEffect, useState } from "react";
import { Article } from "@/types/article";

export function Layout() {
  const { favorites } = useFavorites();
  const [favoriteArticles, setFavoriteArticles] = useState<Article[]>([]);

  // Fetch favorite articles content
  useEffect(() => {
    const fetchFavorites = async () => {
      if (favorites.length === 0) {
        setFavoriteArticles([]);
        return;
      }

      const allArticles = await fetchArticleContent();
      const favArticles = allArticles.filter(article => 
        favorites.includes(article.number)
      );
      
      setFavoriteArticles(favArticles);
    };

    fetchFavorites();
  }, [favorites]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar favoriteArticles={favoriteArticles} />
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

function AppSidebar({ favoriteArticles }: { favoriteArticles: Article[] }) {
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
      </SidebarContent>
    </Sidebar>
  );
}
