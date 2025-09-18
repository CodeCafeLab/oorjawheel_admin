-- Enhanced CMS Database Schema for Dynamic Content Management

-- 1. Content Types (defines different types of content like Article, Product, Event, etc.)
CREATE TABLE content_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Field Types (defines what types of fields can be added to content types)
CREATE TABLE field_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    component VARCHAR(100) NOT NULL, -- React component name
    validation_rules JSON,
    default_config JSON,
    is_active BOOLEAN DEFAULT TRUE
);

-- 3. Content Type Fields (defines fields for each content type)
CREATE TABLE content_type_fields (
    id INT PRIMARY KEY AUTO_INCREMENT,
    content_type_id INT NOT NULL,
    field_type_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    label VARCHAR(200) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    is_required BOOLEAN DEFAULT FALSE,
    is_unique BOOLEAN DEFAULT FALSE,
    field_order INT DEFAULT 0,
    validation_rules JSON,
    field_config JSON, -- field-specific configuration
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (content_type_id) REFERENCES content_types(id) ON DELETE CASCADE,
    FOREIGN KEY (field_type_id) REFERENCES field_types(id),
    UNIQUE KEY unique_field_per_type (content_type_id, slug)
);

-- 4. Enhanced Pages table
ALTER TABLE pages ADD COLUMN IF NOT EXISTS slug VARCHAR(200) UNIQUE;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS meta_title VARCHAR(200);
ALTER TABLE pages ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS template VARCHAR(100) DEFAULT 'default';
ALTER TABLE pages ADD COLUMN IF NOT EXISTS status ENUM('draft', 'published', 'archived') DEFAULT 'draft';
ALTER TABLE pages ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS created_by INT;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS updated_by INT;

-- 5. Content Items (actual content instances)
CREATE TABLE content_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    content_type_id INT NOT NULL,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) NOT NULL,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    featured_image VARCHAR(500),
    excerpt TEXT,
    meta_title VARCHAR(200),
    meta_description TEXT,
    page_id INT, -- optional: link to a specific page
    author_id INT,
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (content_type_id) REFERENCES content_types(id),
    FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE SET NULL,
    UNIQUE KEY unique_slug_per_type (content_type_id, slug),
    INDEX idx_status (status),
    INDEX idx_published_at (published_at),
    INDEX idx_content_type (content_type_id)
);

-- 6. Content Field Values (stores actual field values for content items)
CREATE TABLE content_field_values (
    id INT PRIMARY KEY AUTO_INCREMENT,
    content_item_id INT NOT NULL,
    content_type_field_id INT NOT NULL,
    value_text TEXT,
    value_number DECIMAL(15,4),
    value_date DATETIME,
    value_boolean BOOLEAN,
    value_json JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (content_item_id) REFERENCES content_items(id) ON DELETE CASCADE,
    FOREIGN KEY (content_type_field_id) REFERENCES content_type_fields(id),
    UNIQUE KEY unique_field_per_item (content_item_id, content_type_field_id)
);

-- 7. Media Library
CREATE TABLE media_files (
    id INT PRIMARY KEY AUTO_INCREMENT,
    filename VARCHAR(500) NOT NULL,
    original_name VARCHAR(500) NOT NULL,
    file_path VARCHAR(1000) NOT NULL,
    file_size INT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    alt_text VARCHAR(500),
    caption TEXT,
    uploaded_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_mime_type (mime_type)
);

-- 8. Categories/Tags (for content organization)
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    parent_id INT NULL,
    color VARCHAR(7), -- hex color
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- 9. Content Categories (many-to-many relationship)
CREATE TABLE content_categories (
    content_item_id INT NOT NULL,
    category_id INT NOT NULL,
    PRIMARY KEY (content_item_id, category_id),
    FOREIGN KEY (content_item_id) REFERENCES content_items(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- 10. Page Sections (for page builder functionality)
CREATE TABLE page_sections (
    id INT PRIMARY KEY AUTO_INCREMENT,
    page_id INT NOT NULL,
    section_type VARCHAR(100) NOT NULL, -- hero, content, gallery, etc.
    section_name VARCHAR(200),
    section_order INT DEFAULT 0,
    section_config JSON, -- stores section-specific configuration
    section_content JSON, -- stores section content
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE
);

-- 11. Templates
CREATE TABLE templates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    template_config JSON,
    preview_image VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default field types
INSERT INTO field_types (name, component, validation_rules, default_config) VALUES
('Text', 'TextInput', '{"maxLength": 255}', '{"placeholder": "Enter text"}'),
('Textarea', 'TextareaInput', '{"maxLength": 5000}', '{"rows": 4, "placeholder": "Enter description"}'),
('Rich Text', 'RichTextEditor', '{}', '{"toolbar": ["bold", "italic", "link"]}'),
('Number', 'NumberInput', '{"min": 0}', '{"placeholder": "Enter number"}'),
('Email', 'EmailInput', '{"pattern": "email"}', '{"placeholder": "Enter email"}'),
('URL', 'URLInput', '{"pattern": "url"}', '{"placeholder": "Enter URL"}'),
('Date', 'DateInput', '{}', '{}'),
('DateTime', 'DateTimeInput', '{}', '{}'),
('Boolean', 'CheckboxInput', '{}', '{"label": "Yes/No"}'),
('Select', 'SelectInput', '{}', '{"options": []}'),
('Multi Select', 'MultiSelectInput', '{}', '{"options": []}'),
('Image', 'ImageUpload', '{"allowedTypes": ["jpg", "png", "webp"]}', '{"maxSize": "5MB"}'),
('File', 'FileUpload', '{}', '{"maxSize": "10MB"}'),
('Gallery', 'ImageGallery', '{}', '{"maxImages": 10}'),
('JSON', 'JSONEditor', '{}', '{}'),
('Color', 'ColorPicker', '{}', '{"format": "hex"}');

-- Insert default content types
INSERT INTO content_types (name, slug, description, icon) VALUES
('Article', 'article', 'Blog posts and articles', 'FileText'),
('Page', 'page', 'Static pages', 'File'),
('Product', 'product', 'Product catalog items', 'Package'),
('Event', 'event', 'Events and announcements', 'Calendar'),
('FAQ', 'faq', 'Frequently asked questions', 'HelpCircle'),
('Testimonial', 'testimonial', 'Customer testimonials', 'MessageSquare');

-- Insert default categories
INSERT INTO categories (name, slug, description, color) VALUES
('General', 'general', 'General content', '#6B7280'),
('News', 'news', 'News and updates', '#3B82F6'),
('Tutorial', 'tutorial', 'How-to guides and tutorials', '#10B981'),
('Product', 'product', 'Product related content', '#8B5CF6'),
('Support', 'support', 'Support and help content', '#F59E0B');

-- Insert default templates
INSERT INTO templates (name, slug, description, template_config) VALUES
('Default', 'default', 'Default page template', '{"layout": "single-column"}'),
('Landing Page', 'landing', 'Marketing landing page template', '{"layout": "hero-sections"}'),
('Blog Post', 'blog-post', 'Blog post template with sidebar', '{"layout": "content-sidebar"}'),
('Product Page', 'product', 'Product showcase template', '{"layout": "product-gallery"}');

-- 12. Static Content Pages (for Privacy Policy, Terms, etc.)
CREATE TABLE static_content (
    id INT PRIMARY KEY AUTO_INCREMENT,
    page_type ENUM('privacy_policy', 'terms_conditions', 'shipping_returns', 'payment_terms') NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    content LONGTEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,
    updated_by INT
);

-- Insert default static content pages
INSERT INTO static_content (page_type, title, content) VALUES
('privacy_policy', 'Privacy Policy', 'Enter your privacy policy content here...'),
('terms_conditions', 'Terms & Conditions', 'Enter your terms and conditions content here...'),
('shipping_returns', 'Shipping & Returns', 'Enter your shipping and returns policy content here...'),
('payment_terms', 'Payment Terms', 'Enter your payment terms content here...');