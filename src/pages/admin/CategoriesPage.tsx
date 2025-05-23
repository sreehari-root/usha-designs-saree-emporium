
import React, { useState } from 'react';
import { Tag, PlusCircle, Search, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/components/layout/AdminLayout';

// Mock categories data
const mockCategories = [
  { id: 1, name: 'Sarees', productCount: 32, description: 'Traditional and designer sarees' },
  { id: 2, name: 'Lehengas', productCount: 18, description: 'Wedding and festive lehengas' },
  { id: 3, name: 'Kurtas', productCount: 45, description: 'Casual and ethnic kurtas' },
  { id: 4, name: 'Jewelry', productCount: 62, description: 'Traditional and contemporary jewelry' },
  { id: 5, name: 'Footwear', productCount: 27, description: 'Ethnic and designer footwear' },
  { id: 6, name: 'Accessories', productCount: 40, description: 'Fashion accessories and bags' }
];

const CategoriesPage = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState(mockCategories);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [isLoading, setIsLoading] = useState(false);
  
  // Filter categories based on search term
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (isEditDialogOpen && selectedCategory) {
      setSelectedCategory({ ...selectedCategory, [name]: value });
    } else {
      setNewCategory({ ...newCategory, [name]: value });
    }
  };
  
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // In a real app, this would be a database insert
    setTimeout(() => {
      const newId = Math.max(...categories.map(category => category.id)) + 1;
      const categoryToAdd = {
        ...newCategory,
        id: newId,
        productCount: 0
      };
      
      setCategories([...categories, categoryToAdd]);
      setIsAddDialogOpen(false);
      setNewCategory({ name: '', description: '' });
      
      toast({
        title: "Category added",
        description: "The new category has been successfully created.",
      });
      setIsLoading(false);
    }, 500);
  };
  
  const handleEditCategory = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // In a real app, this would be a database update
    setTimeout(() => {
      const updatedCategories = categories.map(category =>
        category.id === selectedCategory.id ? selectedCategory : category
      );
      
      setCategories(updatedCategories);
      setIsEditDialogOpen(false);
      
      toast({
        title: "Category updated",
        description: "The category has been successfully updated.",
      });
      setIsLoading(false);
    }, 500);
  };
  
  const handleDeleteCategory = (categoryId: number) => {
    setIsLoading(true);
    
    // In a real app, this would be a database delete
    setTimeout(() => {
      setCategories(categories.filter(category => category.id !== categoryId));
      
      toast({
        title: "Category deleted",
        description: "The category has been successfully removed.",
      });
      setIsLoading(false);
    }, 500);
  };
  
  const openEditDialog = (category: any) => {
    setSelectedCategory(category);
    setIsEditDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Categories Management</h1>
            <p className="text-muted-foreground">Create and manage product categories</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddCategory} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Category Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={newCategory.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={newCategory.description}
                    onChange={handleInputChange}
                    rows={3}
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Adding..." : "Add Category"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search categories..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>{category.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {category.productCount} items
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(category)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCategory(category.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {filteredCategories.length === 0 && (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No categories found. Try a different search term or add a new category.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          {selectedCategory && (
            <form onSubmit={handleEditCategory} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Category Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={selectedCategory.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  value={selectedCategory.description}
                  onChange={handleInputChange}
                  rows={3}
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default CategoriesPage;
