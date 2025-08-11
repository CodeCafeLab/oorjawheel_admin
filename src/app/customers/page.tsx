
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

async function getCustomers(): Promise<Customer[]> {
    // MOCK DATA
    const data = [
        { id: '1', name: 'Aarav Sharma', email: 'aarav.sharma@example.com', totalSpent: 5500, orders: 2, status: 'active' },
        { id: '2', name: 'Diya Patel', email: 'diya.patel@example.com', totalSpent: 12000, orders: 5, status: 'active' },
        { id: '3', name: 'Rohan Mehta', email: 'rohan.mehta@example.com', totalSpent: 2500, orders: 1, status: 'inactive' },
        { id: '4', name: 'Priya Singh', email: 'priya.singh@example.com', totalSpent: 8900, orders: 3, status: 'active' },
    ];
    return z.array(customerSchema).parse(data);
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

  const handleDeleteSelected = (ids: string[]) => {
    Promise.all(ids.map(id => deleteCustomer(id))).then(() => {
      toast({ title: 'Customers Deleted', description: `${ids.length} customers have been deleted.` });
      refreshData();
    });
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
      <DataTable columns={columns(handleEdit, handleDelete)} data={customers} onDelete={handleDelete} onDeleteSelected={handleDeleteSelected} />
    </div>
  );
}
