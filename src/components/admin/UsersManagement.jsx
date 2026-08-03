import React from 'react';
import { Search, Shield, UserCheck, Trash2 } from 'lucide-react';

const UsersManagement = ({
  users,
  searchTerm,
  setSearchTerm,
  onUserRoleUpdate,
  onDeleteUser,
  onToggleUserStatus,
  updatingUserId
}) => {
  const filteredUsers = users.filter(user =>
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRoleUpdate = (userId, isAdmin) => {
    if (window.confirm(`Are you sure you want to ${isAdmin ? 'remove admin from' : 'make admin for'} this user?`)) {
      onUserRoleUpdate(userId, isAdmin);
    }
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      onDeleteUser(userId);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-700 dark:border-gray-700">
      <div className="p-6 border-b dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="text-left py-3 px-4 dark:text-gray-300">User</th>
              <th className="text-left py-3 px-4 dark:text-gray-300">Email</th>
              <th className="text-left py-3 px-4 dark:text-gray-300">Phone</th>
              <th className="text-left py-3 px-4 dark:text-gray-300">Role</th>
              <th className="text-left py-3 px-4 dark:text-gray-300">Status</th>
              <th className="text-left py-3 px-4 dark:text-gray-300">Member Since</th>
              <th className="text-left py-3 px-4 dark:text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, index) => (
              <tr key={`user-${user.id || 'no-id'}-${index}`} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="py-3 px-4 dark:text-white">
                  <div className="flex items-center gap-3">
                    <img
                      src={`https://picsum.photos/seed/${user.id}/40/40.jpg`}
                      alt={user.displayName}
                      className="w-10 h-10 rounded-full"
                    />
                    <span>{user.displayName}</span>
                  </div>
                </td>
                <td className="py-3 px-4 dark:text-white">{user.email}</td>
                <td className="py-3 px-4 dark:text-white">{user.phone || 'N/A'}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 w-fit ${user.isAdmin
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                    }`}>
                    {user.isAdmin ? <Shield size={12} /> : <UserCheck size={12} />}
                    {user.isAdmin ? 'Admin' : 'Customer'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${user.isActive === false
                      ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                      : 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                    }`}>
                    {user.isActive === false ? 'Inactive' : 'Active'}
                  </span>
                </td>
                <td className="py-3 px-4 dark:text-white">{user.memberSince}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRoleUpdate(user.id, !user.isAdmin)}
                      disabled={updatingUserId === user.id}
                      className={`px-2 py-1 rounded text-xs flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed ${user.isAdmin
                          ? 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                          : 'bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-300'
                        }`}
                    >
                      {updatingUserId === user.id ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                          Updating...
                        </>
                      ) : (
                        user.isAdmin ? 'Remove Admin' : 'Make Admin'
                      )}
                    </button>
                    <button
                      onClick={() => onToggleUserStatus(user.id, user.isActive !== false)}
                      className={`px-2 py-1 rounded text-xs ${user.isActive === false
                          ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-300'
                        }`}
                    >
                      {user.isActive === false ? 'Activate' : 'Deactivate'}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersManagement;