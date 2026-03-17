import { GithubIcon } from "lucide-react";

import NeedLogo from "@/components/logos/need";
import Navbar from "@/components/sections/navbar/default";
import { SearchBar } from "@/components/ui/search-bar";

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Navbar
        name=""
        logo={<NeedLogo />}
        showNavigation={true}
        mobileLinks={[]}
        customNavigation={<SearchBar compact />}
        actions={[
          {
            text: "GitHub",
            href: "https://github.com/tuckerschreiber/need",
            isButton: true,
            variant: "ghost",
            icon: <GithubIcon className="mr-2 size-4" />,
          },
        ]}
      />
      {children}
    </div>
  );
}
