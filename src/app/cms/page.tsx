
"use client"
import { z } from 'zod';
import { columns } from './columns';
import { DataTable } from './data-table';
import { Page, ContentType, ContentItem, Category, FieldType, Template, MediaFile } from './schema';
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
import { 
  addCategory, addPage, deletePage, updatePage, getPages, getCategories,
  getContentTypes, addContentType, updateContentType, deleteContentType,
  getContentItems, addContentItem, updateContentItem, deleteContentItem,
  getCategoriesDetailed, updateCategory, deleteCategory,
  getFieldTypes, getTemplates, uploadMedia, getMediaFiles, updateMedia, deleteMedia,
  getStaticPage, updateStaticPage, getContentTypeFields, addContentTypeField
} from '@/actions/cms';


export default function CmsPage() {
  const [pages, setPages] = React.useState<Page[]>([]);
  const [contentItems, setContentItems] = React.useState<ContentItem[]>([]);
  const [categories, setCategories] = React.useState<string[]>([]);
  const [contentTypes, setContentTypes] = React.useState<ContentType[]>([]);
  const [fieldTypes, setFieldTypes] = React.useState<FieldType[]>([]);
  const [templates, setTemplates] = React.useState<Template[]>([]);
  const [mediaFiles, setMediaFiles] = React.useState<MediaFile[]>([]);
  const [staticPages, setStaticPages] = React.useState<{[key: string]: string}>({});
  const [isContentSheetOpen, setContentSheetOpen] = React.useState(false);
  const [isCategorySheetOpen, setCategorySheetOpen] = React.useState(false);
  const [isContentTypeSheetOpen, setContentTypeSheetOpen] = React.useState(false);
  const [isMediaSheetOpen, setMediaSheetOpen] = React.useState(false);
  const [selectedPage, setSelectedPage] = React.useState<Page | null>(null);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [editingContentType, setEditingContentType] = React.useState<ContentType | null>(null);
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null);
  const { toast } = useToast();

  const refreshData = async () => {
    try {
      const [pagesData, contentItemsData, categoriesData, contentTypesData, fieldTypesData, templatesData, mediaResult] = await Promise.all([
        getPages(),
        getContentItems(),
        getCategories(),
        getContentTypes(),
        getFieldTypes(),
        getTemplates(),
        getMediaFiles()
      ]);
      
      setPages(pagesData);
      setContentItems(contentItemsData);
      setCategories(categoriesData);
      setContentTypes(contentTypesData);
      setFieldTypes(fieldTypesData);
      setTemplates(templatesData);
      
      // Set media files
      if (mediaResult.success && mediaResult.data?.items) {
        setMediaFiles(mediaResult.data.items);
      }
      
      // Load static pages
      const staticPageTypes = ['privacy', 'terms', 'shipping', 'payment'] as const;
      const staticPagesData: {[key: string]: string} = {};
      
      for (const type of staticPageTypes) {
        const result = await getStaticPage(type);
        if (result.success && result.data) {
          staticPagesData[type] = result.data.excerpt || '';
        }
      }
      setStaticPages(staticPagesData);
      
    } catch (error) {
      console.error('Failed to refresh data:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load CMS data.' });
    }
  }

  React.useEffect(() => {
    refreshData();
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
        category: formData.get('content-category') as string,
        title: formData.get('content-title') as string,
        command: formData.get('content-command') as string,
        description: formData.get('content-description') as string,
    };

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

  const handleContentTypeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
        name: formData.get('content-type-name') as string,
        slug: formData.get('content-type-slug') as string,
        description: formData.get('content-type-description') as string,
        icon: formData.get('content-type-icon') as string,
    };

    const result = editingContentType 
      ? await updateContentType(editingContentType.id.toString(), data)
      : await addContentType(data);
    
    if (result.success) {
        toast({ title: editingContentType ? 'Content Type Updated' : 'Content Type Created', description: result.message });
        refreshData();
        setContentTypeSheetOpen(false);
        setEditingContentType(null);
    } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
  }

  const handleContentTypeEdit = (contentType: ContentType) => {
    setEditingContentType(contentType);
    setContentTypeSheetOpen(true);
  }

  const handleContentTypeDelete = async (id: string) => {
    const result = await deleteContentType(id);
    if (result.success) {
      toast({ title: 'Content Type Deleted', description: result.message });
      refreshData();
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
  }

  const handleContentEdit = (item: ContentItem) => {
    setSelectedPage({
      id: item.id,
      title: item.title,
      category: item.category,
      command: item.command,
      description: item.description,
      image: item.image,
      status: item.status,
      slug: item.slug,
      created_at: item.created_at,
      updated_at: item.updated_at
    });
    setContentSheetOpen(true);
  }

  const handleContentDelete = async (id: string) => {
    const result = await deleteContentItem(id);
    if (result.success) {
      toast({ title: 'Content Deleted', description: result.message });
      refreshData();
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
  }

  const handleMediaUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile) return;

    const formData = new FormData(e.currentTarget);
    const altText = formData.get('alt-text') as string;
    const caption = formData.get('caption') as string;

    const result = await uploadMedia(selectedFile, altText, caption);
    
    if (result.success) {
        toast({ title: 'File Uploaded', description: result.message });
        refreshData();
        setMediaSheetOpen(false);
        setSelectedFile(null);
    } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
  }

  const handleMediaDelete = async (id: string) => {
    const result = await deleteMedia(id);
    if (result.success) {
      toast({ title: 'Media Deleted', description: result.message });
      refreshData();
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
  }

  const handleStaticPageSave = async (type: 'privacy' | 'terms' | 'shipping' | 'payment') => {
    const content = staticPages[type] || '';
    const result = await updateStaticPage(type, content);
    
    if (result.success) {
        toast({ title: 'Page Updated', description: result.message });
    } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
  }

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-headline">Content Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage content for the web and mobile app.
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="app" className="w-full">
        <div className="overflow-x-auto">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 md:grid-cols-7 lg:w-auto min-w-max">
            <TabsTrigger value="app" className="text-xs sm:text-sm">App Content</TabsTrigger>
            <TabsTrigger value="content-types" className="text-xs sm:text-sm">Content Types</TabsTrigger>
            <TabsTrigger value="categories" className="text-xs sm:text-sm">Categories</TabsTrigger>
            <TabsTrigger value="media" className="text-xs sm:text-sm">Media</TabsTrigger>
            <TabsTrigger value="privacy" className="text-xs sm:text-sm">Privacy</TabsTrigger>
            <TabsTrigger value="terms" className="text-xs sm:text-sm">Terms</TabsTrigger>
            <TabsTrigger value="shipping" className="text-xs sm:text-sm">Shipping</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="content-types" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6">
              <div>
                <CardTitle className="text-lg sm:text-xl font-headline">Content Types</CardTitle>
                <CardDescription className="text-sm">Manage content type definitions and their fields.</CardDescription>
              </div>
              <Sheet open={isContentTypeSheetOpen} onOpenChange={(open) => {
                setContentTypeSheetOpen(open);
                if (!open) setEditingContentType(null);
              }}>
                <SheetTrigger asChild>
                  <Button size="sm" className="w-full sm:w-auto">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Add Content Type</span>
                    <span className="sm:hidden">Add Type</span>
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-md">
                  <SheetHeader>
                    <SheetTitle>{editingContentType ? 'Edit Content Type' : 'Add New Content Type'}</SheetTitle>
                  </SheetHeader>
                  <ScrollArea className="h-full">
                    <form onSubmit={handleContentTypeSubmit}>
                      <div className="grid gap-4 px-6 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="content-type-name">Name</Label>
                          <Input 
                            name="content-type-name" 
                            id="content-type-name" 
                            placeholder="e.g., Article" 
                            defaultValue={editingContentType?.name || ''}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="content-type-slug">Slug</Label>
                          <Input 
                            name="content-type-slug" 
                            id="content-type-slug" 
                            placeholder="e.g., article" 
                            defaultValue={editingContentType?.slug || ''}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="content-type-description">Description</Label>
                          <Textarea 
                            name="content-type-description" 
                            id="content-type-description" 
                            placeholder="Describe this content type" 
                            defaultValue={editingContentType?.description || ''}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="content-type-icon">Icon</Label>
                          <Input 
                            name="content-type-icon" 
                            id="content-type-icon" 
                            placeholder="e.g., FileText" 
                            defaultValue={editingContentType?.icon || ''}
                          />
                        </div>
                        <Button type="submit" className="w-full">
                          {editingContentType ? 'Update Content Type' : 'Create Content Type'}
                        </Button>
                      </div>
                    </form>
                  </ScrollArea>
                </SheetContent>
              </Sheet>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="grid gap-3">
                {contentTypes.map((contentType) => (
                  <Card key={contentType.id} className="p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base truncate">{contentType.name}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{contentType.description}</p>
                        <div className="flex gap-3 sm:gap-4 text-xs text-muted-foreground mt-1">
                          <span>{contentType.content_count || 0} items</span>
                          <span>{contentType.field_count || 0} fields</span>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 sm:flex-none text-xs"
                          onClick={() => handleContentTypeEdit(contentType)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="flex-1 sm:flex-none text-xs"
                          onClick={() => handleContentTypeDelete(contentType.id.toString())}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
                {contentTypes.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm sm:text-base">No content types found.</p>
                    <p className="text-xs sm:text-sm">Create your first content type to get started.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6">
              <div>
                <CardTitle className="text-lg sm:text-xl font-headline">Categories</CardTitle>
                <CardDescription className="text-sm">Organize your content with categories.</CardDescription>
              </div>
              <Sheet open={isCategorySheetOpen} onOpenChange={(open) => {
                setCategorySheetOpen(open);
                if (!open) setEditingCategory(null);
              }}>
                <SheetTrigger asChild>
                  <Button size="sm" className="w-full sm:w-auto">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Add Category</span>
                    <span className="sm:hidden">Add</span>
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-md">
                  <SheetHeader>
                    <SheetTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</SheetTitle>
                  </SheetHeader>
                  <ScrollArea className="h-full">
                    <form onSubmit={handleCategorySubmit}>
                      <div className="grid gap-4 px-6 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="category-title">Name</Label>
                          <Input 
                            name="category-title" 
                            id="category-title" 
                            placeholder="e.g., Special Modes" 
                            defaultValue={editingCategory?.name || ''}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category-description">Description</Label>
                          <Textarea 
                            name="category-description" 
                            id="category-description" 
                            placeholder="Describe this category" 
                            defaultValue={editingCategory?.description || ''}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category-color">Color</Label>
                          <Input 
                            name="category-color" 
                            id="category-color" 
                            type="color" 
                            defaultValue={editingCategory?.color || '#6B7280'}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category-icon">Icon</Label>
                          <Input 
                            name="category-icon" 
                            id="category-icon" 
                            placeholder="e.g., Tag" 
                            defaultValue={editingCategory?.icon || ''}
                          />
                        </div>
                        <Button type="submit" className="w-full">
                          {editingCategory ? 'Update Category' : 'Create Category'}
                        </Button>
                      </div>
                    </form>
                  </ScrollArea>
                </SheetContent>
              </Sheet>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="grid gap-3">
                {categories.map((category, index) => (
                  <Card key={index} className="p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div 
                          className="w-4 h-4 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: '#6B7280' }}
                        />
                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm sm:text-base truncate">{category}</h3>
                          <p className="text-xs text-muted-foreground">Category</p>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button variant="outline" size="sm" className="flex-1 sm:flex-none text-xs">
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" className="flex-1 sm:flex-none text-xs">
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
                {categories.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm sm:text-base">No categories found.</p>
                    <p className="text-xs sm:text-sm">Create your first category to get started.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="media" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6">
              <div>
                <CardTitle className="text-lg sm:text-xl font-headline">Media Library</CardTitle>
                <CardDescription className="text-sm">Upload and manage media files.</CardDescription>
              </div>
              <Sheet open={isMediaSheetOpen} onOpenChange={setMediaSheetOpen}>
                <SheetTrigger asChild>
                  <Button size="sm" className="w-full sm:w-auto">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Upload Media</span>
                    <span className="sm:hidden">Upload</span>
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-md">
                  <SheetHeader>
                    <SheetTitle>Upload Media File</SheetTitle>
                  </SheetHeader>
                  <ScrollArea className="h-full">
                    <form onSubmit={handleMediaUpload}>
                      <div className="grid gap-4 px-6 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="media-file">Select File</Label>
                          <Input 
                            name="media-file" 
                            id="media-file" 
                            type="file" 
                            accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="alt-text">Alt Text</Label>
                          <Input 
                            name="alt-text" 
                            id="alt-text" 
                            placeholder="Describe the image"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="caption">Caption</Label>
                          <Textarea 
                            name="caption" 
                            id="caption" 
                            placeholder="Optional caption"
                          />
                        </div>
                        {selectedFile && (
                          <div className="space-y-2">
                            <Label>File Preview</Label>
                            <div className="p-4 border rounded-lg">
                              <p className="text-sm font-medium">{selectedFile.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                        )}
                        <Button type="submit" disabled={!selectedFile} className="w-full">
                          Upload File
                        </Button>
                      </div>
                    </form>
                  </ScrollArea>
                </SheetContent>
              </Sheet>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {mediaFiles.map((file) => (
                  <Card key={file.id} className="p-2 group">
                    <div className="aspect-square bg-muted rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                      {file.mime_type?.startsWith('image/') ? (
                        <Image 
                          src={file.url || '/placeholder.png'} 
                          alt={file.original_name} 
                          width={100} 
                          height={100} 
                          className="rounded-lg object-cover w-full h-full" 
                        />
                      ) : (
                        <div className="text-2xl">📄</div>
                      )}
                    </div>
                    <p className="text-xs font-medium truncate mb-1">{file.original_name}</p>
                    <p className="text-xs text-muted-foreground mb-2">
                      {((file.size || 0) / 1024).toFixed(1)} KB
                    </p>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="flex-1 text-xs h-6"
                        onClick={() => handleMediaDelete(file.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </Card>
                ))}
                {mediaFiles.length === 0 && (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    <p className="text-sm sm:text-base">No media files found.</p>
                    <p className="text-xs sm:text-sm">Upload your first file to get started.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="privacy">
            <Card>
                <CardHeader><CardTitle className="font-headline">Privacy Policy</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <Textarea 
                      placeholder="Enter your privacy policy content here..." 
                      rows={15} 
                      value={staticPages.privacy || ''}
                      onChange={(e) => setStaticPages(prev => ({ ...prev, privacy: e.target.value }))}
                    />
                    <Button onClick={() => handleStaticPageSave('privacy')}>Save Privacy Policy</Button>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="terms">
            <Card>
                <CardHeader><CardTitle className="font-headline">Terms & Conditions</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <Textarea 
                      placeholder="Enter your terms and conditions content here..." 
                      rows={15} 
                      value={staticPages.terms || ''}
                      onChange={(e) => setStaticPages(prev => ({ ...prev, terms: e.target.value }))}
                    />
                    <Button onClick={() => handleStaticPageSave('terms')}>Save Terms & Conditions</Button>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="shipping">
            <Card>
                <CardHeader><CardTitle className="font-headline">Shipping & Returns</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <Textarea 
                      placeholder="Enter your shipping and returns content here..." 
                      rows={15} 
                      value={staticPages.shipping || ''}
                      onChange={(e) => setStaticPages(prev => ({ ...prev, shipping: e.target.value }))}
                    />
                    <Button onClick={() => handleStaticPageSave('shipping')}>Save Shipping & Returns</Button>
                </CardContent>
            </Card>
        </TabsContent>
         <TabsContent value="payment">
            <Card>
                <CardHeader><CardTitle className="font-headline">Payment Terms</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <Textarea 
                      placeholder="Enter your payment terms content here..." 
                      rows={15} 
                      value={staticPages.payment || ''}
                      onChange={(e) => setStaticPages(prev => ({ ...prev, payment: e.target.value }))}
                    />
                    <Button onClick={() => handleStaticPageSave('payment')}>Save Payment Terms</Button>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="app">
           {contentItems.length > 0 ? (
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
                  <div className="grid gap-3">
                    {contentItems.map((item) => (
                      <Card key={item.id} className="p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <img 
                              src={item.image || `https://placehold.co/48x48.png?text=${item.title?.charAt(0) ?? 'C'}`} 
                              alt={item.title} 
                              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-sm sm:text-base truncate">{item.title}</h3>
                              <p className="text-xs text-muted-foreground truncate">{item.category} • {item.command}</p>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 w-full sm:w-auto">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1 sm:flex-none text-xs"
                              onClick={() => handleContentEdit(item)}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              className="flex-1 sm:flex-none text-xs"
                              onClick={() => handleContentDelete(item.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
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
