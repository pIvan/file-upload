export const readEntryRecursive = (entry: FileSystemEntry): Promise<File[]> => {
  return new Promise((resolve) => {
    if ((entry as FileSystemFileEntry).isFile) {
      (entry as FileSystemFileEntry).file((file) => resolve([file]));
    } else if ((entry as FileSystemDirectoryEntry).isDirectory) {
      const reader = (entry as FileSystemDirectoryEntry).createReader();
      const allFiles: File[] = [];

      const readEntries = () => {
        reader.readEntries(async (entries) => {
          if (entries.length === 0) {
            resolve(allFiles);
            return;
          }

          for (const e of entries) {
            const files = await readEntryRecursive(e);
            allFiles.push(...files);
          }

          readEntries();
        });
      };

      readEntries();
    } else {
      resolve([]);
    }
  });
};

export const createFileList = (files: File[]): FileList => {
  const dataTransfer = new DataTransfer();
  files.forEach((file) => dataTransfer.items.add(file));
  return dataTransfer.files;
};
