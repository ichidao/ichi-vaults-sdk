![Deifedge Logo](https://app.defiedge.io/favicon.png)
# @ichivault/sdk
![MIT License](https://badgen.net/badge/license/MIT/blue) ![minified gzipped size](https://badgen.net/bundlephobia/minzip/@ichivault/sdk@0.0.1-a/)

This sdk contains collection of functions to interact with IchiVault's smart contract.

## Table of Contents

* [__Installation__](#Installation)
* [__Usage__](#Usage)
     * [__Vault Functions__](#Vault)
        * [`isDepositTokenApproved()`](#1-isDepositTokenApproved)
        * [`approveDepositToken()`](#2-approveDepositToken)
        * [`isTokenAllowed()`](#3-isTokenAllowed)
        * [`getMaxDepositAmount()`](#4-getMaxDepositAmount)
        * [`deposit()`](#5-depositLP)
        * [`getUserBalance()`](#6-getUserBalance)
        * [`getUserAmounts()`](#7-getUserAmounts)
        * [`getTotalSupply()`](#8-getTotalSupply)
        * [`getTotalAmounts()`](#9-getTotalAmounts)
        * [`withdraw()`](#10-withdraw)



## Installation
Install with
```bash
yarn add @ichivaults/sdk
```
or
```bash
npm install @ichivaults/sdk
```

## Usage
### Vault

#### 1. `isDepositTokenApproved()`

| param | type |  default | required
| -------- | -------- | -------- | --------
| userAddress   | string | - | true
| tokenIdx           | 0 \| 1 | - | true
| amount   | string \| number, | - | true |
| strategyAddress   | string | - | true |
| jsonProvider      | [JsonRpcProvider](https://github.com/ethers-io/ethers.js/blob/f97b92bbb1bde22fcc44100af78d7f31602863ab/packages/providers/src.ts/json-rpc-provider.ts#L393) | - | true
| aam   | Aam | - | true |

<br/>

```typescript
import { Web3Provider } from '@ethersproject/providers';
import { isDepositTokenApproved } from '@ichivaults/sdk';

const web3Provider = new Web3Provider(YOUR_WEB3_PROVIDER);
const vaultAddress = "0x3ac9...a5f132"
const accountAddress = "0xaaaa...aaaaaa"
const amount = 100
const aam = Aam.UniswapV3

const isToken0Approved: boolean = await isDepositTokenApproved(
    accountAddress,
    0, // token idx can be 0 or 1
    amount,
    vaultAddress, 
    web3Provider,
    aam
)
```

#### 2. `approveDepositToken()`

| param | type |  default | required
| -------- | -------- | -------- | --------
| accountAddress   | string | - | true
| tokenIdx           | 0 \| 1 | - | true
| vaultAddress   | string | - | true |
| jsonProvider      | [JsonRpcProvider](https://github.com/ethers-io/ethers.js/blob/f97b92bbb1bde22fcc44100af78d7f31602863ab/packages/providers/src.ts/json-rpc-provider.ts#L393) | - | true
| aam   | Aam | - | true | 
| amount   | string \| number | undefined | false | 
| overrides         | [Overrides](https://github.com/ethers-io/ethers.js/blob/f97b92bbb1bde22fcc44100af78d7f31602863ab/packages/contracts/lib/index.d.ts#L7)  | undefined | false

<br/>

```typescript
import { Web3Provider } from '@ethersproject/providers';
import { approveDepositToken } from '@ichivaults/sdk';

const web3Provider = new Web3Provider(YOUR_WEB3_PROVIDER);
const vaultAddress = "0x3ac9...a5f132"
const accountAddress = "0xaaaa...aaaaaa"
const amount = 100
const aam = Aam.UniswapV3

const txnDetails = await approveStrategyToken(
    accountAddress, 
    0, // token idx can be 0 or 1
    vaultAddress, 
    web3Provider,
    aam,
    amount // (optional)
);

await txnDetails.wait(); 

// can now deposit token0 
// ...
```

#### 3. `isTokenAllowed()`

| param | type |  default | required
| -------- | -------- | -------- | --------
| tokenIdx           | 0 \| 1 | - | true
| vaultAddress   | string | - | true |
| jsonProvider      | [JsonRpcProvider](https://github.com/ethers-io/ethers.js/blob/f97b92bbb1bde22fcc44100af78d7f31602863ab/packages/providers/src.ts/json-rpc-provider.ts#L393) | - | true
| aam   | Aam | - | true | 

<br/>

```typescript
import { Web3Provider } from '@ethersproject/providers';
import { isTokenAllowed } from '@ichivaults/sdk';

const web3Provider = new Web3Provider(YOUR_WEB3_PROVIDER);
const vaultAddress = "0x3ac9...a5f132"
const aam = Aam.UniswapV3

const ratio = await isTokenAllowed(
    0, // token idx can be 0 or 1
    vaultAddress, 
    web3Provider,
    aam,
)

```

#### 4. `getMaxDepositAmount()`

| param | type |  default | required
| -------- | -------- | -------- | --------
| tokenIdx           | 0 \| 1 | - | true
| vaultAddress   | string | - | true |
| jsonProvider      | [JsonRpcProvider](https://github.com/ethers-io/ethers.js/blob/f97b92bbb1bde22fcc44100af78d7f31602863ab/packages/providers/src.ts/json-rpc-provider.ts#L393) | - | true
| aam   | Aam | - | true | 

<br/>

```typescript
import { Web3Provider } from '@ethersproject/providers';
import { getMaxDepositAmount } from '@ichivaults/sdk';

const web3Provider = new Web3Provider(YOUR_WEB3_PROVIDER);
const vaultAddress = "0x3ac9...a5f132"
const aam = Aam.UniswapV3

const ratio = await getMaxDepositAmount(
    0, // token idx can be 0 or 1
    vaultAddress, 
    web3Provider,
    aam,
)

```

#### 4. `deposit()`

| param | type |  default | required
| -------- | -------- | -------- | --------
| accountAddress   | string | - | true
| amount0           | string \| number | - | true
| amount1           | string \| number | - | true
| vaultAddress   | string | - | true 
| jsonProvider      | [JsonRpcProvider](https://github.com/ethers-io/ethers.js/blob/f97b92bbb1bde22fcc44100af78d7f31602863ab/packages/providers/src.ts/json-rpc-provider.ts#L393) | - | true
| aam   | Aam | - | true 
| percentSlippage   | number | 1 | false 
| overrides         | [Overrides](https://github.com/ethers-io/ethers.js/blob/f97b92bbb1bde22fcc44100af78d7f31602863ab/packages/contracts/lib/index.d.ts#L7)  | undefined | false

<br/>

```typescript
import { Web3Provider } from '@ethersproject/providers';
import { deposit } from '@ichivaults/sdk';

const web3Provider = new Web3Provider(YOUR_WEB3_PROVIDER);
const vaultAddress = "0x3ac9...a5f132"
const aam = Aam.UniswapV3
const accountAddress = "0xaaaa...aaaaaa"

const amount0 = 100
const amount1 = 0 
 
const txnDetails = await deposit(
    accountAddress,
    amount0, // can be 0 when only depositing amount1
    amount1, // can be 0 when only depositing amount0
    vaultAddress, 
    web3Provider,
    aam,
    2 // slippage (percents)
)
```

#### 5. `getUserBalance()`

| param | type |  default | required
| -------- | -------- | -------- | --------
| accountAddress   | string | - | true |
| vaultAddress   | string | - | true |
| jsonProvider      | [JsonRpcProvider](https://github.com/ethers-io/ethers.js/blob/f97b92bbb1bde22fcc44100af78d7f31602863ab/packages/providers/src.ts/json-rpc-provider.ts#L393) | - | true
| aam   | Aam | - | true 
| raw   | true | undefined | false | 

<br/>

```typescript
import { Web3Provider } from '@ethersproject/providers';
import { getUserBalance } from '@ichivaults/sdk';

const web3Provider = new Web3Provider(YOUR_WEB3_PROVIDER);
const vaultAddress = "0x3ac9...a5f132"
const aam = Aam.UniswapV3
const accountAddress = "0xaaaa...aaaaaa"

const shares: string = await getUserBalance(
    accountAddress,
    vaultAddress, 
    web3Provider
    aam,
)

// - or - 

const sharesBN: BigNumber = await getUserBalance(
    accountAddress,
    vaultAddress, 
    web3Provider
    aam,
    true
)
```

#### 6. `getUserAmounts()`

| param | type |  default | required
| -------- | -------- | -------- | --------
| accountAddress   | string | - | true |
| vaultAddress   | string | - | true |
| jsonProvider      | [JsonRpcProvider](https://github.com/ethers-io/ethers.js/blob/f97b92bbb1bde22fcc44100af78d7f31602863ab/packages/providers/src.ts/json-rpc-provider.ts#L393) | - | true
| aam   | Aam | - | true 
| raw   | true | undefined | false | 

<br/>

```typescript
import { Web3Provider } from '@ethersproject/providers';
import { getUserAmounts } from '@ichivaults/sdk';

const web3Provider = new Web3Provider(YOUR_WEB3_PROVIDER);
const vaultAddress = "0x3ac9...a5f132"
const aam = Aam.UniswapV3
const accountAddress = "0xaaaa...aaaaaa"

const amounts: [string, string] & {amount0: string, amount1: string} = await getUserAmounts(
    accountAddress,
    vaultAddress, 
    web3Provider
    aam,
)

// - or - 

const amountsBN: [BigNumber, BigNumber] & {amount0: BigNumber, amount1: BigNumber} = await getUserAmounts(
    accountAddress,
    vaultAddress, 
    web3Provider
    aam,
    true
)
```

#### 7. `getTotalSupply()`

| param | type |  default | required
| -------- | -------- | -------- | --------
| vaultAddress   | string | - | true |
| jsonProvider      | [JsonRpcProvider](https://github.com/ethers-io/ethers.js/blob/f97b92bbb1bde22fcc44100af78d7f31602863ab/packages/providers/src.ts/json-rpc-provider.ts#L393) | - | true
| aam   | Aam | - | true 
| raw   | true | undefined | false | 

<br/>

```typescript
import { Web3Provider } from '@ethersproject/providers';
import { getTotalSupply } from '@ichivaults/sdk';

const web3Provider = new Web3Provider(YOUR_WEB3_PROVIDER);
const vaultAddress = "0x3ac9...a5f132"
const aam = Aam.UniswapV3

const shares: string = await getTotalSupply(
    accountAddress,
    vaultAddress, 
    web3Provider
    aam,
)

// - or - 

const sharesBN: BigNumber = await getTotalSupply(
    accountAddress,
    vaultAddress, 
    web3Provider
    aam,
    true
)
```

#### 8. `getTotalAmounts()`

| param | type |  default | required
| -------- | -------- | -------- | --------
| vaultAddress   | string | - | true |
| jsonProvider      | [JsonRpcProvider](https://github.com/ethers-io/ethers.js/blob/f97b92bbb1bde22fcc44100af78d7f31602863ab/packages/providers/src.ts/json-rpc-provider.ts#L393) | - | true
| aam   | Aam | - | true 
| raw   | true | undefined | false | 

<br/>

```typescript
import { Web3Provider } from '@ethersproject/providers';
import { getTotalAmounts } from '@ichivaults/sdk';

const web3Provider = new Web3Provider(YOUR_WEB3_PROVIDER);
const vaultAddress = "0x3ac9...a5f132"
const aam = Aam.UniswapV3
const accountAddress = "0xaaaa...aaaaaa"

const amounts: [string, string] & {total0: string, total1: string} = await getTotalAmounts(
    accountAddress,
    vaultAddress, 
    web3Provider
    aam,
)

// - or - 

const amountsBN: [BigNumber, BigNumber] & {total0: BigNumber, total1: BigNumber} = await getTotalAmounts(
    accountAddress,
    vaultAddress, 
    web3Provider
    aam,
    true
)
```

#### 9. `withdraw()`

| param | type |  default | required
| -------- | -------- | -------- | --------
| accountAddress   | string | - | true
| shares           | string \| number | - | true
| vaultAddress   | string | - | true 
| jsonProvider      | [JsonRpcProvider](https://github.com/ethers-io/ethers.js/blob/f97b92bbb1bde22fcc44100af78d7f31602863ab/packages/providers/src.ts/json-rpc-provider.ts#L393) | - | true
| aam   | Aam | - | true 
| overrides         | [Overrides](https://github.com/ethers-io/ethers.js/blob/f97b92bbb1bde22fcc44100af78d7f31602863ab/packages/contracts/lib/index.d.ts#L7)  | undefined | false

<br/>

```typescript
import { Web3Provider } from '@ethersproject/providers';
import { getUserBalance, withdraw } from '@defiedge/sdk';

const web3Provider = new Web3Provider(YOUR_WEB3_PROVIDER);
const vaultAddress = "0x3ac9...a5f132"
const aam = Aam.UniswapV3
const accountAddress = "0xaaaa...aaaaaa"

const totalUserShares: string = await getUserBalance(
    accountAddress,
    vaultAddress, 
    web3Provider
    aam,
)

let shares = Number(totalUserShare) * 0.5 // 50% of user deshare balance

const txnDetails = await withdraw(
    accountAddress,
    shares, 
    vaultAddress, 
    web3Provider,
    aam
)
```



## Types

### SupportedChainId

```typescript
enum SupportedChainId {
  arbitrum = 42161,
  mainnet = 1,
  polygon = 137,
  bsc = 56,
}
```

### Aam

```typescript
enum Aam {
  UniswapV3,
  Retro,
  Pancakeswap,
}
```


This version of `@ichivaults/sdk` is still in beta, so unfortunately documentation is pretty sparse at the moment. Comments and the source code itself are the best ways to get an idea of what's going on. More thorough documentation is a priority as development continues!
