import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { UsersList } from './UsersList';
import { UsersTable } from './UsersTable';
import {
   getAllUsers,
   deleteUser,
   createUser,
 } from '@/api/services/userService';
import { User } from '@/types';
import { PageHeader } from '@/components/layout';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import AddUserDialog, { AddUserPayload } from './AddUserDialog';

export const UsersPage: React.FC = () => {
  const { toast } = useToast();

  // API hooks using generic useApi helper
  const {
    data: usersResponse,
    loading,
    error,
    execute: fetchUsers
  } = useApi(getAllUsers);

  const { execute: executeDeleteUser } = useApi(deleteUser);

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch users on mount & whenever debouncedSearch changes
  useEffect(() => {
    fetchUsers(1, 10, debouncedSearch);
  }, [fetchUsers, debouncedSearch]);

  // Handlers
  const handleAddUser = () => setShowAddDialog(true);

  const handleAddUserSave = async (payload: AddUserPayload) => {
    try {
      await createUser(payload);
      toast({ title: 'User added' });
      fetchUsers(1, 10, debouncedSearch);
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? (err as { message: string }).message : 'Failed to create user';
      toast({ variant: 'destructive', title: 'Error', description: msg });
      throw err;
    }
  };

  const handleEditUser = async (user: User) => {
    // Placeholder – open dialog for editing
    toast({
      title: 'Not implemented',
      description: `Edit user ${user.name}`
    });
  };

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Are you sure you want to delete ${user.name}?`)) return;
    try {
      setDeletingUserId(user.id);
      await executeDeleteUser(user.id);
      toast({ title: 'User deleted' });
      fetchUsers(1, 10, debouncedSearch);
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'message' in err ? (err as { message: string }).message : 'Failed to delete user';
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage
      });
    } finally {
      setDeletingUserId(null);
    }
  };

  // Get users list from response
  const users: User[] = (usersResponse?.success ? usersResponse.users : []).filter(u => u.role !== 'staff');

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Create, edit and remove system users."
        action={{
          label: 'Add User',
          onClick: handleAddUser,
          icon: <Plus className="h-4 w-4 mr-2" />,
        }}
      />

      <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Error state */}
      {error && (
        <p className="text-destructive">{error.message || 'Failed to load users'}</p>
      )}

      {/* Loading state */}
      {loading && <p>Loading users...</p>}

      {/* Data */}
      {!loading && users.length === 0 && (
        <p className="text-muted-foreground">No users found.</p>
      )}

      {!loading && users.length > 0 && (
        <>
          {/* Desktop table */}
          <div className="hidden md:block">
            <UsersTable users={users} onEdit={handleEditUser} onDelete={handleDeleteUser} deletingUserId={deletingUserId} />
          </div>

          {/* Mobile card list */}
          <div className="md:hidden">
            <UsersList users={users} onEdit={handleEditUser} onDelete={handleDeleteUser} deletingUserId={deletingUserId} />
          </div>
        </>
      )}

      {/* Add dialog */}
      <AddUserDialog open={showAddDialog} onOpenChange={setShowAddDialog} onAdd={handleAddUserSave} />
    </div>
  );
};

export default UsersPage; 