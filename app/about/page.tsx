'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronRight, Truck, ShieldCheck, Clock, Package, MapPin, Phone, Mail, User } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="animate-fade-in">
      {/* Hero with store photo */}
      <section className="relative h-[300px] overflow-hidden">
        <img
          src="/images/shop-photos/My_Dukaan_pic.jpeg"
          alt="Chaudhary General Store"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/30" />
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-lg text-primary-foreground space-y-3">
              <h1 className="text-4xl font-bold">About Us</h1>
              <p className="text-lg opacity-90">चौधरी जेनरल स्टोर</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">About Us</span>
        </div>

        {/* Store Story */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Our Story</h2>
            <p className="text-muted-foreground leading-relaxed">
              Chaudhary General Store is a trusted neighborhood kirana store serving the community
              with dedication and care. Located in Shambhupur Koari, Bhagwanpur, Bihar, we have been
              providing fresh groceries and daily essentials to our customers with a commitment to
              quality and reliability.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Owned and operated by <strong>Kundan Kumar Chaudhary</strong>, our store offers a wide
              range of products including snacks, biscuits, chocolates, rice, flour, oil, dairy products,
              cold drinks, household items, and daily essentials. We take pride in serving our community
              with honesty and building lasting relationships with our customers.
            </p>
          </div>
          <div className="relative rounded-2xl overflow-hidden min-h-[300px]">
            <img
              src="/images/shop-photos/Dukaan_pics.jpeg"
              alt="Our Store Interior"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Owner Info */}
        <div className="rounded-2xl border bg-card p-8 mb-12">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="h-10 w-10" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-bold">Kundan Kumar Chaudhary</h3>
              <p className="text-muted-foreground">Owner & Proprietor</p>
              <div className="flex flex-col sm:flex-row gap-4 mt-3 justify-center md:justify-start">
                <a href="tel:8051806325" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
                  <Phone className="h-4 w-4" /> 80518 06325
                </a>
                <a href="mailto:kkc8014@gmail.com" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
                  <Mail className="h-4 w-4" /> kkc8014@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { icon: Truck, title: 'Home Delivery', desc: 'Delivery within 10 km radius' },
            { icon: ShieldCheck, title: 'Quality Assured', desc: 'Fresh and authentic products' },
            { icon: Clock, title: 'Convenient Hours', desc: 'Open daily for your needs' },
            { icon: Package, title: 'Wide Range', desc: '200+ products across categories' },
          ].map((item, i) => (
            <div key={i} className="border rounded-xl p-6 text-center bg-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mx-auto mb-3">
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Location */}
        <div className="rounded-2xl border bg-card p-8">
          <h2 className="text-2xl font-bold mb-4">Visit Our Store</h2>
          <div className="flex items-start gap-3 mb-4">
            <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Chaudhary General Store</p>
              <p className="text-muted-foreground">
                Shambhupur Koari, Darbar-tola, Pani-tanki,<br />
                Bhagwanpur Subdistrict, Bihar 844114
              </p>
            </div>
          </div>
          <Link href="/contact">
            <Button>Contact Us</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
