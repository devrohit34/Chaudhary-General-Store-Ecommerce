'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Store, Truck, Clock, Phone, CreditCard, Save, MapPin, Mail, Globe } from 'lucide-react';

export default function SettingsPage() {
  const [storeInfo, setStoreInfo] = useState({
    name: 'Chaudhary General Store',
    tagline: 'चौधरी जेनरल स्टोर',
    phone: '+91 8051806325',
    email: 'kundan@chaudharygeneralstore.com',
    address: 'Village Mauza, District, Bihar',
    gstin: '',
    website: '',
  });

  const [deliverySettings, setDeliverySettings] = useState({
    freeDeliveryAbove: '999',
    standardCharge: '69',
    expressCharge: '20',
    minOrderAmount: '100',
  });

  const [businessHours, setBusinessHours] = useState({
    weekdayOpen: '07:00',
    weekdayClose: '22:00',
    weekendOpen: '08:00',
    weekendClose: '21:00',
    closedDays: '',
  });

  const [upiSettings, setUpiSettings] = useState({
    upiId: '8051806325@axl',
    merchantName: 'Chaudhary General Store',
    accountNumber: '3683108002477',
    bankName: 'Canara Bank',
    ifscCode: 'CNRB0003683',
  });

  const saveSection = (section: string) => {
    toast.success(`${section} settings saved successfully`);
  };

  return (
    <div className="p-6 animate-fade-in max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your store configuration</p>
      </div>

      <div className="space-y-6">
        {/* Store Information */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Store className="h-4 w-4 text-green-600" /> Store Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-gray-600">Store Name</Label>
                <Input value={storeInfo.name} onChange={(e) => setStoreInfo({ ...storeInfo, name: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs text-gray-600">Tagline (Hindi)</Label>
                <Input value={storeInfo.tagline} onChange={(e) => setStoreInfo({ ...storeInfo, tagline: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs text-gray-600 flex items-center gap-1"><Phone className="h-3 w-3" /> Phone</Label>
                <Input value={storeInfo.phone} onChange={(e) => setStoreInfo({ ...storeInfo, phone: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs text-gray-600 flex items-center gap-1"><Mail className="h-3 w-3" /> Email</Label>
                <Input value={storeInfo.email} onChange={(e) => setStoreInfo({ ...storeInfo, email: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs text-gray-600">GSTIN</Label>
                <Input value={storeInfo.gstin} onChange={(e) => setStoreInfo({ ...storeInfo, gstin: e.target.value })} placeholder="Enter GSTIN" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs text-gray-600 flex items-center gap-1"><Globe className="h-3 w-3" /> Website</Label>
                <Input value={storeInfo.website} onChange={(e) => setStoreInfo({ ...storeInfo, website: e.target.value })} placeholder="https://..." className="mt-1" />
              </div>
            </div>
            <div>
              <Label className="text-xs text-gray-600 flex items-center gap-1"><MapPin className="h-3 w-3" /> Address</Label>
              <Textarea
                value={storeInfo.address}
                onChange={(e) => setStoreInfo({ ...storeInfo, address: e.target.value })}
                rows={2}
                className="mt-1"
              />
            </div>
            <Button onClick={() => saveSection('Store')} className="bg-green-600 hover:bg-green-700 gap-2">
              <Save className="h-4 w-4" /> Save Store Info
            </Button>
          </CardContent>
        </Card>

        {/* Delivery Charges */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Truck className="h-4 w-4 text-blue-600" /> Delivery Charges
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-gray-600">Free Delivery Above (₹)</Label>
                <Input type="number" value={deliverySettings.freeDeliveryAbove} onChange={(e) => setDeliverySettings({ ...deliverySettings, freeDeliveryAbove: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs text-gray-600">Standard Delivery (₹)</Label>
                <Input type="number" value={deliverySettings.standardCharge} onChange={(e) => setDeliverySettings({ ...deliverySettings, standardCharge: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs text-gray-600">Express Delivery Extra (₹)</Label>
                <Input type="number" value={deliverySettings.expressCharge} onChange={(e) => setDeliverySettings({ ...deliverySettings, expressCharge: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs text-gray-600">Minimum Order Amount (₹)</Label>
                <Input type="number" value={deliverySettings.minOrderAmount} onChange={(e) => setDeliverySettings({ ...deliverySettings, minOrderAmount: e.target.value })} className="mt-1" />
              </div>
            </div>
            <Button onClick={() => saveSection('Delivery')} className="bg-green-600 hover:bg-green-700 gap-2">
              <Save className="h-4 w-4" /> Save Delivery Settings
            </Button>
          </CardContent>
        </Card>

        {/* Business Hours */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-600" /> Business Hours
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-gray-600">Weekday Opening</Label>
                <Input type="time" value={businessHours.weekdayOpen} onChange={(e) => setBusinessHours({ ...businessHours, weekdayOpen: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs text-gray-600">Weekday Closing</Label>
                <Input type="time" value={businessHours.weekdayClose} onChange={(e) => setBusinessHours({ ...businessHours, weekdayClose: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs text-gray-600">Weekend Opening</Label>
                <Input type="time" value={businessHours.weekendOpen} onChange={(e) => setBusinessHours({ ...businessHours, weekendOpen: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs text-gray-600">Weekend Closing</Label>
                <Input type="time" value={businessHours.weekendClose} onChange={(e) => setBusinessHours({ ...businessHours, weekendClose: e.target.value })} className="mt-1" />
              </div>
            </div>
            <div>
              <Label className="text-xs text-gray-600">Closed Days (comma separated)</Label>
              <Input value={businessHours.closedDays} onChange={(e) => setBusinessHours({ ...businessHours, closedDays: e.target.value })} placeholder="e.g. Diwali, Holi" className="mt-1" />
            </div>
            <Button onClick={() => saveSection('Business Hours')} className="bg-green-600 hover:bg-green-700 gap-2">
              <Save className="h-4 w-4" /> Save Hours
            </Button>
          </CardContent>
        </Card>

        {/* UPI Settings */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-green-600" /> UPI Payment Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-gray-600">UPI ID</Label>
                <Input value={upiSettings.upiId} onChange={(e) => setUpiSettings({ ...upiSettings, upiId: e.target.value })} className="mt-1 font-mono" />
              </div>
              <div>
                <Label className="text-xs text-gray-600">Merchant Name</Label>
                <Input value={upiSettings.merchantName} onChange={(e) => setUpiSettings({ ...upiSettings, merchantName: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs text-gray-600">Account Number</Label>
                <Input value={upiSettings.accountNumber} onChange={(e) => setUpiSettings({ ...upiSettings, accountNumber: e.target.value })} className="mt-1 font-mono" />
              </div>
              <div>
                <Label className="text-xs text-gray-600">Bank Name</Label>
                <Input value={upiSettings.bankName} onChange={(e) => setUpiSettings({ ...upiSettings, bankName: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs text-gray-600">IFSC Code</Label>
                <Input value={upiSettings.ifscCode} onChange={(e) => setUpiSettings({ ...upiSettings, ifscCode: e.target.value })} className="mt-1 font-mono" />
              </div>
            </div>
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
              <span>Note: Changes to UPI settings here are for reference only. To update the live payment QR, update the corresponding constants in the checkout and order pages.</span>
            </div>
            <Button onClick={() => saveSection('UPI')} className="bg-green-600 hover:bg-green-700 gap-2">
              <Save className="h-4 w-4" /> Save UPI Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
