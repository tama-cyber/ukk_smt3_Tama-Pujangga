"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  Tags,
  GraduationCap,
  BookOpen,
  Settings,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function AppSidebar() {
  return (
    // Memberikan warna biru langsung pada Sidebar
    <Sidebar className="bg-blue-600 text-black border-r-blue-700">
      
      {/* Header Logo */}
      <SidebarHeader className="p-4">
        <div className="flex items-center justify-center">
          {/* Jika logo belum ada gambarnya, tulisan ini akan muncul */}
          <h1 className="text-xl font-bold text-black">MVP ARS</h1>
        </div>
      </SidebarHeader>

      {/* Content Menu */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-black">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              

              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-black hover:bg-blue-700 hover:text-yellow">
                  <Link href="/admin/user-management">
                    <Users className="w-4 h-4 mr-2" />
                    <span>CRUD</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>


            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter />
    </Sidebar>
  );
}