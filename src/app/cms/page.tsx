import { z } from 'zod';
import { columns } from './columns';
import { DataTable } from './data-table';
import { pageSchema } from './schema';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// Mock data fetching
async function getPages() {
  const data = [
    { id: 'PAGE001', title: 'Home Control', order: 1, status: 'published' },
    { id: 'PAGE002', title: 'Lighting Setup', order: 2, status: 'draft' },
    { id: 'PAGE003', title: 'Device Diagnostics', order: 3, status: 'published' },
  ];
  return z.array(pageSchema).parse(data);
}

export default async function CmsPage() {
  const pages = await getPages();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline">Content Management</h1>
          <p className="text-muted-foreground">
            Manage pages, sections, and their elements.
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Page
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Page</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new page.
              </DialogDescription>
            </DialogHeader>
            <p className="text-center text-muted-foreground py-8">
              Page form will be here.
            </p>
          </DialogContent>
        </Dialog>
      </div>
      <DataTable columns={columns} data={pages} />
    </div>
  );
}
