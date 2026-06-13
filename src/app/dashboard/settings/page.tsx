'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { User, Shield, Bell } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your account and system preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <User size={20} className="text-blue-600" />
              <div>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Manage your admin profile</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input label="Full Name" defaultValue="Admin User" />
            <Input label="Email" type="email" defaultValue="admin@invigitracker.com" />
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield size={20} className="text-blue-600" />
              <div>
                <CardTitle>Security</CardTitle>
                <CardDescription>Password and authentication</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input label="Current Password" type="password" />
            <Input label="New Password" type="password" />
            <Input label="Confirm Password" type="password" />
            <Button>Update Password</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Bell size={20} className="text-blue-600" />
              <div>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Configure notification preferences</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div><p className="font-medium">Email Notifications</p><p className="text-sm text-slate-500">Receive email alerts</p></div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600" />
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div><p className="font-medium">Exam Reminders</p><p className="text-sm text-slate-500">Get reminded about upcoming exams</p></div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600" />
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div><p className="font-medium">Payment Alerts</p><p className="text-sm text-slate-500">Payment due reminders</p></div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600" />
              </label>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
