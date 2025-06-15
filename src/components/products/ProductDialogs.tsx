
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import ProductForm from './ProductForm';
import ProductImageManager from './ProductImageManager';
import { ProductType } from '@/lib/api/products';
import { CategoryType } from '@/lib/api/categories';
import { ProductImageType } from '@/lib/api/productImages';

interface ProductDialogsProps {
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: (open: boolean) => void;
  newProduct: Partial<ProductType>;
  imageFile: File | null;
  imagePreview: string | null;
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (open: boolean) => void;
  selectedProduct: ProductType | null;
  editImageFile: File | null;
  editImagePreview: string | null;
  categories: CategoryType[];
  isLoading: boolean;
  onAddProduct: (e: React.FormEvent) => void;
  onUpdateProduct: (e: React.FormEvent) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onCategoryChange: (value: string) => void;
  onSwitchChange: (name: string, checked: boolean) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  productImages: ProductImageType[];
  onProductImagesChange: (images: ProductImageType[]) => void;
}

const ProductDialogs = ({
  isAddDialogOpen,
  setIsAddDialogOpen,
  newProduct,
  imageFile,
  imagePreview,
  isEditDialogOpen,
  setIsEditDialogOpen,
  selectedProduct,
  editImageFile,
  editImagePreview,
  categories,
  isLoading,
  onAddProduct,
  onUpdateProduct,
  onInputChange,
  onCategoryChange,
  onSwitchChange,
  onImageChange,
  productImages,
  onProductImagesChange,
}: ProductDialogsProps) => {
  return (
    <>
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogTrigger asChild>
          <Button className="bg-usha-burgundy hover:bg-usha-burgundy/90">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <ProductForm
                product={newProduct}
                imageFile={imageFile}
                imagePreview={imagePreview}
                categories={categories}
                isLoading={isLoading}
                onSubmit={onAddProduct}
                onInputChange={onInputChange}
                onCategoryChange={onCategoryChange}
                onSwitchChange={onSwitchChange}
                onImageChange={onImageChange}
                onCancel={() => setIsAddDialogOpen(false)}
              />
            </div>
            <div>
              <ProductImageManager
                productId={newProduct.id || 'new'}
                images={productImages}
                onImagesChange={onProductImagesChange}
                isLoading={isLoading}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <ProductForm
                  product={selectedProduct}
                  imageFile={editImageFile}
                  imagePreview={editImagePreview}
                  categories={categories}
                  isLoading={isLoading}
                  isEdit={true}
                  onSubmit={onUpdateProduct}
                  onInputChange={onInputChange}
                  onCategoryChange={onCategoryChange}
                  onSwitchChange={onSwitchChange}
                  onImageChange={onImageChange}
                  onCancel={() => setIsEditDialogOpen(false)}
                />
              </div>
              <div>
                <ProductImageManager
                  productId={selectedProduct.id}
                  images={productImages}
                  onImagesChange={onProductImagesChange}
                  isLoading={isLoading}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductDialogs;
