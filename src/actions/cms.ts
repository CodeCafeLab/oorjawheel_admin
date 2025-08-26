"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  contentItemSchema,
  ContentItem,
  categorySchema,
  Category,
  contentTypeSchema,
  ContentType,
  fieldTypeSchema,
  FieldType,
  templateSchema,
  Template,
  mediaFileSchema,
} from "@/app/cms/schema";

// Media item schema for API responses
const mediaItemSchema = z.object({
  id: z.string(),
  url: z.string(),
  thumbnail: z.string().nullable(),
  filename: z.string().optional(),
  original_name: z.string().optional(),
  mime_type: z.string().optional(),
  size: z.number().optional(),
  created_at: z.string().optional(),
});

interface MediaApiResponse {
  items: Array<{
    id: string;
    url: string;
    thumbnail?: string;
    // Add other properties that come from your API
  }>;
  // Add pagination properties if they exist
  total?: number;
  page?: number;
  limit?: number;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

// Helper function to handle fetch responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.message || "Request failed");
    (error as any).response = { data: errorData };
    throw error;
  }

  // For 204 No Content responses, return empty object
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// --- Content Types ---
export async function getContentTypes(): Promise<ContentType[]> {
  try {
    const response = await fetch(`${API_BASE}/cms/content-types`, {
      credentials: "include",
    });
    const data = await handleResponse<ContentType[]>(response);
    return z.array(contentTypeSchema).parse(data);
  } catch (error) {
    console.error("Failed to fetch content types:", error);
    return [];
  }
}

export async function addContentType(values: {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
}) {
  try {
    const response = await fetch(`${API_BASE}/cms/content-types`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(values),
    });

    const data = await handleResponse(response);
    console.log("Content type creation response:", data);
    revalidatePath("/cms");
    return { success: true, message: "Content type created successfully." };
  } catch (error: any) {
    console.error("Failed to add content type:", error);
    const errorData = error.response?.data || {};
    console.error("Error response:", errorData);
    const errorMessage =
      errorData.error || error.message || "Failed to create content type.";
    return { success: false, message: errorMessage };
  }
}

export async function updateContentType(
  id: string,
  values: {
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    is_active?: boolean;
  }
) {
  try {
    const response = await fetch(`${API_BASE}/cms/content-types/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(values),
    });

    await handleResponse(response);
    revalidatePath("/cms");
    return { success: true, message: "Content type updated successfully." };
  } catch (error: any) {
    console.error("Failed to update content type:", error);
    const errorData = error.response?.data || {};
    const errorMessage =
      errorData.error || error.message || "Failed to update content type.";
    return { success: false, message: errorMessage };
  }
}

export async function deleteContentType(id: string) {
  try {
    const response = await fetch(`${API_BASE}/cms/content-types/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    await handleResponse(response);
    revalidatePath("/cms");
    return { success: true, message: "Content type deleted successfully." };
  } catch (error: any) {
    console.error("Failed to delete content type:", error);
    const errorData = error.response?.data || {};
    const errorMessage =
      errorData.error || error.message || "Failed to delete content type.";
    return { success: false, message: errorMessage };
  }
}

// --- Content Items ---
export async function getContentItems(
  contentTypeId?: string
): Promise<ContentItem[]> {
  try {
    const params = contentTypeId ? `?content_type_id=${contentTypeId}` : "";
    const response = await fetch(`${API_BASE}/cms/content${params}`, {
      credentials: "include",
    });

    const data = await handleResponse<{ items: any[] }>(response);

    // Transform backend data to match frontend schema
    const items =
      data.items?.map((item: any) => ({
        id: item.id?.toString() ?? String(item.id),
        title: item.title,
        category: item.category || "General",
        command: item.command || "N/A",
        description: item.excerpt || item.description || "",
        image:
          item.featured_image ||
          `https://placehold.co/100x100.png?text=${
            item.title?.charAt(0) ?? "C"
          }`,
        status: item.status || "draft",
        contentTypeId: item.content_type_id?.toString(),
        slug: item.slug,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      })) || [];

    return z.array(contentItemSchema).parse(items);
  } catch (error) {
    console.error("Failed to fetch content items:", error);
    return [];
  }
}

export async function addContentItem(values: {
  contentTypeId: string;
  title: string;
  slug: string;
  category?: string;
  command?: string;
  description?: string;
  status?: string;
  featuredImage?: string;
}) {
  try {
    const payload = {
      content_type_id: values.contentTypeId,
      title: values.title,
      slug: values.slug,
      status: values.status || "draft",
      featured_image: values.featuredImage,
      excerpt: values.description,
      fieldValues: [
        {
          content_type_field_id: 1, // Assuming category field
          value_text: values.category,
        },
        {
          content_type_field_id: 2, // Assuming command field
          value_text: values.command,
        },
      ],
    };

    const response = await fetch(`${API_BASE}/cms/content`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    await handleResponse(response);
    revalidatePath("/cms");
    return { success: true, message: "Content item created successfully." };
  } catch (error: any) {
    console.error("Failed to add content item:", error);
    const errorData = error.response?.data || {};
    const errorMessage =
      errorData.error || error.message || "Failed to create content item.";
    return { success: false, message: errorMessage };
  }
}

export async function updateContentItem(
  id: string,
  values: {
    title: string;
    slug: string;
    category?: string;
    command?: string;
    description?: string;
    status?: string;
    featuredImage?: string;
  }
) {
  try {
    const payload = {
      title: values.title,
      slug: values.slug,
      status: values.status || "draft",
      featured_image: values.featuredImage,
      excerpt: values.description,
      fieldValues: [
        {
          content_type_field_id: 1,
          value_text: values.category,
        },
        {
          content_type_field_id: 2,
          value_text: values.command,
        },
      ],
    };

    const response = await fetch(`${API_BASE}/cms/content/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    await handleResponse(response);
    revalidatePath("/cms");
    return { success: true, message: "Content item updated successfully." };
  } catch (error: any) {
    console.error("Failed to update content item:", error);
    const errorData = error.response?.data || {};
    const errorMessage =
      errorData.error || error.message || "Failed to update content item.";
    return { success: false, message: errorMessage };
  }
}

export async function deleteContentItem(id: string) {
  try {
    const response = await fetch(`${API_BASE}/cms/content/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    await handleResponse(response);
    revalidatePath("/cms");
    return { success: true, message: "Content item deleted successfully." };
  } catch (error: any) {
    console.error("Failed to delete content item:", error);
    const errorData = error.response?.data || {};
    const errorMessage =
      errorData.error || error.message || "Failed to delete content item.";
    return { success: false, message: errorMessage };
  }
}

// --- Categories ---
export async function getCategories(): Promise<string[]> {
  try {
    const response = await fetch(`${API_BASE}/cms/categories`, {
      credentials: "include",
    });

    const data = await handleResponse(response);
    const categories = z.array(categorySchema).parse(data);
    return categories.map((cat) => cat.name);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    // Fallback to default categories
    return ["Special Modes", "Ambiance", "Wellness", "General"];
  }
}

export async function getCategoriesDetailed(): Promise<Category[]> {
  try {
    const response = await fetch(`${API_BASE}/cms/categories`, {
      credentials: "include",
    });

    const data = await handleResponse(response);
    return z.array(categorySchema).parse(data);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

export async function addCategory(values: {
  title: string;
  name?: string;
  slug?: string;
  description?: string;
  color?: string;
  icon?: string;
}) {
  try {
    const name = values.name || values.title;
    const slug = values.slug || name.toLowerCase().replace(/\s+/g, "-");
    const payload = {
      name,
      slug,
      description: values.description,
      color: values.color,
      icon: values.icon,
    };

    const response = await fetch(`${API_BASE}/cms/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    await handleResponse(response);
    revalidatePath("/cms");
    return { success: true, message: "Category created successfully." };
  } catch (error: any) {
    console.error("Failed to add category:", error);
    const errorData = error.response?.data || {};
    const errorMessage =
      errorData.error || error.message || "Failed to create category.";
    return { success: false, message: errorMessage };
  }
}

export async function updateCategory(
  id: string,
  values: {
    name: string;
    slug?: string;
    description?: string;
    color?: string;
    icon?: string;
    is_active?: boolean;
  }
) {
  try {
    const slug = values.slug || values.name.toLowerCase().replace(/\s+/g, "-");
    const payload = { ...values, slug };

    const response = await fetch(`${API_BASE}/cms/categories/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    await handleResponse(response);
    revalidatePath("/cms");
    return { success: true, message: "Category updated successfully." };
  } catch (error: any) {
    console.error("Failed to update category:", error);
    const errorData = error.response?.data || {};
    const errorMessage =
      errorData.error || error.message || "Failed to update category.";
    return { success: false, message: errorMessage };
  }
}

export async function deleteCategory(id: string) {
  try {
    const response = await fetch(`${API_BASE}/cms/categories/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    await handleResponse(response);
    revalidatePath("/cms");
    return { success: true, message: "Category deleted successfully." };
  } catch (error: any) {
    console.error("Failed to delete category:", error);
    const errorData = error.response?.data || {};
    const errorMessage =
      errorData.error || error.message || "Failed to delete category.";
    return { success: false, message: errorMessage };
  }
}

// --- Media ---
export async function uploadMedia(
  file: File,
  altText?: string,
  caption?: string
) {
  try {
    const formData = new FormData();
    formData.append("file", file);
    if (altText) formData.append("alt_text", altText);
    if (caption) formData.append("caption", caption);

    const response = await fetch(`${API_BASE}/cms/media/upload`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    const data = await handleResponse(response);
    revalidatePath("/cms");
    return { success: true, data, message: "File uploaded successfully." };
  } catch (error: any) {
    console.error("Failed to upload media:", error);
    const errorData = error.response?.data || {};
    const errorMessage =
      errorData.error || error.message || "Failed to upload media.";
    return { success: false, message: errorMessage };
  }
}

export async function updateMedia(
  id: string,
  values: { alt_text?: string; caption?: string }
) {
  try {
    const response = await fetch(`${API_BASE}/cms/media/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(values),
    });

    await handleResponse(response);
    revalidatePath("/cms");
    return { success: true, message: "Media file updated successfully." };
  } catch (error: any) {
    console.error("Failed to update media:", error);
    const errorData = error.response?.data || {};
    const errorMessage =
      errorData.error || error.message || "Failed to update media file.";
    return { success: false, message: errorMessage };
  }
}

export async function deleteMedia(id: string) {
  try {
    const response = await fetch(`${API_BASE}/cms/media/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    await handleResponse(response);
    revalidatePath("/cms");
    return { success: true, message: "Media file deleted successfully." };
  } catch (error: any) {
    console.error("Failed to delete media:", error);
    const errorData = error.response?.data || {};
    const errorMessage =
      errorData.error || error.message || "Failed to delete media file.";
    return { success: false, message: errorMessage };
  }
}
export async function getMediaFiles(page = 1, limit = 20) {
  try {
    const response = await fetch(
      `${API_BASE}/cms/media?page=${page}&limit=${limit}`,
      {
        credentials: "include",
      }
    );

    const data = await handleResponse<MediaApiResponse>(response);

    // Transform data to include proper URLs
    const transformedData = {
      ...data,
      items:
        data.items?.map((item: any) => ({
          ...item,
          url: item.url.startsWith("http")
            ? item.url
            : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}${
                item.url
              }`,
          thumbnail:
            item.thumbnail ||
            (item.url.endsWith(".jpg") ||
            item.url.endsWith(".jpeg") ||
            item.url.endsWith(".png") ||
            item.url.endsWith(".gif")
              ? item.url.startsWith("http")
                ? item.url
                : `${
                    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
                  }${item.url}`
              : null),
        })) || [],
    };

    // Define pagination schema
    const paginatedResponseSchema = z.object({
      items: z.array(mediaItemSchema),
      total: z.number().default(0),
      page: z.number().default(1),
      limit: z.number().default(20),
      totalPages: z.number().default(0),
    });

    return paginatedResponseSchema.parse(transformedData);
  } catch (error) {
    console.error("Failed to fetch media files:", error);
    return { items: [], total: 0, page: 1, limit, totalPages: 0 };
  }
}

// --- Static Pages ---
export async function getStaticPage(
  type: "privacy" | "terms" | "shipping" | "payment"
) {
  try {
    const response = await fetch(
      `${API_BASE}/cms/public/static-pages/${type}`,
      {
        credentials: "include",
      }
    );

    const data = await handleResponse(response);
    return { success: true, data };
  } catch (error: any) {
    console.error(`Failed to fetch ${type} page:`, error);
    const errorData = error.response?.data || {};
    const errorMessage =
      errorData.error || error.message || `Failed to fetch ${type} page.`;
    return { success: false, message: errorMessage };
  }
}

export async function updateStaticPage(
  type: "privacy" | "terms" | "shipping" | "payment",
  content: string
) {
  try {
    const payload = {
      title: type.charAt(0).toUpperCase() + type.slice(1),
      excerpt: content,
      status: "published",
    };

    const response = await fetch(`${API_BASE}/cms/content/static-${type}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    await handleResponse(response);
    revalidatePath("/cms");
    return { success: true, message: `${type} page updated successfully.` };
  } catch (error: any) {
    console.error(`Failed to update ${type} page:`, error);
    return { success: false, message: `Failed to update ${type} page.` };
  }
}

// --- Field Types ---
export async function getFieldTypes(): Promise<FieldType[]> {
  try {
    const response = await fetch(`${API_BASE}/cms/field-types`, {
      credentials: "include",
    });

    const data = await handleResponse(response);
    return z.array(fieldTypeSchema).parse(data);
  } catch (error) {
    console.error("Failed to fetch field types:", error);
    return [];
  }
}

// --- Templates ---
export async function getTemplates(): Promise<Template[]> {
  try {
    const response = await fetch(`${API_BASE}/cms/templates`, {
      credentials: "include",
    });

    const data = await handleResponse(response);
    return z.array(templateSchema).parse(data);
  } catch (error) {
    console.error("Failed to fetch templates:", error);
    return [];
  }
}

// Content Type Fields Management
export async function getContentTypeFields(contentTypeId: string) {
  try {
    const response = await fetch(
      `${API_BASE}/cms/content-type-fields?content_type_id=${contentTypeId}`,
      {
        credentials: "include",
      }
    );

    const data = await handleResponse(response);
    return data;
  } catch (error) {
    console.error("Failed to fetch content type fields:", error);
    return { success: false, data: [] };
  }
}

export async function addContentTypeField(
  contentTypeId: string,
  values: {
    field_type_id: string;
    name: string;
    label: string;
    slug: string;
    description?: string;
    is_required?: boolean;
    is_unique?: boolean;
    field_order?: number;
    validation_rules?: any;
    field_config?: any;
  }
) {
  try {
    const response = await fetch(`${API_BASE}/cms/content-type-fields`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        content_type_id: contentTypeId,
        ...values,
      }),
    });

    const data = await handleResponse(response);
    revalidatePath("/cms");
    return { success: true, data };
  } catch (error: any) {
    console.error("Failed to add content type field:", error);
    const errorData = error.response?.data || {};
    const errorMessage =
      errorData.error || error.message || "Failed to add content type field.";
    return { success: false, error: errorMessage };
  }
}

export async function updateContentTypeField(
  id: string,
  values: {
    name?: string;
    label?: string;
    slug?: string;
    description?: string;
    is_required?: boolean;
    is_unique?: boolean;
    field_order?: number;
    validation_rules?: any;
    field_config?: any;
  }
) {
  try {
    const response = await fetch(`${API_BASE}/cms/content-type-fields/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(values),
    });

    await handleResponse(response);
    revalidatePath("/cms");
    return { success: true, message: "Field updated successfully." };
  } catch (error: any) {
    console.error("Failed to update field:", error);
    const errorData = error.response?.data || {};
    const errorMessage =
      errorData.error || error.message || "Failed to update field.";
    return { success: false, message: errorMessage };
  }
}

export async function deleteContentTypeField(id: string) {
  try {
    const response = await fetch(`${API_BASE}/cms/content-type-fields/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    await handleResponse(response);
    revalidatePath("/cms");
    return { success: true, message: "Field deleted successfully." };
  } catch (error: any) {
    console.error("Failed to delete field:", error);
    const errorData = error.response?.data || {};
    const errorMessage =
      errorData.error || error.message || "Failed to delete field.";
    return { success: false, message: errorMessage };
  }
}

// Legacy compatibility - keeping old function names
export const getPages = getContentItems;

export const addPage = async (values: {
  category?: string;
  title: string;
  command?: string;
  description?: string;
  image?: string;
}) => {
  try {
    // Convert legacy format to new format
    const slug = values.title.toLowerCase().replace(/\s+/g, "-");
    const response = await fetch(`${API_BASE}/cms/content`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        contentTypeId: "1", // Default content type
        title: values.title,
        slug,
        category: values.category,
        command: values.command,
        description: values.description,
        featuredImage: values.image,
        status: "published",
        fieldValues: {},
      }),
    });

    await handleResponse(response);
    revalidatePath("/cms");
    return { success: true, message: "Page created successfully." };
  } catch (error: any) {
    console.error("Failed to create page:", error);
    const errorData = error.response?.data || {};
    const errorMessage =
      errorData.error || error.message || "Failed to create page.";
    return { success: false, message: errorMessage };
  }
};

export const updatePage = async (
  id: string,
  values: {
    category?: string;
    title: string;
    command?: string;
    description?: string;
    image?: string;
  }
) => {
  try {
    const slug = values.title.toLowerCase().replace(/\s+/g, "-");
    const response = await fetch(`${API_BASE}/cms/content/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        title: values.title,
        slug,
        category: values.category,
        command: values.command,
        description: values.description,
        featuredImage: values.image,
        status: "published",
        fieldValues: {},
      }),
    });

    await handleResponse(response);
    revalidatePath("/cms");
    return { success: true, message: "Page updated successfully." };
  } catch (error: any) {
    console.error("Failed to update page:", error);
    const errorData = error.response?.data || {};
    const errorMessage =
      errorData.error || error.message || "Failed to update page.";
    return { success: false, message: errorMessage };
  }
};
export const deletePage = deleteContentItem;
