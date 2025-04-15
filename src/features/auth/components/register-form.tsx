import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import PhoneInput from 'react-phone-number-input/input';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { DatetimePicker, Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { H1, H4 } from '@/components/ui/typography';
import { useRegister, registerInputSchema, RegisterInput } from '@/lib/auth';
import { cn } from '@/lib/utils';

type RegisterFormProps = {
  onSuccess: () => void;
};

export const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
  const registering = useRegister({ onSuccess });
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerInputSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      gender: undefined,
      password: '',
      confirmPassword: '',
    },
    shouldUnregister: true,
  });

  function onSubmit(values: RegisterInput) {
    registering.mutate(values);
  }

  return (
    <div className="w-full max-w-[480px] space-y-8 py-12">
      <div className="space-y-3 text-center">
        <H1 className="text-zinc-900">Welcome to Superpower</H1>
        <H4 className="text-zinc-500">Your new era of personal health</H4>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-1">
          <div className="flex flex-col space-y-6">
            <div className="grid grid-cols-1 gap-x-8 gap-y-4 lg:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Legal first name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Legal last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 gap-x-8 gap-y-4 lg:grid-cols-2">
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <DatetimePicker
                        {...field}
                        format={[['months', 'days', 'years'], []]}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biological Sex</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger
                          className={cn(
                            `bg-white px-6 py-4`,
                            field.value
                              ? 'text-primary'
                              : 'text-muted-foreground',
                          )}
                        >
                          <SelectValue placeholder="Select biological sex" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MALE">Male</SelectItem>
                          <SelectItem value="FEMALE">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-1">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <PhoneInput
                        {...field}
                        placeholder="(555) 123-9876"
                        defaultCountry="US"
                        // 14 because 10 + "(", ")", " " and "-"
                        maxLength={14}
                        inputComponent={Input}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-1">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="name@example.com"
                        autoCapitalize="none"
                        autoComplete="email"
                        autoCorrect="off"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-1">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="password">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          id="password"
                          {...field}
                          placeholder="********"
                          type={showPassword ? 'text' : 'password'}
                          autoCapitalize="off"
                          autoComplete="new-password"
                          autoCorrect="off"
                          aria-label="Password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="small"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-zinc-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-zinc-500" />
                          )}
                          <span className="sr-only">
                            {showPassword ? 'Hide password' : 'Show password'}
                          </span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-1">
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="confirmPassword">
                      Confirm Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          {...field}
                          placeholder="********"
                          type={showConfirmPassword ? 'text' : 'password'}
                          autoCapitalize="off"
                          autoComplete="new-password"
                          autoCorrect="off"
                          aria-label="Confirm Password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="small"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-zinc-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-zinc-500" />
                          )}
                          <span className="sr-only">
                            {showConfirmPassword
                              ? 'Hide password'
                              : 'Show password'}
                          </span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <p className="px-8 text-center text-sm text-gray-400">
              By clicking register, you agree to our{' '}
              <span className="underline underline-offset-4 hover:text-black">
                <a
                  href="https://www.superpower.com/terms"
                  target="_blank"
                  rel="noreferrer"
                >
                  Terms
                </a>{' '}
              </span>
              and{' '}
              <span className="underline underline-offset-4 hover:text-black">
                <a
                  href="https://www.superpower.com/privacy"
                  target="_blank"
                  rel="noreferrer"
                >
                  Privacy Policy
                </a>
              </span>
              .
            </p>
            <Button type="submit" disabled={registering.isPending}>
              {registering.isPending ? <Spinner /> : 'Register'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
