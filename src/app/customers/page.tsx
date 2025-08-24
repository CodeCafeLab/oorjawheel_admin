
"use client"

import { columns } from './columns';
import { DataTable } from './data-table';
import { Customer } from './schema';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from '@/components/ui/button';
import { PlusCircle, Users } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import * as React from 'react';
import { useToast } from '@/hooks/use-toast';
import { deleteCustomer, fetchCustomers } from '@/actions/customers';
import { CustomerForm } from './customer-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';


export default function CustomersPage() {
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [isSheetOpen, setSheetOpen] = React.useState(false);
  const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null);
  const { toast } = useToast();

  const refreshData = () => {
    fetchCustomers().then(setCustomers);
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
       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
            <SheetContent className='sm:max-w-lg'>
                <SheetHeader>
                    <SheetTitle className="font-headline text-2xl">{selectedCustomer ? 'Edit Customer' : 'Add New Customer'}</SheetTitle>
                    <SheetDescription>
                        Fill in the details for the customer.
                    </SheetDescription>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-8rem)]">
                  <div className="py-6 px-1">
                    <CustomerForm onFormSuccess={handleFormSuccess} customer={selectedCustomer} />
                  </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
      </div>
      {customers.length > 0 ? (
        <Card>
          <CardContent className="p-4 sm:p-6">
            <DataTable columns={columns(handleEdit, handleDelete)} data={customers} onDelete={handleDelete} />
          </CardContent>
        </Card>
      ) : (
        <Card className="flex flex-col items-center justify-center py-20 border-dashed">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <CardHeader className="text-center p-0">
              <CardTitle className="text-xl font-headline">No Customers Found</CardTitle>
              <CardDescription>
                  Get started by adding your first customer.
              </CardDescription>
          </CardHeader>
          <CardContent className="p-0 mt-6">
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
