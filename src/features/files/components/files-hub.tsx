import { Upload } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileUploadBanner } from '@/features/files/components/file-upload-banner';
import { FilesTable } from '@/features/files/components/files-table';

/**
 * FilesHub is called on both settings and vault pages
 *
 * It displays upload banner and files table
 */
export const FilesHub = () => {
  return (
    <div className="mx-auto">
      <div className="space-y-8">
        <section className="hidden space-y-8 md:block">
          <FileUploadBanner>
            <Card>
              <div className="flex flex-row items-center justify-between gap-4 p-12">
                <div className="mr-12">
                  <h3 className="text-base text-primary lg:text-xl">
                    Upload your past Labcorp and Quest blood results (Beta)
                  </h3>
                  <p className="mt-2 text-sm text-zinc-600 lg:text-base">
                    We&apos;ll process your results and display them on the data
                    page so you can see how your health evolves over time. More
                    document types coming soon.
                  </p>
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
  );
};
