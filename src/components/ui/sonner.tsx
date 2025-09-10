'use client';

import { AlertCircle, Check, Info, Loader2, X } from 'lucide-react';
import React from 'react';
import { ExternalToast, Toaster as Sonner, toast as sonnerToast } from 'sonner';

import { useWindowDimensions } from '@/hooks/use-window-dimensions';

export type ToasterProps = React.ComponentProps<typeof Sonner>;
type ToastType = 'default' | 'error' | 'success';

interface CustomToastProps {
  title: React.ReactNode;
  type?: ToastType;
  icon?: React.ReactNode;
  action?: {
    label: React.ReactNode;
    onClick: () => void;
  };
  closeButton?: boolean;
}

function CustomToast({
  title,
  type = 'default',
  icon,
  action,
  closeButton = false,
}: CustomToastProps) {
  const bgColor = type === 'error' ? 'bg-[#B4006C]' : 'bg-black';

  const textColor = type === 'error' ? 'text-pink-100' : 'text-white';

  return (
    <div
      /* eslint-disable-next-line tailwindcss/no-custom-classname */
      className={`toast group !inset-x-0 !mx-auto flex items-center gap-3 rounded-full ${bgColor} ${textColor} h-auto min-h-12 w-fit px-5 py-3 text-center shadow-[0px_4px_4px_rgba(0,0,0,0.1),0px_8px_16px_rgba(0,0,0,0.1)]`}
    >
      {icon && <div className="flex-none">{icon}</div>}

      <div className="flex-1">
        <p className="text-sm font-normal">{title}</p>
      </div>

      {(action || closeButton) && (
        <div className="flex flex-none items-center gap-3">
          {action && (
            <button
              className="bg-transparent text-sm font-medium hover:text-white/80 hover:underline"
              onClick={() => {
                action.onClick();
                sonnerToast.dismiss();
              }}
            >
              {action.label}
            </button>
          )}
          {closeButton && (
            <button className="flex-none" onClick={() => sonnerToast.dismiss()}>
              <X className="size-4 text-gray-400" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

type ToastOptions = Omit<ExternalToast, 'id'> & {
  icon?: React.ReactNode;
  action?: {
    label: React.ReactNode;
    onClick: () => void;
  };
};

function createToast() {
  const toastFn = function (
    message: React.ReactNode,
    options?: ToastOptions,
  ): string | number {
    return sonnerToast.custom(() => (
      <CustomToast
        title={message}
        icon={options?.icon}
        action={options?.action}
        closeButton={options?.closeButton}
      />
    ));
  };

  toastFn.success = function (
    message: React.ReactNode,
    options?: ToastOptions,
  ): string | number {
    return sonnerToast.custom(() => (
      <CustomToast
        title={message}
        type="success"
        icon={options?.icon || <Check className="size-4" />}
        action={options?.action}
        closeButton={options?.closeButton}
      />
    ));
  };

  toastFn.error = function (
    message: React.ReactNode,
    options?: ToastOptions,
  ): string | number {
    return sonnerToast.custom(() => (
      <CustomToast
        title={message}
        type="error"
        icon={options?.icon || <AlertCircle className="size-4" />}
        action={options?.action}
        closeButton={options?.closeButton}
      />
    ));
  };

  toastFn.promise = function <T>(
    promise: Promise<T>,
    options: {
      loading: React.ReactNode;
      success: (data: T) => React.ReactNode;
      error: (error: any) => React.ReactNode;
      loadingIcon?: React.ReactNode;
      action?: {
        label: React.ReactNode;
        onClick: () => void;
      };
      closeButton?: boolean;
    },
  ): string | number {
    const toastId = sonnerToast.custom(() => (
      <CustomToast
        title={options.loading}
        type="default"
        icon={
          options.loadingIcon || <Loader2 className="size-4 animate-spin" />
        }
        action={options.action}
        closeButton={options.closeButton}
      />
    ));

    promise
      .then((data) => {
        toast.success(options.success(data));
      })
      .catch((error) => {
        toast.error(options.error(error));
      });

    return toastId;
  };

  // define other toast types
  // toastFn.loading = sonnerToast.loading;
  // toastFn.custom = sonnerToast.custom;
  // toastFn.dismiss = sonnerToast.dismiss;
  // toastFn.message = sonnerToast.message;
  toastFn.info = function (
    message: React.ReactNode,
    options?: ToastOptions,
  ): string | number {
    return sonnerToast.custom(() => (
      <CustomToast
        title={message}
        type="default"
        icon={options?.icon || <Info className="size-4" />}
        action={options?.action}
        closeButton={options?.closeButton}
      />
    ));
  };
  // toastFn.warning = sonnerToast.warning;

  return toastFn;
}

export const toast = createToast();

export const Toaster = ({ ...props }: ToasterProps) => {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  return (
    <Sonner
      /* eslint-disable-next-line tailwindcss/no-custom-classname */
      className="toaster font-sans"
      position={isMobile ? 'top-center' : 'bottom-center'}
      visibleToasts={1}
      expand={false}
      toastOptions={{
        className: 'mx-auto w-fit',
        classNames: {
          toast:
            'data-[type=default]:mx-auto data-[type=success]:mx-auto data-[type=error]:mx-auto left-0 right-0 w-fit',
        },
      }}
      style={{
        width: '90vw',
        maxWidth: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        right: 'auto',
      }}
      {...props}
    />
  );
};
