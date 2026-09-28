# OFFO Vendor Frontend

OFFO (Order Food From Office) is a cafeteria food-ordering platform designed for cafeterias operating inside offices, campuses, hospitals, and other workplace environments.

The Vendor Frontend is used by cafeteria/vendor staff to manage incoming orders, scheduled orders, menu items, reports, customer-related information, and vendor operations.

---

## Tech Stack

- React
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Axios
- REST API

---

## Vendor Application

The Vendor Frontend provides the operational interface for cafeteria staff.

The main responsibilities are:

- Managing live orders
- Managing scheduled orders
- Updating order status
- Managing menu items
- Viewing reports
- Managing customer-related information
- Managing vendor support
- Managing vendor settings

---

# Main Modules

## Live Orders

The Live Orders section is used by cafeteria staff to manage current orders.

Orders are organized according to their operational status.

```text
Incoming
    ↓
Preparing
    ↓
Ready to Take
    ↓
Picked Up

The vendor can view relevant order information and update the order status as the order progresses.

Scheduled Orders

Scheduled orders are handled separately from immediate orders.

Vendor staff can view upcoming scheduled orders and prepare them according to the customer's selected schedule.

The scheduled-order interface helps staff distinguish future orders from currently active orders.

Order Status

The vendor application works with the OFFO order lifecycle.

Supported order statuses include:

CREATED
PREPARING
READY
PICKED_UP
COMPLETED
REJECTED
CANCELLED

The vendor interface presents the operationally relevant statuses to staff.

Menu Management

The Vendor Frontend allows authorized vendor staff to manage the cafeteria menu.

Depending on permissions and the existing backend configuration, menu management includes:

Viewing menu categories
Viewing menu items
Adding menu items
Updating menu items
Updating prices
Managing item availability
Managing item images
Managing menu categories

Menu item images are stored through the OFFO file-storage system.

Reports

The vendor application provides operational and business reporting.

Reports can be used to understand:

Orders
Sales
Revenue
Customer activity
Menu performance
Operational performance

Reports should remain focused on information required by the MVP and should not introduce unnecessary analytics infrastructure.

CRM

The CRM section provides vendor-side customer information and order-related customer activity.

It is intended to help cafeteria staff understand:

Customers
Customer orders
Customer activity
Relevant customer information

The CRM should use information provided by the backend rather than maintaining a separate customer database in the frontend.

Vendor Support

Vendor support is separate from the customer support system.

Vendor staff can use the vendor support functionality to:

Create vendor support tickets
Describe operational issues
Attach supporting images where supported
View ticket status
View ticket messages
Continue conversations on existing tickets

The vendor ticket system is intentionally separate from the user-facing support ticket system.

Vendor Authentication

Vendor staff authenticate through the vendor authentication system.

The frontend maintains the authenticated vendor session and communicates with protected backend APIs.

Vendor access is controlled by the backend according to the staff member's assigned role and permissions.

Staff Roles & Permissions

OFFO supports vendor staff roles and permissions.

The frontend should display and enable functionality according to the permissions returned/allowed by the backend.

The frontend should not be treated as the security boundary.

Authorization must ultimately be enforced by the backend.

Cafeteria / Branch

Vendor users may operate within a specific cafeteria branch.

A cafeteria can have one or more branches.

The vendor interface therefore works with branch-specific information such as:

Branch name
Location
Menu
Operating information
Orders
Branch documents
Vendor configuration
Notifications

The Vendor Frontend can display relevant in-app operational notifications provided by the backend.

Notifications may relate to:

New orders
Order updates
Scheduled orders
Vendor support
Other operational events
Settings

Vendor settings provide configuration options available to authorized vendor staff.

Settings should be persisted through the backend where applicable.

The frontend should not assume that browser-local state is the source of truth for persistent vendor configuration.

File & Image Uploads

The vendor application supports file uploads where required by vendor functionality.

Examples include:

Menu item images
Branch images
Branch documents
Vendor support attachments

Files are stored using the OFFO backend's AWS S3 integration.

The backend validates file type and size before storage.

Add VITE_API_BASE_URL=http://localhost:8000 to .env (if not create .env)