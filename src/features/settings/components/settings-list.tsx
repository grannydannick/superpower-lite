import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Billing } from '@/features/settings/components/billing/billing';
import { Membership } from '@/features/settings/components/membership/membership';
import { Profile } from '@/features/settings/components/profile/profile';

export const SettingsList = () => {
  return (
    <Tabs defaultValue="profile" className="">
      <TabsList className="flex h-auto flex-wrap items-center justify-start">
        <TabsTrigger value="profile" className="text-base lg:text-xl">
          Profile
        </TabsTrigger>
        <TabsTrigger value="billing" className="text-base lg:text-xl">
          Billing
        </TabsTrigger>
        <TabsTrigger value="membership" className="text-base lg:text-xl">
          Membership
        </TabsTrigger>
        <TabsTrigger value="integrations" className="text-base lg:text-xl">
          Integrations
        </TabsTrigger>
        <TabsTrigger value="history" className="text-base lg:text-xl">
          Order History
        </TabsTrigger>
      </TabsList>
      <TabsContent value="profile" className="mt-16">
        <Profile />
      </TabsContent>
      <TabsContent value="billing" className="mt-16">
        <Billing />
      </TabsContent>
      <TabsContent value="membership" className="mt-16">
        <Membership />
      </TabsContent>
    </Tabs>
  );
};
