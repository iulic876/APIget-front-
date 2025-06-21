import type { Metadata } from "next";
import { MainRootLayout } from "@/components/layout/MainRootLayout";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="border-none">
      <MainRootLayout>{children}</MainRootLayout>
    </div>
  );
}
