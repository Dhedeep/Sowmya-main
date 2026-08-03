# Admin Dashboard Setup Guide

This guide will help you set up and use the admin dashboard for the Sowmya e-commerce application.

## Features Implemented

### Admin Dashboard
- **Product Management**: Full CRUD operations (Create, Read, Update, Delete)
- **Image Upload**: Support for multiple product images with Firebase Storage
- **Order Management**: View all orders and update their status
- **Statistics Dashboard**: Real-time stats for products, orders, and revenue
- **Role-based Access**: Admin-only access with authentication

### Firebase Integration
- **Authentication**: User authentication with admin role management
- **Firestore**: Database for products, orders, and user data
- **Storage**: Image storage for product photos

## Setup Instructions

### 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable the following services:
   - **Authentication**: Enable Email/Password sign-in method
   - **Firestore Database**: Create a new database in test mode
   - **Storage**: Enable Firebase Storage for file uploads

### 2. Update Firebase Configuration

Update the Firebase configuration in `src/firebase/config.js` with your project details:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 3. Initialize Admin Account

The application includes an initialization script that creates an admin user:

- Primary Admin Email: `admin@sowmyaselections.com`
- **Password**: sowmya@123
- **Role**: Admin

To initialize the data:
1. Run the application
2. The initialization script will automatically create the admin account and sample products

### 4. Accessing the Admin Dashboard

1. Start the application: `npm run dev`
2. Log in with the admin credentials
3. Click on the settings icon in the header to access the Admin Panel
4. Alternatively, navigate directly to `/admin` route

## Admin Dashboard Features

### Dashboard Tab
- Overview statistics
- Recent orders
- Recent products
- Quick insights

### Products Tab
- **View All Products**: Grid view with search and filtering
- **Add New Product**: Form with image upload
- **Edit Product**: Modify existing product details
- **Delete Product**: Remove products with confirmation
- **Image Management**: Upload and manage product images

### Orders Tab
- **View All Orders**: Complete order list
- **Update Status**: Change order status (Processing → Shipped → Delivered)
- **Order Details**: View detailed order information
- **Search & Filter**: Find orders by ID or status

## Product Management

### Adding a New Product
1. Go to Admin Dashboard → Products tab
2. Click "Add Product"
3. Fill in product details:
   - Name, Category, Price, Original Price
   - Sizes (comma-separated)
   - Colors (comma-separated)
   - Description and Fabric Details
   - Upload product images
4. Click "Add Product" to save

### Editing a Product
1. Click the edit icon on any product
2. Modify the desired fields
3. Upload additional images if needed
4. Click "Update Product" to save changes

### Deleting a Product
1. Click the trash icon on any product
2. Confirm deletion in the popup
3. Product and all associated images will be removed

## Order Management

### Updating Order Status
1. Go to Admin Dashboard → Orders tab
2. Use the dropdown in the Status column
3. Select new status:
   - **Processing**: Order received, being prepared
   - **Shipped**: Order dispatched with tracking
   - **Delivered**: Order successfully delivered
   - **Cancelled**: Order cancelled (with reason)

### Order Status Flow
```
Processing → Shipped → Delivered
    ↓
  Cancelled
```

## Security Features

### Role-Based Access
- Only users with `isAdmin: true` in their Firestore document can access admin features
- Regular users cannot access admin routes
- Admin status is verified on each admin page load

### Authentication
- Firebase Authentication handles user login/logout
- Session persistence across browser refreshes
- Automatic redirect for unauthorized access attempts

## File Structure

```
src/
├── firebase/
│   ├── config.js           # Firebase configuration
│   ├── services/
│   │   ├── authService.js   # Authentication functions
│   │   ├── productService.js # Product CRUD operations
│   │   └── orderService.js  # Order management functions
│   └── initData.js         # Database initialization
├── contexts/
│   └── AdminContext.jsx    # Admin state management
└── pages/
    └── AdminDashboardPage.jsx # Main admin interface
```

## Troubleshooting

### Common Issues

1. **Admin Access Denied**
   - Ensure user has `isAdmin: true` in Firestore
   - Check Firebase Authentication is properly configured
   - Verify email and password are correct

2. **Image Upload Fails**
   - Check Firebase Storage rules allow uploads
   - Verify storage bucket configuration
   - Check file size limits

3. **Products Not Loading**
   - Verify Firestore database rules
   - Check network connectivity
   - Ensure Firebase config is correct

4. **Order Status Updates Not Saving**
   - Check Firestore write permissions
   - Verify user has admin privileges
   - Check browser console for errors

### Firebase Security Rules

#### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Only admins can write products
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    
    // Users can read their own orders, admins can read all
    match /orders/{orderId} {
      allow read: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true);
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
  }
}
```

#### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Anyone can read images
    match /products/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
  }
}
```

## Development Notes

### Adding New Admin Features
1. Create service functions in appropriate `src/firebase/services/` file
2. Add UI components to `AdminDashboardPage.jsx`
3. Update security rules if needed
4. Test with admin account

### Customizing the Dashboard
- Modify `AdminDashboardPage.jsx` for layout changes
- Update `AdminContext.jsx` for state management
- Add new tabs in the dashboard navigation

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify Firebase configuration is correct
3. Ensure all security rules are properly set
4. Test with the provided admin account

## Next Steps

Potential enhancements:
- **Bulk Operations**: Select and update multiple products/orders
- **Analytics Dashboard**: Advanced sales and user analytics
- **Inventory Management**: Stock tracking and alerts
- **Email Notifications**: Automated order status emails
- **Export Features**: CSV/Excel export for orders and products