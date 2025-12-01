import { isLoggedIn } from "@/lib/utils";
import { useState, useEffect } from "react";

export function useCookieUpdate() {
  const [cookieInfo, setCookieInfo] = useState({
    isAuthenticated: isLoggedIn(),
  });

  useEffect(() => {
    const listener = (event: CookieChangeEvent) => {
      const hasSessionUpdate = (changes: readonly CookieListItem[]) =>
        changes.some((v) => v.name == "session_id");
      const created = hasSessionUpdate(event.changed);
      const deleted = hasSessionUpdate(event.deleted);

      if (created || deleted) {
        setCookieInfo((prev) => ({
          ...prev,
          isAuthenticated: created,
        }));
      }
    };
    cookieStore.addEventListener("change", listener);

    return () => {
      cookieStore.removeEventListener("change", listener);
    };
  }, []);

  return cookieInfo;
}
