import { isLoggedIn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function useLoginCheck() {
  const [isLogin, setIsLogin] = useState<boolean>(isLoggedIn());

  useEffect(() => {
    const listener = (event: StorageEvent) => {
      if (event.key === "isLogin") {
        setIsLogin(event.newValue !== null);
      }
    };
    window.addEventListener("storage", listener);
    return () => window.removeEventListener("storage", listener);
  }, []);

  return isLogin;
}
