'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Phone, Mail, MapPin, Instagram, MessageCircle, Clock, User, ChevronRight } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="animate-fade-in">
      {/* Hero with store photo */}
      <section className="relative h-[280px] overflow-hidden">
        <img
          src="/images/shop-photos/My_Dukaan_Pics.jpeg"
          alt="Chaudhary General Store"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/30" />
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-lg text-primary-foreground space-y-3">
              <h1 className="text-4xl font-bold">Contact Us</h1>
              <p className="text-lg opacity-90">Get in touch with Chaudhary General Store</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Contact Us</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Contact Info Cards */}
          <div className="space-y-4">
            {/* Owner */}
            <div className="rounded-2xl border bg-card p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <User className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Kundan Kumar Chaudhary</h3>
                  <p className="text-sm text-muted-foreground">Owner & Proprietor</p>
                </div>
              </div>
            </div>

            {/* Phone */}
            <a href="tel:8051806325" className="block group">
              <div className="rounded-2xl border bg-card p-6 transition-all group-hover:shadow-lg group-hover:border-primary/30">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <Phone className="h-7 w-7" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Phone</h3>
                    <p className="text-lg font-medium text-primary">80518 06325</p>
                    <p className="text-sm text-muted-foreground">Tap to call</p>
                  </div>
                </div>
              </div>
            </a>

            {/* Email */}
            <a href="mailto:kkc8014@gmail.com" className="block group">
              <div className="rounded-2xl border bg-card p-6 transition-all group-hover:shadow-lg group-hover:border-primary/30">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                    <Mail className="h-7 w-7" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Email</h3>
                    <p className="text-lg font-medium text-primary">kkc8014@gmail.com</p>
                    <p className="text-sm text-muted-foreground">Tap to email</p>
                  </div>
                </div>
              </div>
            </a>

            {/* WhatsApp */}
            <a href="https://wa.me/918051806325" target="_blank" rel="noopener noreferrer" className="block group">
              <div className="rounded-2xl border bg-card p-6 transition-all group-hover:shadow-lg group-hover:border-primary/30">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-100 text-green-600">
                    <MessageCircle className="h-7 w-7" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">WhatsApp</h3>
                    <p className="text-lg font-medium text-primary">80518 06325</p>
                    <p className="text-sm text-muted-foreground">Chat with us on WhatsApp</p>
                  </div>
                </div>
              </div>
            </a>

            {/* Instagram */}
            <a href="https://www.instagram.com/kundankumarchaudhary_kkc/" target="_blank" rel="noopener noreferrer" className="block group">
              <div className="rounded-2xl border bg-card p-6 transition-all group-hover:shadow-lg group-hover:border-primary/30">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 text-white">
                    <Instagram className="h-7 w-7" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Instagram</h3>
                    <p className="text-lg font-medium text-primary">@kundankumarchaudhary_kkc</p>
                    <p className="text-sm text-muted-foreground">Follow us on Instagram</p>
                  </div>
                </div>
              </div>
            </a>

            {/* Address */}
            <div className="rounded-2xl border bg-card p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-red-100 text-red-600 flex-shrink-0">
                  <MapPin className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Store Address</h3>
                  <p className="text-muted-foreground">
                    Shambhupur Koari, Darbar-tola, Pani-tanki,<br />
                    Bhagwanpur Subdistrict, Bihar 844114
                  </p>
                </div>
              </div>
            </div>

            {/* Hours */}
            <div className="rounded-2xl border bg-card p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary flex-shrink-0">
                  <Clock className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Business Hours</h3>
                  <p className="text-muted-foreground">Open daily</p>
                  <p className="text-sm text-muted-foreground mt-1">Morning to evening</p>
                </div>
              </div>
            </div>
          </div>

          {/* Store Photo */}
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden min-h-[400px]">
              <img
                src="/images/shop-photos/My_Dukaan_pic.jpeg"
                alt="Chaudhary General Store"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                <h3 className="text-white font-bold text-xl">Chaudhary General Store</h3>
                <p className="text-white/80 text-sm">चौधरी जेनरल स्टोर</p>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden min-h-[200px]">
              <img
                src="/images/shop-photos/ChatGPT_Image_Jul_2,_2026,_12_06_40_AM.png"
                alt="Store Interior"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border p-8">
          <h2 className="text-2xl font-bold mb-3">Have Questions?</h2>
          <p className="text-muted-foreground mb-6">We&apos;re here to help. Reach out to us anytime.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="tel:8051806325">
              <Button size="lg"><Phone className="h-5 w-5 mr-2" /> Call Now</Button>
            </a>
            <a href="https://wa.me/918051806325" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="secondary"><MessageCircle className="h-5 w-5 mr-2" /> WhatsApp</Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
