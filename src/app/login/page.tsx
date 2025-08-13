
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { login } from "@/actions/auth"
import { z } from "zod"
import { loginSchema } from "@/actions/schemas"
import { Eye, EyeOff } from "lucide-react"

const OorjaLogo = () => (
    <svg
      width="48"
      height="48"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-primary"
    >
      <path
        d="M50 0C22.38 0 0 22.38 0 50C0 77.62 22.38 100 50 100C77.62 100 100 77.62 100 50C100 22.38 77.62 0 50 0ZM50 88C29.01 88 12 70.99 12 50C12 29.01 29.01 12 50 12C70.99 12 88 29.01 88 50C88 70.99 70.99 88 50 88Z"
        fill="currentColor"
      />
      <path
        d="M50 25C36.2 25 25 36.2 25 50C25 63.8 36.2 75 50 75C63.8 75 75 63.8 75 50C75 36.2 63.8 25 50 25ZM50 63C42.82 63 37 57.18 37 50C37 42.82 42.82 37 50 37C57.18 37 63 42.82 63 50C63 57.18 57.18 63 50 63Z"
        fill="currentColor"
      />
    </svg>
  )


export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
        const values: z.infer<typeof loginSchema> = { email, password };
        const result = await login(values)

        if (result.success) {
            toast({
                title: "Login Successful",
                description: "Redirecting you to the dashboard...",
            })
            router.push("/")
        } else {
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: result.message,
            })
        }
    } catch (error) {
        toast({
            variant: "destructive",
            title: "An Error Occurred",
            description: "Something went wrong. Please try again.",
        })
    } finally {
        setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background font-body px-4">
       <Card className="w-full max-w-sm">
        <form onSubmit={handleLogin}>
            <CardHeader className="space-y-1 text-center">
                <div className="flex justify-center mb-4">
                    <OorjaLogo />
                </div>
              <CardTitle className="text-2xl font-headline">Oorja Wheel Admin</CardTitle>
              <CardDescription>Enter your credentials to access the panel</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                    id="email" 
                    type="email" 
                    placeholder="admin@oorja.com" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                />
              </div>
              <div className="grid gap-2 relative">
                <Label htmlFor="password">Password</Label>
                <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="pr-10"
                />
                 <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-7 h-7 w-7 text-muted-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button className="w-full" type="submit" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
                </Button>
            </CardFooter>
        </form>
      </Card>
    </div>
  )
}
