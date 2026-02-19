'use client';

import { useFormState } from 'react-dom';
import { registerUser } from '../actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function RegisterForm() {
  const [state, action] = useFormState(registerUser, undefined);

  return (
    <form action={action} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required />
        {state?.errors?.name && <p className="text-sm text-red-500">{state.errors.name}</p>}
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
        {state?.errors?.email && <p className="text-sm text-red-500">{state.errors.email}</p>}
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required />
        {state?.errors?.password && <p className="text-sm text-red-500">{state.errors.password}</p>}
      </div>
      <Button type="submit" className="w-full">
        Register
      </Button>
      {state?.message && <p className="text-sm text-red-500">{state.message}</p>}
    </form>
  );
}