import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { login, isAuthenticated, userRole } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname;
      if (userRole === 'admin') {
        navigate(from || '/admin/dashboard', { replace: true });
      } else if (userRole === 'staff') {
        navigate(from || '/staff/dashboard', { replace: true });
      } else if (userRole === 'billing') {
        navigate(from || '/billing/pos', { replace: true });
      }
    }
  }, [isAuthenticated, userRole, navigate, location]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      await login(values.email, values.password);
      
      toast({
        title: 'Success',
        description: 'Welcome back!',
      });
    } catch (error) {
      let errorMessage = 'Invalid email or password';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // For demo purposes, we'll keep the mock users option
  const loginWithMockUser = (role: 'admin' | 'staff' | 'billing') => {
    let email = '';
    let password = '';
    
    if (role === 'admin') {
      email = 'admin@barbershop.com';
      password = 'admin123';
    } else if (role === 'staff') {
      email = 'staff@barbershop.com';
      password = 'staff123';
    } else if (role === 'billing') {
      email = 'billing@barbershop.com';
      password = 'billing123';
    }
    
    form.setValue('email', email);
    form.setValue('password', password);
    form.handleSubmit(onSubmit)();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-[400px]">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <img src="/logo/logo-tran.png" alt="Barber Shop Logo" className="h-32 w-auto" />
          </div>
          <div className="space-y-1">
            <CardDescription>Sign in to your account</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 text-sm text-muted-foreground">
          <div className="text-center w-full">
            Demo credentials:
            <div className="pt-2 flex flex-col gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => loginWithMockUser('admin')}
                disabled={isLoading}
              >
                Login as Admin
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => loginWithMockUser('staff')}
                disabled={isLoading}
              >
                Login as Staff
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => loginWithMockUser('billing')}
                disabled={isLoading}
              >
                Login as Billing
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};