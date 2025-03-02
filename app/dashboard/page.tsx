import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { getUserSession } from "@/lib/auth"
import { logout } from "@/lib/actions"

export default async function DashboardPage() {
  const user = await getUserSession()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="container py-10">
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
          <CardDescription>You are logged in!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">User Information</h3>
              <p className="text-sm text-muted-foreground">Email: {user.email}</p>
              {user.name && <p className="text-sm text-muted-foreground">Name: {user.name}</p>}
              <p className="text-sm text-muted-foreground">Login method: {user.provider || "Email/Password"}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <form action={logout} className="w-full">
            <Button type="submit" variant="destructive" className="w-full">
              Sign Out
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}

