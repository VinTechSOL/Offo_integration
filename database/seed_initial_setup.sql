BEGIN;

-- =====================================================
-- 1️⃣ INSERT STAFF ROLES
-- =====================================================

INSERT INTO core.staff_roles (
    role_id,
    cafe_id,
    role_name,
    description
)
VALUES
(1, NULL, 'SUPER_ADMIN', 'System level administrator'),
(2, 1, 'VENDOR_ADMIN', 'Manages specific branch'),
(3, 1, 'VENDOR', 'Basic staff role')
ON CONFLICT (role_id) DO NOTHING;



-- =====================================================
-- 2️⃣ INSERT PERMISSIONS
-- =====================================================

INSERT INTO core.permissions (
    permission_id,
    permission_code,
    description
)
VALUES
(1, 'VIEW_ORDERS', 'Can view orders'),
(2, 'ACCEPT_ORDER', 'Can accept orders'),
(3, 'REJECT_ORDER', 'Can reject orders'),
(4, 'MOVE_ORDER', 'Can move order status'),
(5, 'MANAGE_MENU', 'Can manage menu'),
(6, 'MANAGE_STAFF', 'Can manage staff')
ON CONFLICT (permission_id) DO NOTHING;



-- =====================================================
-- 3️⃣ ROLE → PERMISSION MAPPING
-- =====================================================

-- SUPER_ADMIN → all permissions
INSERT INTO core.role_permissions (role_id, permission_id)
SELECT 1, permission_id FROM core.permissions
ON CONFLICT DO NOTHING;


-- BRANCH_MANAGER → operational permissions
INSERT INTO core.role_permissions (role_id, permission_id)
VALUES
(2,1),(2,2),(2,3),(2,4),(2,5)
ON CONFLICT DO NOTHING;


-- STAFF → limited permissions
INSERT INTO core.role_permissions (role_id, permission_id)
VALUES
(3,1),(3,2),(3,4)
ON CONFLICT DO NOTHING;



-- =====================================================
-- 4️⃣ INSERT ITEM TYPES (VERY IMPORTANT)
-- =====================================================

INSERT INTO catalog.item_types (
    item_type_id,
    name,
    is_active
)
VALUES
(1, 'veg', true),
(2, 'non-veg', true)
ON CONFLICT (item_type_id) DO NOTHING;



-- =====================================================
-- 5️⃣ INSERT CAFE
-- =====================================================

INSERT INTO core.cafeteria (
    cafe_id,
    cafe_name,
    phone_number,
    email_id,
    is_active
)
VALUES
(
    1,
    'Healthy Bites Catering',
    '+919876543210',
    'healthybites@offo.com',
    true
)
ON CONFLICT (cafe_id) DO NOTHING;



insert into locations.cities(city_id,city_name) values (1,'Bangalore');
insert into locations.campuses(campus_id,city_id,campus_name) values (1,1,'Manyata Tech park');
insert into locations.buildings(building_id,campus_id,building_name) values (1,1,'vsw data solutions');


-- =====================================================
-- 6️⃣ INSERT BRANCH
-- =====================================================

INSERT INTO core.cafe_branch (
    branch_id,
    cafe_id,
    branch_name,
    city_id,
    campus_id,
    building_id,
    opens_at,
    closes_at,
    is_active
)
VALUES
(
    1,
    1,
    'Healthy Bites - Manyata',
    1,
    1,
    1,
    '08:00',
    '20:00',
    true
)
ON CONFLICT (branch_id) DO NOTHING;



-- =====================================================
-- 7️⃣ INSERT STAFF USER
-- Password = admin123 (bcrypt hash)
-- =====================================================

INSERT INTO core.staff (
    staff_id,
    first_name,
    last_name,
    username,
    password_hash,
    role_id,
    branch_id,
    is_active
)
VALUES
(
    2,
    'Admin',
    'User',
    'sathya12',
    '$2b$12$KIXQ4pF5z5cF8ZzK4n1rWuj7mY5q8VvM4Qb0tD1Lw8bR9zY6z9G5G',
    1,
    null,
    true
)
ON CONFLICT (staff_id) DO NOTHING;

INSERT INTO core.staff (
    staff_id,
    first_name,
    last_name,
    username,
    password_hash,
    role_id,
    branch_id,
    is_active,
    created_at
)
VALUES
(
    3,
    'Rohit',
    'S',
    'rohit7',
    '$2b$12$uPU1umlKqIi3Sh1R2mR1.Otc5T/Xm1IgW7RDWCzTIeuNTGhg5MHtm',
    1,
    null,
    true,
    NOW()
)
ON CONFLICT (staff_id) DO NOTHING;


COMMIT;


