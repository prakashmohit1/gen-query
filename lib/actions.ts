"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createUser, validateCredentials } from "@/lib/auth";
import { removeCookie } from "./utils";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  try {
    const user = await validateCredentials(email, password);

    if (!user) {
      return { error: "Invalid email or password" };
    }

    // Set a session cookie
    const session = {
      id: user.id,
      email: user.email,
      name: user.name,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week
    };

    cookies().set("session", JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Failed to login" };
  }
}

export async function signup(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    return { error: "All fields are required" };
  }

  try {
    const user = await createUser({
      name,
      email,
      password,
    });

    // Set a session cookie
    const session = {
      id: user.id,
      email: user.email,
      name: user.name,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week
    };

    cookies().set("session", JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    return { success: true };
  } catch (error) {
    console.error("Signup error:", error);
    return { error: "Failed to create account" };
  }
}

export async function loginWithGoogle() {
  // In a real implementation, you would redirect to Google OAuth
  // For example, using NextAuth.js or a similar library

  // This is a placeholder for demonstration purposes
  redirect("/api/auth/google");
}

export async function logout() {
  removeCookie("id_token");
  removeCookie("refresh_token");
}
