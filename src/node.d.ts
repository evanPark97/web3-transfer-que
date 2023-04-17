declare namespace NodeJS {
    export interface ProcessEnv {
        API_KEY: string;
        API_SECRET_KEY: string;
        MAINNET_HTTP: string;
        TESTNET_HTTP: string;
        OWNER_PUBLIC: string;
        OWNER_PRIVATE: string;
        CONTRACT_ADDRESS: string;
    }
}