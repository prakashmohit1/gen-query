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
  document.cookie = `${name}=${value || ""}${expires}; path=${path || "/"}`;
};

// please use cookies according to cookie policy - (Legal)
export const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
};

// delete the cookie
export const deleteCookie = (name: string) => {
  document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
};
