
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProductsTable from '@/components/products/ProductsTable';
import ProductDialogs from '@/components/products/ProductDialogs';
import ProductsSearch from '@/components/products/ProductsSearch';
import { useProductManagement } from '@/hooks/useProductManagement';

const ProductsPage = () => {
  const {
    filteredProducts,
    currentProducts,
    categories,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    pageCount,
    isLoading,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    selectedProduct,
    newProduct,
    imageFile,
    imagePreview,
    editImageFile,
    editImagePreview,
    productsPerPage,
    productImages,
    handleEdit,
    handleDelete,
    handleAddProduct,
    handleUpdateProduct,
    handleInputChange,
    handleSwitchChange,
    handleCategoryChange,
    handleImageChange,
    onProductImagesChange,
  } = useProductManagement();

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Products Management</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <ProductDialogs
          isAddDialogOpen={isAddDialogOpen}
          setIsAddDialogOpen={setIsAddDialogOpen}
          newProduct={newProduct}
          imageFile={imageFile}
          imagePreview={imagePreview}
          isEditDialogOpen={isEditDialogOpen}
          setIsEditDialogOpen={setIsEditDialogOpen}
          selectedProduct={selectedProduct}
          editImageFile={editImageFile}
          editImagePreview={editImagePreview}
          categories={categories}
          isLoading={isLoading}
          onAddProduct={handleAddProduct}
          onUpdateProduct={handleUpdateProduct}
          onInputChange={handleInputChange}
          onCategoryChange={handleCategoryChange}
          onSwitchChange={handleSwitchChange}
          onImageChange={handleImageChange}
          productImages={productImages}
          onProductImagesChange={onProductImagesChange}
        />
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Product Catalog</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductsSearch
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            pageCount={pageCount}
            totalProducts={filteredProducts.length}
            productsPerPage={productsPerPage}
          />
          
          <ProductsTable
            products={currentProducts}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddProduct={() => setIsAddDialogOpen(true)}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductsPage;
