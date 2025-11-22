'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { forgotPassword } from '@/services/authservices';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email);
      toast.success('OTP has been sent to your email');
      // Store email in sessionStorage for next step
      sessionStorage.setItem('resetPasswordEmail', email);
      router.push('/verify-otp');
    } catch (error) {
      const message =
        error?.message ||
        error?.response?.data?.message ||
        'Failed to send OTP. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen page-gradient flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="p-8">
          <div className="mb-6">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="mb-4 gap-2">
                <ArrowLeft className="size-4" />
                Back to Login
              </Button>
            </Link>
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-[#FFCBD8]/30 rounded-full">
                <Mail className="size-8 text-[#FFCBD8]" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-center text-neutral-900 mb-2">
              Forgot Password?
            </h1>
            <p className="text-sm text-center text-neutral-600">
              Enter your email address and we'll send you an OTP to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="mt-1"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                'Send OTP'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600">
              Remember your password?{' '}
              <Link href="/login" className="text-[#FFCBD8] hover:text-[#FFCBD8]/80 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

