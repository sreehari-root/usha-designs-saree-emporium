import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { ProductType, fetchProducts, addProduct, updateProduct, deleteProduct } from '@/lib/api/products';
import { CategoryType, fetchCategories } from '@/lib/api/categories';
import { ProductImageType, fetchProductImages, addProductImage } from '@/lib/api/productImages';

export const useProductManagement = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<ProductType[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);
  const [productImages, setProductImages] = useState<ProductImageType[]>([]);
  const productsPerPage = 10;
  
  // New product form state
  const [newProduct, setNewProduct] = useState({
    name: '',
    category_id: '',
    price: 0,
    discount: 0,
    description: '',
    stock: 10,
    featured: false,
    bestseller: false,
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>([]);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [productsData, categoriesData] = await Promise.all([
          fetchProducts(),
          fetchCategories()
        ]);
        
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load products and categories',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [toast]);

  useEffect(() => {
    const loadProductImages = async () => {
      if (selectedProduct && isEditDialogOpen) {
        const images = await fetchProductImages(selectedProduct.id);
        setProductImages(images);
      } else if (!isEditDialogOpen) {
        setProductImages([]);
      }
    };
    
    loadProductImages();
  }, [selectedProduct, isEditDialogOpen]);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.category_name && product.category_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const pageCount = Math.ceil(filteredProducts.length / productsPerPage);

  const handleEdit = (product: ProductType) => {
    setSelectedProduct(product);
    setEditImagePreview(product.image);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setIsLoading(true);
      const success = await deleteProduct(productId);
      if (success) {
        setProducts(products.filter(product => product.id !== productId));
      }
      setIsLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const product = await addProduct(newProduct, imageFile || undefined);
      if (product) {
        // Add additional images if any
        if (additionalImages.length > 0) {
          for (let i = 0; i < additionalImages.length; i++) {
            await addProductImage(product.id, additionalImages[i], i + 1);
          }
        }

        const updatedProduct = {
          ...product,
          category_name: categories.find(c => c.id === product.category_id)?.name
        };
        setProducts([updatedProduct, ...products]);
        setIsAddDialogOpen(false);
        resetNewProductForm();
      }
    } catch (error) {
      console.error('Error adding product:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    
    setIsLoading(true);
    try {
      const updatedProduct = await updateProduct(
        selectedProduct.id, 
        selectedProduct, 
        editImageFile || undefined
      );
      
      if (updatedProduct) {
        const updatedProductWithCategory = {
          ...updatedProduct,
          category_name: categories.find(c => c.id === updatedProduct.category_id)?.name
        };
        
        setProducts(products.map(p => 
          p.id === updatedProduct.id ? updatedProductWithCategory : p
        ));
        setIsEditDialogOpen(false);
      }
    } catch (error) {
      console.error('Error updating product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetNewProductForm = () => {
    setNewProduct({
      name: '',
      category_id: '',
      price: 0,
      discount: 0,
      description: '',
      stock: 10,
      featured: false,
      bestseller: false,
    });
    setImageFile(null);
    setImagePreview(null);
    setAdditionalImages([]);
    setAdditionalImagePreviews([]);
    setProductImages([]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (isEditDialogOpen && selectedProduct) {
      setSelectedProduct({
        ...selectedProduct,
        [name]: name === 'price' || name === 'discount' || name === 'stock' 
          ? Number(value) 
          : value
      });
    } else {
      setNewProduct({
        ...newProduct,
        [name]: name === 'price' || name === 'discount' || name === 'stock' 
          ? Number(value) 
          : value
      });
    }
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    if (name === 'stock') {
      const stockValue = checked ? 1 : 0;
      if (isEditDialogOpen && selectedProduct) {
        setSelectedProduct({
          ...selectedProduct,
          stock: stockValue
        });
      } else {
        setNewProduct({
          ...newProduct,
          stock: stockValue
        });
      }
    } else {
      if (isEditDialogOpen && selectedProduct) {
        setSelectedProduct({
          ...selectedProduct,
          [name]: checked
        });
      } else {
        setNewProduct({
          ...newProduct,
          [name]: checked
        });
      }
    }
  };

  const handleCategoryChange = (value: string) => {
    if (isEditDialogOpen && selectedProduct) {
      setSelectedProduct({
        ...selectedProduct,
        category_id: value
      });
    } else {
      setNewProduct({
        ...newProduct,
        category_id: value
      });
    }
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file',
        description: 'Please select an image file (JPEG, PNG, etc.)',
        variant: 'destructive'
      });
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Image size should not exceed 5MB',
        variant: 'destructive'
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      if (isEditDialogOpen) {
        setEditImageFile(file);
        setEditImagePreview(reader.result as string);
      } else {
        setImageFile(file);
        setImagePreview(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validFiles: File[] = [];
    const validPreviews: string[] = [];

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file',
          description: `${file.name} is not an image file`,
          variant: 'destructive'
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: `${file.name} size should not exceed 5MB`,
          variant: 'destructive'
        });
        return;
      }

      validFiles.push(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        validPreviews.push(reader.result as string);
        if (validPreviews.length === validFiles.length) {
          setAdditionalImages([...additionalImages, ...validFiles]);
          setAdditionalImagePreviews([...additionalImagePreviews, ...validPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveAdditionalImage = (index: number) => {
    setAdditionalImages(additionalImages.filter((_, i) => i !== index));
    setAdditionalImagePreviews(additionalImagePreviews.filter((_, i) => i !== index));
  };

  const handleProductImagesChange = (images: ProductImageType[]) => {
    setProductImages(images);
  };

  return {
    // State
    products,
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
    additionalImages,
    additionalImagePreviews,
    editImageFile,
    editImagePreview,
    productsPerPage,
    productImages,
    
    // Actions
    handleEdit,
    handleDelete,
    handleAddProduct,
    handleUpdateProduct,
    handleInputChange,
    handleSwitchChange,
    handleCategoryChange,
    handleImageChange,
    handleAdditionalImagesChange,
    handleRemoveAdditionalImage,
    onProductImagesChange: handleProductImagesChange,
  };
};
