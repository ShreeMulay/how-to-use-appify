import { Home, Database, HardDrive, Play, Box } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Link, useLocation } from "react-router-dom"

const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Actors",
    url: "/actors",
    icon: Box,
  },
  {
    title: "Datasets",
    url: "/datasets",
    icon: Database,
  },
  {
    title: "Storage",
    url: "/storage",
    icon: HardDrive,
  },
  {
    title: "Runs",
    url: "/runs",
    icon: Play,
  },
]

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-4">
          <div className="bg-primary flex size-8 items-center justify-center rounded-md text-primary-foreground">
            <span className="font-bold text-lg">A</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm">Apify Learning</span>
            <span className="text-muted-foreground text-xs">Lab Environment</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url || (item.url !== "/" && location.pathname.startsWith(item.url))}
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
