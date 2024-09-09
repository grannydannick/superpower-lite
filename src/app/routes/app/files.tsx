import { ChevronLeft, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { ContentLayout } from '@/components/layouts';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Body1, H1 } from '@/components/ui/typography';
import { FileUploadBanner } from '@/features/files/components/file-upload-banner';
import { FilesTable } from '@/features/files/components/files-table';

export const FilesRoute = () => {
  const navigate = useNavigate();

  return (
    <ContentLayout bgColor="zinc">
      <div
        className="hidden cursor-pointer items-center gap-2 md:flex"
        role="presentation"
        onClick={() => navigate('/data')}
      >
        <ChevronLeft className="text-zinc-400" />
        <Body1 className="text-zinc-500">Back to Data</Body1>
      </div>

      <div
        role="presentation"
        className="flex size-[44px] cursor-pointer items-center justify-center rounded-full bg-white shadow-[0px_32px_64px_0px_rgba(212,212,212,0.25)] md:hidden"
        onClick={() => navigate('/data')}
      >
        <ChevronLeft width={16} height={16} color="black" />
      </div>

      <div className="space-y-2">
        <H1>Health records</H1>
        <Body1 className="text-zinc-500">
          Manage and import previous healthcare records into your Superpower
          dashboard
        </Body1>
      </div>
      <div className="mx-auto">
        <div className="space-y-8">
          <section
            id="personal-information"
            className="hidden space-y-8 md:block"
          >
            <FileUploadBanner>
              <Card>
                <div className="flex flex-row items-center justify-between gap-4 p-12">
                  <div>
                    <h3 className="text-base text-primary lg:text-xl">
                      Integrate your healthcare data into the Superpower
                      ecosystem
                    </h3>
                  </div>
                  <div className="flex flex-row items-center space-x-6">
                    <Button className="space-x-2.5">
                      <div>
                        <Upload className="size-4" />
                      </div>
                      <span> Upload</span>
                    </Button>
                  </div>
                </div>
              </Card>
            </FileUploadBanner>
          </section>
          <section id="files">
            <FilesTable />
          </section>
        </div>
      </div>
    </ContentLayout>
  );
};
