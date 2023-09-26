![Ichivaults Logo](https://ichi.org/static/img_logo_ichi_black-1c38d8d8e04542b1421ef1a1b2169f57.svg)
# @ichidao/ichi-vaults-sdk
![MIT License](https://badgen.net/badge/license/MIT/blue)

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
yarn add @ichidao/ichi-vaults-sdk
```
or
```bash
npm install @ichidao/ichi-vaults-sdk
```

## Usage
### Vault

#### 1. `isDepositTokenApproved()`

| param | type |  default | required
| -------- | -------- | -------- | --------
| accountAddress   | string | - | true
| tokenIdx           | 0 \| 1 | - | true
| amount   | string \| number, | - | true |
| vaultAddress   | string | - | true |
| jsonProvider      | [JsonRpcProvider](https://github.com/ethers-io/ethers.js/blob/f97b92bbb1bde22fcc44100af78d7f31602863ab/packages/providers/src.ts/json-rpc-provider.ts#L393) | - | true
| dex   | SupportedDex | - | true |

<br/>

```typescript
import { Web3Provider } from '@ethersproject/providers';
import { isDepositTokenApproved, SupportedDex } from '@ichidao/ichi-vaults-sdk';

const web3Provider = new Web3Provider(YOUR_WEB3_PROVIDER);
const vaultAddress = "0x3ac9...a5f132"
const accountAddress = "0xaaaa...aaaaaa"
const amount = 100
const dex = SupportedDex.UniswapV3

const isToken0Approved: boolean = await isDepositTokenApproved(
    accountAddress,
    0, // token idx can be 0 or 1
    amount,
    vaultAddress, 
    web3Provider,
    dex
)
```

#### 2. `approveDepositToken()`

| param | type |  default | required
| -------- | -------- | -------- | --------
| accountAddress   | string | - | true
| tokenIdx           | 0 \| 1 | - | true
| vaultAddress   | string | - | true |
| jsonProvider      | [JsonRpcProvider](https://github.com/ethers-io/ethers.js/blob/f97b92bbb1bde22fcc44100af78d7f31602863ab/packages/providers/src.ts/json-rpc-provider.ts#L393) | - | true
| dex   | SupportedDex | - | true | 
| amount   | string \| number | undefined | false | 
| overrides         | [Overrides](https://github.com/ethers-io/ethers.js/blob/f97b92bbb1bde22fcc44100af78d7f31602863ab/packages/contracts/lib/index.d.ts#L7)  | undefined | false

<br/>

```typescript
import { Web3Provider } from '@ethersproject/providers';
import { approveDepositToken, SupportedDex } from '@ichidao/ichi-vaults-sdk';

const web3Provider = new Web3Provider(YOUR_WEB3_PROVIDER);
const vaultAddress = "0x3ac9...a5f132"
const accountAddress = "0xaaaa...aaaaaa"
const amount = 100
const dex = SupportedDex.UniswapV3

const txnDetails = await approveDepositToken(
    accountAddress, 
    0, // token idx can be 0 or 1
    vaultAddress, 
    web3Provider,
    dex,
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
| dex   | SupportedDex | - | true | 

<br/>

```typescript
import { Web3Provider } from '@ethersproject/providers';
import { isTokenAllowed, SupportedDex } from '@ichidao/ichi-vaults-sdk';

const web3Provider = new Web3Provider(YOUR_WEB3_PROVIDER);
const vaultAddress = "0x3ac9...a5f132"
const dex = SupportedDex.UniswapV3

const ratio = await isTokenAllowed(
    0, // token idx can be 0 or 1
    vaultAddress, 
    web3Provider,
    dex
)

```

#### 4. `getMaxDepositAmount()`

| param | type |  default | required
| -------- | -------- | -------- | --------
| tokenIdx           | 0 \| 1 | - | true
| vaultAddress   | string | - | true |
| jsonProvider      | [JsonRpcProvider](https://github.com/ethers-io/ethers.js/blob/f97b92bbb1bde22fcc44100af78d7f31602863ab/packages/providers/src.ts/json-rpc-provider.ts#L393) | - | true
| dex   | SupportedDex | - | true | 

<br/>

```typescript
import { Web3Provider } from '@ethersproject/providers';
import { getMaxDepositAmount, SupportedDex } from '@ichidao/ichi-vaults-sdk';

const web3Provider = new Web3Provider(YOUR_WEB3_PROVIDER);
const vaultAddress = "0x3ac9...a5f132"
const dex = SupportedDex.UniswapV3

const ratio = await getMaxDepositAmount(
    0, // token idx can be 0 or 1
    vaultAddress, 
    web3Provider,
    dex
)

```

#### 5. `deposit()`

| param | type |  default | required
| -------- | -------- | -------- | --------
| accountAddress   | string | - | true
| amount0           | string \| number | - | true
| amount1           | string \| number | - | true
| vaultAddress   | string | - | true 
| jsonProvider      | [JsonRpcProvider](https://github.com/ethers-io/ethers.js/blob/f97b92bbb1bde22fcc44100af78d7f31602863ab/packages/providers/src.ts/json-rpc-provider.ts#L393) | - | true
| dex   | SupportedDex | - | true 
| percentSlippage   | number | 1 | false 
| overrides         | [Overrides](https://github.com/ethers-io/ethers.js/blob/f97b92bbb1bde22fcc44100af78d7f31602863ab/packages/contracts/lib/index.d.ts#L7)  | undefined | false

<br/>

```typescript
import { Web3Provider } from '@ethersproject/providers';
import { deposit, SupportedDex } from '@ichidao/ichi-vaults-sdk';

const web3Provider = new Web3Provider(YOUR_WEB3_PROVIDER);
const vaultAddress = "0x3ac9...a5f132"
const dex = SupportedDex.UniswapV3
const accountAddress = "0xaaaa...aaaaaa"

const amount0 = 100
const amount1 = 0 
 
const txnDetails = await deposit(
    accountAddress,
    amount0, // can be 0 when only depositing amount1
    amount1, // can be 0 when only depositing amount0
    vaultAddress, 
    web3Provider,
    dex,
    1 // acceptable slippage (percents)
)
```

#### 6. `getUserBalance()`

| param | type |  default | required
| -------- | -------- | -------- | --------
| accountAddress   | string | - | true |
| vaultAddress   | string | - | true |
| jsonProvider      | [JsonRpcProvider](https://github.com/ethers-io/ethers.js/blob/f97b92bbb1bde22fcc44100af78d7f31602863ab/packages/providers/src.ts/json-rpc-provider.ts#L393) | - | true
| dex   | SupportedDex | - | true 
| raw   | true | undefined | false | 

<br/>

```typescript
import { Web3Provider } from '@ethersproject/providers';
import { getUserBalance, SupportedDex } from '@ichidao/ichi-vaults-sdk';

const web3Provider = new Web3Provider(YOUR_WEB3_PROVIDER);
const vaultAddress = "0x3ac9...a5f132"
const dex = SupportedDex.UniswapV3
const accountAddress = "0xaaaa...aaaaaa"

const shares: string = await getUserBalance(
    accountAddress,
    vaultAddress, 
    web3Provider
    dex
)

// - or - 

const sharesBN: BigNumber = await getUserBalance(
    accountAddress,
    vaultAddress, 
    web3Provider
    dex,
    true
)
```

#### 7. `getUserAmounts()`

| param | type |  default | required
| -------- | -------- | -------- | --------
| accountAddress   | string | - | true |
| vaultAddress   | string | - | true |
| jsonProvider      | [JsonRpcProvider](https://github.com/ethers-io/ethers.js/blob/f97b92bbb1bde22fcc44100af78d7f31602863ab/packages/providers/src.ts/json-rpc-provider.ts#L393) | - | true
| dex   | SupportedDex | - | true 
| raw   | true | undefined | false | 

<br/>

```typescript
import { Web3Provider } from '@ethersproject/providers';
import { getUserAmounts, SupportedDex } from '@ichidao/ichi-vaults-sdk';

const web3Provider = new Web3Provider(YOUR_WEB3_PROVIDER);
const vaultAddress = "0x3ac9...a5f132"
const dex = SupportedDex.UniswapV3
const accountAddress = "0xaaaa...aaaaaa"

const amounts: [string, string] & {amount0: string, amount1: string} = await getUserAmounts(
    accountAddress,
    vaultAddress, 
    web3Provider
    dex,
)

// - or - 

const amountsBN: [BigNumber, BigNumber] & {amount0: BigNumber, amount1: BigNumber} = await getUserAmounts(
    accountAddress,
    vaultAddress, 
    web3Provider
    dex,
    true
)
```

#### 8. `getTotalSupply()`

| param | type |  default | required
| -------- | -------- | -------- | --------
| vaultAddress   | string | - | true |
| jsonProvider      | [JsonRpcProvider](https://github.com/ethers-io/ethers.js/blob/f97b92bbb1bde22fcc44100af78d7f31602863ab/packages/providers/src.ts/json-rpc-provider.ts#L393) | - | true
| dex   | SupportedDex | - | true 
| raw   | true | undefined | false | 

<br/>

```typescript
import { Web3Provider } from '@ethersproject/providers';
import { getTotalSupply, SupportedDex } from '@ichidao/ichi-vaults-sdk';

const web3Provider = new Web3Provider(YOUR_WEB3_PROVIDER);
const vaultAddress = "0x3ac9...a5f132"
const dex = SupportedDex.UniswapV3

const shares: string = await getTotalSupply(
    accountAddress,
    vaultAddress, 
    web3Provider
    dex,
)

// - or - 

const sharesBN: BigNumber = await getTotalSupply(
    accountAddress,
    vaultAddress, 
    web3Provider
    dex,
    true
)
```

#### 9. `getTotalAmounts()`

| param | type |  default | required
| -------- | -------- | -------- | --------
| vaultAddress   | string | - | true |
| jsonProvider      | [JsonRpcProvider](https://github.com/ethers-io/ethers.js/blob/f97b92bbb1bde22fcc44100af78d7f31602863ab/packages/providers/src.ts/json-rpc-provider.ts#L393) | - | true
| dex   | SupportedDex | - | true 
| raw   | true | undefined | false | 

<br/>

```typescript
import { Web3Provider } from '@ethersproject/providers';
import { getTotalAmounts, SupportedDex } from '@ichidao/ichi-vaults-sdk';

const web3Provider = new Web3Provider(YOUR_WEB3_PROVIDER);
const vaultAddress = "0x3ac9...a5f132"
const dex = SupportedDex.UniswapV3
const accountAddress = "0xaaaa...aaaaaa"

const amounts: [string, string] & {total0: string, total1: string} = await getTotalAmounts(
    accountAddress,
    vaultAddress, 
    web3Provider
    dex,
)

// - or - 

const amountsBN: [BigNumber, BigNumber] & {total0: BigNumber, total1: BigNumber} = await getTotalAmounts(
    accountAddress,
    vaultAddress, 
    web3Provider
    dex,
    true
)
```

#### 10. `withdraw()`

| param | type |  default | required
| -------- | -------- | -------- | --------
| accountAddress   | string | - | true
| shares           | string \| number | - | true
| vaultAddress   | string | - | true 
| jsonProvider      | [JsonRpcProvider](https://github.com/ethers-io/ethers.js/blob/f97b92bbb1bde22fcc44100af78d7f31602863ab/packages/providers/src.ts/json-rpc-provider.ts#L393) | - | true
| dex   | SupportedDex | - | true 
| overrides         | [Overrides](https://github.com/ethers-io/ethers.js/blob/f97b92bbb1bde22fcc44100af78d7f31602863ab/packages/contracts/lib/index.d.ts#L7)  | undefined | false

<br/>

```typescript
import { Web3Provider } from '@ethersproject/providers';
import { getUserBalance, withdraw, SupportedDex } from '@ichidao/ichi-vaults-sdk';

const web3Provider = new Web3Provider(YOUR_WEB3_PROVIDER);
const vaultAddress = "0x3ac9...a5f132"
const dex = SupportedDex.UniswapV3
const accountAddress = "0xaaaa...aaaaaa"

const totalUserShares: string = await getUserBalance(
    accountAddress,
    vaultAddress, 
    web3Provider
    dex,
)

let shares = Number(totalUserShare) * 0.5 // 50% of user deshare balance

const txnDetails = await withdraw(
    accountAddress,
    shares, 
    vaultAddress, 
    web3Provider,
    dex
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

### SupportedDex

```typescript
enum SupportedDex {
  UniswapV3,
  Retro,
  Pancakeswap,
}
```
