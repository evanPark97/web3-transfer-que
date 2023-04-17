"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const web3_1 = __importDefault(require("web3"));
const dotenv_1 = __importDefault(require("dotenv"));
const queue_1 = __importDefault(require("./utils/queue"));
// ENV파일 경로 설정
dotenv_1.default.config();
const ENV = process.env;
// Owner 계정 정보 설정
const ACCOUNT = {
    address: ENV.OWNER_PUBLIC,
    private: ENV.OWNER_PRIVATE,
};
const CONTRACT = {
    address: ENV.CONTRACT_ADDRESS,
    abi: require(`../contractABI/${ENV.CONTRACT_ADDRESS}.json`),
};
const web3 = new web3_1.default(new web3_1.default.providers.HttpProvider(ENV.MAINNET_HTTP));
const COB = new web3.eth.Contract(CONTRACT.abi, CONTRACT.address);
console.clear();
console.log(`[ Setting Information ]`);
console.log(` -- ${ACCOUNT.address}`);
console.log(` -- ${CONTRACT.address}`);
console.log(ENV.MAINNET_HTTP);
// 전역사용 큐 생성
const que = new queue_1.default;
const failQue = new queue_1.default;
const holders = [
    { address: "0xb9Bab9CcA7aD4B788aA6b58DAAD7C2d996e6779f", value: 1 },
    { address: "0xb9Bab9CcA7aD4B788aA6b58DAAD7C2d996e6779f", value: 2 },
    { address: "0xb9Bab9CcA7aD4B788aA6b58DAAD7C2d996e6779f", value: 3 },
    { address: "0xb9Bab9CcA7aD4B788aA6b58DAAD7C2d996e6779f", value: 4 },
    { address: "0xb9Bab9CcA7aD4B788aA6b58DAAD7C2d996e6779f", value: 5 },
    { address: "0xb9Bab9CcA7aD4B788aA6b58DAAD7C2d996e6779f", value: 6 },
    { address: "0xb9Bab9CcA7aD4B788aA6b58DAAD7C2d996e6779f", value: 7 },
];
const setEventData = () => __awaiter(void 0, void 0, void 0, function* () {
    holders.map((holder) => {
        que.enqueue(holder);
    });
});
const executeEvent = () => __awaiter(void 0, void 0, void 0, function* () {
    const data = que.dequeue();
    console.clear();
    console.log(data);
    if (data) {
        const address = data.address;
        const value = data.value;
        try {
            yield executeTokenTransferEvent(address, value); // 토큰 전송
        }
        catch (err) {
            console.error(err);
            failQue.enqueue(data);
        }
    }
    else {
        console.log('Queue is empty');
    }
});
const executeTokenTransferEvent = (address, value) => __awaiter(void 0, void 0, void 0, function* () {
    const encodeABI = COB.methods.transfer(address, web3.utils.toWei((value).toString(), 'ether')).encodeABI();
    const gasPrice = 100000000000;
    const estimateGas = yield web3.eth.estimateGas({
        from: ACCOUNT.address,
        to: CONTRACT.address,
        value: 0,
        data: encodeABI,
    });
    console.clear();
    console.log(`[ Token Send Execute ]`);
    const transaction = {
        gasPrice: web3.utils.toHex(gasPrice.toString()),
        gasLimit: web3.utils.toHex(estimateGas.toString()),
        from: ACCOUNT.address,
        to: CONTRACT.address,
        value: 0,
        data: encodeABI
    };
    const signedTransaction = yield web3.eth.accounts.signTransaction(transaction, ACCOUNT.private);
    const result = yield web3.eth.sendSignedTransaction(signedTransaction.rawTransaction)
        .on('confirmation', (confirmationNumber, receipt, lastBlockHash) => {
        console.clear();
        console.log(`Confirm count: ${confirmationNumber} / 24`);
        if (confirmationNumber == 24) {
            console.clear();
            const transactionHash = result.transactionHash;
            const message = {
                type: 'Confirm',
                message: `Confirm Transaction`,
                hash: transactionHash,
            };
            console.log(message);
            return executeMaticTransferEvent(address);
        }
    })
        .on('error', (err) => {
        console.log('error');
        console.log(err);
        const transactionHash = result.transactionHash;
        const message = {
            type: 'Confirm',
            message: `Confirm Transaction`,
            hash: transactionHash,
        };
        console.error(message);
    });
});
const executeMaticTransferEvent = (address) => __awaiter(void 0, void 0, void 0, function* () {
    const value = web3.utils.toHex(web3.utils.toBN(5000000000000000));
    const gasPrice = 100000000000;
    const estimateGas = yield web3.eth.estimateGas({
        from: ACCOUNT.address,
        to: address,
        value: value,
    });
    console.clear();
    console.log(`[ Matic Send Execute ]`);
    const transaction = {
        gasPrice: web3.utils.toHex(gasPrice.toString()),
        gasLimit: web3.utils.toHex(estimateGas.toString()),
        from: ACCOUNT.address,
        to: address,
        value: value,
    };
    const signedTransaction = yield web3.eth.accounts.signTransaction(transaction, ACCOUNT.private);
    const result = yield web3.eth.sendSignedTransaction(signedTransaction.rawTransaction)
        .on('confirmation', (confirmationNumber, receipt, lastBlockHash) => {
        console.clear();
        console.log(`Confirm count: ${confirmationNumber} / 24`);
        if (confirmationNumber == 24) {
            console.clear();
            const transactionHash = result.transactionHash;
            const message = {
                type: 'Confirm',
                message: `Confirm Transaction`,
                hash: transactionHash,
            };
            console.log(message);
            return executeEvent();
        }
    })
        .on('error', (err) => {
        console.log('error');
        console.log(err);
        const transactionHash = result.transactionHash;
        const message = {
            type: 'Confirm',
            message: `Confirm Transaction`,
            hash: transactionHash,
        };
        console.error(message);
    });
});
const run = () => {
    setEventData();
    executeEvent();
};
run();
