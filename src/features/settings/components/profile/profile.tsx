import { Card } from '@/components/ui/card';
import { H2 } from '@/components/ui/typography';
import { ContactForm } from '@/features/settings/components/profile/contact-form';
import { PersonalInformationForm } from '@/features/settings/components/profile/personal-informartion-form';

export const Profile = () => {
  return (
    <div className="space-y-8 md:space-y-20">
      <section id="personal" className="md:space-y-8">
        <H2 className="hidden md:block">Personal Information</H2>
        <Card className="bg-white p-[72px]">
          <PersonalInformationForm />
        </Card>
      </section>
      <section id="contact" className="md:space-y-8">
        <H2 className="md:block">Contact</H2>
        <Card className="bg-transparent p-[72px] md:bg-white">
          <ContactForm />
        </Card>
      </section>
    </div>
  );
};
