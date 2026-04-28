export const downloadBlob = (blob: Blob, fileName?: string): void => {
  // Convert the blob into an object URL that can be downloaded via an anchor tag.
  const blobUrl = URL.createObjectURL(blob);

  // Create a link element
  const link = document.createElement('a');

  // Set link's href to point to the Blob URL
  link.href = blobUrl;
  link.download = fileName ?? '';

  // Append link to the body
  document.body.appendChild(link);

  // Dispatch click event on the link
  // This is necessary as link.click() does not work on the latest firefox
  link.dispatchEvent(
    new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window,
    }),
  );

  // Remove link from body
  document.body.removeChild(link);

  // Allow the browser to begin the download before releasing the object URL.
  setTimeout(() => URL.revokeObjectURL(blobUrl), 0);
};
