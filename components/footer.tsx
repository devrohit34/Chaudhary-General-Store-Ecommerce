import Image from 'next/image';
import Link from 'next/link';
import { Phone, Mail, MapPin, Instagram, MessageCircle } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-muted/30 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="/images/shop-photos/WhatsApp_Image_2026-06-25_at_12.55.44_PM.jpeg"
                alt="Chaudhary General Store Logo"
                width={40}
                height={40}
                className="h-10 w-auto object-contain"
              />
              <div>
                <div className="font-bold">Chaudhary General Store</div>
                <div className="text-xs text-muted-foreground">चौधरी जेनरल स्टोर</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Your trusted neighborhood kirana store. Fresh groceries and daily essentials for our community.
            </p>
            <div className="flex gap-2">
              <Link
                href="https://www.instagram.com/kundankumarchaudhary_kkc/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-background border hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Instagram className="h-4 w-4" />
              </Link>
              <Link
                href="https://wa.me/918051806325"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-background border hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-sm">Shop</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/categories" className="hover:text-primary">All Categories</Link></li>
              <li><Link href="/products" className="hover:text-primary">All Products</Link></li>
              <li><Link href="/categories/dairy" className="hover:text-primary">Fresh Dairy</Link></li>
              <li><Link href="/categories/snacks" className="hover:text-primary">Snacks & Namkeen</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-sm">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-primary">Contact Us</Link></li>
              <li><Link href="/account" className="hover:text-primary">My Account</Link></li>
              <li><Link href="/orders" className="hover:text-primary">My Orders</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-sm">Contact</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> 80518 06325</li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> kkc8014@gmail.com</li>
              <li className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" /> Shambhupur Koari, Darbar-tola, Pani-tanki, Bhagwanpur, Bihar 844114</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © 2026 Chaudhary General Store · Owner: Kundan Kumar Chaudhary
          </p>
          <div className="flex gap-3 text-xs text-muted-foreground">
            <span>We accept:</span>
            <span className="font-medium">UPI</span>
            <span className="font-medium">PhonePe</span>
            <span className="font-medium">GPay</span>
            <span className="font-medium">Paytm</span>
            <span className="font-medium">COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
