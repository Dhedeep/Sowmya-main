# Firebase Storage Setup Guide

## Issue
The admin dashboard is unable to upload images because Firebase Storage has not been initialized for the project.

## Solution

### Step 1: Set up Firebase Storage in the Console
1. Go to the Firebase Console: https://console.firebase.google.com/project/test-46178/storage
2. Click **"Get Started"** button
3. Choose **"Start in test mode"** (for now)
4. Select a location (choose the one closest to your users, e.g., `us-central1`)
5. Click **"Done"**

### Step 2: Deploy Storage Rules
After setting up Storage in the console, run:
```bash
firebase deploy --only storage
```

### Step 3: Test the Image Upload
1. Start the development server: `npm run dev`
2. Log in as admin ()
3. Go to Admin Dashboard
4. Click on "Products" tab
5. Click "Add Product"
6. Fill in the product details
7. Upload images using the image upload area
8. Click "Add Product" to save

## Code Changes Made

### 1. Fixed AdminDashboardPage.jsx
- Improved error handling in `handleProductSubmit` function
- Added proper array handling for sizes and colors
- Added error alerts for better debugging

### 2. Updated Storage Rules
- Added admin check function to storage.rules
- Restricted write access to admin users only
- Public read access remains for product images

### 3. Fixed Image Deletion in productService.js
- Fixed URL parsing for image deletion
- Properly extracts path from full Firebase Storage URLs

## Troubleshooting

### If image upload still fails:
1. Check browser console for errors
2. Verify you're logged in as admin@sowmyaselections.com
3. Ensure Firebase Storage is properly set up in the console
4. Check that storage rules are deployed correctly

### Common Error Messages:
- `storage/unauthorized`: Storage rules don't allow the operation
- `storage/unknown`: Storage bucket doesn't exist (needs to be set up in console)
- `permission-denied`: User doesn't have admin privileges

## Next Steps
After setting up Storage, consider:
1. Moving from test mode to production rules
2. Setting up image optimization
3. Adding image size limits
4. Implementing image compression