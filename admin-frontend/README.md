# OFFO Admin Frontend

OFFO (Order Food From Office) is a cafeteria food-ordering platform designed for cafeterias operating inside offices, campuses, hospitals, and other workplace environments.

The Admin Frontend provides the administrative interface for managing the OFFO platform, vendors, cafeterias, branches, users, orders, menus, staff, support, reports, and platform-level configuration.

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

# Admin Application

The Admin Frontend is used by authorized OFFO administrators to manage and monitor the platform.

The main responsibilities include:

- Platform dashboard
- Vendor management
- Cafeteria management
- Branch management
- User management
- Order monitoring
- Menu management
- Staff and permissions
- Reports
- Support management
- Platform settings

All administrative actions are performed through authenticated backend APIs.

---

# Admin Dashboard

The Admin Dashboard provides an overview of the platform.

Depending on the administrator's permissions and the available backend data, the dashboard can provide information such as:

- Orders
- Revenue
- Users
- Cafeterias
- Branches
- Operational activity
- Current platform activity

The dashboard is intended to provide administrators with a quick overview before entering individual management modules.

---

# Vendor Management

Administrators can manage vendors/cafeteria owners registered on the OFFO platform.

Vendor management may include:

- View vendors
- Create vendor records
- Update vendor information
- Activate/deactivate vendors
- View vendor branches
- View vendor-related information

Vendor information is maintained by the backend and the Admin Frontend displays the data returned by the API.

---

# Cafeteria Management

Administrators can manage cafeterias registered with OFFO.

Cafeteria management includes information such as:

- Cafeteria name
- Contact information
- Active/inactive status
- Associated branches

A cafeteria can have multiple branches.

---

# Branch Management

Administrators can manage individual cafeteria branches.

Branch information can include:

- Branch name
- City
- Campus
- Building
- Address
- Operating hours
- Contact information
- Location information
- Images
- Business information
- FSSAI information
- GST information
- Bank information
- Owner information
- Branch documents
- Active/inactive status

Branch-specific documents and images are handled through the OFFO file-storage system.

---

# Location Management

OFFO uses a location hierarchy for workplace cafeterias.

```text
City
  ↓
Campus
  ↓
Building

Administrators can manage the location information required for the platform.

This location structure is used by the User Frontend to identify relevant cafeterias and branches.

User Management

Administrators can view and manage platform users.

User information can include:

User name
Mobile number
OTP verification state
Account timestamps
User context
Addresses

Administrative actions should follow the permissions provided by the backend.

The Admin Frontend must not expose sensitive information unnecessarily.

Order Management

Administrators can monitor platform orders.

Supported order states include:

CREATED
PREPARING
READY
PICKED_UP
COMPLETED
REJECTED
CANCELLED

Administrators can use order information to understand platform activity and investigate operational issues.

Order and payment information displayed in the Admin Frontend should come from the backend.

Payment Monitoring

The Admin Frontend can display payment-related information provided by the backend.

Payment states include:

PENDING
PAID
FAILED
REFUNDED
REFUND_PENDING

Payment information can be used by administrators to investigate:

Successful payments
Failed payments
Pending payments
Refunds
Refund-related issues

The frontend must not independently determine whether a payment is successful.

The backend payment system remains authoritative.

Menu Management

Administrators can manage platform menu information where permitted.

Menu-related entities include:

Item Type
Menu Category
Menu Item
Branch Menu Item

Menu management can include:

Menu categories
Menu items
Item types
Prices
Availability
Branch-specific menu configuration
Item images

Branch-specific menu configuration is maintained through the backend.

Staff Management

The Admin Frontend provides administrative management of staff accounts where supported.

Staff-related functionality includes:

Staff accounts
Staff roles
Staff permissions
Account status
Branch/vendor association where applicable
Roles & Permissions

OFFO uses role and permission-based access control.

The backend contains role and permission information that determines which administrative functions a user can access.

The Admin Frontend should:

Display only authorized functionality where appropriate.
Respect backend-provided permissions.
Hide unavailable actions from unauthorized users where appropriate.
Never rely on frontend hiding as the actual security mechanism.

Backend authorization remains authoritative.

Support Management

The Admin Frontend provides administrative visibility into support activity.

Support functionality can include:

User support tickets
Ticket details
Ticket messages
Ticket status
Issue information
Related orders
Related order items
Support attachments

Vendor support is maintained as a separate support system.

The Admin Frontend should preserve this distinction between:

User Support
Vendor Support
Feedback

Administrators can access feedback information submitted by users.

Feedback can contain:

Food rating
App rating
Comments
Related order
User information
Submission timestamp

Feedback can be used for operational review and customer-experience monitoring.

Reports

The Admin Frontend provides administrative reporting based on the data available from the backend.

Reports can cover areas such as:

Orders
Revenue
Payments
Cafeteria performance
Branch activity
Menu performance
Customer activity
Operational information

Reports should remain proportional to the OFFO MVP requirements.

Notifications

The Admin Frontend can display administrative notifications provided by the backend where applicable.

Notifications may relate to:

Platform activity
Orders
Vendor activity
Support
Other administrative events
File & Document Management

The OFFO platform uses AWS S3 for centralized file storage.

The Admin Frontend can work with files associated with administrative entities.

Examples include:

Branch images
Menu item images
Branch documents
Support screenshots

The frontend communicates with the backend for file operations.

It should not contain AWS secret credentials.

Add VITE_API_BASE_URL=http://localhost:8000 to .env (if not create .env)