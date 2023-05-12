import * as path from "path";
import { URL } from 'url';

const __filename = new URL('', import.meta.url).pathname;
const __dirname = new URL('.', import.meta.url).pathname;

// Assume add.wasm file exists that contains a single function adding 2 provided arguments
import * as fs from 'fs';

const wasmBuffer = fs.readFileSync(path.resolve(__dirname,'../a.out.wasm'));

const env = new WebAssembly.Global({
    value: "i32",
    memoryBase: 0,
    tableBase: 0,
    memory: new WebAssembly.Memory({
      initial: 256
    }),
    table: new WebAssembly.Table({
      initial: 0,
      element: 'anyfunc'
    })
});

WebAssembly.instantiate(new Uint8Array(wasmBuffer), {
    js: env
  }).then(wasmModule => {
  // Exported function live under instance.exports
  console.log("instanciated");
  const { add } = wasmModule.instance.exports;
  const sum = add(5, 6);
  console.log(sum); // Outputs: 11
});

//import { dirname } from 'path';
//import { createRequire } from 'module';
//globalThis.__dirname = dirname(import.meta.url).substring(7);
//globalThis.require = createRequire(import.meta.url);

//import loadWASM from '../a.out.js';

//const wasm_module = await loadWASM();
//console.log(wasm_module._increment(12));