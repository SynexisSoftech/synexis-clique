"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile, changePassword } from '../../service/authApi';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Eye, EyeOff, Upload, User, Lock, Camera, KeyRound, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import Navbar from '../(root)/components/navbar/navbar';
import Footer from '../(root)/components/footer/footer';

export default function ProfilePage() {
  // --- HOOKS ---
  const { user, setUser, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- STATE ---
  const [profileForm, setProfileForm] = useState({ firstName: '', lastName: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<{ current?: string; new?: string; confirm?: string }>({});
  const [passwordStrength, setPasswordStrength] = useState<'Weak' | 'Medium' | 'Strong' | ''>('');

  // --- SIDE EFFECTS ---
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setProfileForm({ firstName: user.firstName || '', lastName: user.lastName || '' });
    }
  }, [user]);

  // Password strength checker
  useEffect(() => {
    if (!passwordForm.newPassword) {
      setPasswordStrength('');
      return;
    }
    const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d\S]{12,}$/;
    const medium = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d\S]{8,}$/;
    if (strong.test(passwordForm.newPassword)) setPasswordStrength('Strong');
    else if (medium.test(passwordForm.newPassword)) setPasswordStrength('Medium');
    else setPasswordStrength('Weak');
  }, [passwordForm.newPassword]);

  // --- EVENT HANDLERS ---
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({ title: "File too large", description: "Please select an image smaller than 5MB.", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => setSelectedImage(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => fileInputRef.current?.click();

  const handleProfileUpdate = async () => {
    // (This function remains unchanged)
    if (!user) return;
    setIsUpdating(true);
    try {
      const updateData: any = {};
      if (profileForm.firstName.trim() !== user.firstName) updateData.firstName = profileForm.firstName.trim();
      if (profileForm.lastName.trim() !== user.lastName) updateData.lastName = profileForm.lastName.trim();
      if (selectedImage) updateData.photoBase64 = selectedImage;

      if (Object.keys(updateData).length === 0) {
        toast({ title: "No changes", description: "No changes were made to update." });
        return;
      }

      const response = await updateProfile(updateData);
      setUser(response.user);
      localStorage.setItem("user", JSON.stringify(response.user));
      toast({ title: "Profile Updated", description: "Your profile has been updated successfully." });
      setSelectedImage(null);
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.response?.data?.message || "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordUpdate = async () => {
    let errors: { current?: string; new?: string; confirm?: string } = {};
    if (!passwordForm.currentPassword) errors.current = 'Current password is required.';
    if (!passwordForm.newPassword) errors.new = 'New password is required.';
    if (!passwordForm.confirmPassword) errors.confirm = 'Please confirm your new password.';
    if (passwordForm.newPassword && passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirm = "New password and confirm password must match.";
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d\S]{8,}$/;
    if (passwordForm.newPassword && !passwordRegex.test(passwordForm.newPassword)) {
      errors.new = "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.";
    }
    setPasswordErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setIsUpdating(true);
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast({ title: "Password Changed", description: "Your password has been changed successfully." });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordErrors({});
      setIsPasswordDialogOpen(false);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "An unknown error occurred.";
      if (errorMessage.toLowerCase().includes('current password')) {
        setPasswordErrors((prev) => ({ ...prev, current: errorMessage }));
      } else {
        setPasswordErrors((prev) => ({ ...prev, new: errorMessage }));
      }
      toast({
        title: "Password Change Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // --- CONDITIONAL RENDERING ---
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Redirecting to login...</p>
      </div>
    );
  }

  // --- MAIN COMPONENT RENDER ---
  return (
    <div>
<Navbar />

    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
      </div>

      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
        {/* Profile Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Profile Information</CardTitle>
            <CardDescription>Update your personal information and profile picture</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={selectedImage || user.photoURL} alt={`${user.firstName} ${user.lastName}`} />
                  <AvatarFallback>{user.firstName?.charAt(0)}{user.lastName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <Button size="sm" variant="outline" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0" onClick={handleImageClick}>
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
              <p className="text-sm text-gray-500 text-center">Click the camera icon to change your profile picture</p>
            </div>
            <Separator />
            <div className="space-y-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" name="firstName" value={profileForm.firstName} onChange={handleProfileChange} placeholder="Enter your first name" />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" name="lastName" value={profileForm.lastName} onChange={handleProfileChange} placeholder="Enter your last name" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user.email} disabled className="bg-gray-50" />
                <p className="text-sm text-gray-500 mt-1">Email cannot be changed for security reasons</p>
              </div>
            </div>
            <Button onClick={handleProfileUpdate} disabled={isUpdating} className="w-full bg-[#6F4E37] hover:bg-[#5d4230] text-white">
              {isUpdating ? "Updating..." : "Update Profile"}
            </Button>
          </CardContent>
        </Card>

        {/* Security Settings Card with Dialog Trigger */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" /> Security</CardTitle>
            <CardDescription>Manage your account's security settings</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-start space-y-4">
              <p className="text-sm text-gray-700">Update your password to keep your account secure.</p>
              
              <Dialog open={isPasswordDialogOpen} onOpenChange={(open) => {
                setIsPasswordDialogOpen(open);
                if (!open) {
                  setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  setPasswordErrors({});
                  setPasswordStrength('');
                }
              }}>
                  <DialogTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2">
                          <KeyRound className="h-4 w-4" /> Change Password
                      </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[520px]">
                      <DialogHeader>
                          <DialogTitle>Change Password</DialogTitle>
                          <DialogDescription>
                              Enter your current password and a new password. Click save when you're done.
                          </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-5 py-2">
                          {/* Current Password */}
                          <div>
                              <Label htmlFor="currentPassword-modal">Current Password</Label>
                              <div className="relative mt-1">
                                  <Input id="currentPassword-modal" name="currentPassword" type={showCurrentPassword ? "text" : "password"} value={passwordForm.currentPassword} onChange={handlePasswordFormChange} placeholder="Current password" className="pr-10" />
                                  <Button type="button" variant="ghost" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </Button>
                              </div>
                              {passwordErrors.current && <div className="text-xs text-red-600 mt-1">{passwordErrors.current}</div>}
                          </div>
                          {/* New Password */}
                          <div>
                              <Label htmlFor="newPassword-modal">New Password</Label>
                              <div className="relative mt-1">
                                  <Input id="newPassword-modal" name="newPassword" type={showNewPassword ? "text" : "password"} value={passwordForm.newPassword} onChange={handlePasswordFormChange} placeholder="New password" className="pr-10" />
                                  <Button type="button" variant="ghost" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => setShowNewPassword(!showNewPassword)}>
                                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </Button>
                              </div>
                              {passwordForm.newPassword && (
                                  <div className="text-xs mt-1">
                                      Password strength: <span className={
                                          passwordStrength === 'Strong' ? 'text-green-600' :
                                          passwordStrength === 'Medium' ? 'text-yellow-600' :
                                          passwordStrength === 'Weak' ? 'text-red-600' : ''
                                      }>{passwordStrength}</span>
                                  </div>
                              )}
                              {passwordErrors.new && <div className="text-xs text-red-600 mt-1">{passwordErrors.new}</div>}
                          </div>
                          {/* Confirm Password */}
                          <div>
                              <Label htmlFor="confirmPassword-modal">Confirm New Password</Label>
                              <div className="relative mt-1">
                                  <Input id="confirmPassword-modal" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={passwordForm.confirmPassword} onChange={handlePasswordFormChange} placeholder="Confirm new password" className="pr-10" />
                                  <Button type="button" variant="ghost" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </Button>
                              </div>
                              {passwordErrors.confirm && <div className="text-xs text-red-600 mt-1">{passwordErrors.confirm}</div>}
                          </div>
                          <p className="text-sm text-gray-500 text-center">
                              Must be 8+ characters with uppercase, lowercase, number, & special character.
                          </p>
                      </div>
                      <DialogFooter>
                          <Button onClick={handlePasswordUpdate} disabled={isUpdating} className="w-full bg-[#6F4E37] hover:bg-[#5d4230] text-white flex items-center justify-center py-3 rounded-lg text-base font-semibold">
                              {isUpdating && <Loader2 className="animate-spin h-4 w-4 mr-2" />} {isUpdating ? "Saving..." : "Save Changes"}
                          </Button>
                      </DialogFooter>
                  </DialogContent>
              </Dialog>
          </CardContent>
        </Card>
      </div>
    </div>
<Footer />
        </div>
  );
}