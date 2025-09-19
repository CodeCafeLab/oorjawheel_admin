
"use client"
import { z } from 'zod';
import { columns } from './columns';
import { DataTable } from './data-table';
import { Page } from './schema';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
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
import { addCategory, addPage, deletePage, updatePage, getPages, getCategories, getStaticContent, saveStaticContent, StaticContentType, StaticContent, Category } from '@/actions/cms';


export default function CmsPage() {
  const [pages, setPages] = React.useState<Page[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [isContentSheetOpen, setContentSheetOpen] = React.useState(false);
  const [isCategorySheetOpen, setCategorySheetOpen] = React.useState(false);
  const [selectedPage, setSelectedPage] = React.useState<Page | null>(null);
  const [staticContent, setStaticContent] = React.useState<Record<StaticContentType, StaticContent | null>>({
    privacy_policy: null,
    terms_conditions: null,
    shipping_returns: null,
    payment_terms: null,
  });
  const [activeTab, setActiveTab] = React.useState<string>('privacy');
  const { toast } = useToast();

  const refreshData = () => {
    getPages().then(setPages);
    getCategories().then(setCategories);
  }

  const refreshStaticContent = async () => {
    const contentTypes: StaticContentType[] = ['privacy_policy', 'terms_conditions', 'shipping_returns', 'payment_terms'];
    const contentPromises = contentTypes.map(async (type) => {
      const content = await getStaticContent(type);
      return { type, content };
    });
    
    const results = await Promise.all(contentPromises);
    const newStaticContent = results.reduce((acc, { type, content }) => {
      acc[type] = content;
      return acc;
    }, {} as Record<StaticContentType, StaticContent | null>);
    
    setStaticContent(newStaticContent);
  }

  React.useEffect(() => {
    refreshData();
    refreshStaticContent();
  }, []);

  const handleEdit = (page: Page) => {
    setSelectedPage(page);
    setContentSheetOpen(true);
  }

  const handleDelete = async (id: string) => {
    const result = await deletePage(id);
    if (result.success) {
      toast({ title: 'Content Deleted', description: 'The content item has been deleted.' });
      refreshData();
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
  }

  const handleDeleteSelected = (ids: string[]) => {
    Promise.all(ids.map(id => deletePage(id))).then(() => {
        toast({ title: 'Content Deleted', description: `${ids.length} content items have been deleted.` });
        refreshData();
    });
  }

  const handleCategorySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('category-title') as string;
    const result = await addCategory({ title });

    if (result.success) {
        toast({ title: 'Category Added', description: `Category "${title}" has been added.` });
        refreshData();
        setCategorySheetOpen(false);
    } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
  }

  const handleContentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
        title: formData.get('content-title') as string,
        command: formData.get('content-command') as string,
        description: formData.get('content-description') as string,
        category_id: Number(formData.get('content-category') || 0) || undefined,
    } as const;

    const result = selectedPage
        ? await updatePage(selectedPage.id, data)
        : await addPage(data);
    
    if (result.success) {
        toast({ title: selectedPage ? 'Content Updated' : 'Content Added', description: result.message });
        refreshData();
        setContentSheetOpen(false);
        setSelectedPage(null);
    } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
  }

  const handleStaticContentSave = async (pageType: StaticContentType, title: string, content: string) => {
    const result = await saveStaticContent(pageType, title, content);
    
    if (result.success) {
        toast({ title: 'Content Saved', description: result.message });
        refreshStaticContent();
    } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
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
      
      <Tabs defaultValue="privacy" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 md:w-auto">
          <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
          <TabsTrigger value="terms">Terms & Conditions</TabsTrigger>
          <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
          <TabsTrigger value="payment">Payment Terms</TabsTrigger>
          <TabsTrigger value="app">App</TabsTrigger>
        </TabsList>
        <TabsContent value="privacy">
            <StaticContentCard 
              pageType="privacy_policy"
              title="Privacy Policy"
              content={staticContent.privacy_policy?.content || ''}
              onSave={handleStaticContentSave}
            />
        </TabsContent>
        <TabsContent value="terms">
            <StaticContentCard 
              pageType="terms_conditions"
              title="Terms & Conditions"
              content={staticContent.terms_conditions?.content || ''}
              onSave={handleStaticContentSave}
            />
        </TabsContent>
        <TabsContent value="shipping">
            <StaticContentCard 
              pageType="shipping_returns"
              title="Shipping & Returns"
              content={staticContent.shipping_returns?.content || ''}
              onSave={handleStaticContentSave}
            />
        </TabsContent>
         <TabsContent value="payment">
            <StaticContentCard 
              pageType="payment_terms"
              title="Payment Terms"
              content={staticContent.payment_terms?.content || ''}
              onSave={handleStaticContentSave}
            />
        </TabsContent>
        <TabsContent value="app">
           {pages.length > 0 ? (
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
                      <SheetContent className='md:max-w-xl'>
                        <SheetHeader>
                          <SheetTitle>{selectedPage ? 'Edit App Content' : 'Add New App Content'}</SheetTitle>
                        </SheetHeader>
                        <ScrollArea className="h-full">
                            <form onSubmit={handleContentSubmit}>
                            <div className='space-y-4 px-6 py-4'>
                                <div className="space-y-2">
                                    <Label htmlFor="content-category">Category</Label>
                                    <Select name="content-category" defaultValue={undefined}>
                                        <SelectTrigger id="content-category">
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map(cat => <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>)}
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
                  <DataTable 
                    columns={columns(handleEdit, handleDelete)} 
                    data={pages} 
                    categories={categories.map(c => c.name)}
                    onDelete={handleDelete}
                  />
              </CardContent>
            </Card>
           ) : (
             <Card className="flex flex-col items-center justify-center py-20">
                 <CardHeader>
                     <CardTitle className="text-xl font-headline">No App Content Found</CardTitle>
                     <CardDescription>
                         Get started by adding your first piece of app content.
                     </CardDescription>
                 </CardHeader>
                 <CardContent>
                     <Button size="lg" onClick={() => { setSelectedPage(null); setContentSheetOpen(true); }}>
                         <PlusCircle className="mr-2 h-4 w-4" />
                         Add Your First Content
                     </Button>
                 </CardContent>
             </Card>
           )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Static Content Card Component
interface StaticContentCardProps {
  pageType: StaticContentType;
  title: string;
  content: string | null;
  onSave: (pageType: StaticContentType, title: string, content: string) => void;
}

function StaticContentCard({ pageType, title, content, onSave }: StaticContentCardProps) {
  const [localContent, setLocalContent] = React.useState(content || '');
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    setLocalContent(content || '');
  }, [content]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(pageType, title, localContent);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea 
          placeholder={`Enter your ${title.toLowerCase()} content here...`}
          rows={15}
          value={localContent}
          onChange={(e) => setLocalContent(e.target.value)}
        />
        <Button 
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : `Save ${title}`}
        </Button>
      </CardContent>
    </Card>
  );
}
