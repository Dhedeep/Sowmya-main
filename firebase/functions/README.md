# Firebase Functions for Order Statistics

This directory contains Cloud Functions that automatically maintain order statistics to optimize database queries and improve performance.

## Functions

### Order Statistics Triggers

1. **onOrderCreated** - Triggered when a new order is created
2. **onOrderUpdated** - Triggered when an order status is updated
3. **onOrderDeleted** - Triggered when an order is deleted

### Scheduled Functions

1. **updateOrderStatisticsDaily** - Runs daily at midnight UTC to ensure statistics stay in sync

### HTTP Functions

1. **manualUpdateOrderStatistics** - Manual trigger to update statistics (useful for admin dashboard)

## Deployment

1. Install dependencies:
```bash
cd firebase/functions
npm install
```

2. Deploy functions:
```bash
firebase deploy --only functions
```

## Usage

### Automatic Updates

The statistics are automatically updated when orders are created, updated, or deleted through the Firestore triggers.

### Manual Updates

You can manually trigger a statistics update by calling the HTTP function:

```javascript
// In your client code
const updateStats = async () => {
  try {
    const response = await fetch('https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/manualUpdateOrderStatistics', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const result = await response.json();
    console.log('Statistics updated:', result);
  } catch (error) {
    console.error('Error updating statistics:', error);
  }
};
```

### Client-Side Integration

The client-side code in `src/firebase/services/orderService.js` has been updated to:

1. First try to read from the `statistics/orders` document
2. Fall back to calculating statistics if the document doesn't exist
3. Asynchronously update statistics when orders change

## Data Structure

The statistics document is stored at `statistics/orders` with the following structure:

```json
{
  "total": 150,
  "processing": 25,
  "shipped": 40,
  "delivered": 75,
  "cancelled": 10,
  "totalRevenue": 15000.00,
  "lastUpdated": "2023-12-02T17:10:00.000Z"
}
```

## Benefits

1. **Reduced Database Reads**: Instead of fetching all orders to calculate statistics, we read a single document
2. **Improved Performance**: Admin dashboard loads much faster
3. **Lower Costs**: Fewer document reads reduces Firebase usage costs
4. **Real-time Updates**: Statistics stay up-to-date with automatic triggers
5. **Reliability**: Daily scheduled function ensures data consistency

## Monitoring

You can monitor the functions in the Firebase Console:

1. Go to Firebase Console → Functions
2. Check logs for any errors
3. Monitor execution metrics

## Troubleshooting

If statistics seem incorrect:

1. Check the logs in Firebase Console for any errors
2. Manually trigger the update using the HTTP function
3. Verify that the triggers are properly deployed
4. Check that the statistics document exists at `statistics/orders`