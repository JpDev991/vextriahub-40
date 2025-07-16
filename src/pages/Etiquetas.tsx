
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Layout/AppSidebar";
import { TagManager } from "@/components/Publications/TagManager";
import { Tag } from "lucide-react";

export default function Etiquetas() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <Tag className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Etiquetas</h1>
            </div>
            
            <TagManager />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
