let supabase: any;
try {
  // use require so script can run standalone even if ESM resolution differs
  const mod = await import('../lib/supabase');
  supabase = mod.supabase;
} catch (e) {
  supabase = null;
}

type SeedProduct = {
  name: string;
  category?: string;
  price: number;
  mrp?: number;
  unit?: string;
  image?: string;
};

export const PRODUCTS: SeedProduct[] = [
  { name: 'Chana Daal 1Kg', category: 'Pulses & Dal', price: 80, mrp: 90, unit: '1 Kg', image: 'https://cdn.pixabay.com/photo/2013/07/25/12/03/chana-166987_1280.jpg' },
  { name: 'Masoor Daal 1Kg', category: 'Pulses & Dal', price: 80, mrp: 90, unit: '1 Kg', image: 'https://img.magnific.com/free-psd/brown-ceramic-bowl-overflowing-with-vibrant-orange-split-red-lentils-isolated-pure-black-background_84443-57438.jpg?semt=ais_hybrid&w=740&q=80' },
  { name: 'Chana 1Kg', category: 'Pulses', price: 75, mrp: 85, unit: '1 Kg', image: 'https://www.commodityonline.com/leads/2026/04/original_1775968506_265394_lead_69db20fa5bb77_.webp' },
  { name: 'Rahar Daal 1Kg', category: 'Pulses & Dal', price: 120, mrp: 130, unit: '1 Kg', image: 'https://5.imimg.com/data5/SELLER/Default/2024/4/407409091/QD/BY/ZN/64742259/img-20240405-095937-500x500.jpeg' },
  { name: 'Kesari Daal 1Kg', category: 'Pulses & Dal', price: 60, mrp: 70, unit: '1 Kg', image: 'https://imgs.mongabay.com/wp-content/uploads/sites/30/2019/05/31104302/Khesari-banner.jpg' },
  { name: 'Raja Ji Chawal 1Kg', category: 'Rice', price: 40, mrp: 45, unit: '1 Kg', image: 'https://5.imimg.com/data5/SELLER/Default/2022/4/FD/AA/FL/28275880/raja-ji-premium-quality-silky-sortex-parboiled-rice.jpg' },
  { name: 'Raees Biryani Chawal 1Kg', category: 'Rice', price: 110, mrp: 120, unit: '1 Kg', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7Qk6iHgNp3nenDRfg0DxtBWn2LJlIa18yXLeo3yDYTiDaY1UIBhgvzVDG&s=10' },
  { name: 'Kheer Basmati Chawal 1Kg', category: 'Rice', price: 80, mrp: 90, unit: '1 Kg', image: 'https://m.media-amazon.com/images/I/613JvZuCHNL._AC_UF894,1000_QL80_.jpg' },
  { name: 'Miniket Chawal 1Kg', category: 'Rice', price: 60, mrp: 70, unit: '1 Kg', image: 'https://cpimg.tistatic.com/11229591/b/7/gold-star-red-miniket-rice.jpg' },
  { name: 'Moong Daal 500gm', category: 'Pulses & Dal', price: 70, mrp: 80, unit: '500 gm', image: 'https://tiimg.tistatic.com/fp/2/008/318/commonly-cultivated-natural-and-dried-whole-raw-moong-dal-186.jpg' },
  { name: 'Peela Sarso (Yellow Mustard Seeds) 500gm', category: 'Spices', price: 90, mrp: 100, unit: '500 gm', image: 'https://m.media-amazon.com/images/I/51rQ609hcSS._AC_UF894,1000_QL80_.jpg' },

  { name: 'Arawa Chawal 1Kg', price: 40, unit: '1 Kg', image: 'https://dukaan.b-cdn.net/700x700/webp/17656/f3cb4c69-bd7d-4b5d-bd3c-457a7a07caff.png' },
  { name: 'Chokar 1Kg', price: 32, unit: '1 Kg', image: 'https://5.imimg.com/data5/HR/PX/MY-68856377/50kg-wheat-chopar-cattle-feed.jpg' },
  { name: 'Chiwda (Poha) 1Kg', price: 40, unit: '1 Kg', image: 'https://www.indianhealthyrecipes.com/wp-content/uploads/2020/11/poha-chivda-recipe-001.jpg' },
  { name: 'Atta (Flour) 1Kg', price: 35, unit: '1 Kg', image: 'https://images.jdmagicbox.com/quickquotes/images_main/atta-2020407074-u92e07np.jpg' },
  { name: 'Maida 1Kg', price: 35, unit: '1 Kg', image: 'https://images.jdmagicbox.com/quickquotes/images_main/maida-flour-2219759364-tqgguesj.jpg' },
  { name: 'Besan 1 Kg', price: 100, unit: '1 Kg', image: 'https://tiimg.tistatic.com/fp/1/008/614/besan-740.jpg' },
  { name: 'Chini (Sugar) 1kg', price: 46, unit: '1 Kg', image: 'https://api.qkart.in/storage/file_uploads/RlgfjwIJiHrye4TlLoTA2jxwstpMV7PtmejBV3dk.webp?ts=1696234491' },

  { name: 'Scooter Sarso tel (Grade - 1) 1litre', price: 170, unit: '1 Litre', image: 'https://rukminim2.flixcart.com/image/480/640/xif0q/edible-oil/x/j/s/1-kachchi-ghani-pouch-1-mustard-oil-scooter-original-imagueaaxdbq7s8b.jpeg?q=90' },
  { name: 'Scooter Sarso tel (Grade - 2) 1litre', price: 165, unit: '1 Litre', image: 'https://img.clevup.in/23983/1656311378406_SKU-0483_0.jpeg?width=600&format=webp' },
  { name: 'Scooter Sarso tel 500 ml', price: 85, unit: '500 ml', image: 'https://bookmyrashan.com/cdn/shop/files/5260675B-F94D-4CA6-A8D6-F33BD88B5787.jpg?v=1781174318&width=1946' },
  { name: 'Fortune refine tel 1 litre', price: 150, unit: '1 Litre', image: 'https://tiimg.tistatic.com/fp/1/007/893/fortune-refined-soyabean-cooking-oil-1-liter-pouch-pack-272.jpg' },
  { name: 'Fortune refine tel 500 ml', price: 85, unit: '500 ml', image: 'https://5.imimg.com/data5/SELLER/Default/2025/5/510886982/NO/KG/TS/34396468/500ml-fortune-refined-soyabean-oil.jpg' },
  { name: 'Ruchi Gold Refine tel 500 ml', price: 60, unit: '500 ml', image: 'https://cpimg.tistatic.com/06919369/b/4/500ml-Palmolein-Oil.jpg' },
  { name: 'Ruchi Gold Refine tel 1 litre', price: 120, unit: '1 Litre', image: 'https://tiimg.tistatic.com/fp/3/007/839/made-from-fruit-of-palm-highly-saturated-refined-ruchi-gold-palmolein-oil-1l-804.jpg' },
  { name: 'Scooter Tel Bottle 200 ml', price: 40, unit: '200 ml', image: 'https://5.imimg.com/data5/SELLER/Default/2022/1/NT/DX/EY/6680225/scooter-kachi-ghani-mustard-oil.jpg' },

  { name: 'Wheel Saraf 1Kg', price: 75, unit: '1 Kg', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQyCUU2tFIM7Pj7zjsn19QJBxILksKH5FI_k1vyJqNybocJ-0FZ5NZ9BKev&s=10' },
  { name: 'Wheel Saraf 500 gm', price: 40, unit: '500 gm', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfTUqGhsxkgafhxBtYcF9bnAOxoFPm0pvcgF92fTjittzEFccgiu8hv7I&s=10' },
  { name: 'Ghadi Saraf 1Kg', price: 70, unit: '1 Kg', image: 'https://rukminim2.flixcart.com/image/480/480/k4ehnrk0/laundry-detergent/g/p/u/detergent-powder-500g-ghadi-original-imafnbh6jzegunpd.jpeg?q=20' },
  { name: 'Ghadi Saraf 500 gm', price: 35, unit: '500 gm', image: 'https://www.haridwarmart.com/wp-content/uploads/2020/12/haridwar-mart-ghadi-surf.png' },
  { name: 'Surf Excel Saraf 1Kg', price: 140, unit: '1 Kg', image: 'https://www.bbassets.com/media/uploads/p/l/40101707_12-surf-excel-easy-wash-detergent-powder.jpg' },
  { name: 'Surf Excel Saraf 500 gm', price: 70, unit: '500 gm', image: 'https://5.imimg.com/data5/SELLER/Default/2026/4/598945079/JZ/AL/DB/251972383/surf-excel-easy-wash-500-gm-pack-500x500.jpg' },
  { name: 'Guide Saraf 1kg', price: 75, unit: '1 Kg', image: 'https://5.imimg.com/data5/SELLER/Default/2025/3/499162952/WA/VT/AS/242297521/guide-detergent-family-pack-250x250.png' },

  { name: 'LifeBuoy Sabun (Soap) 1 pie', price: 10, unit: '1 pie', image: 'https://m.media-amazon.com/images/I/51v+ef+oWlL.jpg' },
  { name: 'LifeBuoy Sabun (Soap) 1 pie', price: 30, unit: '1 pie', image: 'https://m.media-amazon.com/images/I/61V7yBaoMkL._AC_UF350,350_QL80_.jpg' },
  { name: 'Dettol Sabun (Soap) 1 pie', price: 10, unit: '1 pie', image: 'https://image.cdn.shpy.in/319551/1702115043998_1.jpeg?format=webp' },
  { name: 'Dettol Sabun (Soap) 1 pie', price: 10, unit: '1 pie', image: 'https://image.cdn.shpy.in/319551/1702115043998_1.jpeg?format=webp' },
  { name: 'Dettol Sabun (Soap) 1 pie', price: 40, unit: '1 pie', image: 'https://www.quickpantry.in/cdn/shop/products/dettol-intense-cool-soap-quick-pantry-2.jpg?v=1710538713' },
  { name: 'Cinthol Sabun (Soap) 1 pie', price: 10, unit: '1 pie', image: 'https://rukmini1.flixcart.com/image/1500/1500/k44hksw0/soap/y/a/x/8-800-lime-soap-100g-pack-of-8-cinthol-original-imafmug7mgygutdt.jpeg?q=70' },
  { name: 'Margo Sabun (Soap) 1pie', price: 10, unit: '1 pie', image: 'https://andamangreengrocers.com/wp-content/uploads/2022/02/margo-soap-500x500-1.jpg' },
  { name: 'Lux Sabun ( Soap) 1 pie', price: 10, unit: '1 pie', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPsu_QOS9zKrtn_hbUda69L9LCtIVdMJ-giW055eI-eBexlYSIW49WXT4p&s=10' },
  { name: 'Santoor Sabun (Soap) 1 pie', price: 10, unit: '1 pie', image: 'https://5.imimg.com/data5/SELLER/Default/2023/12/367437986/LN/FG/ZV/111441864/whatsapp-image-2023-12-11-at-4-54-03-pm-2.jpeg' },
  { name: 'Dove Sabun ( Soap) 1 Pie', price: 24, unit: '1 pie', image: 'https://m.media-amazon.com/images/I/51vdytucIVL.jpg' },
  { name: 'Dove Sabun ( Soap) 1 Pie', price: 40, unit: '1 pie', image: 'https://5.imimg.com/data5/SELLER/Default/2024/1/380345260/JT/VW/TQ/205189144/direct-supplier-dove-soap-original-bar-body-wash-dove-beauty-cream-bar-soap-100g.png' },

  { name: 'Butter Biscuit 1 packet', price: 5, unit: '1 packet', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIIPucI2WXeutWpJcMh7E-LGNbJSqFpAhNaZrgoRryzb38XKE5tPq-yCDw&s=10' },
  { name: 'Butter Biscuit 1 packet', price: 10, unit: '1 packet', image: 'https://www.bbassets.com/media/uploads/groot/images/1102020-b207328b-icon_04.jpg' },
  { name: 'Butter Biscuit 1 packet', price: 40, unit: '1 packet', image: 'https://5.imimg.com/data5/ANDROID/Default/2023/1/TA/DL/KD/17040408/product-jpeg.jpg' },
  { name: 'Marie Gold Biscuit 1 Packet', price: 5, unit: '1 packet', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRtcc3bM9JUarryEMBLgwooqhuszHmzZSawOj1VB31gAA&s=10' },
  { name: 'Marie Gold Biscuit 1 Packet', price: 10, unit: '1 packet', image: 'https://tiimg.tistatic.com/fp/1/008/182/sweet-and-delicious-semi-soft-round-britannia-marie-gold-biscuit-536.jpg' },
  { name: 'Marie Gold Biscuit 1 Packet', price: 40, unit: '1 packet', image: 'https://frugivore-bucket.s3.amazonaws.com/media/package/img_one/2020-08-12/MARIEGOLD_250G.jpg' },
  { name: 'Top Biscuit 1 Packet', price: 5, unit: '1 packet', image: 'https://5.imimg.com/data5/AU/MN/SS/GLADMIN-83164673/9s7fd9sdfsf7sd-500x500.png' },
  { name: 'Top Biscuit 1 Packet', price: 35, unit: '1 packet', image: 'https://5.imimg.com/data5/SELLER/Default/2025/11/559714511/JM/ZL/HO/83509305/parle-top-buttery-crackers-biscuits.jpg' },
  { name: 'Dream Lite Biscuit 1 Packet', price: 5, unit: '1 packet', image: 'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=1080/da/cms-assets/cms/product/cbefa809-1819-4378-83a9-62f209549a31.png?bg_token=color.background.quaternary' },
  { name: 'Happy-Happy Biscuit 1 Packet', price: 5, unit: '1 packet', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKnIFPUi04DF_Xi-FqZZa-b93d1B4tGui9cn-vYfKf8O9NT7VRpdu-QXbN&s=10' },
  { name: 'Parle-G Biscuit 1 Packet', price: 5, unit: '1 packet', image: 'https://tiimg.tistatic.com/fp/1/007/585/parle-g-biscuit-packets-56-gm-with-rich-in-protein-fats-and-calories-nutrients-445.jpg' },

  { name: 'Horlicks 1 packet', price: 5, unit: '1 packet', image: 'https://storage.googleapis.com/shy-pub/394829/SKU-0447_0-1728187011452.jpg' },
  { name: 'Horlicks 1Kg', price: 399, unit: '1 Kg', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzffszxhcreI5OCl76Ps_6rD6pBl9rn6NBegNAOvasiTXWtpAAQQpcVABl&s=10' },
  { name: 'Horlicks 500 gm', price: 230, unit: '500 gm', image: 'https://cdn01.pharmeasy.in/dam/products_otc/J47037/horlicks-health-nutrition-drink-pouch-500-g-2-1671741746.jpg' },
  { name: 'Bourn Vita 1 Packet', price: 5, unit: '1 packet', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTU5TJr8ph2oUpy_sHPGejHjQ1N0NL4QKQ8TZ20rP8t9C2p8QOwbjD_AIPi&s=10' },
  { name: 'Makhana 1 Packet 250 gm', price: 250, unit: '250 gm', image: 'https://5.imimg.com/data5/SELLER/Default/2023/11/363437693/EL/CC/YS/200040761/makhana-250gm-500x500.jpeg' },
  { name: 'Sattu 1 Packet 200 gm', price: 20, unit: '200 gm', image: 'https://5.imimg.com/data5/SELLER/Default/2022/8/VX/RO/VZ/5588885/1-kg-sattu-packet-500x500.jpg' },
  { name: 'Sabudana 1 packet 200 gm', price: 20, unit: '200 gm', image: 'https://5.imimg.com/data5/SELLER/Default/2022/3/UP/CN/QY/95824286/bharat-gold-sabudana-500x500.jpg' },

  { name: 'Raja Ji Chawal 26 Kg', price: 999, unit: '26 Kg', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQSCiyj1kj6HXyX9X4Vx4NpWwUv0ourCSV2u2FnAqMevg&s=10' },
  { name: 'Kurkure 1 Packet', price: 5, unit: '1 packet', image: 'https://www.bbassets.com/media/uploads/p/l/40068077_2-kurkure-namkeen-masala-munch.jpg' },
  { name: 'Tedhe-Medhe Kurkure 1 packet', price: 5, unit: '1 packet', image: 'https://www.bbassets.com/media/uploads/p/l/40008102_15-bingo-tedhe-medhe-masala-tadka.jpg' },
  { name: 'Lays (Chips) 1 Packet', price: 5, unit: '1 packet', image: 'https://m.media-amazon.com/images/I/71gKmrEYnoL.jpg' },
  { name: 'Takatak Kurkure 1 Packet', price: 5, unit: '1 packet', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFueFokS-j_b7P6gsbyXM9Ru_J_RW3CNOL5gStRlQghY5Q7xRDWPS2KeQ&s=10' },
  { name: 'O,Yes Kukure 1 Packet', price: 5, unit: '1 packet', image: 'https://media-dev.bazaar5.com/media/product/21/4169/o-yes-puffs-tangy-tamatar-8137a280.jpg' },
  { name: 'O,Yes Kukure 1 Packet', price: 5, unit: '1 packet', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVLiYmZZIJdhFp8JfL0itIoxWvFPPiQgMhZ_J9-28Pp14hFawYv7GOuTc&s=10' },
  { name: 'O,Yes Kukure 1 Packet', price: 5, unit: '1 packet', image: 'https://www.reddit.com/media?url=https%3A%2F%2Fpreview.redd.it%2Fi-still-remember-i-used-to-buy-a-pack-of-oyes-and-tang-v0-ztyscfzvdkm81.jpg%3Fwidth%3D640%26crop%3Dsmart%26auto%3Dwebp%26s%3D89ae9d0026403067cd67ae99c97bc1ca05224219' },
  { name: 'Navrattan Mixture 1 Packet', price: 5, unit: '1 packet', image: 'https://5.imimg.com/data5/ANDROID/Default/2022/12/IU/YM/ZT/98394814/product-jpeg.jpg' },
  { name: 'Navrattan Mixture 1 Packet', price: 10, unit: '1 packet', image: 'https://5.imimg.com/data5/SELLER/Default/2025/5/511995241/QE/FF/MF/244860561/1-162-500x500.webp' },
  { name: 'Navrattan Mixture 1 Packet', price: 20, unit: '1 packet', image: 'https://www.bbassets.com/media/uploads/p/xl/70000815_7-haldirams-namkeen-navrattan-del.jpg' },

  { name: 'Lotto Choco Pie', price: 10, unit: '1 packet', image: 'https://www.lotteindia.com/images/choco-pause-button-img.png' },
  { name: 'Gobbles Cake Britannia 1 Packet', price: 10, unit: '1 packet', image: 'https://rukminim2.flixcart.com/image/480/640/xif0q/cake-pastry/c/c/4/-original-imahdzxbvagf9hzz.jpeg?q=90' },
  { name: 'Cream Cake 1 Packet', price: 5, unit: '1 packet', image: 'https://dukaan.b-cdn.net/1000x1000/webp/10363/5d2e998e-0eba-4082-b325-ff423f3babea.png' },

  { name: 'Lahsun (Garlic) 1Kg', price: 100, unit: '1 Kg', image: 'https://vrmshoppe.com/wp-content/uploads/2021/07/desi-garlic-bom-mp-500x500-1.jpg' },
  { name: 'Pyaaj (onion) 1Kg', price: 30, unit: '1 Kg', image: 'https://dukaan.b-cdn.net/500x500/webp/43685/bbdb9d9b-1236-4e9b-aaaf-51adc0f881c5.png' },
  { name: 'Aalu ( Potato) 1Kg', price: 15, unit: '1 Kg', image: 'https://media.naheed.pk/catalog/product/cache/2f2d0cb0c5f92580479e8350be94f387/1/1/1168924-1.jpg' },
  { name: 'Anda (Egg) 1 pie', price: 8, unit: '1 pie', image: 'https://5.imimg.com/data5/ANDROID/Default/2025/3/494320902/EI/JQ/UO/242397288/prod-20250308-1505456800756066624616301-jpg.jpg' },
  { name: 'Adarak (Ginger) 250 gm', price: 50, unit: '250 gm', image: 'https://andamangreengrocers.com/wp-content/uploads/2021/12/Ginger-600x461-1.jpg' },
  { name: 'Full Jhaddu (Broom) 1 Pie', price: 80, unit: '1 pie', image: 'https://dcprovide.com/wp-content/uploads/2023/04/phool-jhadu-500x500-1.jpg' },
  { name: 'Bamboo Jhadu 1 Pie', price: 80, unit: '1 pie', image: 'https://m.media-amazon.com/images/I/51ZhWPe4mVL._AC_UF894,1000_QL80_.jpg' },
  { name: 'Kishmish (Raisin) 100 gm', price: 50, unit: '100 gm', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQctMhXXGR7KDrRPJ39YiTn4HPEs0WgwhK3_rPQfifGPooej3U0N8Ywblw&s=10' },
  { name: 'chohara ( Sukha Khajoor) 250 gm', price: 50, unit: '250 gm', image: 'https://images.jdmagicbox.com/quickquotes/images_main/dry-dates-chohara-fruit-paking-size-1-kg-2227066190-8py9md1n.jpg' },

  { name: 'Munch 1 Packet (32 Pie)', price: 160, unit: '1 packet', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSVFwN4qkv9DlkElgIMRt9SkrFdZ-52n_UdPgB9Sp9oKbi5q4tOLkr3WA&s=10' },
  { name: 'Snakker 1 packet (30 pie)', price: 150, unit: '1 packet', image: 'https://m.media-amazon.com/images/I/81wCnoxaFRL.jpg' },
  { name: 'Taaja Chaipatti 1 packet', price: 10, unit: '1 packet', image: 'https://5.imimg.com/data5/ECOM/Default/2023/7/323490877/VO/OP/CS/44622788/1664337376475-sku-1291-0.png' },
  { name: 'Taaja Chaipatti 1 packet (100gm)', price: 25, unit: '100 gm', image: 'https://5.imimg.com/data5/ECOM/Default/2023/9/348680507/LN/LV/LE/114673083/1693629712478-sku-0180-0-500x500.jpg' },
  { name: 'Tata Agni Chaipatti 1 packet', price: 5, unit: '1 packet', image: 'https://www.bbassets.com/media/uploads/p/l/40305563_1-tata-tea-agni-leaf-danedar-chai.jpg' },
  { name: 'Tata Agni Chaipatti 1 packet', price: 10, unit: '1 packet', image: 'https://cdn.zeptonow.com/production/ik-seo/tr:w-360,ar-1200-1200,pr-true,f-auto,q-40/cms/product_variant/07188757-ea94-4b46-bff9-5e0e3575d298/Tata-Tea-Agni-Cardamom-Tea.jpeg' },
  { name: 'Tata Agni Chaipatti 1 packet (100gm)', price: 25, unit: '100 gm', image: 'https://dukaan.b-cdn.net/700x700/webp/media/77a588f4-0457-416e-8d21-60104248af5d.jpg' },
  { name: 'Tata Agni Chaipatti 1 packet (250gm)', price: 55, unit: '250 gm', image: 'https://www.tataconsumer.com/sites/g/files/gfwrlq316/files/Buff_Dust_250_g_3D_Pack_17022023_0.png' },
  { name: 'Tata Agni Chaipatti Elaichi flavour 1 packet (250gm)', price: 75, unit: '250 gm', image: 'https://bankurasamabaybipani.com/wp-content/uploads/2023/12/Tata-Tea-Agni-Elaichi-Chai-250-g.webp' },

  { name: 'Rusk 1 packet', price: 5, unit: '1 packet', image: 'https://tiimg.tistatic.com/fp/0/009/527/suju-saunf-rusk-996.jpg' },
  { name: 'Parle Rusk 1 packet', price: 10, unit: '1 packet', image: 'https://m.media-amazon.com/images/I/617rCmQ4i6L._AC_UF894,1000_QL80_.jpg' },
  { name: 'Agra Mixture (400gm) 1 packet', price: 70, unit: '400 gm', image: 'https://dukaan.b-cdn.net/1000x1000/webp/86002/0fa9d439-15e8-4f83-a04c-2111065e6bc6.png' },
  { name: 'Anmol Cake 1 packet', price: 10, unit: '1 packet', image: 'https://m.media-amazon.com/images/I/51bef6XKNkL._AC_UF894,1000_QL80_.jpg' },
  { name: 'Bhola bangh 1 pie', price: 2, unit: '1 pie', image: 'https://aquaherbals.in/cdn/shop/files/Untitleddesign_1.png?v=1741067205&width=1445' },
  { name: 'Eno 1 pie', price: 11, unit: '1 pie', image: 'https://www.bbassets.com/media/uploads/p/xl/20005354_5-eno-fruit-salt-lemon-flavor.jpg' },
  { name: 'Bhujia Kurkure 1 pie', price: 5, unit: '1 pie', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCBRBJJo7QH34EVwM-44Fc1b4a0Q2rxrUEdkrna6ZZfefcsSGQjXcK6rTF&s=10' },
  { name: 'Mangal deep agarbatti 1 pie', price: 10, unit: '1 pie', image: 'https://www.bbassets.com/media/uploads/p/l/40272838_2-mangaldeep-3-in-1-agarbatti-premium-quality-incense-long-lasting-fragrances-charcoal-free.jpg' },
  { name: 'Ridhi Sidhi agarbatti 1 pie', price: 10, unit: '1 pie', image: 'https://m.media-amazon.com/images/I/81xS0kVvsTL.jpg' },
  { name: 'Ridhi Sidhi agarbatti 1 pie', price: 20, unit: '1 pie', image: 'https://m.media-amazon.com/images/I/81ymL2fZDlL._AC_UF350,350_QL50_.jpg' },
  { name: 'HiraMoti agarbatti 1 pie', price: 10, unit: '1 pie', image: 'https://jharkhandbihar.com/productimages/10591.jpg' },
  { name: 'Soybean Chunks 1 packet', price: 10, unit: '1 packet', image: 'https://5.imimg.com/data5/SELLER/Default/2025/11/559296769/TQ/CK/KY/255955575/image-500x500.jpeg' },
  { name: 'Cha-Papa Nasta 1 Packet', price: 25, unit: '1 packet', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdUM5-Z4dPAhe7wuVAN_zNKROagMTUyQHvWCN7vWGGXn6c9r2FamAJ6IZz&s=10' },
  { name: 'Pav Roti 1 Packet', price: 5, unit: '1 packet', image: 'https://m.media-amazon.com/images/I/71+jz33vJDL._AC_UF894,1000_QL80_.jpg' },
  { name: 'Soan Papdi 1 pie', price: 5, unit: '1 pie', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5wt2z8_ybRYZSRa3O8T-wfFn5rIKFf-0lcDjkTN5RV2Oic6s66OKYgzAW&s=10' },
  { name: 'Vaseline 1 pie', price: 5, unit: '1 pie', image: 'https://www.roopsi.in/wp-content/uploads/2024/08/18397251-1723128055538.webp' },
  { name: 'Ponds Cold Cream 1 pie', price: 5, unit: '1 pie', image: 'https://www.starquik.com/cdn/shop/files/Ponds_Moisturising_Cold_Cream_200_Ml_3.jpg?v=1750941667&width=416' },
  { name: 'Navratana Powder 1 Packet', price: 10, unit: '1 packet', image: 'https://rupanshimart.in/wp-content/uploads/2024/05/6c2f8685-c2ca-4d50-8768-904ab2d2ce89-removebg-preview-1.png' },
  { name: 'Boro Plus 1 Pie', price: 10, unit: '1 pie', image: 'https://www.samyaksupermart.com/cdn/shop/files/Addasubheading-2025-10-23T145851.239.png?v=1761211754' },
  { name: 'Eveready Battery 1 pie', price: 10, unit: '1 pie', image: 'https://static1.industrybuying.com/products/office-supplies/stationary-items/battery-cell/OFF.BAT.634273318_1753359574355.webp' },
  { name: 'Pen (Blue) 1 pie', price: 5, unit: '1 pie', image: 'https://5.imimg.com/data5/SELLER/Default/2025/8/540342807/BX/GB/AM/158151401/untitled-design-2025-08-28t184102-054.png' },
  { name: 'Shikhar (Gutka) 1 pie', price: 5, unit: '1 pie', image: 'https://pbs.twimg.com/media/GRKiksEWcAAXZPa.jpg' },
  { name: 'Vimal ( Gutka) 1 pie', price: 5, unit: '1 pie', image: 'https://image.cdn.shpy.in/309224/images-1722344344632.jpeg?format=webp' },
  { name: 'Kamla Pasand (Gutka) 1 pie', price: 6, unit: '1 pie', image: 'https://dms.mydukaan.io/original/jpeg/4454839/7a5c983f-0b6e-455a-9680-31ec5397c0b1/1621431559590-a115130e-d0db-46ed-af12-82cdae5b83a9.jpeg' },
  { name: 'Rajni Gandha (Gutka) 1 Pie', price: 25, unit: '1 pie', image: 'https://www.gutkhausa.com/cdn/shop/files/GUTKHAUSA.COM3.32.01PM_512x512.jpg?v=1769808763' },
  { name: 'Siggnature (Gutka) 1 pie', price: 15, unit: '1 pie', image: 'https://www.alchemytradex.com/cdn/shop/files/10_22973fd0-6bfd-47bd-98fd-723a95d01812.jpg?v=1721300025&width=1200' },
  { name: 'Charms (Singratte) 1 pie', price: 6, unit: '1 pie', image: 'https://tpackss.globaltobaccocontrol.org/sites/default/files/styles/500x500/public/pack_images/IND_CHI_L2_03_001_0_0_2_2.JPG?itok=U3VJ0JUJ' },
  { name: 'Gold Flake Mini (Superstar) Singratte 1 pie', price: 10, unit: '1 pie', image: 'https://dukaan.b-cdn.net/1000x1000/webp/2522321/38145666-f831-4fa9-9ee3-99d983cdfed9/1610725826138.jpeg' },
  { name: 'Gold Flake (Premium) Singratte 1 pie', price: 15, unit: '1 pie', image: 'https://encrypted-tbn0.gstatic.com/images?q=tn:ANd9GcRFKY0nSpU58wWp0a-tgvFfMXfH_N2C4xXneQ9cLXWp28O5RMS564mkagg&s=10' },
  { name: 'Gold Flake (Indie Mint) Singratte 1 pie', price: 15, unit: '1 pie', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCoQexfTJ74jBdvUzxY7ejACMd7rbQYhyeehzY2irGZLGRUifaCFgHsyw&s=10' },

  { name: 'Navrattan Mixture 210gm 1 packet', price: 50, unit: '210 gm', image: 'https://www.prinitifoods.com/images/navratan-mixture.png' },
  { name: 'Amul Rasogulla 500gm (7 Pie)', price: 115, unit: '500 gm', image: 'https://cdn.zeptonow.com/production/ik-seo/tr:w-312,ar-2400-2400,pr-true,f-auto,q-40/cms/product_variant/e1c449dd-9cf1-4c78-88b4-d80f0275bd14/Amul-Rasgulla-Tin-Soft-Juicy-Sweet.jpeg' },
  { name: 'Amul Gulab Jamun 500gm (8 Pie)', price: 140, unit: '500 gm', image: 'https://rukminim2.flixcart.com/image/480/480/xif0q/sweet-mithai/g/z/r/500-gulab-jamun-tin-1-gulab-jamun-amul-original-imahgvjyqh8tcmyr.jpeg?q=90' },
  { name: 'Mentos Chocholate 1 pie', price: 10, unit: '1 pie', image: 'https://storage.googleapis.com/shy-pub/330294/SKU-1875_0-1722426462570.png' },
  { name: 'Maggie 1 pie (35gm)', price: 7, unit: '35 gm', image: 'https://rdnstore.ranjitdebnath.com/images/products/37-maggi-chotu-2-minute-noodles-35g-1.jpg' },
  { name: 'Maggie 1 pie ( 70gm)', price: 15, unit: '70 gm', image: 'https://tiimg.tistatic.com/fp/1/007/883/70-gram-pack-size-yummy-and-tasty-delicious-maggie-noodles--463.jpg' },
  { name: 'Noodle Maggie 1 Packet', price: 5, unit: '1 packet', image: 'https://images.jdmagicbox.com/quickquotes/images_main/mapkin-noodles-2217199984-0h3rbi1m.jpg' },
  { name: 'Noodle Maggie 1 packet', price: 10, unit: '1 packet', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9yi2M-gO2UqhaJuQkP-jK4Te30UiSZiWy125gw6xWcVRBHhZ7x_-DImE&s=10' },
  { name: 'Dettol Powder to Liquid 1 Packet', price: 10, unit: '1 packet', image: 'https://5.imimg.com/data5/ECOM/Default/2024/5/422114073/KR/LR/FE/44622788/1691159064539-dettolhw10-500x500.jpeg' },
  { name: 'Goibibbo Huggies 1 packet (S size)', price: 10, unit: '1 packet', image: 'https://onemg.gumlet.io/l_watermark_346,w_480,h_480/a_ignore,w_480,h_480,c_fit,q_auto,f_auto/688be1bba1ad4c569d3c08ed455e7f90.jpg?dpr=3&format=auto&w=412' },
  { name: 'Goibibbo Huggies 1 packet (M size)', price: 13, unit: '1 packet', image: 'https://doobidoo.in/cdn/shop/files/WhatsApp_Image_2026-03-13_at_11.08.31_AM_2.jpg?v=1776319890&width=1445' },
  { name: 'Goibibbo Huggies 1 packet (L size)', price: 15, unit: '1 packet', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpQ-UH1TTkzEsgF4zpNme_X6GLqqpcIgFKgqViKkrQDpqD2rsnbAGFG2xf&s=10' },
  { name: 'Goibibbo Huggies 1 Bunddle (S size) 10 Pants', price: 99, unit: '10 pants', image: 'https://www.cureka.com/wp-content/uploads/2023/03/Layer_408-600x600.jpg' },
  { name: 'Goibibbo Huggies 1 Bunddle (L size) 14 Pants', price: 210, unit: '14 pants', image: 'https://doobidoo.in/cdn/shop/products/dbd_l-14.jpg?v=1665832137' },
];

function slugify(text = '') {
  return text
    .toString()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function ensureCategory(name?: string) {
  if (!name) return null;
  const slug = slugify(name);
  // try find
  const { data: existing } = await supabase.from('categories').select('*').eq('slug', slug).limit(1).maybeSingle();
  if (existing) return existing.id;

  const { data, error } = await supabase.from('categories').insert({ name, slug, description: null, image_url: null }).select().maybeSingle();
  if (error) {
    console.error('Category insert error', name, error);
    return null;
  }
  return data?.id ?? null;
}

async function upsertProduct(p: SeedProduct) {
  const categoryName = p.category || inferCategoryFromName(p.name);
  const category_id = await ensureCategory(categoryName ?? undefined);

  const slug = slugify(p.name);
  const payload = {
    category_id,
    name: p.name,
    slug,
    description: null,
    brand: 'Chaudhary General Store',
    price: Number(p.price),
    original_price: p.mrp ? Number(p.mrp) : null,
    discount_percent: 0,
    unit: p.unit ?? 'piece',
    weight: p.unit ?? null,
    stock_quantity: 100,
    min_stock_alert: 10,
    image_url: p.image ?? null,
    images: p.image ? [p.image] : [],
    tags: [],
    is_active: true,
    is_featured: false,
    is_flash_sale: false,
    gst_percent: 5,
  };

  const { data, error } = await supabase.from('products').upsert(payload, { onConflict: 'slug' }).select().limit(1).maybeSingle();
  if (error) {
    console.error('Upsert product error', p.name, error);
    return false;
  }
  return !!data;
}

function inferCategoryFromName(name: string) {
  const n = name.toLowerCase();
  if (n.includes('dal') || n.includes('daal') || n.includes('puls')) return 'Pulses & Dal';
  if (n.includes('chawal') || n.includes('rice')) return 'Rice';
  if (n.includes('oil') || n.includes('tel') || n.includes('mustard') || n.includes('refine')) return 'Oils';
  if (n.includes('soap') || n.includes('sabun') || n.includes('ponds') || n.includes('dettol') || n.includes('dove')) return 'Personal Care';
  if (n.includes('biscuit') || n.includes('cookie') || n.includes('cake') || n.includes('cream')) return 'Bakery & Sweets';
  if (n.includes('maggi') || n.includes('noodle') || n.includes('maggie')) return 'Instant Foods';
  if (n.includes('kurkure') || n.includes('chips') || n.includes('namkeen') || n.includes('mixture')) return 'Snacks';
  if (n.includes('tea') || n.includes('chaipatti') || n.includes('tea')) return 'Tea & Beverages';
  if (n.includes('detergent') || n.includes('surf') || n.includes('ghadi') || n.includes('wheel')) return 'Household';
  if (n.includes('battery') || n.includes('pen') || n.includes('broom') || n.includes('jhadu')) return 'Stationery';
  if (n.includes('gutka') || n.includes('tobacco') || n.includes('cigarette') || n.includes('gutka')) return 'Tobacco Products';
  if (n.includes('soap') || n.includes('cream') || n.includes('powder')) return 'Personal Care';
  return 'Other';
}

async function run() {
  console.log('Seeding products:', PRODUCTS.length);
  let success = 0;
  for (const p of PRODUCTS) {
    try {
      const ok = await upsertProduct(p);
      if (ok) success++;
    } catch (err) {
      console.error('Unexpected error while seeding', p.name, err);
    }
  }
  console.log(`Seed complete. Upserted ${success}/${PRODUCTS.length} products.`);
}

if (supabase && !process.argv.includes('--export-local')) {
  run().catch((e) => {
    console.error('Seed run failed', e);
    process.exit(1);
  });
}

if (process.argv.includes('--export-local')) {
  (async () => {
    const fs = await import('fs');
    const path = await import('path');
    const slugifyLocal = (text = '') =>
      text
        .toString()
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

    const now = new Date().toISOString();
    const seedPath = path.join(process.cwd(), 'data', 'local-seed.json');
    let seed: any = { categories: [], products: [] };
    try {
      seed = JSON.parse(fs.readFileSync(seedPath, 'utf8') as any);
    } catch (e) {}

    const categoryMap: Record<string, string> = {};
    (seed.categories || []).forEach((c: any) => (categoryMap[c.name] = c.id));

    const productsOut = PRODUCTS.map((p, idx) => {
      const slug = slugifyLocal(p.name);
      const categoryName = p.category || inferCategoryFromName(p.name);
      const category_id = categoryMap[categoryName] || categoryMap['Other'] || null;
      return {
        id: `p_${idx + 1}`,
        category_id,
        name: p.name,
        slug,
        description: null,
        brand: 'Chaudhary General Store',
        sku: null,
        price: Number(p.price),
        original_price: p.mrp ? Number(p.mrp) : null,
        discount_percent: 0,
        unit: p.unit || 'piece',
        weight: p.unit || null,
        stock_quantity: 100,
        min_stock_alert: 10,
        image_url: p.image || null,
        images: p.image ? [p.image] : [],
        tags: [],
        is_active: true,
        is_featured: false,
        is_flash_sale: false,
        flash_sale_price: null,
        flash_sale_ends_at: null,
        rating: 0,
        review_count: 0,
        gst_percent: 5,
        hsn_code: null,
        created_at: now,
        updated_at: now,
      };
    });

    seed.products = productsOut;
    fs.writeFileSync(seedPath, JSON.stringify(seed, null, 2), 'utf8');
    console.log(`Wrote ${productsOut.length} products to ${seedPath}`);
  })();
}
