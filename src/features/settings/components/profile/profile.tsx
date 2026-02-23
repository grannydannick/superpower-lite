import { Card } from '@/components/ui/card';
import { H3 } from '@/components/ui/typography';
import { ContactForm } from '@/features/settings/components/profile/contact-form';
import { PasswordManagement } from '@/features/settings/components/profile/password-management';
import { PersonalInformationForm } from '@/features/settings/components/profile/personal-information-form';

export const Profile = () => {
  return (
    <div className="space-y-8 md:space-y-20">
      <section id="personal" className="md:space-y-8">
        <Card className="overflow-visible bg-transparent p-0 shadow-none md:bg-white md:p-10 md:shadow-sm">
          <H3 className="mb-4 hidden md:block">Personal Information</H3>
          <PersonalInformationForm />
        </Card>
      </section>
      <section id="contact" className="md:space-y-8">
        <Card className="overflow-visible bg-transparent p-0 shadow-none md:bg-white md:p-10 md:shadow-sm">
          <H3 className="mb-4 hidden md:block">Contact</H3>
          <ContactForm />
        </Card>
      </section>
      <section id="password" className="md:space-y-8">
        <PasswordManagement />
      </section>
    </div>
  );
};
