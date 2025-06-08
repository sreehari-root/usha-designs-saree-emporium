
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';

const About = () => {
  return (
    <MainLayout>
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">About Usha Designs</h1>
          
          <div className="space-y-8">
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Founded with a passion for traditional Indian craftsmanship, Usha Designs brings you 
                  an exquisite collection of handcrafted sarees and ethnic wear. Our journey began with 
                  a simple vision: to preserve and celebrate the rich heritage of Indian textiles while 
                  making them accessible to modern women around the world.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We are committed to supporting traditional artisans and weavers by bringing their 
                  beautiful creations directly to you. Every piece in our collection tells a story 
                  of skilled craftsmanship, cultural heritage, and timeless elegance.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-semibold mb-4">Quality Promise</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We believe in quality over quantity. Each product is carefully selected and 
                  quality-checked to ensure you receive only the finest ethnic wear. Our collection 
                  features authentic handwoven fabrics, intricate embroidery, and traditional 
                  designs that have been passed down through generations.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default About;
