import { ChildrenLayout } from "@/components/layout/ChildrenLayout";
import { TabsProvider } from "@/components/tabs/TabsContext";
import { SavedRequestsProvider } from "@/components/context/SavedRequestsContext";
import { ReactNode } from "react";

type RootLayoutProps = {
  children: ReactNode;
};

export const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <SavedRequestsProvider>
      <TabsProvider>
        <div className="flex h-screen z-0">
          {/* Sidebar și content */}
          <ChildrenLayout />
          <main className="flex-1 z-10">{children}</main>
        </div>
      </TabsProvider>
    </SavedRequestsProvider>
  );
};

export default RootLayout;
