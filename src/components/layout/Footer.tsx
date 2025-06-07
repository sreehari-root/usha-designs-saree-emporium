
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Usha Silks</h3>
            <p className="text-gray-300 mb-4">
              Your destination for beautiful traditional wear. Quality craftsmanship and timeless elegance.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-300 hover:text-white">Home</Link></li>
              <li><Link to="/shop" className="text-gray-300 hover:text-white">Shop</Link></li>
              <li><Link to="/about" className="text-gray-300 hover:text-white">About</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-white">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Categories</h4>
            <ul className="space-y-2">
              <li><Link to="/shop?category=silk-sarees" className="text-gray-300 hover:text-white">Silk Sarees</Link></li>
              <li><Link to="/shop?category=cotton-sarees" className="text-gray-300 hover:text-white">Cotton Sarees</Link></li>
              <li><Link to="/shop?category=wedding-collection" className="text-gray-300 hover:text-white">Wedding Collection</Link></li>
              <li><Link to="/shop?category=lehengas" className="text-gray-300 hover:text-white">Lehengas</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Contact Info</h4>
            <div className="text-gray-300 space-y-2">
              <p>123 Fashion Street</p>
              <p>Mumbai, Maharashtra 400001</p>
              <p>Phone: +91 98765 43210</p>
              <p>Email: info@ushasilks.com</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; 2024 Usha Silks. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
