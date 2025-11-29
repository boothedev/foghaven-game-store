import { isLoggedIn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function useLoggedIn() {
  const [isLogin, setIsLogin] = useState<boolean>(isLoggedIn());

  useEffect(() => {
    const listener = (event: CookieChangeEvent) => {
      const sessionCookie = isLogin
        ? event.deleted.find((cookie) => cookie.name === "session_id")
        : event.changed.find((cookie) => cookie.name === "session_id");

      if (sessionCookie) {
        setIsLogin(!isLogin);
      }
    };
    cookieStore.addEventListener("change", listener);
    return () => cookieStore.removeEventListener("change", listener);
  }, []);

  return isLogin;
}
