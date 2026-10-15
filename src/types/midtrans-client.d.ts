declare module 'midtrans-client' {
  export interface SnapTransactionDetails {
    order_id: string;
    gross_amount: number;
  }

  export interface SnapItemDetail {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }

  export interface SnapCustomerDetails {
    first_name: string;
    email: string;
    phone: string;
  }

  export interface SnapExpiry {
    unit: string;
    duration: number;
  }

  export interface SnapCallbacks {
    finish?: string;
  }

  export interface SnapTransactionParams {
    transaction_details: SnapTransactionDetails;
    item_details?: SnapItemDetail[];
    customer_details?: SnapCustomerDetails;
    expiry?: SnapExpiry;
    callbacks?: SnapCallbacks;
  }

  export interface SnapTransactionResponse {
    token: string;
    redirect_url: string;
  }

  export class Snap {
    constructor(config: { isProduction: boolean; serverKey: string; clientKey?: string });
    createTransaction(params: SnapTransactionParams): Promise<SnapTransactionResponse>;
  }

  export interface TransactionStatusResponse {
    status_code: string;
    gross_amount: string;
    transaction_status: string;
    fraud_status?: string;
    payment_type?: string;
    transaction_id?: string;
    transaction_time?: string;
  }

  export class CoreApi {
    constructor(config: { isProduction: boolean; serverKey: string; clientKey?: string });
    transaction: {
      status(orderId: string): Promise<TransactionStatusResponse>;
      cancel(orderId: string): Promise<TransactionStatusResponse>;
      expire(orderId: string): Promise<TransactionStatusResponse>;
    };
  }
}
