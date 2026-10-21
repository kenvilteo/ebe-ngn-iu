import { useEffect, useState } from "react";
import type { MouseEvent, ReactNode } from "react";

/**
 * Pathname hiện tại, đã chuẩn hoá: bỏ dấu "/" thừa ở cuối và viết thường.
 * Cần thiết vì cả Vite dev lẫn Express fallback đều phục vụ "/love/" như "/love".
 */
export function getPath(): string {
  const raw = window.location.pathname;
  const trimmed = raw.replace(/\/+$/, "");
  return (trimmed || "/").toLowerCase();
}

/**
 * Điều hướng phía client. Phát ra sự kiện "popstate" để dùng chung một đường
 * xử lý với nút Back của trình duyệt — nhờ vậy chỉ có đúng một chỗ set state.
 */
export function navigate(to: string): void {
  if (getPath() === to) return;
  window.history.pushState({}, "", to);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo(0, 0);
}

export function useRoute(): string {
  const [path, setPath] = useState(getPath);

  useEffect(() => {
    const onPop = () => setPath(getPath());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  return path;
}

/**
 * Link thật (<a href>) để chuột giữa / "mở tab mới" / "copy link" vẫn hoạt động,
 * nhưng chặn điều hướng mặc định cho cú click trái thông thường.
 */
export function RouteLink({
  to,
  className,
  children,
}: {
  to: string;
  className?: string;
  children: ReactNode;
}) {
  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(to);
  }

  return (
    <a href={to} className={className} onClick={onClick}>
      {children}
    </a>
  );
}
