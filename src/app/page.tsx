import { headers } from "next/headers";
import MobileLanding from "@/components/mobile/MobileLanding";
import HomeClient from "@/components/home/HomeClient";

export default function Page() {
  const headersList = headers();
  const userAgent = headersList.get("user-agent") || "";
  const isMobile = /android|iphone|ipad|ipod/i.test(userAgent);

  if (isMobile) {
    return <MobileLanding />;
  }

  return <HomeClient />;
}
