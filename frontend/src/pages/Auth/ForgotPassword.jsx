import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { HeartIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSubmitted(true);
      toast.success('Password reset email sent!');
    } catch (error) {
      toast.error('Failed to send reset email. Please try again.');
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <HeartIcon className="mx-auto h-12 w-12 text-primary-600" />
            <h2 className="mt-6 text-3xl font-extrabold text-foreground">
              Check your email
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We've sent a password reset link to your email address.
            </p>
          </div>
          
          <div className="mt-8 space-y-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Didn't receive the email? Check your spam folder or{' '}
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  try again
                </button>
              </p>
            </div>
            
            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <HeartIcon className="mx-auto h-12 w-12 text-primary-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-foreground">
            Forgot your password?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground">
              Email address
            </label>
            <input
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              type="email"
              className="input mt-1"
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-full py-2"
            >
              {isSubmitting ? 'Sending...' : 'Send reset link'}
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Back to sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
