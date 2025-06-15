
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RotateCcw, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

const Returns = () => {
  return (
    <MainLayout>
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-usha-burgundy mb-4">Returns & Exchanges</h1>
            <div className="indian-border w-24 mx-auto mb-6"></div>
            <p className="text-xl text-muted-foreground">
              Easy returns and exchanges for your peace of mind
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RotateCcw className="h-5 w-5 text-usha-burgundy" />
                  Return Policy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  We accept returns within 7 days of delivery for a full refund, provided items are in original condition with tags attached.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Items must be unworn and unwashed</li>
                  <li>• Original packaging and tags required</li>
                  <li>• Return shipping costs apply</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-usha-burgundy" />
                  Exchange Policy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Exchange for different size or color within 10 days of delivery, subject to availability.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Size exchanges available</li>
                  <li>• Color exchanges subject to stock</li>
                  <li>• One exchange per order</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>How to Return/Exchange</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="text-center">
                  <div className="w-12 h-12 bg-usha-burgundy/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-usha-burgundy font-bold">1</span>
                  </div>
                  <h4 className="font-medium mb-2">Contact Us</h4>
                  <p className="text-sm text-muted-foreground">
                    Email us at returns@ushadesigns.com or call our support team
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-usha-burgundy/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-usha-burgundy font-bold">2</span>
                  </div>
                  <h4 className="font-medium mb-2">Pack & Ship</h4>
                  <p className="text-sm text-muted-foreground">
                    Pack items securely with original tags and ship to our warehouse
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-usha-burgundy/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-usha-burgundy font-bold">3</span>
                  </div>
                  <h4 className="font-medium mb-2">Get Refund</h4>
                  <p className="text-sm text-muted-foreground">
                    Receive refund or replacement within 5-7 business days
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Returnable Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Sarees and dress materials</li>
                  <li>• Ready-made blouses</li>
                  <li>• Accessories (if unused)</li>
                  <li>• Gift items</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  Non-Returnable Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Custom-tailored items</li>
                  <li>• Sale/clearance items</li>
                  <li>• Items altered or damaged</li>
                  <li>• Intimate apparel</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Returns;
