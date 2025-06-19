import type { Metadata } from "next";
import { MainRootLayout } from "@/components/layout/MainRootLayout";



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        
      >
        <MainRootLayout>{children}</MainRootLayout>
      </body>
    </html>
  );
}
