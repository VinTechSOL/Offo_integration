# OFFO User Frontend

OFFO (Order Food From Office) is a cafeteria food-ordering platform designed for users inside offices, campuses, and other workplace environments.

The User Frontend allows customers to discover nearby cafeterias, browse menus, add food to cart, place instant or scheduled orders, make payments, track orders, manage their account, and raise support requests.

---

## Tech Stack

- React
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Axios
- Context API
- Zustand
- REST API

---

## Application Features

### Authentication

- User signup
- User login
- Mobile number based OTP verification
- Session restoration
- Access token handling
- Refresh token flow
- Logout/session expiry handling

### Location

Users select their working location before accessing cafeteria services.

Location hierarchy:

```text
City
  ↓
Campus / Company
  ↓
Building

The selected context is used to display cafeterias and menus relevant to the user.

Home

The Home screen provides:

Current location
Nearby cafeterias
Cafeteria open/closed status
Popular food items
Food item preview
Quick Add to Cart
Cart item count
Notifications
Bottom navigation
Change location

The Home screen retrieves cafeteria and menu information from the backend.

Cafeteria & Menu

Users can open a cafeteria and browse its available menu.

Menu functionality includes:

Menu categories
Food items
Food images
Prices
Vegetarian information
Add to cart
Increase/decrease quantity
Food item details
Cart access
Cart

The Cart screen allows users to:

View selected items
Change quantities
Remove items
Clear cart
View subtotal
View applicable fees
View GST
View final payable amount
Continue to payment
Schedule an order

The cart is synchronized with the backend.

Orders

Users can view their orders and order history.

Supported order states include:

CREATED
PREPARING
READY
PICKED_UP
COMPLETED
REJECTED
CANCELLED

The frontend periodically refreshes active orders to keep order status updated.

Order Types
Instant Order
Scheduled Order
Order Actions

Depending on the order state, users can:

View order details
Track order status
Edit eligible scheduled orders
Edit order items where supported
Download receipt
Submit feedback
Raise support requests
Payments

The frontend supports the OFFO payment flow through the backend payment APIs.

Payment-related screens include:

Payment
Payment status
Payment success
Payment failure

Payment states include:

PENDING
PAID
FAILED
REFUNDED
REFUND_PENDING

The frontend does not treat a payment as successful based only on the client-side response. Payment status is synchronized with the backend.

Receipt

Users can download a simple order receipt from their order history and successful-order screens.

The receipt contains information such as:

OFFO branding
Order ID
Order type
Cafeteria
Order date
Order status
Ordered items
Item amounts
Fees
GST
Total amount
Payment status
Transaction ID
FSSAI information

The receipt is generated using the existing order information available to the frontend.

Notifications

Users can access their notifications through the notification screen.

Notifications can include order-related updates and other in-app notifications provided by the backend.

Support

The User Frontend provides a support system for customers.

Users can:

Create support tickets
Select an issue type
Describe the issue
Attach supporting screenshots where supported
View existing tickets
Open individual ticket details
View ticket messages
Continue conversations on a ticket

Support is separate from the vendor-side support system.

Feedback

Users can submit feedback for eligible orders.

Feedback supports:

Food rating
App rating
Comments

For completed orders:

Food Rating
App Rating
Comments

For cancelled/rejected orders:

App Rating
Comments

The food-rating UI is hidden when food was not actually received.

Profile & Account

The frontend provides:

Profile
My Account
Account-related information
User context/location information
Navigation

The primary user navigation contains:

Home
My Orders
Help
Profile

Additional screens are accessed through the relevant application flows.

Add VITE_API_BASE_URL=http://localhost:8000 to .env (if not create .env)