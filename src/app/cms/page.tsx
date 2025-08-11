
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

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
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline">Content Management</h1>
          <p className="text-muted-foreground">
            Manage content for both the web and the mobile app.
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="web" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="web">Web</TabsTrigger>
          <TabsTrigger value="app">App</TabsTrigger>
        </TabsList>
        <TabsContent value="web">
          <Card>
            <CardHeader>
                <CardTitle>Web Content</CardTitle>
                <CardDescription>Manage static pages for the website.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="privacy" className="w-full flex flex-col md:flex-row gap-6">
                    <TabsList className="flex-col h-auto items-start bg-transparent border-r-0 md:border-r pr-4">
                        <TabsTrigger value="privacy" className="w-full justify-start">Privacy Policy</TabsTrigger>
                        <TabsTrigger value="terms" className="w-full justify-start">Terms & Conditions</TabsTrigger>
                        <TabsTrigger value="shipping" className="w-full justify-start">Shipping & Returns</TabsTrigger>
                        <TabsTrigger value="payment" className="w-full justify-start">Payment Terms</TabsTrigger>
                    </TabsList>
                    <div className="flex-1">
                        <TabsContent value="privacy">
                            <Card>
                                <CardHeader><CardTitle>Privacy Policy</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <Textarea placeholder="Enter your privacy policy content here..." rows={15} />
                                    <Button>Save Privacy Policy</Button>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="terms">
                            <Card>
                                <CardHeader><CardTitle>Terms & Conditions</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <Textarea placeholder="Enter your terms and conditions content here..." rows={15} />
                                    <Button>Save Terms & Conditions</Button>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="shipping">
                            <Card>
                                <CardHeader><CardTitle>Shipping & Returns</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <Textarea placeholder="Enter your shipping and returns content here..." rows={15} />
                                    <Button>Save Shipping & Returns</Button>
                                </CardContent>
                            </Card>
                        </TabsContent>
                         <TabsContent value="payment">
                            <Card>
                                <CardHeader><CardTitle>Payment Terms</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <Textarea placeholder="Enter your payment terms content here..." rows={15} />
                                    <Button>Save Payment Terms</Button>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </div>
                </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="app">
            <Card>
              <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                      <CardTitle>App Pages</CardTitle>
                      <CardDescription>Manage dynamic pages for the mobile app.</CardDescription>
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
              </CardHeader>
              <CardContent>
                  <DataTable columns={columns} data={pages} />
              </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
