'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export function RegisterForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
      nik: formData.get('nik') as string,
      phone: formData.get('phone') as string,
      roomNumber: formData.get('roomNumber') as string,
    };

    try {
      // Validation
      if (!data.name || data.name.length < 3) {
        throw new Error('Name must be at least 3 characters');
      }
      if (!data.email || !data.email.includes('@')) {
        throw new Error('Please enter a valid email');
      }
      if (!data.password || data.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      if (data.password !== data.confirmPassword) {
        throw new Error('Passwords do not match');
      }
      if (!data.nik || data.nik.length < 16) {
        throw new Error('NIK must be at least 16 digits');
      }

      // Call registration API (use auto-register endpoint)
      const response = await fetch('/api/tenant/register-auto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          nik: data.nik,
          phone: data.phone || '',
          roomNumber: data.roomNumber || '',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed');
      }

      toast({
        title: 'Registration successful!',
        description: 'You can now log in with your credentials.',
      });

      router.push('/login');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Registration failed',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="John Doe"
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="john@example.com"
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="nik">NIK (Indonesian ID Number)</Label>
        <Input
          id="nik"
          name="nik"
          type="text"
          placeholder="16 digit NIK number"
          pattern="[0-9]{16}"
          required
          disabled={isLoading}
          maxLength={16}
        />
        <p className="text-xs text-gray-500">
          Enter your 16 digit NIK number
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number (Optional)</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="08123456789"
          disabled={isLoading}
        />
        <p className="text-xs text-gray-500">
          Your WhatsApp or mobile number
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="roomNumber">Room Number (Optional)</Label>
        <Input
          id="roomNumber"
          name="roomNumber"
          type="text"
          placeholder="101"
          disabled={isLoading}
        />
        <p className="text-xs text-gray-500">
          Leave empty if not assigned yet
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          disabled={isLoading}
          minLength={6}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          required
          disabled={isLoading}
          minLength={6}
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-teal-600 hover:bg-teal-700"
        disabled={isLoading}
      >
        {isLoading ? 'Creating account...' : 'Create Tenant Account'}
      </Button>
    </form>
  );
}
