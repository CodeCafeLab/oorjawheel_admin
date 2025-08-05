import { z } from 'zod';
import { columns } from './columns';
import { DataTable } from './data-table';
import { productSchema } from './schema';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// Mock data fetching
async function getProducts() {
  // In a real app, you'd fetch this from your database.
  const data = [
    { id: "PROD001", name: "Oorja Smart Wheel", price: 25000, stock: 150, status: "in stock", image: "https://placehold.co/40x40.png" },
    { id: "PROD002", name: "Oorja Battery Pack", price: 8000, stock: 300, status: "in stock", image: "https://placehold.co/40x40.png" },
    { id: "PROD003", name: "Oorja Solar Charger", price: 5000, stock: 0, status: "out of stock", image: "https://placehold.co/40x40.png" },
    { id: "PROD004", name: "Oorja Mounting Kit", price: 1500, stock: 500, status: "in stock", image: "https://placehold.co/40x40.png" },
    { id: "PROD005", name: "Oorja Mobile App Subscription", price: 999, stock: Infinity, status: "in stock", image: "https://placehold.co/40x40.png" },
    { id: "PROD006", name: "Oorja Extended Warranty", price: 3000, stock: Infinity, status: "in stock", image: "https://placehold.co/40x40.png" },
  ];
  return z.array(productSchema).parse(data);
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline">Products</h1>
          <p className="text-muted-foreground">
            Manage your product inventory.
          </p>
        </div>
        <Dialog>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Product
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                    <DialogDescription>
                        Fill in the details to add a new product.
                    </DialogDescription>
                </DialogHeader>
                 {/* Form would go here */}
                 <p className="text-center text-muted-foreground py-8">Product form will be here.</p>
            </DialogContent>
        </Dialog>
      </div>
      <DataTable columns={columns} data={products} />
    </div>
  );
}
