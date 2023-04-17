import Web3 from 'web3';
import dotenv from 'dotenv';
import Queue from './utils/queue';
import { QueueData, AccountInterface, ContractInterface, ResponseMessage } from './utils/interface';
import axios from "axios";

// ENV파일 경로 설정
dotenv.config();

const ENV: NodeJS.ProcessEnv = process.env;

// Owner 계정 정보 설정
const ACCOUNT: AccountInterface =  {
    address: ENV.OWNER_PUBLIC,
    private: ENV.OWNER_PRIVATE,
}

const CONTRACT: ContractInterface = {
    address: ENV.CONTRACT_ADDRESS,
    abi: require(`../contractABI/${ENV.CONTRACT_ADDRESS}.json`),
}
const web3 = new Web3(new Web3.providers.HttpProvider(ENV.MAINNET_HTTP));
const COB = new web3.eth.Contract(CONTRACT.abi, CONTRACT.address);
console.clear();
console.log(`[ Setting Information ]`);
console.log(` -- ${ACCOUNT.address}`);
console.log(` -- ${CONTRACT.address}`);
console.log(ENV.MAINNET_HTTP);

// 전역사용 큐 생성
const que = new Queue;
const failQue = new Queue;

const holders = [
    { address: "0x0000...", value: 1000 },
]

const setEventData = async () => {    
    holders.map((holder) => {
        que.enqueue(holder);
        console.log(holder);
    });
}

const executeEvent = async () => {
    const data = que.dequeue();

    console.clear();
    console.log(data);

    if(data){
        const address = data.address;
        const value = data.value;
    
        try{
            await executeTokenTransferEvent(address, value); // 토큰 전송
            await executeMaticTransferEvent(address); // Matic transfer
        }
        catch(err){
            console.error(err);
            failQue.enqueue(data);
        }
    } else {
        console.log('Queue is empty');
    }
}

const getGasData = async () => {
    const gasData = await axios('https://gasstation-mainnet.matic.network/v2');
    const { maxPriorityFee, maxFee } = gasData.data.standard;
    const maxFeeConvert = web3.utils.toHex(web3.utils.toWei(Math.floor(maxFee).toString(), 'gwei'));
    const maxPriorityFeeConvert = web3.utils.toHex(web3.utils.toWei(Math.floor(maxPriorityFee).toString(), 'gwei'));
    return { maxFee: maxFeeConvert, maxPriorityFee: maxPriorityFeeConvert }
}

const executeTokenTransferEvent = async (address: string, value: string) => {
    const encodeABI : string = COB.methods.transfer(address, web3.utils.toWei((value).toString(), 'ether')).encodeABI();

    console.clear();
    console.log(`[ Token Send Execute ]`);

    const { maxFee, maxPriorityFee } = await getGasData();

    const estimateGas = await web3.eth.estimateGas({
        from: ACCOUNT.address, // 컨트랙트 발행자 주소
        to: CONTRACT.address, // 컨트랙트 주소
        value: 0,
        data: encodeABI,
    })

    const transaction = {
        gasLimit: web3.utils.toHex(estimateGas.toString()),
        maxFee: maxFee,
        // maxPriorityFee: maxPriorityFeeConvert,
        maxPriorityFeePerGas: maxPriorityFee,
        from: ACCOUNT.address,
        to: CONTRACT.address,
        value: 0,
        data: encodeABI
    }

    await transactionExecute(transaction);
}

const executeMaticTransferEvent = async (address: string) => {
    const value = web3.utils.toHex(web3.utils.toBN(5000000000000000));
    const estimateGas = await web3.eth.estimateGas({
        from: ACCOUNT.address,
        to: address,
        value: value,
    })

    const { maxFee, maxPriorityFee } = await getGasData();

    console.clear();
    console.log(`[ Matic Send Execute ]`);

    const transaction = {
        gasLimit: web3.utils.toHex(estimateGas.toString()),
        maxFee: maxFee,
        // maxPriorityFee: maxPriorityFeeConvert,
        maxPriorityFeePerGas: maxPriorityFee,
        from: ACCOUNT.address,
        to: address,
        value: value,
    }

    await transactionExecute(transaction);
}

const transactionExecute = async (transaction) => {
    const signedTransaction = await web3.eth.accounts.signTransaction(transaction, ACCOUNT.private);
    const result = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction)
      .on('confirmation', (confirmationNumber, receipt, lastBlockHash) => { // 12번째까지 블럭을 모두 확인한 이후
          console.clear();
          console.log(`Confirm count: ${confirmationNumber} / 24`);
          if(confirmationNumber == 24){
              console.clear();
              const transactionHash = result.transactionHash;
              const message: ResponseMessage = {
                  type: 'Confirm',
                  message: `Confirm Transaction`,
                  hash: transactionHash,
              }
              console.log(message);
              return executeEvent();
          }
      })
      .on('error', (err) => { // 오류발생시
          console.log('error');
          console.log(err);

          const transactionHash = result.transactionHash;
          const message: ResponseMessage = {
              type: 'Confirm',
              message: `Confirm Transaction`,
              hash: transactionHash,
          }
          console.error(message);
      })
}

const run = async () => {
    await setEventData();
    // await executeEvent();
}

run();