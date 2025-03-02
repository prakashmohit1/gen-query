import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"

// This is a mock database for demonstration purposes
// In a real application, you would use a real database
const users = new Map()

interface User {
  id: string
  name: string
  email: string
  password: string
  provider?: string
}

export async function createUser({ name, email, password }: Omit<User, "id">) {
  // Check if user already exists
  if (users.has(email)) {
    throw new Error("User already exists")
  }

  // In a real app, you would hash the password
  const user = {
    id: uuidv4(),
    name,
    email,
    password, // In a real app, this would be hashed
  }

  users.set(email, user)
  return user
}

export async function validateCredentials(email: string, password: string) {
  // In a real app, you would verify against a database
  const user = users.get(email)

  if (!user) {
    return null
  }

  // In a real app, you would compare hashed passwords
  if (user.password !== password) {
    return null
  }

  return user
}

export async function getUserSession() {
  const sessionCookie = cookies().get("session")

  if (!sessionCookie) {
    return null
  }

  try {
    const session = JSON.parse(sessionCookie.value)

    // Check if session is expired
    if (new Date(session.expires) < new Date()) {
      return null
    }

    return session
  } catch (error) {
    return null
  }
}

// Mock function for Google OAuth
export async function createOrGetUserFromGoogle(profile: any) {
  const email = profile.email

  // Check if user already exists
  if (users.has(email)) {
    const user = users.get(email)
    return { ...user, provider: "Google" }
  }

  // Create new user
  const user = {
    id: uuidv4(),
    name: profile.name,
    email,
    password: "", // No password for OAuth users
    provider: "Google",
  }

  users.set(email, user)
  return user
}

