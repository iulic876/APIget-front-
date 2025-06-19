import type { Metadata } from "next";
import { MainRootLayout } from "@/components/layout/MainRootLayout";



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="border-none">
          <MainRootLayout>{children}</MainRootLayout>
        </div>
      </body>
    </html>
  );
}
