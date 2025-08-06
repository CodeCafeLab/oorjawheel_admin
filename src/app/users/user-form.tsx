"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { userFormSchema } from "@/actions/schemas"
import { addUser } from "@/actions/users"

export function UserForm({ setOpen }: { setOpen: (open: boolean) => void }) {
  const { toast } = useToast()
  const form = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: "",
      password: "",
      status: "active",
    },
  })

  async function onSubmit(data: z.infer<typeof userFormSchema>) {
    const result = await addUser(data)
    if (result.success) {
      toast({
        title: "User Added",
        description: "The new user has been created successfully.",
      })
      setOpen(false)
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.message,
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="user@example.com" {...field} />
              </FormControl>
              <FormDescription>
                The user's email address. They will use this to log in.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormDescription>
                The user's password. Must be at least 8 characters.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Status</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="active" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Active
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="locked" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Locked
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Create User</Button>
      </form>
    </Form>
  )
}
