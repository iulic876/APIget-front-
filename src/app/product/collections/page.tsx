import { TabsProvider } from "@/components/tabs/TabsContext";
import { TabsBar } from "@/components/tabs/TabsBar";
import { TabContent } from "@/components/tabs/TabContent";


export default function Page() {
  return (
    <div className="" suppressHydrationWarning>
      <TabsBar />
      <TabContent />
    </div>
  );
}
