import React, { useRef } from 'react';
import { Upload, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { CategoryType } from '@/lib/api/categories';
import { ProductType } from '@/lib/api/products';

interface ProductFormProps {
  product: Partial<ProductType>;
  categories: CategoryType[];
  imageFile: File | null;
  imagePreview: string | null;
  additionalImages?: File[];
  additionalImagePreviews?: string[];
  isLoading: boolean;
  isEdit?: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onCategoryChange: (value: string) => void;
  onSwitchChange: (name: string, checked: boolean) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAdditionalImagesChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveAdditionalImage?: (index: number) => void;
  onCancel: () => void;
}

const ProductForm = ({
  product,
  categories,
  imageFile,
  imagePreview,
  additionalImages = [],
  additionalImagePreviews = [],
  isLoading,
  isEdit = false,
  onSubmit,
  onInputChange,
  onCategoryChange,
  onSwitchChange,
  onImageChange,
  onAdditionalImagesChange,
  onRemoveAdditionalImage,
  onCancel
}: ProductFormProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const additionalImagesInputRef = useRef<HTMLInputElement>(null);

  return (
    <form onSubmit={onSubmit} className="space-y-4 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={isEdit ? "edit-name" : "name"}>Product Name</Label>
          <Input
            id={isEdit ? "edit-name" : "name"}
            name="name"
            value={product.name || ''}
            onChange={onInputChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor={isEdit ? "edit-category" : "category"}>Category</Label>
          <Select 
            onValueChange={onCategoryChange}
            value={product.category_id || ''}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={isEdit ? "edit-price" : "price"}>Price (₹)</Label>
          <Input
            id={isEdit ? "edit-price" : "price"}
            name="price"
            type="number"
            min="0"
            value={product.price || 0}
            onChange={onInputChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor={isEdit ? "edit-discount" : "discount"}>Discount (%)</Label>
          <Input
            id={isEdit ? "edit-discount" : "discount"}
            name="discount"
            type="number"
            min="0"
            max="100"
            value={product.discount || 0}
            onChange={onInputChange}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor={isEdit ? "edit-stock" : "stock"}>Stock Quantity</Label>
        <Input
          id={isEdit ? "edit-stock" : "stock"}
          name="stock"
          type="number"
          min="0"
          value={product.stock || 0}
          onChange={onInputChange}
          required
        />
      </div>
      
      {/* Main Product Image Section */}
      <div className="space-y-2">
        <Label>Main Product Image</Label>
        <div className="flex items-center space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Main Image
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={onImageChange}
          />
          {(imagePreview || product.image) && (
            <div className="relative h-16 w-16 rounded-md overflow-hidden">
              <img
                src={imagePreview || product.image || ''}
                alt="Main preview"
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </div>
      </div>

      {/* Additional Images Section - Only for new products */}
      {!isEdit && (
        <div className="space-y-2">
          <Label>Additional Product Images</Label>
          <div className="space-y-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => additionalImagesInputRef.current?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Additional Images
            </Button>
            <input
              type="file"
              ref={additionalImagesInputRef}
              className="hidden"
              accept="image/*"
              multiple
              onChange={onAdditionalImagesChange}
            />
            
            {additionalImagePreviews.length > 0 && (
              <div className="grid grid-cols-4 gap-4">
                {additionalImagePreviews.map((preview, index) => (
                  <div key={index} className="relative h-20 w-20 rounded-md overflow-hidden group">
                    <img
                      src={preview}
                      alt={`Additional preview ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onRemoveAdditionalImage?.(index)}
                    >
                      <X size={12} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {isEdit && (
        <p className="text-sm text-muted-foreground">
          Note: Additional product images can be managed in the "Product Images" section on the right.
        </p>
      )}
      
      <div className="space-y-2">
        <Label htmlFor={isEdit ? "edit-description" : "description"}>Description</Label>
        <Textarea
          id={isEdit ? "edit-description" : "description"}
          name="description"
          value={product.description || ''}
          onChange={onInputChange}
          rows={4}
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center space-x-2">
          <Switch
            id={isEdit ? "edit-inStock" : "inStock"}
            checked={(product.stock || 0) > 0}
            onCheckedChange={(checked) => onSwitchChange('stock', checked)}
          />
          <Label htmlFor={isEdit ? "edit-inStock" : "inStock"}>In Stock</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id={isEdit ? "edit-featured" : "featured"}
            checked={product.featured || false}
            onCheckedChange={(checked) => onSwitchChange('featured', checked)}
          />
          <Label htmlFor={isEdit ? "edit-featured" : "featured"}>Featured</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id={isEdit ? "edit-bestseller" : "bestseller"}
            checked={product.bestseller || false}
            onCheckedChange={(checked) => onSwitchChange('bestseller', checked)}
          />
          <Label htmlFor={isEdit ? "edit-bestseller" : "bestseller"}>Bestseller</Label>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEdit ? 'Saving...' : 'Adding...'}
            </>
          ) : (isEdit ? "Save Changes" : "Add Product")}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
