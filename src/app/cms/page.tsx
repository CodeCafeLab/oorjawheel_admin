

"use client"
import { z } from 'zod';
import { columns } from './columns';
import { DataTable } from './data-table';
import { pageSchema, Page } from './schema';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import Image from 'next/image';
import * as React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

// Mock data fetching
async function getPages(): Promise<Page[]> {
  const data = [
    { id: 'PAGE001', category: 'Lighting', image: 'https://placehold.co/100x100.png', title: 'Ambient Mood', command: 'L100,50,10' , description: 'Set a warm ambient light for evenings.' },
    { id: 'PAGE002', category: 'Wheel', image: 'https://placehold.co/100x100.png', title: 'Full Speed', command: 'S100', description: 'Run the wheel at maximum speed.' },
    { id: 'PAGE003', category: 'Sound', image: 'https://placehold.co/100x100.png', title: 'Nature Sounds', command: 'P_NATURE', description: 'Play soothing nature sounds.' },
  ];
  return z.array(pageSchema).parse(data);
}

export default function CmsPage() {
  const [pages, setPages] = React.useState<Page[]>([]);
  const [categories, setCategories] = React.useState(['Lighting', 'Wheel', 'Sound']);
  const [isContentSheetOpen, setContentSheetOpen] = React.useState(false);
  const [isCategorySheetOpen, setCategorySheetOpen] = React.useState(false);
  const [selectedPage, setSelectedPage] = React.useState<Page | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    getPages().then(setPages);
  }, []);

  const handleEdit = (page: Page) => {
    setSelectedPage(page);
    setContentSheetOpen(true);
  }

  const handleDelete = (id: string) => {
    setPages(prev => prev.filter(p => p.id !== id));
    toast({ title: 'Content Deleted', description: 'The content item has been deleted.' });
  }

  const handleCategorySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newCategory = formData.get('category-title') as string;
    if (newCategory && !categories.includes(newCategory)) {
        setCategories(prev => [...prev, newCategory]);
        toast({ title: 'Category Added', description: `Category "${newCategory}" has been added.` });
    }
    setCategorySheetOpen(false);
  }

  const handleContentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newPage: Page = {
        id: selectedPage?.id || `PAGE${Date.now()}`,
        category: formData.get('content-category') as string,
        image: selectedPage?.image || 'https://placehold.co/100x100.png', // Placeholder for image
        title: formData.get('content-title') as string,
        command: formData.get('content-command') as string,
        description: formData.get('content-description') as string,
    }

    if (selectedPage) {
        setPages(prev => prev.map(p => p.id === selectedPage.id ? newPage : p));
        toast({ title: 'Content Updated', description: 'The content item has been updated.' });
    } else {
        setPages(prev => [...prev, newPage]);
        toast({ title: 'Content Added', description: 'A new content item has been added.' });
    }
    setContentSheetOpen(false);
    setSelectedPage(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline">Content Management</h1>
          <p className="text-muted-foreground">
            Manage content for the web and the mobile app.
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="app" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 md:w-auto">
          <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
          <TabsTrigger value="terms">Terms & Conditions</TabsTrigger>
          <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
          <TabsTrigger value="payment">Payment Terms</TabsTrigger>
          <TabsTrigger value="app">App</TabsTrigger>
        </TabsList>
        <TabsContent value="privacy">
            <Card>
                <CardHeader><CardTitle className="font-headline">Privacy Policy</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <Textarea placeholder="Enter your privacy policy content here..." rows={15} />
                    <Button>Save Privacy Policy</Button>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="terms">
            <Card>
                <CardHeader><CardTitle className="font-headline">Terms & Conditions</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <Textarea placeholder="Enter your terms and conditions content here..." rows={15} />
                    <Button>Save Terms & Conditions</Button>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="shipping">
            <Card>
                <CardHeader><CardTitle className="font-headline">Shipping & Returns</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <Textarea placeholder="Enter your shipping and returns content here..." rows={15} />
                    <Button>Save Shipping & Returns</Button>
                </CardContent>
            </Card>
        </TabsContent>
         <TabsContent value="payment">
            <Card>
                <CardHeader><CardTitle className="font-headline">Payment Terms</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <Textarea placeholder="Enter your payment terms content here..." rows={15} />
                    <Button>Save Payment Terms</Button>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="app">
            <Card>
              <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                      <CardTitle className="font-headline">App Content</CardTitle>
                      <CardDescription>Manage dynamic content for the mobile app.</CardDescription>
                  </div>
                  <div className='flex gap-2'>
                    <Sheet open={isCategorySheetOpen} onOpenChange={setCategorySheetOpen}>
                        <SheetTrigger asChild>
                        <Button variant="outline">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Category
                        </Button>
                        </SheetTrigger>
                        <SheetContent>
                            <SheetHeader>
                                <SheetTitle>Add New Category</SheetTitle>
                            </SheetHeader>
                            <ScrollArea className="h-full">
                                <form onSubmit={handleCategorySubmit}>
                                    <div className="grid gap-4 px-6 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="category-title">Category Title</Label>
                                            <Input name="category-title" id="category-title" placeholder="e.g., Special Modes" />
                                        </div>
                                        <Button type="submit">Save Category</Button>
                                    </div>
                                </form>
                            </ScrollArea>
                        </SheetContent>
                    </Sheet>
                    <Sheet open={isContentSheetOpen} onOpenChange={(isOpen) => {
                        setContentSheetOpen(isOpen);
                        if (!isOpen) setSelectedPage(null);
                    }}>
                      <SheetTrigger asChild>
                        <Button onClick={() => { setSelectedPage(null); setContentSheetOpen(true); }}>
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Add Content
                        </Button>
                      </SheetTrigger>
                      <SheetContent>
                        <SheetHeader>
                          <SheetTitle>{selectedPage ? 'Edit App Content' : 'Add New App Content'}</SheetTitle>
                        </SheetHeader>
                        <ScrollArea className="h-full">
                            <form onSubmit={handleContentSubmit}>
                            <div className='space-y-4 px-6 py-4'>
                                <div className="space-y-2">
                                    <Label htmlFor="content-category">Category</Label>
                                    <Select name="content-category" defaultValue={selectedPage?.category}>
                                        <SelectTrigger id="content-category">
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="content-image">Image</Label>
                                    <Input name="content-image" id="content-image" type="file" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="content-title">Title</Label>
                                    <Input name="content-title" id="content-title" placeholder="e.g., Party Mode" defaultValue={selectedPage?.title} />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="content-command">Command</Label>
                                    <Input name="content-command" id="content-command" placeholder="e.g., L255,0,255" defaultValue={selectedPage?.command} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="content-description">Description</Label>
                                    <Textarea name="content-description" id="content-description" placeholder="Describe what this content/command does." defaultValue={selectedPage?.description} />
                                </div>
                                <Button type="submit">{selectedPage ? 'Save Changes' : 'Save Content'}</Button>
                            </div>
                            </form>
                        </ScrollArea>
                      </SheetContent>
                    </Sheet>
                  </div>
              </CardHeader>
              <CardContent>
                  <DataTable columns={columns(handleEdit, handleDelete)} data={pages} categories={categories} onDelete={handleDelete} />
              </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
