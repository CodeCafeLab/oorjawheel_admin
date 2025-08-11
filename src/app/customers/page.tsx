
import { promises as fs } from 'fs';
import path from 'path';
import { z } from 'zod';
import { columns } from './columns';
import { DataTable } from './data-table';
import { customerSchema } from './schema';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';


// Mock data fetching
async function getCustomers() {
  // In a real app, you'd fetch this from your database.
  const data = [
    { id: "CUST001", name: "Rohan Sharma", email: "rohan.sharma@example.com", totalSpent: 50000, orders: 5, status: "active" },
    { id: "CUST002", name: "Priya Patel", email: "priya.patel@example.com", totalSpent: 75000, orders: 8, status: "active" },
    { id: "CUST003", name: "Amit Singh", email: "amit.singh@example.com", totalSpent: 22000, orders: 3, status: "inactive" },
    { id: "CUST004", name: "Sunita Gupta", email: "sunita.gupta@example.com", totalSpent: 120000, orders: 12, status: "active" },
    { id: "CUST005", name: "Vikram Kumar", email: "vikram.kumar@example.com", totalSpent: 15000, orders: 2, status: "active" },
    { id: "CUST006", name: "Anjali Mehta", email: "anjali.mehta@example.com", totalSpent: 98000, orders: 10, status: "active" },
    { id: "CUST007", name: "Sanjay Verma", email: "sanjay.verma@example.com", totalSpent: 0, orders: 0, status: "inactive" },
  ];
  return z.array(customerSchema).parse(data);
}

export default async function CustomersPage() {
  const customers = await getCustomers();

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline">Customers</h1>
          <p className="text-muted-foreground">
            Manage your customers and view their details.
          </p>
        </div>
        <Sheet>
            <SheetTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Customer
                </Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Add New Customer</SheetTitle>
                    <SheetDescription>
                        Fill in the details to add a new customer.
                    </SheetDescription>
                </SheetHeader>
                {/* Form would go here */}
                <p className="text-center text-muted-foreground py-8">Customer form will be here.</p>
            </SheetContent>
        </Sheet>
      </div>
      <DataTable columns={columns} data={customers} />
    </div>
  );
}
