import { ChildrenLayout } from "@/components/layout/ChildrenLayout";
import { TabsProvider } from "@/components/tabs/TabsContext";
import { ReactNode } from "react";

type RootLayoutProps = {
  children: ReactNode;
};

export const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <TabsProvider>
      <div className="flex h-screen">
        {/* Sidebar și content */}
        <ChildrenLayout />
        <main className="flex-1 rounded-2xl">{children}</main>
      </div>
    </TabsProvider>
  );
};

export default RootLayout;
