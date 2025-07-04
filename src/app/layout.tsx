import type { Metadata } from "next";
import "./globals.css";
import { AppWrapper } from "@/components/AppWrapper";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Analytics } from "@vercel/analytics/next";
import { PostHogProvider } from "@/components/PostHogProvider";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <PostHogProvider />
        <AppWrapper>
          <AuthLayout>
            {children}
            <Analytics />
          </AuthLayout>
        </AppWrapper>
        <Script
          async
          id="toolbar-script"
          data-toolbar-api-key="2a63fcc4-b17d-4701-adb9-83fedca0f0cd"
          src="https://get.usetool.bar/embedded-app.js"
        />
      </body>
    </html>
  );
}
