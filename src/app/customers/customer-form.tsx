
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { addCustomer, updateCustomer } from "@/actions/customers"
import { Customer } from "./schema"
import { customerSchema } from "./schema"

type CustomerFormProps = {
    onFormSuccess: () => void;
    customer?: Customer | null;
}

const formSchema = customerSchema.omit({ id: true });

export function CustomerForm({ onFormSuccess, customer }: CustomerFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = React.useState(false)

  const isEditMode = !!customer;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      totalSpent: 0,
      orders: 0,
      status: "active",
    },
  })

  React.useEffect(() => {
    if (isEditMode && customer) {
        form.reset({
            name: customer.name,
            email: customer.email,
            totalSpent: customer.totalSpent,
            orders: customer.orders,
            status: customer.status,
        });
    } else {
        form.reset({
            name: "",
            email: "",
            totalSpent: 0,
            orders: 0,
            status: "active",
        });
    }
  }, [customer, isEditMode, form]);


  async function onSubmit(data: z.infer<typeof formSchema>) {
    setLoading(true)

    const result = isEditMode && customer
        ? await updateCustomer(customer.id.toString(), data)
        : await addCustomer(data)
    
    setLoading(false)

    if (result.success) {
      toast({
        title: isEditMode ? "Customer Updated" : "Customer Added",
        description: `The customer has been ${isEditMode ? 'updated' : 'created'} successfully.`,
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
          name="name"
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
          name="totalSpent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total Spent</FormLabel>
              <FormControl>
                <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} disabled={loading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="orders"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Orders</FormLabel>
              <FormControl>
                <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))} disabled={loading} />
              </FormControl>
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
                      <RadioGroupItem value="inactive" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Inactive
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={loading}>{loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Customer' : 'Create Customer')}</Button>
      </form>
    </Form>
  )
}
