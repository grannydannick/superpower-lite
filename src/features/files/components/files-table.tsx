import { Spinner } from '@/components/ui/spinner';
import { useFiles } from '@/features/files/api/get-files';
import { columns } from '@/features/files/components/desktop/columns';
import { DataTable } from '@/features/files/components/desktop/data-table';
import { MobileFiles } from '@/features/files/components/mobile-files';

export function FilesTable(): JSX.Element {
  const { data, isLoading } = useFiles();

  if (isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner variant="primary" size="lg" />
      </div>
    );
  }

  if (!data) return <></>;

  const { files } = data;

  if (!files) return <></>;

  return (
    <>
      {/*Mobile*/}
      <MobileFiles files={files} />

      {/*Desktop*/}
      {files.length > 0 && <DataTable columns={columns} data={files} />}

      {files.length === 0 && <FilesTableEmpty />}
    </>
  );
}

function FilesTableEmpty(): JSX.Element {
  return (
    <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
      <h3 className="mt-4 text-lg font-semibold">No files yet</h3>
      <p className="mb-4 mt-2 text-sm text-zinc-400">
        You have not uploaded any files.
      </p>
    </div>
  );
}
