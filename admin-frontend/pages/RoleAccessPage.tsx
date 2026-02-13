
import React, { useState } from 'react';
import Button from '../components/common/Button.tsx';
import Modal from '../components/common/Modal.tsx';
import { constants } from '../constants.ts';
import { Role, Permission, AllPermissions } from '../types.ts';

export const RoleAccessPage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([
    { 
      id: 'super_admin', 
      name: 'Super Admin', 
      description: 'Full access to all system features across all branches.', 
      permissions: [...AllPermissions],
      isSystem: true
    },
    { 
      id: 'branch_admin', 
      name: 'Branch Admin', 
      description: 'Full control over a specific branch, including settings and staff.', 
      permissions: ['view dashboard', 'view orders', 'update orders', 'manage menu', 'manage staff', 'manage branch settings', 'view reports'],
      isSystem: false
    },
    { 
      id: 'manager', 
      name: 'Manager', 
      description: 'Can manage daily operations, menu, and staff.', 
      permissions: ['view dashboard', 'view orders', 'update orders', 'manage menu', 'manage staff'],
      isSystem: false
    },
    { 
      id: 'staff', 
      name: 'Staff', 
      description: 'Can view and update orders.', 
      permissions: ['view dashboard', 'view orders', 'update orders'],
      isSystem: false
    },
    {
      id: 'billing',
      name: 'Billing Staff',
      description: 'Handles payments and reports.',
      permissions: ['view dashboard', 'view orders', 'view reports'],
      isSystem: false
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  // Confirmation Modal
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean, roleId: string | null }>({
      isOpen: false,
      roleId: null
  });

  const openPermissionModal = (role: Role) => {
    if (role.isSystem) return; // Guard clause
    setEditingRole({...role}); // Create a copy to edit
    setIsModalOpen(true);
  };

  const createRole = () => {
      const newRole: Role = {
          id: Math.random().toString(36).substr(2, 9),
          name: 'New Role',
          description: 'Description here...',
          permissions: ['view dashboard'],
          isSystem: false
      };
      setEditingRole(newRole);
      setIsModalOpen(true);
  };

  const requestDeleteRole = (role: Role) => {
      if (role.isSystem) return;
      setDeleteConfirmation({ isOpen: true, roleId: role.id });
  };

  const confirmDeleteRole = () => {
      if (deleteConfirmation.roleId) {
          setRoles(roles.filter(r => r.id !== deleteConfirmation.roleId));
          setDeleteConfirmation({ isOpen: false, roleId: null });
      }
  };

  const togglePermission = (permission: Permission) => {
    if (!editingRole) return;
    
    const hasPermission = editingRole.permissions.includes(permission);
    const newPermissions = hasPermission
      ? editingRole.permissions.filter(p => p !== permission)
      : [...editingRole.permissions, permission];
    
    setEditingRole({ ...editingRole, permissions: newPermissions });
  };

  const saveRole = () => {
      if (!editingRole) return;
      
      const existingIndex = roles.findIndex(r => r.id === editingRole.id);
      if (existingIndex >= 0) {
          setRoles(roles.map(r => r.id === editingRole.id ? editingRole : r));
      } else {
          setRoles([...roles, editingRole]);
      }
      setIsModalOpen(false);
  };

  const formatPermission = (p: string) => {
      return p.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-3xl font-bold text-${constants.colors.TEXT_DARK}`}>Roles & Permissions</h1>
          <p className="text-gray-500 mt-1">Manage access levels. <span className="font-semibold text-offoOrange">Super Admin</span> approval required for new roles.</p>
        </div>
        <button 
            onClick={createRole} 
            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-colors"
        >
            <span className="mr-2 text-lg">+</span> Create Role
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {roles.map(role => (
          <div key={role.id} className={`bg-white rounded-xl p-6 shadow-sm border flex flex-col relative h-full ${role.isSystem ? 'border-l-4 border-l-offoOrange border-y-gray-100 border-r-gray-100' : 'border-gray-100'}`}>
            {/* Delete Icon */}
            {!role.isSystem && (
                <button 
                    onClick={() => requestDeleteRole(role)}
                    className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            )}

            {/* Header */}
            <div className="flex gap-4 items-start mb-4 pr-8">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${role.isSystem ? 'bg-orange-100 text-offoOrange' : 'bg-purple-50 text-purple-600'}`}>
                    {role.isSystem ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V9a2 2 0 012-2h2zM7 15a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H9a2 2 0 01-2-2v-4zM12 9v6m-4-6V9m8 0V9m-4 4h.01M17 19h.01M13 13h.01" />
                        </svg>
                    )}
                </div>
                <div>
                    <div className="flex items-center gap-2">
                         <h3 className="text-lg font-bold text-gray-900">{role.name}</h3>
                         {role.isSystem && <span className="bg-gray-100 text-gray-600 text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-gray-200">System</span>}
                    </div>
                    <p className="text-gray-500 text-sm mt-1 leading-snug">{role.description}</p>
                </div>
            </div>

            {/* Permissions */}
            <div className="flex-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Permissions</p>
                <div className="flex flex-wrap gap-2">
                    {role.permissions.map(perm => (
                        <span key={perm} className="bg-slate-200 text-slate-700 px-2 py-1 rounded text-xs font-medium">
                            {formatPermission(perm)}
                        </span>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-end">
                {role.isSystem ? (
                    <span className="text-xs text-gray-400 italic py-2">Full access granted by system</span>
                ) : (
                    <button 
                        onClick={() => openPermissionModal(role)}
                        className="px-4 py-1.5 border border-orange-500 text-orange-500 rounded text-sm font-medium hover:bg-orange-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-orange-500"
                    >
                        Edit Permissions
                    </button>
                )}
            </div>
          </div>
        ))}
      </div>

      {/* Edit/Create Role Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingRole?.id ? `Edit ${editingRole.name}` : 'Create Role'}
      >
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                <input 
                    type="text" 
                    value={editingRole?.name || ''} 
                    onChange={(e) => setEditingRole(editingRole ? {...editingRole, name: e.target.value} : null)}
                    className="w-full rounded-md border border-gray-300 p-2 focus:ring-offoOrange focus:border-offoOrange"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input 
                    type="text" 
                    value={editingRole?.description || ''} 
                    onChange={(e) => setEditingRole(editingRole ? {...editingRole, description: e.target.value} : null)}
                    className="w-full rounded-md border border-gray-300 p-2 focus:ring-offoOrange focus:border-offoOrange"
                />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Permissions</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {AllPermissions.map(permission => {
                        const isEnabled = editingRole?.permissions.includes(permission);
                        return (
                            <div 
                                key={permission} 
                                className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${isEnabled ? 'bg-orange-50 border-offoOrange' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                                onClick={() => togglePermission(permission)}
                            >
                                <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 flex-shrink-0 ${isEnabled ? 'bg-offoOrange border-offoOrange' : 'border-gray-400'}`}>
                                    {isEnabled && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                                </div>
                                <span className={`text-sm select-none ${isEnabled ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                                    {formatPermission(permission)}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="pt-4 flex justify-end gap-2 border-t border-gray-100">
                <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button onClick={saveRole}>Save Role</Button>
            </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, roleId: null })}
        title="Confirm Deletion"
        footer={
            <>
                <Button variant="ghost" onClick={() => setDeleteConfirmation({ isOpen: false, roleId: null })}>Cancel</Button>
                <Button variant="danger" onClick={confirmDeleteRole}>Delete</Button>
            </>
        }
      >
          <p className="text-gray-600">Are you sure you want to delete this role? Users assigned to this role may lose access.</p>
      </Modal>
    </div>
  );
};