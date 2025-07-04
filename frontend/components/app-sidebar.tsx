"use client"

import type React from "react"
import {
  LayoutDashboard,
  Package,
  Tags,
  Settings,
  Plus,
  Eye,
  ChevronDown,
  Building2,
  Users,
  MessageSquare,
  Star,
  ShoppingCart,
  ImageIcon,
  Phone,
  Share2,
  Truck,
  Shield,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const data = {
  navMain: [
    {
      title: "Admin",
      url: "/admin",
      icon: LayoutDashboard,
      isActive: false,
    },
    {
      title: "Categories",
      url: "/admin/categories",
      icon: Tags,
      isActive: false,
      items: [
        {
          title: "View Categories",
          url: "/admin/categories",
          icon: Eye,
        },
        {
          title: "Add Category",
          url: "/admin/addcategory",
          icon: Plus,
        },
      ],
    },
    {
      title: "Subcategories",
      url: "/admin/subcategories",
      icon: Building2,
      isActive: false,
      items: [
        {
          title: "View Subcategories",
          url: "/admin/subcategories",
          icon: Eye,
        },
        {
          title: "Add Subcategory",
          url: "/admin/add-subcategory",
          icon: Plus,
        },
      ],
    },
    {
      title: "Products",
      url: "/admin/products",
      icon: Package,
      isActive: false,
      items: [
        {
          title: "View Products",
          url: "/admin/products",
          icon: Eye,
        },
        {
          title: "Add Product",
          url: "/admin/add-product",
          icon: Plus,
        },
      ],
    },

    {
      title: "Users management",
      url: "/admin//user-management",
      icon: Users,
      isActive: false,
    },

    {
      title: "Add Homepage Image",
      url: "/admin/hero",
      icon: ImageIcon,
      isActive: false,
    },
    {
      title: "Reviews",
      url: "/admin/product-reviews",
      icon: Star,
      isActive: false,
    },
    {
      title: "Orders",
      url: "/admin/oders",
      icon: ShoppingCart,
      isActive: false,
    },
    {
      title: "Contact Info",
      url: "/admin/contact-info",
      icon: Phone,
      isActive: false,
    },
    {
      title: "Contacts",
      url: "/admin/contacts",
      icon: MessageSquare,
      isActive: false,
    },
    {
      title: "Social Media",
      url: "/admin/social-media",
      icon: Share2,
      isActive: false,
    },
    {
      title: "Shipping Management",
      url: "/admin/shipping",
      icon: Truck,
      isActive: false,
    },
    {
      title: "Audit Logs",
      url: "/admin/audit-logs",
      icon: Shield,
      isActive: false,
    },
    // {
    //   title: "Settings",
    //   url: "/admin/settings",
    //   icon: Settings,
    //   isActive: false,
    // },
    //  {
    //   title: "user management",
    //   url: "/admin/user-management",
    //   icon: Settings,
    //   isActive: false,
    // },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/admin">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <LayoutDashboard className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Admin Dashboard</span>
                  <span className="text-xs">Management System</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navMain.map((item) => {
                const isActive = pathname === item.url || pathname.startsWith(item.url + "/")

                if (item.items && item.items.length > 0) {
                  return (
                    <Collapsible key={item.title} defaultOpen={isActive} className="group/collapsible">
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton className="font-medium" isActive={isActive}>
                            <item.icon className="size-4" />
                            <span>{item.title}</span>
                            <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton asChild isActive={pathname === subItem.url}>
                                  <Link href={subItem.url}>
                                    <subItem.icon className="size-4" />
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  )
                }

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.url}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
