import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createOrGetUserFromGoogle } from "@/lib/auth"

// This is a mock implementation of Google OAuth
// In a real app, you would use a library like NextAuth.js
export async function GET() {
  // Simulate a successful Google login
  const googleProfile = {
    id: "123456789",
    name: "Google User",
    email: "user@gmail.com",
    picture: "https://lh3.googleusercontent.com/a/default-user",
  }

  // Create or get user from the database
  const user = await createOrGetUserFromGoogle(googleProfile)

  // Set a session cookie
  const session = {
    id: user.id,
    email: user.email,
    name: user.name,
    provider: "Google",
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week
  }

  cookies().set("session", JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  })

  // Redirect to dashboard
  redirect("/dashboard")
}

