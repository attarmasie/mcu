import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import React from "react";

type BreadcrumbElement =
  | { type: "link"; label: string; href: string; hidden?: boolean }
  | { type: "page"; label: string; hidden?: boolean };

interface DashboardLayoutProps {
  children: React.ReactNode;
  breadcrumb?: BreadcrumbElement[];
}

export function DashboardLayout({
  children,
  breadcrumb = [],
}: DashboardLayoutProps) {
  return (
    <div className="flex h-screen">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b">
            <div className="flex items-center gap-2 px-3">
              <SidebarTrigger />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumb.map((item, idx) => {
                    const isLast = idx === breadcrumb.length - 1;
                    const hiddenClass = item.hidden ? "hidden md:block" : "";

                    return (
                      <React.Fragment key={idx}>
                        <BreadcrumbItem className={hiddenClass}>
                          {item.type === "link" ? (
                            <BreadcrumbLink href={item.href}>
                              {item.label}
                            </BreadcrumbLink>
                          ) : (
                            <BreadcrumbPage>{item.label}</BreadcrumbPage>
                          )}
                        </BreadcrumbItem>
                        {!isLast && (
                          <BreadcrumbSeparator className={hiddenClass} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
