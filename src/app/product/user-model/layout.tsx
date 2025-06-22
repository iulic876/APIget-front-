import { UserModelLayout } from "@/components/user-model/UserModelLayout";
import { ReactNode } from "react";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="border-black border-[0.5] rounded-2xl">
      <div className="flex h-screen z-0">
        <UserModelLayout />
        <main className="flex-1 ">{children}</main>
      </div>
    </div>
  );
}
