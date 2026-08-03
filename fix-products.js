import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc, addDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyByrUein4m5p3woiXmGXucMM-jF18Ym2XI",
  authDomain: "sowmya-selections.firebaseapp.com",
  projectId: "sowmya-selections",
  storageBucket: "sowmya-selections.firebasestorage.app",
  messagingSenderId: "315262534086",
  appId: "1:315262534086:web:46498a6ecb87d7907532c7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const PRODUCTS = [
  {
    id: 1,
    name: "Classic Crew Neck Tee",
    category: 'T-Shirts',
    price: 899,
    originalPrice: 1299,
    images: ["https://picsum.photos/seed/product1/800/800", "https://picsum.photos/seed/product1b/800/800"],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'White', 'Navy'],
    description: "A timeless classic, our crew neck tee is crafted from ultra-soft cotton for everyday comfort. Perfect for layering or wearing on its own.",
    fabricDetails: "We use premium 240 GSM, 100% super-combed cotton fabric. It is pre-shrunk and bio-washed for a soft feel and long-lasting quality."
  },
  {
    id: 2,
    name: "Urban Explorer Hoodie",
    category: 'Hoodies',
    price: 1999,
    originalPrice: 2499,
    images: ["https://picsum.photos/seed/product2/800/800", "https://picsum.photos/seed/product2b/800/800"],
    sizes: ['M', 'L', 'XL'],
    colors: ['Charcoal', 'Olive Green'],
    description: "Stay warm and stylish with our Urban Explorer Hoodie. It features a cozy fleece lining, a spacious kangaroo pocket, and a modern fit.",
    fabricDetails: "We use premium 320 GSM, cotton-poly blend fleece. It is brushed for extra softness and warmth, ensuring comfort in cooler weather."
  },
  {
    id: 3,
    name: "Oversized Graphic Tee",
    category: 'Oversized T-Shirts',
    price: 1299,
    originalPrice: 1799,
    images: ["https://picsum.photos/seed/product3/800/800", "https://picsum.photos/seed/product3b/800/800"],
    sizes: ['S/M', 'L/XL'],
    colors: ['Beige', 'Washed Black'],
    description: "Make a statement with our Oversized Graphic Tee. The relaxed, drop-shoulder fit provides a modern silhouette, perfect for a streetwear look.",
    fabricDetails: "We use premium 240 GSM, 100% heavyweight cotton. The fabric is durable yet breathable, providing a structured drape and premium feel."
  },
  {
    id: 4,
    name: "Minimalist Pocket Tee",
    category: 'T-Shirts',
    price: 999,
    originalPrice: 1399,
    images: ["https://picsum.photos/seed/product4/800/800", "https://picsum.photos/seed/product4b/800/800"],
    sizes: ['S', 'M', 'L'],
    colors: ['Heather Grey', 'White'],
    description: "Simple, clean, and versatile. Our Minimalist Pocket Tee is an elevated basic that pairs with anything in your wardrobe.",
    fabricDetails: "We use premium 220 GSM, cotton-modal blend for an exceptionally soft and smooth texture with excellent drape."
  },
  {
    id: 5,
    name: "Street-Style Pullover Hoodie",
    category: 'Hoodies',
    price: 2199,
    originalPrice: 2799,
    images: ["https://picsum.photos/seed/product5/800/800", "https://picsum.photos/seed/product5b/800/800"],
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'Red'],
    description: "Designed for the streets, this pullover hoodie combines comfort with a bold look. Featuring a printed back and a comfortable fit.",
    fabricDetails: "We use premium 320 GSM, cotton-poly blend fleece. It is brushed for extra softness and warmth, ensuring comfort in cooler weather."
  },
  {
    id: 6,
    name: "Vintage Wash Oversized Tee",
    category: 'Oversized T-Shirts',
    price: 1399,
    originalPrice: 1899,
    images: ["https://picsum.photos/seed/product6/800/800", "https://picsum.photos/seed/product6b/800/800"],
    sizes: ['S/M', 'L/XL'],
    colors: ['Faded Blue', 'Acid Wash Grey'],
    description: "Get that perfect lived-in feel from day one. Our Vintage Wash tee has a unique, faded look and an ultra-comfortable oversized fit.",
    fabricDetails: "We use premium 240 GSM, 100% heavyweight cotton. Each garment is individually dyed and washed for a one-of-a-kind finish."
  },
  {
    id: 7,
    name: "Premium Cotton Polo",
    category: 'T-Shirts',
    price: 1199,
    originalPrice: 1699,
    images: ["https://picsum.photos/seed/product7/800/800", "https://picsum.photos/seed/product7b/800/800"],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Navy', 'White', 'Black', 'Maroon'],
    description: "Classic polo shirt with a modern twist. Features a comfortable fit and premium cotton fabric.",
    fabricDetails: "We use premium 220 GSM, 100% combed cotton with a pique knit texture for breathability and comfort."
  },
  {
    id: 8,
    name: "Athletic Performance Tee",
    category: 'T-Shirts',
    price: 1099,
    originalPrice: 1499,
    images: ["https://picsum.photos/seed/product8/800/800", "https://picsum.photos/seed/product8b/800/800"],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Navy', 'Grey', 'White'],
    description: "Performance-driven tee designed for active lifestyles. Moisture-wicking and quick-drying fabric.",
    fabricDetails: "We use premium 200 GSM, polyester-cotton blend with moisture-wicking technology for optimal performance."
  },
  {
    id: 9,
    name: "Vintage Logo Hoodie",
    category: 'Hoodies',
    price: 2299,
    originalPrice: 2899,
    images: ["https://picsum.photos/seed/product9/800/800", "https://picsum.photos/seed/product9b/800/800"],
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: ['Vintage Black', 'Heather Grey', 'Navy'],
    description: "Retro-inspired hoodie with vintage logo print. Perfect for a nostalgic streetwear look.",
    fabricDetails: "We use premium 320 GSM, cotton-poly blend fleece with a vintage wash for that perfect worn-in feel."
  },
  {
    id: 10,
    name: "Zip-Up Sports Hoodie",
    category: 'Hoodies',
    price: 2499,
    originalPrice: 3199,
    images: ["https://picsum.photos/seed/product10/800/800", "https://picsum.photos/seed/product10b/800/800"],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'Navy', 'Red', 'Grey'],
    description: "Full-zip hoodie perfect for layering. Features side pockets and adjustable hood.",
    fabricDetails: "We use premium 300 GSM, cotton-poly blend with anti-pill finish for long-lasting wear."
  },
  {
    id: 11,
    name: "Artistic Print Oversized Tee",
    category: 'Oversized T-Shirts',
    price: 1499,
    originalPrice: 1999,
    images: ["https://picsum.photos/seed/product11/800/800", "https://picsum.photos/seed/product11b/800/800"],
    sizes: ['S/M', 'L/XL'],
    colors: ['White', 'Black', 'Cream'],
    description: "Stand out with our artistic print oversized tee. Features exclusive artwork and a relaxed fit.",
    fabricDetails: "We use premium 240 GSM, 100% heavyweight cotton with high-quality screen print that lasts."
  },
  {
    id: 12,
    name: "Tie-Dye Oversized Tee",
    category: 'Oversized T-Shirts',
    price: 1599,
    originalPrice: 2099,
    images: ["https://picsum.photos/seed/product12/800/800", "https://picsum.photos/seed/product12b/800/800"],
    sizes: ['S/M', 'L/XL'],
    colors: ['Multi Tie-Dye', 'Blue Tie-Dye', 'Pink Tie-Dye'],
    description: "Unique tie-dye oversized tee with vibrant colors. Each piece is one-of-a-kind.",
    fabricDetails: "We use premium 240 GSM, 100% cotton with hand-dyed tie-dye patterns for a unique look."
  }
];

async function fixProducts() {
  try {
    console.log('Signing in...');
    await signInWithEmailAndPassword(auth, 'admin@sowmyaselections.com', 'admin123456');
    console.log('Signed in successfully');

    console.log('Getting all products...');
    const productsRef = collection(db, 'products');
    const querySnapshot = await getDocs(productsRef);

    console.log(`Found ${querySnapshot.docs.length} products to delete`);

    // Delete all existing products
    for (const docSnapshot of querySnapshot.docs) {
      await deleteDoc(docSnapshot.ref);
      console.log(`Deleted product: ${docSnapshot.id}`);
    }

    console.log('All existing products deleted');

    // Add new products with unique IDs
    for (const product of PRODUCTS) {
      const { id, ...productData } = product;
      const newProduct = {
        ...productData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(productsRef, newProduct);
      console.log(`Added product: ${product.name} with ID: ${docRef.id}`);
    }

    console.log('All products added successfully');
    console.log('Process completed!');

  } catch (error) {
    console.error('Error fixing products:', error);
  }
}

fixProducts();