'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { verifyOTP, forgotPassword } from '@/services/authservices';

export default function VerifyOTPPage() {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef([]);

  useEffect(() => {
    // Get email from sessionStorage
    const storedEmail = sessionStorage.getItem('resetPasswordEmail');
    if (!storedEmail) {
      toast.error('Email not found. Please start over.');
      router.push('/forgot-password');
      return;
    }
    setEmail(storedEmail);
    setCountdown(60); // 60 second countdown before allowing resend
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only take the last character
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
      setOtp(newOtp.slice(0, 6));
      const nextIndex = Math.min(pastedData.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await verifyOTP(email, otpString);
      const resetToken = response?.data?.resetToken;
      if (resetToken) {
        // Store reset token for password reset page
        sessionStorage.setItem('resetPasswordToken', resetToken);
        toast.success('OTP verified successfully');
        router.push('/reset-password');
      } else {
        throw new Error('Reset token not received');
      }
    } catch (error) {
      const message =
        error?.message ||
        error?.response?.data?.message ||
        'Invalid OTP. Please try again.';
      toast.error(message);
      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) {
      toast.error(`Please wait ${countdown} seconds before resending`);
      return;
    }

    setResending(true);
    try {
      await forgotPassword(email);
      toast.success('OTP has been resent to your email');
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (error) {
      const message =
        error?.message ||
        error?.response?.data?.message ||
        'Failed to resend OTP. Please try again.';
      toast.error(message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen page-gradient flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="p-8">
          <div className="mb-6">
            <Link href="/forgot-password">
              <Button variant="ghost" size="sm" className="mb-4 gap-2">
                <ArrowLeft className="size-4" />
                Back
              </Button>
            </Link>
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-[#FFCBD8]/30 rounded-full">
                <Shield className="size-8 text-[#FFCBD8]" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-center text-neutral-900 mb-2">
              Verify OTP
            </h1>
            <p className="text-sm text-center text-neutral-600">
              Enter the 6-digit OTP sent to <br />
              <span className="font-medium text-neutral-900">{email}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-12 h-14 text-center text-xl font-semibold border-2 border-neutral-300 rounded-lg focus:outline-none focus:border-[#FFCBD8] focus:ring-2 focus:ring-[#FFCBD8]/30"
                  disabled={loading}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || otp.join('').length !== 6}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify OTP'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-neutral-600">
              Didn't receive the OTP?
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResendOTP}
              disabled={resending || countdown > 0}
              className="w-full"
            >
              {resending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Resending...
                </>
              ) : countdown > 0 ? (
                `Resend OTP (${countdown}s)`
              ) : (
                'Resend OTP'
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

