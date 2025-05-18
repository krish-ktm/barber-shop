import React, { useEffect } from 'react';
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
        navigate(from || '/dashboard', { replace: true });
      } else if (userRole === 'staff') {
        navigate(from || '/staff/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, userRole, navigate, location]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (values.email === 'admin@barbershop.com' && values.password === 'admin123') {
      login('admin');
      toast({
        title: 'Success',
        description: 'Welcome back, Admin!',
      });
    } else if (values.email === 'staff@barbershop.com' && values.password === 'staff123') {
      login('staff');
      toast({
        title: 'Success',
        description: 'Welcome back, Staff Member!',
      });
    } else {
      toast({
        title: 'Error',
        description: 'Invalid email or password',
        variant: 'destructive',
      });
    }
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
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Sign In
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 text-sm text-muted-foreground">
          <div className="text-center w-full">
            Demo credentials:
            <div className="pt-2">
              <strong>Admin Access</strong>
              <div>Email: admin@barbershop.com</div>
              <div>Password: admin123</div>
            </div>
            <div className="pt-2">
              <strong>Staff Access</strong>
              <div>Email: staff@barbershop.com</div>
              <div>Password: staff123</div>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};