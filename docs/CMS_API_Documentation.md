# Dynamic CMS API Documentation

## Overview
This document outlines the comprehensive API endpoints for the dynamic CMS system that allows you to create, manage, and display content dynamically.

## Base URL
```
http://localhost:4000/api/cms
```

## Authentication
Most CMS endpoints require authentication. Include the authentication token in your requests.

---

## Content Types Management

### 1. List Content Types
**GET** `/content-types`

Returns all available content types with their field counts and content counts.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Article",
    "slug": "article",
    "description": "Blog posts and articles",
    "icon": "FileText",
    "content_count": 25,
    "field_count": 8,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
]
```

### 2. Create Content Type
**POST** `/content-types`

**Body:**
```json
{
  "name": "Product",
  "slug": "product",
  "description": "Product catalog items",
  "icon": "Package"
}
```

### 3. Get Content Type with Fields
**GET** `/content-types/:id`

Returns a content type with all its configured fields.

### 4. Add Field to Content Type
**POST** `/content-types/:content_type_id/fields`

**Body:**
```json
{
  "field_type_id": 1,
  "name": "title",
  "label": "Title",
  "slug": "title",
  "description": "The main title",
  "is_required": true,
  "is_unique": false,
  "field_order": 1,
  "validation_rules": {
    "maxLength": 200
  },
  "field_config": {
    "placeholder": "Enter title"
  }
}
```

---

## Content Management

### 1. List Content Items
**GET** `/content`

**Query Parameters:**
- `content_type_id` - Filter by content type
- `status` - Filter by status (draft, published, archived)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `search` - Search in title and excerpt

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "title": "Sample Article",
      "slug": "sample-article",
      "status": "published",
      "featured_image": "/uploads/image.jpg",
      "excerpt": "This is a sample article",
      "content_type_name": "Article",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

### 2. Create Content Item
**POST** `/content`

**Body:**
```json
{
  "content_type_id": 1,
  "title": "My New Article",
  "slug": "my-new-article",
  "status": "draft",
  "featured_image": "/uploads/featured.jpg",
  "excerpt": "Brief description",
  "meta_title": "SEO Title",
  "meta_description": "SEO Description",
  "fieldValues": [
    {
      "content_type_field_id": 1,
      "value_text": "This is the content body"
    },
    {
      "content_type_field_id": 2,
      "value_number": 100
    }
  ]
}
```

### 3. Get Content Item
**GET** `/content/:id`

Returns a content item with all its field values.

### 4. Update Content Item
**PUT** `/content/:id`

Same body structure as create.

### 5. Delete Content Item
**DELETE** `/content/:id`

---

## Categories Management

### 1. List Categories
**GET** `/categories`

### 2. Create Category
**POST** `/categories`

**Body:**
```json
{
  "name": "Technology",
  "slug": "technology",
  "description": "Tech-related content",
  "parent_id": null,
  "color": "#3B82F6",
  "icon": "Cpu"
}
```

---

## Media Management

### 1. List Media Files
**GET** `/media`

**Query Parameters:**
- `page` - Page number
- `limit` - Items per page
- `mime_type` - Filter by file type (image, video, etc.)

### 2. Upload Media File
**POST** `/media/upload`

Use multipart/form-data with file upload.

---

## System Resources

### 1. List Field Types
**GET** `/field-types`

Returns available field types for content type configuration.

### 2. List Templates
**GET** `/templates`

Returns available page templates.

---

## Public Content API

These endpoints are for frontend consumption and don't require authentication.

### 1. Get Content by Type
**GET** `/public/:content_type_slug`

**Query Parameters:**
- `limit` - Number of items to return

**Example:**
```
GET /api/cms/public/article?limit=10
```

### 2. Get Specific Content Item
**GET** `/public/:content_type_slug/:slug`

**Example:**
```
GET /api/cms/public/article/my-article-slug
```

---

## Field Types Available

1. **Text** - Single line text input
2. **Textarea** - Multi-line text input
3. **Rich Text** - WYSIWYG editor
4. **Number** - Numeric input
5. **Email** - Email validation
6. **URL** - URL validation
7. **Date** - Date picker
8. **DateTime** - Date and time picker
9. **Boolean** - Checkbox
10. **Select** - Dropdown selection
11. **Multi Select** - Multiple selection
12. **Image** - Image upload
13. **File** - File upload
14. **Gallery** - Multiple image upload
15. **JSON** - JSON editor
16. **Color** - Color picker

---

## Usage Examples

### Creating a Blog System

1. **Create Article Content Type:**
```bash
POST /api/cms/content-types
{
  "name": "Article",
  "slug": "article",
  "description": "Blog articles"
}
```

2. **Add Fields to Article:**
```bash
POST /api/cms/content-types/1/fields
{
  "field_type_id": 3, // Rich Text
  "name": "content",
  "label": "Article Content",
  "slug": "content",
  "is_required": true
}
```

3. **Create an Article:**
```bash
POST /api/cms/content
{
  "content_type_id": 1,
  "title": "How to Use Our CMS",
  "slug": "how-to-use-cms",
  "status": "published",
  "fieldValues": [
    {
      "content_type_field_id": 1,
      "value_text": "<p>This is how you use our CMS...</p>"
    }
  ]
}
```

4. **Display on Frontend:**
```bash
GET /api/cms/public/article
```

This system provides complete flexibility to create any type of content structure you need!
