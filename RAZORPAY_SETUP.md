# Razorpay Integration Setup

## Prerequisites

1. Create a Razorpay account at https://razorpay.com
2. Get your API keys from Razorpay Dashboard

## Environment Variables

### Frontend (`.env.local`)
Add the following to your `.env.local` file:

```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id_here
```

### Backend (`.env`)
Add the following to your backend `.env` file:

```env
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
```

**Important:**
- Frontend only needs the **Key ID** (public key)
- Backend needs both **Key ID** and **Key Secret** (private key)
- Never expose the Key Secret in frontend code!

## Getting Razorpay Keys

1. Log in to your Razorpay Dashboard
2. Go to Settings → API Keys
3. Generate Test/Live keys as needed
4. Copy the Key ID and add it to your `.env.local` file

## Testing

For testing, use Razorpay's test mode:
- Test cards: https://razorpay.com/docs/payments/payments/test-card-details/
- Test UPI: success@razorpay

## Payment Flow

1. User fills shipping address on checkout page
2. Order is created in the database
3. Razorpay payment modal opens
4. User completes payment
5. Payment is verified with backend
6. Order status is updated to "paid"
7. Cart is cleared
8. User is redirected to order confirmation page

## Security Notes

- Never expose Razorpay Key Secret in frontend code
- Always verify payment signatures on the backend
- Use HTTPS in production
- Implement proper error handling

