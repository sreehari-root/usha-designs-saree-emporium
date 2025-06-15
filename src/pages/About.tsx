
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const About = () => {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-usha-burgundy mb-4">About Usha Designs</h1>
          <div className="indian-border w-24 mx-auto mb-6"></div>
          <p className="text-xl text-muted-foreground">
            The Designer Lane - Crafting elegance since 2005
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-usha-burgundy">Our Story</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Founded in 2005, Usha Designs has been at the forefront of bringing traditional Indian craftsmanship to modern fashion. Our journey began with a simple vision: to preserve and celebrate the rich heritage of Indian textiles while adapting to contemporary styles.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-usha-burgundy">Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We are committed to providing authentic, high-quality ethnic wear that combines traditional artistry with modern design sensibilities. Each piece in our collection tells a story of skilled craftsmanship and cultural heritage.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-semibold mb-8">Why Choose Usha Designs?</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <h3 className="text-xl font-medium text-usha-burgundy mb-2">Quality Craftsmanship</h3>
              <p className="text-muted-foreground">
                Each garment is carefully crafted by skilled artisans using traditional techniques.
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-medium text-usha-burgundy mb-2">Authentic Materials</h3>
              <p className="text-muted-foreground">
                We use only the finest fabrics including pure silk, cotton, and georgette.
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-medium text-usha-burgundy mb-2">Timeless Designs</h3>
              <p className="text-muted-foreground">
                Our collections blend traditional aesthetics with contemporary fashion trends.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
