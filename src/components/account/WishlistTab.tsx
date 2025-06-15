
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const WishlistTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Wishlist</CardTitle>
        <p className="text-sm text-muted-foreground">Items you've saved for later</p>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Your wishlist is empty</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WishlistTab;
