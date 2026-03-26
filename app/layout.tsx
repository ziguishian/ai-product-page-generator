import type { Metadata } from "next";
import { Toaster } from "sonner";

import "./globals.css";

import { AppShell } from "@/components/layout/app-shell";
import { ThemeScript } from "@/components/layout/theme-script";
import { BackToTopButton } from "@/components/shared/back-to-top-button";
import { ChunkReloadGuard } from "@/components/shared/chunk-reload-guard";

export const metadata: Metadata = {
  title: "banana-mall",
  description: "AI 电商详情页生成与编辑工作台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeScript />
        <ChunkReloadGuard />
        <AppShell>{children}</AppShell>
        <BackToTopButton />
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
