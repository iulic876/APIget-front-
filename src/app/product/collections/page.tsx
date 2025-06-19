import { TabsProvider } from "@/components/tabs/TabsContext";
import { TabsBar } from "@/components/tabs/TabsBar";
import { TabContent } from "@/components/tabs/TabContent";
import { TabOpener } from "@/components/tabs/TabOpener";

export default function Page() {
  return (
    <div className="">
      <TabsBar />
      <TabContent />
    </div>
  );
}
