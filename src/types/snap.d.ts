export {};

declare global {
  interface Window {
    snap?: {
      pay(
        token: string,
        options?: {
          onSuccess?: (result: SnapResult) => void;
          onPending?: (result: SnapResult) => void;
          onError?: (result: SnapResult) => void;
          onClose?: () => void;
        }
      ): void;
      embed(token: string, options: { embedId: string }): void;
    };
  }
}

export interface SnapResult {
  order_id?: string;
  transaction_id?: string;
  transaction_status?: string;
  status_code?: string;
  status_message?: string;
}
