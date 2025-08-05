import { z } from 'zod';
import { columns } from './columns';
import { DataTable } from './data-table';
import { orderSchema } from './schema';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// Mock data fetching
async function getOrders() {
  // In a real app, you'd fetch this from your database.
  const data = [
    { id: "ORD001", customerName: "Rohan Sharma", date: "2024-07-20", total: 25000, status: "completed" },
    { id: "ORD002", customerName: "Priya Patel", date: "2024-07-19", total: 8000, status: "processing" },
    { id: "ORD003", customerName: "Sunita Gupta", date: "2024-07-19", total: 33000, status: "completed" },
    { id: "ORD004", customerName: "Amit Singh", date: "2024-07-18", total: 1500, status: "shipped" },
    { id: "ORD005", customerName: "Anjali Mehta", date: "2024-07-17", total: 5000, status: "cancelled" },
    { id: "ORD006", customerName: "Vikram Kumar", date: "2024-07-16", total: 999, status: "completed" },
  ];
  return z.array(orderSchema).parse(data);
}

export default async function OrdersPage() {
  const orders = await getOrders();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline">Orders</h1>
          <p className="text-muted-foreground">
            Track and manage all customer orders.
          </p>
        </div>
        <Dialog>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Order
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Order</DialogTitle>
                    <DialogDescription>
                        Fill in the details to create a new order.
                    </DialogDescription>
                </DialogHeader>
                 {/* Form would go here */}
                 <p className="text-center text-muted-foreground py-8">Order form will be here.</p>
            </DialogContent>
        </Dialog>
      </div>
      <DataTable columns={columns} data={orders} />
    </div>
  );
}
