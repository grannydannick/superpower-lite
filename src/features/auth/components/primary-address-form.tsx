import { useState } from 'react';
import * as React from 'react';
import { UseFormReturn } from 'react-hook-form';

import { AddressAutocomplete } from '@/components/ui/address-autocomplete';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { US_STATES } from '@/const';
import { RegisterInput } from '@/lib/auth';

function FullPrimaryAddressForm({
  form,
}: {
  form: UseFormReturn<RegisterInput>;
}) {
  return (
    <div className="flex flex-col gap-x-8 gap-y-4">
      <FormField
        control={form.control}
        name="address.line1"
        render={({ field }) => {
          return (
            <FormItem>
              <FormLabel>Address Line 1</FormLabel>
              <FormControl>
                <AddressAutocomplete
                  onFormSubmit={(data) => form.setValue('address', data)}
                  placeholder="Street address"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
      />
      <FormField
        control={form.control}
        name="address.line2"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address Line 2</FormLabel>
            <FormControl>
              <Input
                autoComplete="off"
                placeholder="Apartment, suite, etc. (optional)"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-3">
        <FormField
          control={form.control}
          name="address.city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input autoComplete="off" placeholder="City" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address.state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>State</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-[58px]">
                      <SelectValue placeholder="State" asChild={false} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="text-zinc-600">
                    {US_STATES.map((state) => (
                      <SelectItem value={state.value} key={state.value}>
                        {state.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address.postalCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ZIP Code</FormLabel>
              <FormControl>
                <Input
                  autoComplete="off"
                  placeholder="ZIP Code"
                  inputMode="numeric"
                  maxLength={5}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

export function PrimaryAddressForm({
  form,
}: {
  form: UseFormReturn<RegisterInput>;
}) {
  const [input, setInput] = useState('');
  const address = form.watch('address');

  if (address) {
    return <FullPrimaryAddressForm form={form} />;
  }

  return (
    // note: intentionally leaving some fields blank here so we display it "one time"
    <div className="flex flex-col gap-4">
      <Label className="text-secondary" htmlFor="line1">
        Where do you plan to receive your service?&nbsp;
        <span className="text-vermillion-900">*</span>
      </Label>
      <AddressAutocomplete
        onChange={(e) => {
          setInput(e.target.value);
        }}
        value={input}
        onBlur={() => {}}
        name="line1"
        onFormSubmit={(address) => {
          form.setValue('address', address);
        }}
      />
    </div>
  );
}
