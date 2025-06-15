import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import ProductForm from '@/components/products/ProductForm';
import { ProductType } from '@/lib/api/products';
import { CategoryType } from '@/lib/api/categories';

interface ProductDialogsProps {
  // Add dialog props
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: (open: boolean) => void;
  newProduct: any;
  imageFile: File | null;
  imagePreview: string | null;
  
  // Edit dialog props
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (open: boolean) => void;
  selectedProduct: ProductType | null;
  editImageFile: File | null;
  editImagePreview: string | null;
  
  // Common props
  categories: CategoryType[];
  isLoading: boolean;
  
  // Handlers
  onAddProduct: (e: React.FormEvent) => void;
  onUpdateProduct: (e: React.FormEvent) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onCategoryChange: (value: string) => void;
  onSwitchChange: (name: string, checked: boolean) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
}: ProductDialogsProps) => {
  return (
    <>
      {/* Add Product Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogTrigger asChild>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <ProductForm
            product={newProduct}
            categories={categories}
            imageFile={imageFile}
            imagePreview={imagePreview}
            isLoading={isLoading}
            onSubmit={onAddProduct}
            onInputChange={onInputChange}
            onCategoryChange={onCategoryChange}
            onSwitchChange={onSwitchChange}
            onImageChange={onImageChange}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      {selectedProduct && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
            </DialogHeader>
            <ProductForm
              product={selectedProduct}
              categories={categories}
              imageFile={editImageFile}
              imagePreview={editImagePreview}
              isLoading={isLoading}
              isEdit={true}
              onSubmit={onUpdateProduct}
              onInputChange={onInputChange}
              onCategoryChange={onCategoryChange}
              onSwitchChange={onSwitchChange}
              onImageChange={onImageChange}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default ProductDialogs;
