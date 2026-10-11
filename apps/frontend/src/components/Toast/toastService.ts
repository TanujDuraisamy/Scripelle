import type { ToastType } from "./Toast";

type ToastCallback = (toast: { id: string; message: string; type: ToastType }) => void;

class ToastEmitter {
  private listeners: ToastCallback[] = [];

  on(_event: "show", callback: ToastCallback) {
    this.listeners.push(callback);
  }

  off(_event: "show", callback: ToastCallback) {
    this.listeners = this.listeners.filter((listener) => listener !== callback);
  }

  emit(_event: "show", toast: { id: string; message: string; type: ToastType }) {
    this.listeners.forEach((listener) => listener(toast));
  }
}

export const toastEmitter = new ToastEmitter();

export const toast = (message: string, type: ToastType = "info") => {
  const id = Math.random().toString(36).substring(2, 9);
  toastEmitter.emit("show", { id, message, type });
};

// Convenience methods
toast.success = (message: string) => toast(message, "success");
toast.error = (message: string) => toast(message, "error");
toast.warning = (message: string) => toast(message, "warning");
toast.info = (message: string) => toast(message, "info");
