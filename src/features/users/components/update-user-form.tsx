import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { H3 } from '@/components/ui/typography';
import { AdminUser } from '@/types/api';

import { useAdminUpdateUser } from '../api';

const updateUserSchema = z.object({
  email: z
    .union([z.string().min(1).email('Invalid email address'), z.literal('')])
    .transform((val) => (val === '' ? undefined : val?.toLowerCase().trim()))
    .optional(),
  phone: z
    .union([
      z
        .string()
        .min(1)
        .regex(
          /^\+[1-9]\d{8,13}$/, // counting the + sign
          'Phone number must start with + and be 10-14 digits (e.g., +16198618759)',
        ),
      z.literal(''),
    ])
    .transform((val) => (val === '' ? undefined : val))
    .optional(),
  firstName: z
    .union([
      z
        .string()
        .min(1)
        .regex(
          /^[a-zA-Z\s'-]+$/,
          'Names can only contain letters, spaces, hyphens, and apostrophes',
        ),
      z.literal(''),
    ])
    .transform((val) => (val === '' ? undefined : val))
    .optional(),
  lastName: z
    .union([
      z
        .string()
        .min(1)
        .regex(
          /^[a-zA-Z\s'-]+$/,
          'Names can only contain letters, spaces, hyphens, and apostrophes',
        ),
      z.literal(''),
    ])
    .transform((val) => (val === '' ? undefined : val))
    .optional(),
  dateOfBirth: z
    .union([
      z
        .string()
        .min(1)
        .refine((date) => {
          const parsed = new Date(date);
          return !isNaN(parsed.getTime());
        }, 'Invalid date format')
        .refine((date) => {
          const parsed = new Date(date);
          return parsed <= new Date();
        }, 'Date of birth cannot be in the future')
        .refine((date) => {
          const parsed = new Date(date);
          const minDate = new Date();
          minDate.setFullYear(minDate.getFullYear() - 120);
          return parsed >= minDate;
        }, 'Date of birth is too far in the past'),
      z.literal(''),
    ])
    .transform((val) => (val === '' ? undefined : val))
    .optional(),
  gender: z
    .union([z.enum(['MALE', 'FEMALE', 'OTHER', 'UNKNOWN']), z.literal('')])
    .transform((val) => (val === '' ? undefined : val))
    .optional(),
});

type UpdateUserFormInput = z.input<typeof updateUserSchema>;
type UpdateUserFormData = z.output<typeof updateUserSchema>;

interface UpdateUserFormProps {
  user: AdminUser;
  isOpen: boolean;
  onClose: () => void;
}

export const UpdateUserForm = ({
  user,
  isOpen,
  onClose,
}: UpdateUserFormProps) => {
  const queryClient = useQueryClient();
  const updateUserMutation = useAdminUpdateUser();

  const form = useForm<UpdateUserFormInput, unknown, UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    mode: 'onSubmit',
    defaultValues: {
      email: user.email || '',
      phone: user.phone || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '', // Convert to YYYY-MM-DD format
      gender:
        (user.gender as 'MALE' | 'FEMALE' | 'OTHER' | 'UNKNOWN') || undefined,
    },
  });

  const onSubmit = async (data: UpdateUserFormData) => {
    try {
      await updateUserMutation.mutateAsync({
        id: user.id,
        data,
      });
      await queryClient.refetchQueries({ queryKey: ['users'] });
      toast.success('User updated successfully');
      form.reset(data);
      onClose();
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="p-10">
          <DialogTitle>
            <H3>Update member information</H3>
          </DialogTitle>
          {form.formState.isDirty && (
            <DialogDescription className="text-left">
              <div className="mt-2 rounded bg-vermillion-50 px-2 py-1 text-sm text-vermillion-700">
                You have unsaved changes. Modified fields will be highlighted.
              </div>
            </DialogDescription>
          )}
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
              noValidate
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        {...field}
                        className={
                          form.formState.dirtyFields.email
                            ? 'border-vermillion-700 bg-vermillion-50'
                            : ''
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className={
                          form.formState.dirtyFields.phone
                            ? 'border-vermillion-700 bg-vermillion-50'
                            : ''
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className={
                            form.formState.dirtyFields.firstName
                              ? 'border-vermillion-700 bg-vermillion-50'
                              : ''
                          }
                        />
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
                        <Input
                          {...field}
                          className={
                            form.formState.dirtyFields.lastName
                              ? 'border-vermillion-700 bg-vermillion-50'
                              : ''
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        className={
                          form.formState.dirtyFields.dateOfBirth
                            ? 'border-vermillion-700 bg-vermillion-50'
                            : ''
                        }
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
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger
                          className={
                            form.formState.dirtyFields.gender
                              ? 'border-vermillion-700 bg-vermillion-50'
                              : ''
                          }
                        >
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                        <SelectItem value="UNKNOWN">Unknown</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={updateUserMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    updateUserMutation.isPending || !form.formState.isDirty
                  }
                >
                  {updateUserMutation.isPending ? 'Updating...' : 'Update User'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};
