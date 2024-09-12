import { zodResolver } from '@hookform/resolvers/zod';
import * as React from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { rtlRender, screen, userEvent, waitFor } from '@/testing/test-utils';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
  SelectGroup,
} from '../select';

test('should handle basic select flow', async () => {
  const openButtonPlaceholder = 'Select a timezone';
  const labelText = 'North America';
  const est = 'Eastern Standard Time (EST)';

  rtlRender(
    <Select>
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder={openButtonPlaceholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>{labelText}</SelectLabel>
          <SelectItem value="est">{est}</SelectItem>
          <SelectItem value="cst">Central Standard Time (CST)</SelectItem>
          <SelectItem value="mst">Mountain Standard Time (MST)</SelectItem>
          <SelectItem value="pst">Pacific Standard Time (PST)</SelectItem>
          <SelectItem value="akst">Alaska Standard Time (AKST)</SelectItem>
          <SelectItem value="hst">Hawaii Standard Time (HST)</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>,
  );

  expect(screen.queryByText(labelText)).not.toBeInTheDocument();

  await userEvent.click(screen.getByText(openButtonPlaceholder), {
    pointerEventsCheck: 0,
  });

  expect(await screen.findByText(labelText)).toBeInTheDocument();

  await userEvent.click(screen.getByText(est));

  expect(screen.queryByText(openButtonPlaceholder)).not.toBeInTheDocument();

  await waitFor(() =>
    expect(screen.queryByText(labelText)).not.toBeInTheDocument(),
  );
});

const schema = z.object({
  gender: z.string().min(1, 'Required'),
});

const openButtonPlaceholder = 'Select gender';

const FormSelectTest = ({
  onSubmit,
}: {
  onSubmit: SubmitHandler<z.infer<typeof schema>>;
}) => {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      gender: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={openButtonPlaceholder} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button name="submit" type="submit" className="w-full">
          Submit
        </Button>
      </form>
    </Form>
  );
};

test('should render and submit a select in Form component', async () => {
  const gender = 'Male';
  const testData = {
    gender: 'MALE',
  };

  const handleSubmit = vi.fn() as SubmitHandler<z.infer<typeof schema>>;

  rtlRender(<FormSelectTest onSubmit={handleSubmit} />);

  await userEvent.click(screen.getByText(openButtonPlaceholder), {
    pointerEventsCheck: 0,
  });

  await userEvent.click(screen.getByRole('option', { name: gender }));

  await userEvent.click(screen.getByRole('button', { name: /submit/i }));

  await waitFor(() =>
    expect(handleSubmit).toHaveBeenCalledWith(testData, expect.anything()),
  );
});
