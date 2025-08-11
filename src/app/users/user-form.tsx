
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import * as React from "react"

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
import { addUser, updateUser } from "@/actions/users"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import { User } from "./schema"

type UserFormProps = {
    onFormSuccess: () => void;
    user?: User | null; // Make user optional for creating new users
}

export function UserForm({ onFormSuccess, user }: UserFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = React.useState(false)

  const isEditMode = !!user;

  const form = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      contactNumber: "",
      address: "",
      country: "",
      password: "",
      status: "active",
    },
  })

  React.useEffect(() => {
    if (isEditMode && user) {
        form.reset({
            fullName: user.fullName || '',
            email: user.email,
            contactNumber: user.contactNumber || '',
            address: user.address || '',
            country: user.country || '',
            status: user.status,
            password: '', // Don't pre-fill password
        });
    } else {
        form.reset();
    }
  }, [user, isEditMode, form]);


  async function onSubmit(data: z.infer<typeof userFormSchema>) {
    setLoading(true)

    const result = isEditMode && user
        ? await updateUser(user.id.toString(), data)
        : await addUser(data)
    
    setLoading(false)

    if (result.success) {
      toast({
        title: isEditMode ? "User Updated" : "User Added",
        description: `The user has been ${isEditMode ? 'updated' : 'created'} successfully.`,
      })
      onFormSuccess()
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} disabled={loading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="user@example.com" {...field} disabled={loading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contactNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Number</FormLabel>
              <FormControl>
                <Input placeholder="+91 12345 67890" {...field} disabled={loading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea placeholder="123 Main St, Anytown..." {...field} disabled={loading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Country</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={loading}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a country" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    {/* In a real app, this would be a dynamic list */}
                    <SelectItem value="India">India</SelectItem>
                    <SelectItem value="USA">United States</SelectItem>
                    <SelectItem value="UK">United Kingdom</SelectItem>
                    </SelectContent>
                </Select>
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
                <Input type="password" {...field} disabled={loading}/>
              </FormControl>
              <FormDescription>
                {isEditMode ? "Leave blank to keep the current password." : "The user's password. Must be at least 8 characters."}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Status</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex items-center space-x-4"
                  disabled={loading}
                >
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="active" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Active
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
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
        <Button type="submit" disabled={loading}>{loading ? (isEditMode ? 'Updating User...' : 'Creating User...') : (isEditMode ? 'Update User' : 'Create User')}</Button>
      </form>
    </Form>
  )
}
