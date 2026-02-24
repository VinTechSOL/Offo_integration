import React, { useMemo, useState } from 'react';
import Drawer from '../components/common/Drawer';

/* ======================================================
   Base User Type
====================================================== */

interface UserWithStats {
  id: string;
  firstName: string;
  lastName: string;
  mobile: string;
  totalOrders: number;
  totalSpent: number;
  lastOrder?: string;
  status: 'Active' | 'Inactive' | 'No Orders';
}

/* ======================================================
   Dummy Data
====================================================== */

const mockUsers: UserWithStats[] = [
  {
    id: '1',
    firstName: 'Rahul',
    lastName: 'Sharma',
    mobile: '9876543210',
    totalOrders: 18,
    totalSpent: 12450,
    lastOrder: '2026-02-18',
    status: 'Active'
  },
  {
    id: '2',
    firstName: 'Anita',
    lastName: 'Verma',
    mobile: '9988776655',
    totalOrders: 6,
    totalSpent: 3400,
    lastOrder: '2026-01-05',
    status: 'Inactive'
  },
  {
    id: '3',
    firstName: 'Karan',
    lastName: 'Mehta',
    mobile: '9123456789',
    totalOrders: 0,
    totalSpent: 0,
    lastOrder: undefined,
    status: 'No Orders'
  },
  {
    id: '4',
    firstName: 'Surya',
    lastName: 'Reddy',
    mobile: '9000012345',
    totalOrders: 25,
    totalSpent: 18900,
    lastOrder: '2026-02-20',
    status: 'Active'
  }
];

/* ======================================================
   Component
====================================================== */

export const ManageUsersPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<'all' | 'Active' | 'Inactive' | 'No Orders'>('all');
  const [selectedUser, setSelectedUser] =
    useState<UserWithStats | null>(null);

  /* ================= Filtering ================= */

  const filteredUsers = useMemo(() => {
    return mockUsers.filter(user => {
      const matchesSearch =
        `${user.firstName} ${user.lastName}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        user.mobile.includes(searchQuery);

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : user.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  /* ================= Stats ================= */

  const totalUsers = mockUsers.length;
  const activeUsers = mockUsers.filter(u => u.status === 'Active').length;
  const totalOrders = mockUsers.reduce((a, b) => a + b.totalOrders, 0);
  const totalRevenue = mockUsers.reduce((a, b) => a + b.totalSpent, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-8 space-y-10">

      {/* ================= Header ================= */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Manage Users
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Customer activity overview and purchase insights
        </p>
      </div>

      {/* ================= Black Stats ================= */}
      <div className="bg-black rounded-2xl p-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-white shadow-lg">
        <BlackStat label="Total Users" value={totalUsers} />
        <BlackStat label="Active Users" value={activeUsers} />
        <BlackStat label="Total Orders" value={totalOrders} />
        <BlackStat label="Revenue" value={`₹${totalRevenue}`} />
      </div>

      {/* ================= Search + Filter ================= */}
      <div className="flex items-center justify-between">
        <input
          type="text"
          placeholder="Search by name or mobile number..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full max-w-xl border border-gray-300 rounded-xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
        />

        <select
          value={statusFilter}
          onChange={e =>
            setStatusFilter(
              e.target.value as 'all' | 'Active' | 'Inactive' | 'No Orders'
            )
          }
          className="ml-6 border border-gray-300 rounded-xl px-4 py-3 text-sm shadow-sm"
        >
          <option value="all">All Users</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="No Orders">No Orders</option>
        </select>
      </div>

      {/* ================= Table Header ================= */}
      <div className="bg-orange-500 text-white rounded-xl px-6 py-4 grid grid-cols-1 md:grid-cols-6 text-sm font-semibold uppercase tracking-wide shadow-sm">
        <div>Name</div>
        <div className="text-center">Total Orders</div>
        <div>Total Spent</div>
        <div>Last Order</div>
        <div>Status</div>
        <div className="text-right">Action</div>
      </div>

      {/* ================= Users Rows ================= */}
      <div className="space-y-4">

        {filteredUsers.map(user => (
          <div
            key={user.id}
            onClick={() => setSelectedUser(user)}
            className="bg-white border border-gray-200 rounded-xl px-6 py-5 hover:shadow-md hover:border-orange-300 transition cursor-pointer"
          >
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6 items-center">

              <div>
                <p className="font-semibold text-gray-900">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-sm text-gray-500">
                  {user.mobile}
                </p>
              </div>

              <div className="text-center font-semibold">
                {user.totalOrders}
              </div>

              <div className="font-semibold text-gray-900">
                ₹{user.totalSpent}
              </div>

              <div className="text-sm text-gray-600">
                {user.lastOrder || '—'}
              </div>

              <div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    user.status === 'Active'
                      ? 'bg-green-100 text-green-700'
                      : user.status === 'Inactive'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {user.status}
                </span>
              </div>

              <div className="text-right text-orange-600 font-medium">
                View →
              </div>

            </div>
          </div>
        ))}

      </div>

      {/* ================= Drawer ================= */}
      <Drawer
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title={
          selectedUser
            ? `${selectedUser.firstName} ${selectedUser.lastName}`
            : ''
        }
      >
        {selectedUser && (
          <div className="space-y-4 text-sm">
            <p><strong>Mobile:</strong> {selectedUser.mobile}</p>
            <p><strong>Total Orders:</strong> {selectedUser.totalOrders}</p>
            <p><strong>Total Spent:</strong> ₹{selectedUser.totalSpent}</p>
            <p><strong>Status:</strong> {selectedUser.status}</p>
          </div>
        )}
      </Drawer>

    </div>
  );
};

/* ======================================================
   Black Stat Component
====================================================== */

const BlackStat = ({
  label,
  value
}: {
  label: string;
  value: number | string;
}) => (
  <div>
    <p className="text-xs uppercase text-gray-400 tracking-wide">
      {label}
    </p>
    <p className="text-3xl font-bold mt-2 text-white">
      {value}
    </p>
  </div>
);