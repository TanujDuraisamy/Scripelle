import { useEffect, useState } from "react";
import Toast from "./Toast";
import type { ToastType } from "./Toast";
import { toastEmitter } from "./toastService.ts";

interface ToastData {
  id: string;
  message: string;
  type: ToastType;
}

const ToastContainer = () => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    const handleToast = (toast: ToastData) => {
      setToasts((prev) => [...prev, toast]);
    };

    toastEmitter.on("show", handleToast);

    return () => {
      toastEmitter.off("show", handleToast);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col items-end">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={removeToast}
        />
      ))}
    </div>
  );
};

export default ToastContainer;
