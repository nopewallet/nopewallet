import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";

const LOCAL_STORAGE_EXPORT_FILENAME = 'wallet-backup.json';

function exportLocalStorage() {
  const data = { ...localStorage };
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = LOCAL_STORAGE_EXPORT_FILENAME;
  a.click();

  URL.revokeObjectURL(url);
}

function importLocalStorage(file: File, onSuccess: () => void, onError: (err: string) => void) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result as string);
      if (typeof data !== 'object' || data === null) throw new Error('Invalid backup file');
      Object.entries(data).forEach(([key, value]) => {
        localStorage.setItem(key, value as string);
      });
      onSuccess();
    } catch (err: any) {
      onError(err.message || 'Failed to import backup');
    }
  };
  reader.onerror = () => onError('Failed to read file');
  reader.readAsText(file);
}

const BackupEncrypt: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = React.useState<string | null>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    importLocalStorage(
      file,
      () => setImportStatus('Import successful! Please reload the page.'),
      (err) => setImportStatus(`Import failed: ${err}`)
    );
    e.target.value = '';
  };

  return (
    <div>
      <h2 className='text-sm mb-2'>Export Broswer LocalStorage (Backup)</h2>
      <p className='text-[10px] mb-2'>
        You can convert all LocalStorage data into a downloadable JSON file.<br className='hidden md:block'/> If
        you forget your encryption password, you will not be able to recover your data.
      </p>
      <Button onClick={exportLocalStorage}>Export Browser Backup</Button>
      <hr className="my-4" />
      <h3 className='text-sm mt-5 mb-2'>Import Browser LocalStorage (Restore)</h3>
      <p className='text-[10px] mb-2'>
        Restore your LocalStorage from a previously exported backup file.
      </p>
      <Button onClick={handleImportClick}>Import Browser Backup</Button>
      <input
        type="file"
        accept="application/json"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      {importStatus && (
        <div className={`mt-2 ${importStatus.startsWith('Import successful') ? 'text-green-600' : 'text-red-600'}`}>
          {importStatus}
        </div>
      )}
    </div>
  );
};

export default BackupEncrypt;
