import { Footer } from "@/components/feature/layout/footer"
import { Header } from "@/components/feature/layout/header"
import { Sidebar } from "@/components/feature/layout/sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/toast"

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <SidebarProvider>
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex w-full flex-1 flex-col gap-6 pt-4 pr-4 pb-8 pl-4 sm:gap-10 sm:pt-6 sm:pr-10 sm:pb-10 sm:pl-8">
          {children}
        </main>
        <Footer />
      </div>
      <Toaster />
    </SidebarProvider>
  )
}
