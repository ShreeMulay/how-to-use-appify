import { AppSidebar } from "./AppSidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbLink } from "@/components/ui/breadcrumb"
import { useLocation } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"

export function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const pathSegments = location.pathname.split("/").filter(Boolean)

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              {pathSegments.map((segment, index) => {
                const isLast = index === pathSegments.length - 1
                const href = `/${pathSegments.slice(0, index + 1).join("/")}`
                return (
                  <div key={href} className="flex items-center gap-2">
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage className="capitalize">{segment.replace("-", " ")}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={href} className="capitalize">
                          {segment.replace("-", " ")}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </div>
                )
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  )
}
