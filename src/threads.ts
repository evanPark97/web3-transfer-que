import { Worker } from "worker_threads";
import { spawn } from 'child_process';
import * as fs from "fs";

/*
* tsconfig의 alias 설정후 테스트 진행해야할듯
* 패키지의 경로를 정상적으로 찾아오지 못하는 오류가 있음
* */

const thread_test = () => {
  const file = fs.readFileSync('./src/queue_token_transfer.ts', 'utf-8');
  const worker = new Worker(file);

  console.log(worker);
}

thread_test();