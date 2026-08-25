import { ToastNotification, ToastType } from "../types";

type ToastListener = (toasts: ToastNotification[]) => void;

interface ToastOptions {
  title?: string;
  duration?: number;
  icon?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

class ToastManager {
  private toasts: ToastNotification[] = [];
  private listeners: Set<ToastListener> = new Set();
  private nextId = 1;

  public subscribe(listener: ToastListener): () => void {
    this.listeners.add(listener);
    listener([...this.toasts]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const list = [...this.toasts];
    this.listeners.forEach((listener) => listener(list));
  }

  public show(
    message: string,
    type: ToastType = "info",
    options?: ToastOptions
  ): string {
    const id = `toast_${Date.now()}_${this.nextId++}`;
    const newToast: ToastNotification = {
      id,
      message,
      type,
      title: options?.title,
      duration: options?.duration ?? 3800,
      icon: options?.icon,
      action: options?.action,
    };

    // Limit maximum stacked toasts to 5
    this.toasts = [newToast, ...this.toasts.slice(0, 4)];
    this.notify();

    return id;
  }

  public dismiss(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.notify();
  }

  public clearAll() {
    this.toasts = [];
    this.notify();
  }

  // Specialized convenience helpers
  public vault(message: string, options?: ToastOptions): string {
    return this.show(message, "vault", {
      title: options?.title || "Smriti Vault",
      duration: options?.duration ?? 4000,
      ...options,
    });
  }

  public language(message: string, options?: ToastOptions): string {
    return this.show(message, "language", {
      title: options?.title || "Bhasha Sangam",
      duration: options?.duration ?? 3500,
      ...options,
    });
  }

  public theme(message: string, options?: ToastOptions): string {
    return this.show(message, "theme", {
      title: options?.title || "Visual Appearance",
      duration: options?.duration ?? 3200,
      ...options,
    });
  }

  public audio(message: string, options?: ToastOptions): string {
    return this.show(message, "audio", {
      title: options?.title || "Sacred Soundscape",
      duration: options?.duration ?? 3200,
      ...options,
    });
  }

  public success(message: string, options?: ToastOptions): string {
    return this.show(message, "success", {
      title: options?.title || "Success",
      duration: options?.duration ?? 3500,
      ...options,
    });
  }

  public info(message: string, options?: ToastOptions): string {
    return this.show(message, "info", {
      title: options?.title,
      duration: options?.duration ?? 3500,
      ...options,
    });
  }

  public warning(message: string, options?: ToastOptions): string {
    return this.show(message, "warning", {
      title: options?.title || "Notice",
      duration: options?.duration ?? 4500,
      ...options,
    });
  }

  public error(message: string, options?: ToastOptions): string {
    return this.show(message, "error", {
      title: options?.title || "Error",
      duration: options?.duration ?? 5000,
      ...options,
    });
  }
}

export const toast = new ToastManager();
