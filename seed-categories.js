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

const CATEGORIES = [
    {
        name: "Silk Sarees",
        subcategories: ["Chennuri Silk", "Kalamkari Silk", "Matka Silk"]
    },
    {
        name: "Kota Sarees",
        subcategories: ["Kalamkari Kota"]
    },
    {
        name: "Cotton Sarees",
        subcategories: ["Vasundhara Cotton"]
    },
    {
        name: "Dress Material",
        subcategories: ["Kanchi Cotton"]
    }
];

async function seedCategories() {
    try {
        console.log('Signing in...');
        await signInWithEmailAndPassword(auth, 'admin@sowmyaselections.com', 'admin123456');
        console.log('Signed in successfully');

        const categoriesRef = collection(db, 'categories');

        // Delete existing categories
        const querySnapshot = await getDocs(categoriesRef);
        console.log(`Deleting ${querySnapshot.docs.length} existing categories...`);
        for (const docSnapshot of querySnapshot.docs) {
            await deleteDoc(docSnapshot.ref);
        }
        console.log('Existing categories deleted.');

        // Add new categories
        console.log('Adding new categories...');
        for (const cat of CATEGORIES) {
            const mainCatDoc = await addDoc(categoriesRef, {
                name: cat.name,
                parentId: null,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            console.log(`Added Main Category: ${cat.name} [ID: ${mainCatDoc.id}]`);

            for (const sub of cat.subcategories) {
                const subCatDoc = await addDoc(categoriesRef, {
                    name: sub,
                    parentId: mainCatDoc.id,
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                console.log(`  Added Subcategory: ${sub} [ID: ${subCatDoc.id}]`);
            }
        }

        console.log('Category seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding categories:', error);
        process.exit(1);
    }
}

seedCategories();
