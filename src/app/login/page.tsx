"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { login } from "@/actions/auth"
import { z } from "zod"
import { loginSchema } from "@/actions/schemas"
import { Eye, EyeOff, Loader2, AlertCircle, Lock, Mail } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const OorjaLogo = () => (
  <div className="relative">
    <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/40 rounded-full blur-sm opacity-75"></div>
    <div className="relative">
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
    </div>
  </div>
)

// Client component that uses useSearchParams
function LoginForm() {
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('from') || '/'
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: process.env.NODE_ENV === 'development' ? 'admin@oorja.com' : '',
      password: process.env.NODE_ENV === 'development' ? 'Admin@123' : '',
    },
  })
  
  const router = useRouter()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [isMounted, setIsMounted] = React.useState(false)
  
  // Check if user is already logged in
  React.useEffect(() => {
    setIsMounted(true)
    
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include', // Include cookies in the request
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (response.ok) {
          router.push(redirectTo);
        } else {
          // If not authenticated, clear any existing auth data
          await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
          });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Not authenticated, stay on login page
      }
    };
    
    checkAuth();
  }, [router, redirectTo]);

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    try {
      setError(null)
      setIsLoading(true)
      
      const result = await login(values)

      if (result.success) {
        toast({
          title: "Login Successful",
          description: "Redirecting to dashboard...",
        })
        
        router.push(redirectTo)
        router.refresh()
      } else {
        setError(result.message || "Invalid email or password")
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: result.message || "Invalid email or password",
        })
      }
    } catch (error: any) {
      console.error("Login error:", error)
      const errorMessage = error.message || "An unexpected error occurred. Please try again."
      setError(errorMessage)
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl border border-border bg-card">
        <CardHeader className="space-y-1 text-center px-6 pt-8 pb-2">
          <div className="flex justify-center mb-4">
            <OorjaLogo />
          </div>
          <CardTitle className="text-2xl font-headline text-card-foreground">
            Oorja Wheel Admin
          </CardTitle>
          <CardDescription className="text-muted-foreground/80">
            Enter your credentials to access the admin panel
          </CardDescription>
        </CardHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <CardContent className="space-y-4 px-6">
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Enter your email"
                          type="email"
                          autoComplete="username"
                          className="pl-10"
                          disabled={isLoading}
                          {...field}
                        />
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                      <Link
                        href="/forgot-password"
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Enter your password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          className="pr-10"
                          disabled={isLoading}
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4 px-6 pb-6">
              <Button type="submit" className="w-full mt-2 bg-primary hover:bg-primary/90" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Sign in
                  </>
                )}
              </Button>
              
             
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  )
}

// Main page component that wraps the form in Suspense
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
