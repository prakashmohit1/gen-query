import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const setCookie = (
  name: string,
  value: string,
  path?: string,
  days?: number,
  timeStamp?: number
) => {
  let expires = "";
  let date;

  if (timeStamp) {
    date = new Date(timeStamp);
  } else {
    date = new Date();
    date.setTime(date.getTime() + (days || 365) * 24 * 60 * 60 * 1000);
  }

  expires = `; expires=${date.toUTCString()}`;
  try {
    if (document)
      document.cookie = `${name}=${value || ""}${expires}; path=${path || "/"}`;
  } catch (error) {
    console.error("Error setting cookie:", error);
  }
};

// please use cookies according to cookie policy - (Legal)
export function getCookie(name: string): string {
  try {
    if (!document) return "";
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || "";
    return "";
  } catch (error) {
    console.error("Error getting cookie:", error);
    return "";
  }
}

// delete the cookie
export const deleteCookie = (name: string) => {
  try {
    if (!document) return;
    document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
  } catch (error) {
    console.error("Error deleting cookie:", error);
  }
};

interface DecodedToken {
  email: string;
  name: string;
  [key: string]: any;
}

export function decodeJwt(token: string): DecodedToken | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
}

export const clearAllCookies = () => {
  try {
    if (!document) return;
    document.cookie.split("; ").forEach((cookie) => {
      const name = cookie.split("=")[0].trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    });
  } catch (error) {
    console.error("Error clearing cookies:", error);
  }
};
