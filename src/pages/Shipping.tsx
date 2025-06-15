
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, Clock, MapPin, Shield } from 'lucide-react';

const Shipping = () => {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-usha-burgundy mb-4">Shipping & Delivery</h1>
          <div className="indian-border w-24 mx-auto mb-6"></div>
          <p className="text-xl text-muted-foreground">
            Fast, secure, and reliable delivery to your doorstep
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-usha-burgundy" />
                Delivery Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-medium">Standard Delivery</h4>
                <p className="text-sm text-muted-foreground">5-7 business days - ₹99</p>
              </div>
              <div>
                <h4 className="font-medium">Express Delivery</h4>
                <p className="text-sm text-muted-foreground">2-3 business days - ₹199</p>
              </div>
              <div>
                <h4 className="font-medium">Same Day Delivery</h4>
                <p className="text-sm text-muted-foreground">Within city limits - ₹299</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-usha-burgundy" />
                Processing Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Orders are processed within 1-2 business days. Custom or made-to-order items may take 3-5 additional days for processing.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-usha-burgundy" />
              Delivery Areas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-2">Domestic Delivery</h4>
                <p className="text-sm text-muted-foreground">
                  We deliver across all major cities in India including Mumbai, Delhi, Bangalore, Chennai, Kolkata, and more.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">International Delivery</h4>
                <p className="text-sm text-muted-foreground">
                  International shipping available to USA, UK, Canada, Australia, and select countries. Contact us for details.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-usha-burgundy" />
              Shipping Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium">Free Shipping</h4>
              <p className="text-sm text-muted-foreground">
                Enjoy free standard shipping on orders above ₹2,999 within India.
              </p>
            </div>
            <div>
              <h4 className="font-medium">Secure Packaging</h4>
              <p className="text-sm text-muted-foreground">
                All items are carefully packaged to ensure they reach you in perfect condition.
              </p>
            </div>
            <div>
              <h4 className="font-medium">Order Tracking</h4>
              <p className="text-sm text-muted-foreground">
                Track your order with the provided tracking number via SMS and email updates.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Shipping;
