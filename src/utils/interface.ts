export interface QueueData {
    address: string;
    value?: string;
}

export interface AccountInterface {
    address: string;
    private: string;
}

export interface ContractInterface {
    address: string;
    abi: any[];
}

export interface ResponseMessage {
    type: string;
    message: string;
    code?: string;
    hash?: string;
}