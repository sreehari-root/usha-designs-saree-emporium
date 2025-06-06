
import React, { useState, useRef } from 'react';
import { Plus, X, Upload, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductImageType, addProductImage, deleteProductImage, updateImageOrder } from '@/lib/api/productImages';

interface ProductImageManagerProps {
  productId: string;
  images: ProductImageType[];
  onImagesChange: (images: ProductImageType[]) => void;
  isLoading?: boolean;
}

const ProductImageManager = ({ productId, images, onImagesChange, isLoading }: ProductImageManagerProps) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    
    try {
      const uploadPromises = Array.from(files).map(async (file, index) => {
        const newOrder = images.length + index;
        return addProductImage(productId, file, newOrder);
      });

      const uploadedImages = await Promise.all(uploadPromises);
      const validImages = uploadedImages.filter(Boolean) as ProductImageType[];
      
      if (validImages.length > 0) {
        onImagesChange([...images, ...validImages]);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    const success = await deleteProductImage(imageId);
    if (success) {
      onImagesChange(images.filter(img => img.id !== imageId));
    }
  };

  const moveImage = async (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);

    // Update display orders
    const updatePromises = newImages.map((img, index) =>
      updateImageOrder(img.id, index)
    );

    await Promise.all(updatePromises);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Product Images</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || isLoading}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Images
        </Button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        multiple
        onChange={handleImageUpload}
      />

      {images.length === 0 ? (
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
          <Upload className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-2 text-sm text-muted-foreground">No images uploaded yet</p>
          <p className="text-xs text-muted-foreground">Click "Add Images" to upload product photos</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={image.id} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                <img
                  src={image.image_url}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleDeleteImage(image.id)}
              >
                <X size={12} />
              </Button>
              
              <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-black/50 text-white text-xs px-1 py-0.5 rounded">
                  {index + 1}
                </div>
              </div>

              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                {index > 0 && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => moveImage(index, index - 1)}
                  >
                    <GripVertical size={12} />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {uploading && (
        <div className="text-center text-sm text-muted-foreground">
          Uploading images...
        </div>
      )}
    </div>
  );
};

export default ProductImageManager;
