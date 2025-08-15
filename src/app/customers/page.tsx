
"use client"

import { z } from 'zod';
import { columns } from './columns';
import { DataTable } from './data-table';
import { customerSchema, Customer } from './schema';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import * as React from 'react';
import { useToast } from '@/hooks/use-toast';
import { deleteCustomer } from '@/actions/customers';
import { CustomerForm } from './customer-form';
import pool from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';


async function getCustomers(): Promise<Customer[]> {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute(`
            SELECT 
                u.id, 
                u.fullName, 
                u.email, 
                u.status,
                COUNT(ud.device_id) as orders,
                COALESCE(SUM(p.amount), 0) as totalSpent
            FROM users u
            LEFT JOIN user_devices ud ON u.id = ud.user_id
            LEFT JOIN payments p ON u.id = p.user_id 
            GROUP BY u.id
        `);
        connection.release();

        const customers = (rows as any[]).map(user => ({
            id: user.id.toString(),
            name: user.fullName || 'N/A',
            email: user.email,
            totalSpent: parseFloat(user.totalSpent),
            orders: user.orders,
            status: user.status === 'locked' ? 'inactive' : 'active',
        }));

        return z.array(customerSchema).parse(customers);
    } catch (error) {
        console.error("Failed to fetch customers:", error);
        return [];
    }
}

export default function CustomersPage() {
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [isSheetOpen, setSheetOpen] = React.useState(false);
  const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null);
  const { toast } = useToast();

  const refreshData = () => {
    getCustomers().then(setCustomers);
  };

  React.useEffect(() => {
    refreshData();
  }, []);

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setSheetOpen(true);
  }

  const handleDelete = async (id: string) => {
    const result = await deleteCustomer(id);
    if (result.success) {
      toast({ title: 'Customer Deleted', description: 'The customer has been deleted.' });
      refreshData();
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
  }

  const handleFormSuccess = () => {
    setSheetOpen(false);
    setSelectedCustomer(null);
    refreshData();
  }

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline">Customers</h1>
          <p className="text-muted-foreground">
            Manage your customers and view their details.
          </p>
        </div>
        <Sheet open={isSheetOpen} onOpenChange={(isOpen) => {
            setSheetOpen(isOpen);
            if (!isOpen) setSelectedCustomer(null);
        }}>
            <SheetTrigger asChild>
                <Button onClick={() => { setSelectedCustomer(null); setSheetOpen(true); }}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Customer
                </Button>
            </SheetTrigger>
            <SheetContent className='md:max-w-xl'>
                <SheetHeader>
                    <SheetTitle>{selectedCustomer ? 'Edit Customer' : 'Add New Customer'}</SheetTitle>
                    <SheetDescription>
                        Fill in the details for the customer.
                    </SheetDescription>
                </SheetHeader>
                <ScrollArea className="h-full">
                  <div className="py-4 px-6">
                    <CustomerForm onFormSuccess={handleFormSuccess} customer={selectedCustomer} />
                  </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
      </div>
      {customers.length > 0 ? (
        <DataTable columns={columns(handleEdit, handleDelete)} data={customers} onDelete={handleDelete} />
      ) : (
        <Card className="flex flex-col items-center justify-center py-20">
            <CardHeader>
                <CardTitle className="text-xl font-headline">No Customers Found</CardTitle>
                <CardDescription>
                    Get started by adding your first customer.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button size="lg" onClick={() => { setSelectedCustomer(null); setSheetOpen(true); }}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Your First Customer
                </Button>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
