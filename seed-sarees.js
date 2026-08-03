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

const SAREES = [
    {
        name: "Premium Chennuri Silk Saree with Handblock Prints",
        category: "Silk Sarees",
        subcategory: "Chennuri Silk",
        price: 2000,
        originalPrice: 2300,
        stock: 10,
        featured: true,
        images: [
            "/images/01_ Chennuri Silk Special Handblock Prints - Yellow-/01_ Chennuri Silk Special Handblock Prints - Yellow/Chennuri Silk Yellow 600x800 - 01.jpg",
            "/images/01_ Chennuri Silk Special Handblock Prints - Yellow-/01_ Chennuri Silk Special Handblock Prints - Yellow/Chennuri Silk Yellow 600x800 - 02.jpg",
            "/images/01_ Chennuri Silk Special Handblock Prints - Yellow-/01_ Chennuri Silk Special Handblock Prints - Yellow/Chennuri Silk Yellow 600x800 - 03.jpg",
            "/images/01_ Chennuri Silk Special Handblock Prints - Yellow-/01_ Chennuri Silk Special Handblock Prints - Yellow/Chennuri Silk Yellow 600x800 - 04.jpg"
        ],
        sizes: ["Standard (5.5m)"],
        colors: ["Yellow"],
        description: "Experience the elegance of pure craftsmanship with this Premium Chennuri Silk Saree, beautifully designed with authentic handblock prints using natural organic dyes. This saree features thoughtfully curated patterns without god or animal motifs, making it suitable for all occasions and preferences. The rich silk texture ensures a soft, graceful drape that enhances your traditional look effortlessly. Perfect for festive wear, office occasions, cultural events, and elegant gatherings.",
        fabricDetails: "Fabric: Premium Chennuri Silk\nPrint: Traditional Handblock Prints\nDye: Natural Organic Dyes\nMotifs: No God or Animal Motifs\nBlouse: Running Blouse (Unstitched)\nSaree Length: 5.5 Meters\nWidth: 46 Inches\nTexture: Soft & Lightweight\nOccasion: Festive | Traditional | Elegant Wear"
    },
    {
        name: "Black & Green Patly Style Chennuri Kalamkari Silk Saree",
        category: "Silk Sarees",
        subcategory: "Kalamkari Silk",
        price: 1600,
        originalPrice: 1800,
        stock: 8,
        featured: true,
        images: [
            "/images/02_ Chennuri silk Black & Green/02_ Chennuri silk Black & Green 600x800/Chennuri silk Black & Green 600x800 01.jpg",
            "/images/02_ Chennuri silk Black & Green/02_ Chennuri silk Black & Green 600x800/Chennuri silk Black & Green 600x800 02.jpg",
            "/images/02_ Chennuri silk Black & Green/02_ Chennuri silk Black & Green 600x800/Chennuri silk Black & Green 600x800 03.jpg",
            "/images/02_ Chennuri silk Black & Green/02_ Chennuri silk Black & Green 600x800/Chennuri silk Black & Green 600x800 04.jpg"
        ],
        sizes: ["Standard (5.5m)"],
        colors: ["Black & Green"],
        description: "Elevate your traditional wardrobe with this elegant Black & Green Patly Style Chennuri Kalamkari Silk Saree, designed with classic Kalamkari patterns that reflect timeless artistry. The rich black and green combination creates a bold yet graceful festive look. Crafted in premium Chennuri silk, this saree offers a soft drape and lightweight comfort, making it ideal for celebrations, family functions, and cultural occasions.",
        fabricDetails: "Fabric: Patly Style Chennuri Kalamkari Silk\nColor Combination: Black & Green\nBlouse: Running Blouse (Unstitched)\nSaree Length: 5.5 Meters\nWidth: 46 Inches\nTexture: Soft & Lightweight\nOccasion: Festive | Traditional | Elegant Wear"
    },
    {
        name: "Lavender & Black Patly Style Chennuri Kalamkari Silk Saree",
        category: "Silk Sarees",
        subcategory: "Kalamkari Silk",
        price: 1600,
        originalPrice: 1800,
        stock: 12,
        featured: true,
        images: [
            "/images/03_ Chennuri silk Black & LAVENDER/03_ Chennuri silk Black & LAVENDER 600x800/LAVENDER  600x800  - 1.jpg",
            "/images/03_ Chennuri silk Black & LAVENDER/03_ Chennuri silk Black & LAVENDER 600x800/LAVENDER  600x800  - 2.jpg",
            "/images/03_ Chennuri silk Black & LAVENDER/03_ Chennuri silk Black & LAVENDER 600x800/LAVENDER  600x800  - 3.jpg"
        ],
        sizes: ["Standard (5.5m)"],
        colors: ["Lavender & Black"],
        description: "Add a graceful touch to your traditional collection with this elegant Lavender & Black Patly Style Chennuri Kalamkari Silk Saree. The soft lavender shade beautifully contrasts with the rich black Kalamkari printed pallu and border, creating a refined and festive look. Crafted in premium Chennuri silk, this saree offers a smooth texture and elegant drape, making it perfect for celebrations, family gatherings, and cultural occasions.",
        fabricDetails: "Fabric: Patly Style Chennuri Kalamkari Silk\nColor Combination: Lavender & Black\nBlouse: Running Blouse (Unstitched)\nSaree Length: 5.5 Meters\nWidth: 46 Inches\nTexture: Soft & Lightweight\nOccasion: Festive | Traditional | Elegant Wear"
    },
    {
        name: "Black Kota Kalamkari Saree",
        category: "Kota Sarees",
        subcategory: "Kalamkari Kota",
        price: 1250,
        originalPrice: 1500,
        stock: 15,
        featured: true,
        images: [
            "/images/04_ Black cotton Kota/04_ Black cotton Kota/black cotton kota website  600x800 01.jpg",
            "/images/04_ Black cotton Kota/04_ Black cotton Kota/black cotton kota website  600x800 02.jpg",
            "/images/04_ Black cotton Kota/04_ Black cotton Kota/black cotton kota website  600x800 03.jpg",
            "/images/04_ Black cotton Kota/04_ Black cotton Kota/black cotton kota website  600x800 04.jpg"
        ],
        sizes: ["Standard (5.5m)"],
        colors: ["Black"],
        description: "Embrace effortless elegance with this Black Kota Kalamkari Saree, designed for women who appreciate lightweight comfort with traditional charm. Crafted in breathable Kota fabric and adorned with classic Kalamkari prints, this saree offers a soft texture and easy drape, making it ideal for daily wear, office wear, and casual traditional occasions. Its timeless black shade enhances the intricate detailing, creating a graceful and versatile look suitable for multiple occasions.",
        fabricDetails: "Fabric: Kota with Kalamkari Prints\nColor: Black\nBlouse: Running Blouse (Unstitched)\nSaree Length: 5.5 Meters\nWidth: 46 Inches\nTexture: Lightweight & Breathable\nOccasion: Office Wear | Daily Wear | Traditional Gatherings"
    },
    {
        name: "Kota Kalamkari Lotus Design Floral Saree",
        category: "Kota Sarees",
        subcategory: "Kalamkari Kota",
        price: 1700,
        originalPrice: 2000,
        stock: 7,
        featured: true,
        images: [
            "/images/05_ kota kalamkari lotus/05_ kota kalamkari lotus 600x800/lightweight kota kalamkari lotus 600x800 - 01.jpg",
            "/images/05_ kota kalamkari lotus/05_ kota kalamkari lotus 600x800/lightweight kota kalamkari lotus 600x800 - 02.jpg",
            "/images/05_ kota kalamkari lotus/05_ kota kalamkari lotus 600x800/lightweight kota kalamkari lotus 600x800 - 03.jpg",
            "/images/05_ kota kalamkari lotus/05_ kota kalamkari lotus 600x800/lightweight kota kalamkari lotus 600x800 - 04.jpg"
        ],
        sizes: ["Standard (4.4m)"],
        colors: ["Multicolor Floral"],
        description: "Add timeless elegance to your collection with this Kota Kalamkari Lotus Design Floral Saree, beautifully crafted with intricate lotus and floral motifs inspired by traditional Kalamkari art. The vibrant detailing combined with breathable Kota fabric creates a graceful and lightweight drape, making it ideal for festive gatherings, cultural occasions, and elegant daytime wear.",
        fabricDetails: "Fabric: Kota with Kalamkari Floral Print\nDesign: Lotus & Traditional Floral Motifs\nBlouse: Running Blouse (Unstitched)\nSaree Length: 4.4 Meters\nWidth: 46 Inches\nTexture: Lightweight & Breathable\nOccasion: Festive | Traditional | Elegant Wear"
    },
    {
        name: "Pink Pure Vasundhara Cotton Hand Block & Hand Print Saree",
        category: "Cotton Sarees",
        subcategory: "Vasundhara Cotton",
        price: 1450,
        originalPrice: 1850,
        stock: 20,
        featured: true,
        images: [
            "/images/06 Pink Pure Vasundhara Cotton Hand Block & Hand Print Saree/06 Pink Pure Vasundhara Cotton Hand Block & Hand Print Saree/Pink Pure Vasundhara Cotton 600x800 - 01.jpg",
            "/images/06 Pink Pure Vasundhara Cotton Hand Block & Hand Print Saree/06 Pink Pure Vasundhara Cotton Hand Block & Hand Print Saree/Pink Pure Vasundhara Cotton 600x800 - 02.jpg",
            "/images/06 Pink Pure Vasundhara Cotton Hand Block & Hand Print Saree/06 Pink Pure Vasundhara Cotton Hand Block & Hand Print Saree/Pink Pure Vasundhara Cotton 600x800 - 03.jpg",
            "/images/06 Pink Pure Vasundhara Cotton Hand Block & Hand Print Saree/06 Pink Pure Vasundhara Cotton Hand Block & Hand Print Saree/Pink Pure Vasundhara Cotton 600x800 - 04.jpg"
        ],
        sizes: ["Standard (5.5m)"],
        colors: ["Pink"],
        description: "Fall in love with this elegant Pink Pure Vasundhara Cotton Saree, crafted in fine 120-count cotton with authentic hand block and hand print work. The soft pink shade adds a graceful and feminine touch, while the lightweight fabric ensures all-day comfort. Perfect for festive wear, office styling, and classy everyday looks, this saree blends tradition with modern elegance effortlessly.",
        fabricDetails: "Fabric: Pure Vasundhara Cotton (120 Count)\nColor: Pink\nWork: Hand Block & Hand Print\nBlouse: Running Blouse (Unstitched)\nSaree Length: 5.5 Meters\nWidth: 46 Inches\nTexture: Lightweight & Breathable\nOccasion: Office Wear | Festive | Daily Elegant Wear"
    },
    {
        name: "Yellow & White Matka Silk Saree",
        category: "Silk Sarees",
        subcategory: "Matka Silk",
        price: 2200,
        originalPrice: 2600,
        stock: 5,
        featured: true,
        images: [
            "/images/07_ Yellow Matka Silk-/07_ Yellow Matka Silk/Yellow Matka Silk 600x800 - 01.jpg",
            "/images/07_ Yellow Matka Silk-/07_ Yellow Matka Silk/Yellow Matka Silk 600x800 - 02.jpg",
            "/images/07_ Yellow Matka Silk-/07_ Yellow Matka Silk/Yellow Matka Silk 600x800 - 03.jpg",
            "/images/07_ Yellow Matka Silk-/07_ Yellow Matka Silk/Yellow Matka Silk 600x800 - 04.jpg",
            "/images/07_ Yellow Matka Silk-/07_ Yellow Matka Silk/Yellow Matka Silk 600x800 - 05.jpg"
        ],
        sizes: ["Standard (5.5m)"],
        colors: ["Yellow & White"],
        description: "Brighten your wardrobe with this elegant Yellow & White Matka Silk Saree, beautifully designed with graceful floral prints that enhance its traditional charm. The vibrant yellow pallu paired with a subtle white body creates a refreshing and festive look. Crafted in rich Matka silk, this saree offers a slightly textured finish with a graceful drape, making it perfect for festive occasions, family gatherings, and elegant celebrations.",
        fabricDetails: "Fabric: Premium Matka Silk\nColor Combination: Yellow & White\nDesign: Floral Printed Border & Pallu\nBlouse: Running Blouse (Unstitched)\nSaree Length: 5.5 Meters\nWidth: 46 Inches\nTexture: Soft with Natural Silk Finish\nOccasion: Festive | Traditional | Elegant Wear"
    },
    {
        name: "Kanchi Cotton Dress Material – Premium Handloom Collection",
        category: "Dress Material",
        subcategory: "Kanchi Cotton",
        price: 1450,
        originalPrice: 1650,
        stock: 0,
        featured: true,
        images: [
            "/images/08_ (Sold Out) Kanchi Cotton Dress/08_ (Sold Out) Kanchi Cotton Dress/kanchi cotton Dress materials 600x800 01.jpg",
            "/images/08_ (Sold Out) Kanchi Cotton Dress/08_ (Sold Out) Kanchi Cotton Dress/kanchi cotton Dress materials 600x800 02.jpg",
            "/images/08_ (Sold Out) Kanchi Cotton Dress/08_ (Sold Out) Kanchi Cotton Dress/kanchi cotton Dress materials 600x800 03.jpg"
        ],
        sizes: ["Dress Material (3m)"],
        colors: ["Kanchi Cotton"],
        description: "Experience comfort and elegance with this beautifully woven Kanchi Cotton Dress Material, crafted from premium handloom cotton. Designed for effortless styling, this fabric offers a soft texture, breathable comfort, and timeless appeal — perfect for daily wear, office looks, and elegant casual outfits. A classic addition to your wardrobe that blends tradition with modern simplicity.",
        fabricDetails: "Fabric: Premium Handloom Cotton\nType: Kanchi Cotton Dress Material\nLength: 3 Meters\nTexture: Soft & Breathable\nOccasion: Daily Wear | Office Wear | Elegant Casual"
    }
];

async function seedProducts() {
    try {
        console.log('Signing in...');
        await signInWithEmailAndPassword(auth, 'admin@sowmyaselections.com', 'admin123456');
        console.log('Signed in successfully');

        const productsRef = collection(db, 'products');

        // Optional: Delete existing placeholder products
        const querySnapshot = await getDocs(productsRef);
        console.log(`Deleting ${querySnapshot.docs.length} existing products...`);
        for (const docSnapshot of querySnapshot.docs) {
            await deleteDoc(docSnapshot.ref);
        }
        console.log('Existing products deleted.');

        // Add new products
        console.log('Adding new sarees...');
        for (const saree of SAREES) {
            const newProduct = {
                ...saree,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const docRef = await addDoc(productsRef, newProduct);
            console.log(`Added: ${saree.name} [ID: ${docRef.id}]`);
        }

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding products:', error);
        process.exit(1);
    }
}

seedProducts();
