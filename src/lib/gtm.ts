/**
 * Capture an event to the GTM dataLayer
 * @param event The name of the event
 * @param data Additional data to send with the event
 */
export const captureEvent = (event: string, data: Record<string, any>) => {
  try {
    const windowAny = window as any;
    windowAny.dataLayer = windowAny.dataLayer || [];
    windowAny.dataLayer.push({
      event,
      ...data,
    });
  } catch (e) {
    // do nothing
    console.error('Error capturing dataLayer event', e);
  }
};
