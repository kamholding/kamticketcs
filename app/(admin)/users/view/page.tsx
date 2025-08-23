'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog } from '@headlessui/react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  phone_number: string;
  profile_picture: string | null;
}

const DEPARTMENTS = [
  'HR',
  'Audit',
  'Supply Chain/Store',
  'Admin/Health/Security/Legal',
  'Production',
  'Account/Finance',
  'Electrical/Maintenance',
  'IT',
];

export default function ViewUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);

  const editForm = useForm<User>();
  const passwordForm = useForm<{ password: string }>();

  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== 'GM' && user.role !== 'Manager') {
      toast.error('Unauthorized access');
      router.push('/unauthorized');
    }
  }, [user, router]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users`);
      const data = await res.json();
      setUsers(data);
    } catch {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== id));
        toast.success('User deleted');
      } else {
        toast.error('Delete failed');
      }
    } catch {
      toast.error('Error deleting user');
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (u: User) => {
    setSelectedUser(u);
    editForm.reset(u);
    setPreviewImage(u.profile_picture ? `${process.env.NEXT_PUBLIC_IMAGE_API_PATH}/${u.profile_picture}` : '/default-avatar.png');
    setIsEditOpen(true);
  };

  const openPassword = (u: User) => {
    setSelectedUser(u);
    passwordForm.reset();
    setIsPasswordOpen(true);
  };

  const updatePassword = async (data: { password: string }) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${selectedUser?.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast.success('Password updated');
        setIsPasswordOpen(false);
      } else {
        toast.error('Password update failed');
      }
    } catch {
      toast.error('Error updating password');
    }
  };

  const updateUser = async (data: User) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      if (selectedImage) {
        formData.append('profile_picture', selectedImage);
      }
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${selectedUser?.id}`, {
        method: 'PUT',
        body: formData,
      });
      if (res.ok) {
        toast.success('User updated');
        fetchUsers();
        setIsEditOpen(false);
      } else {
        toast.error('User update failed');
      }
    } catch {
      toast.error('Error updating user');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  if (!user) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Admin List</h2>

     {loading ? (
  <div className="flex justify-center items-center h-40">
    <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
  </div>
) : (
  <div className="overflow-x-auto rounded-lg shadow-md">
    <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
      <thead className="bg-gray-100">
        <tr>
          <th className="p-2 border">Profile</th>
          <th className="p-2 border">Name</th>
          <th className="p-2 border">Email</th>
          <th className="p-2 border">Role</th>
          <th className="p-2 border">Department</th>
          <th className="p-2 border">Phone</th>
          <th className="p-2 border">Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map(u => (
          <tr
            key={u.id}
            className="transition-colors hover:bg-gray-50"
          >
            <td className="p-2 border text-center">
              <Image
                src={u.profile_picture ? `${process.env.NEXT_PUBLIC_IMAGE_API_PATH}/${u.profile_picture}` : '/default-avatar.png'}
                alt={u.name}
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
            </td>
            <td className="p-2 border">{u.name}</td>
            <td className="p-2 border">{u.email}</td>
            <td className="p-2 border">{u.role}</td>
            <td className="p-2 border">{u.department}</td>
            <td className="p-2 border">{u.phone_number}</td>
            <td className="p-2 border space-x-2">
              <button onClick={() => openEdit(u)} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition">Edit</button>
              <button onClick={() => deleteUser(u.id)} className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition">Delete</button>
              <button onClick={() => openPassword(u)} className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition">Change Password</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}


      {/* Edit User Modal */}
      <Dialog open={isEditOpen} onClose={() => setIsEditOpen(false)} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen p-4">
          <Dialog.Panel className="bg-white rounded-lg p-6 w-full max-w-lg shadow-lg">
            <Dialog.Title className="text-lg font-bold mb-4">Edit User</Dialog.Title>
            <form onSubmit={editForm.handleSubmit(updateUser)} className="space-y-3">
              <input {...editForm.register('name', { required: true })} placeholder="Name" className="w-full border p-2 rounded" />
              <input {...editForm.register('email', { required: true })} placeholder="Email" type="email" className="w-full border p-2 rounded" />
              <select {...editForm.register('role', { required: true })} className="w-full border p-2 rounded">
                <option value="Admin">Admin</option>
                <option value="User">User</option>
              </select>
              <select {...editForm.register('department', { required: true })} className="w-full border p-2 rounded">
                {DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <input {...editForm.register('phone_number', { required: true })} placeholder="Phone" className="w-full border p-2 rounded" />
              <div>
                <input type="file" accept="image/*" onChange={handleImageChange} />
                {previewImage && <Image src={previewImage} alt="Preview" width={100} height={100} className="mt-2 rounded" />}
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button type="button" onClick={() => setIsEditOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Update</button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Change Password Modal */}
      <Dialog open={isPasswordOpen} onClose={() => setIsPasswordOpen(false)} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen p-4">
          <Dialog.Panel className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <Dialog.Title className="text-lg font-bold mb-4">Change Password</Dialog.Title>
            <form onSubmit={passwordForm.handleSubmit(updatePassword)} className="space-y-3">
              <input {...passwordForm.register('password', { required: true })} type="password" placeholder="New Password" className="w-full border p-2 rounded" />
              <div className="flex justify-end space-x-2 mt-4">
                <button type="button" onClick={() => setIsPasswordOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Update</button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
