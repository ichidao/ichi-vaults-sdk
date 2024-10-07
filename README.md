![Ichivaults Logo](https://ichi.org/static/img_logo_ichi_black-1c38d8d8e04542b1421ef1a1b2169f57.svg)
# @ichidao/ichi-vaults-sdk
![MIT License](https://badgen.net/badge/license/MIT/blue)

This sdk contains collection of functions to interact with IchiVault's smart contract.

## Table of Contents

* [__Installation__](#Installation)
* [__Subgraphs__](#Subgraphs)
* [__Usage__](#Usage)
     * [__Vault Functions__](#Vault)
        * [`approveDepositToken()`](#1-approveDepositToken)
        * [`deposit()`](#2-depositLP)
        * [`depositNativeToken()`](#3-depositLP)
        * [`approveVaultToken()`](#4-approveDepositToken)
        * [`isVaultTokenApproved()`](#5-approveDepositToken)
        * [`withdraw()`](#6-withdraw)
        * [`withdrawWithSlippage()`](#7-withdraw)
        * [`withdrawNativeToken()`](#8-withdraw)
        * [`isDepositTokenApproved()`](#9-isDepositTokenApproved)
        * [`isTokenAllowed()`](#10-isTokenAllowed)
        * [`getMaxDepositAmount()`](#11-getMaxDepositAmount)
        * [`getUserBalance()`](#12-getUserBalance)
        * [`getUserAmounts()`](#13-getUserAmounts)
        * [`getAllUserBalances()`](#14-getAllUserBalances)
        * [`getAllUserAmounts()`](#15-getAllUserAmounts)
        * [`getTotalSupply()`](#16-getTotalSupply)
        * [`getTotalAmounts()`](#17-getTotalAmounts)
        * [`getFeesCollected()`](#18-getFeesCollected)
        * [`getFeesCollectedInfo()`](#19-getFeesCollectedInfo)
        * [`getAverageDepositTokenRatios()`](#20-getAverageDepositTokenRatios)
        * [`getLpApr()`](#21-getLpApr)
        * [`getLpPriceChange()`](#22-getLpPriceChange)
        * [`getVaultMetrics()`](#23-getVaultMetrics)
        * [`getIchiVaultInfo()`](#24-getIchiVaultInfo)
        * [`getVaultsByTokens()`](#25-getVaultsByTokens)
        * [`getVaultsByPool()`](#26-getVaultsByPool)
        * [`getVaultPositions()`](#27-getVaultPositions)
        * [`getSupportedDexes()`](#28-getSupportedDexes)
        * [`getChainsForDex()`](#29-getChainsForDex)

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
### Subgraphs
This SDK uses subgraphs to obtain information about ICHI vaults. The subgraphs are deployed in the Subgraph Studio and published on Arbitrum One. If you prefer to use published subgraphs, you need to add your [subgraph API key](https://thegraph.com/studio/apikeys/) to the SUBGRAPH_API_KEY environment variable. Otherwise, the SDK will use the subgraph's Studio endpoint.

### Vault

#### 1. `approveDepositToken()`

| param | type |  default | required
| -------- | -------- | -------- | --------
| accountAddress   | string | - | true
| tokenIdx           | 0 \| 1 | - | true
| vaultAddress   | string | - | true |
| jsonProvider      | [JsonRpcProvider](https://github.com/ethers-io/ethers.js/blob/f97b92bbb1bde22fcc44100af78d7f31602863ab/packages/providers/src.ts/json-rpc-provider.ts#L393) | - | true
| dex   | SupportedDex | - | true |
| amount   | string \| number \| BigNumber | undefined | false |
| overrides         | [Overrides](https://github.com/ethers-io/ethers.js/blob/f97b92bbb1bde22fcc44100af78d7f31602863ab/packages/contracts/lib/index.d.ts#L7)  | undefined | false

<br/>
This function approves tokens for deposit into the vault and must be called before the deposit() function.
The 'amount' parameter can be either a string or a number, representing the number of tokens in major units. For instance, if the deposit token is wETH, 'amount' being equal to 0.5 or '0.5' signifies 0.5 wETH. If the 'amount' parameter is not specified the token will be approved for the maximum allowable amount.

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

#### 2. `deposit()`

| param | type |  default | required
| -------- | -------- | -------- | --------
| accountAddress   | string | - | true
| amount0           | string \| number \| BigNumber | - | true
| amount1           | string \| number \| BigNumber | - | true
| vaultAddress   | string | - | true
| jsonProvider      | [JsonRpcProvider](https://github.com/ethers-io/ethers.js/blob/f97b92bbb1bde22fcc44100af78d7f31602863ab/packages/providers/src.ts/json-rpc-provider.ts#L393) | - | true
| dex   | SupportedDex | - | true
| percentSlippage   | number | 1 | false
| overrides         | [Overrides](https://github.com/ethers-io/ethers.js/blob/f97b92bbb1bde22fcc44100af78d7f31602863ab/packages/contracts/lib/index.d.ts#L7)  | undefined | false

<br/>
This function facilitates deposits into the vault.
The 'amount0' and 'amount1' parameters can be either a string or a number, representing the number of tokens in major units. For instance, if the deposit token is wETH, 'amount' being equal to 0.5 or '0.5' signifies 0.5 wETH.
One of the 'amount' parameters must be set to zero. Use the isTokenAllowed() function to determing if a token could be deposited.

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

#### 3. `depositNativeToken()`

| param | type |  default | required
| -------- | -------- | -------- | --------
| accountAddress   | string | - | true
| amount0           | string \| number \| BigNumber | - | true
| amount1           | string \| number \| BigNumber | - | true
| vaultAddress   | string | - | true
| jsonProvider      | [JsonRpcProvider](https://github.com/ethers-io/ethers.js/blob/f97b92bbb1bde22fcc44100af78d7f31602863ab/packages/providers/src.ts/json-rpc-provider.ts#L393) | - | true
| dex   | SupportedDex | - | true
| percentSlippage   | number | 1 | false
| overrides         | [Overrides](https://github.com/ethers-io/ethers.js/blob/f97b92bbb1bde22fcc44100af78d7f31602863ab/packages/contracts/lib/index.d.ts#L7)  | undefined | false

<br/>
This function deposits native tokens of the chain into the vault if the vault accepts wrapped native token deposits.
The 'amount0' and 'amount1' parameters can be either a string or a number, representing the number of tokens in major units. For instance, if the deposit token is wETH, 'amount' being equal to 0.5 or '0.5' signifies 0.5 wETH, and 0.5 ETH will be deposited.
The other 'amount' parameter must be set to zero.

```typescript
import { Web3Provider } from '@ethersproject/providers';
import { deposit, SupportedDex } from '@ichidao/ichi-vaults-sdk';

const web3Provider = new Web3Provider(YOUR_WEB3_PROVIDER);
const vaultAddress = "0x3ac9...a5f132"
const dex = SupportedDex.UniswapV3
const accountAddress = "0xaaaa...aaaaaa"

const amount0 = 100
const amount1 = 0

const txnDetails = await depositNativeToken(
    accountAddress,
    amount0, // can be 0 when only depositing amount1
    amount1, // can be 0 when only depositing amount0
    vaultAddress,
    web3Provider,
    dex,
    1 // acceptable slippage (percents)
)
```

#### 4. `approveVaultToken()`

| param | type |  default | required
| -------- | -------- | -------- | --------
| accountAddress   | string | - | true
| vaultAddress   | string | - | true |
| jsonProvider      | [JsonRpcProvider](https://github.com/ethers-io/ethers.js/blob/f97b92bbb1bde22fcc44100af78d7f31602863ab/packages/providers/src.ts/json-rpc-provider.ts#L393) | - | true
| dex   | SupportedDex | - | true |
| shares   | string \| number \| BigNumber | undefined | false |
| overrides         | [Overrides](https://github.com/ethers-io/ethers.js/blob/f97b92bbb1bde22fcc44100af78d7f31602863ab/packages/contracts/lib/index.d.ts#L7)  | undefined | false

<br/>
The approveVaultToken() function facilitates the approval of vault tokens for the withdrawWithSlipage() and withdrawNativeToken functions. The 'shares' parameter can be either a string or a number, representing the number of vault tokens in major units. For example, if 'shares' is equal to 0.5 or '0.5', it signifies 0.5 vault token. If the 'shares' parameter is not specified, the token will be approved for the maximum allowable amount.

```typescript
import { Web3Provider } from '@ethersproject/providers';
import { approveVaultToken, SupportedDex } from '@ichidao/ichi-vaults-sdk';

const web3Provider = new Web3Provider(YOUR_WEB3_PROVIDER);
const vaultAddress = "0x3ac9...a5f132"
const accountAddress = "0xaaaa...aaaaaa"
const amount = 100
const dex = SupportedDex.UniswapV3

const txnDetails = await approveVaultToken(
    accountAddress,
    vaultAddress,
    web3Provider,
    dex,
    amount // (optional)
);

await txnDetails.wait();

// can now deposit token0
// ...
```

#### 5. `isVaultTokenApproved()`

| param | type |  default | required
| -------- | -------- | -------- | --------
| accountAddress   | string | - | true
| shares   | string \| number \| BigNumber, | - | true |
| vaultAddress   | string | - | true |
| jsonProvider      | [JsonRpcProvider](https://github.com/ethers-io/ethers.js/blob/f97b92bbb1bde22fcc44100af78d7f31602863ab/packages/providers/src.ts/json-rpc-provider.ts#L393) | - | true
| dex   | SupportedDex | - | true |

<br/>
This function returns true if the vault token allowance is non-zero and greater than or equal to the specified amount.
The 'shares' parameter can be either a string or a number, representing the number of vault tokens in major units. For example, if 'shares' is equal to 0.5 or '0.5', it signifies 0.5 vault token.


```typescript
import { Web3Provider } from '@ethersproject/providers';
import { isVaultTokenApproved, SupportedDex } from '@ichidao/ichi-vaults-sdk';

const web3Provider = new Web3Provider(YOUR_WEB3_PROVIDER);
const vaultAddress = "0x3ac9...a5f132"
const accountAddress = "0xaaaa...aaaaaa"
const amount = 100
const dex = SupportedDex.UniswapV3

const isApproved: boolean = await isVaultTokenApproved(
    accountAddress,
    amount,
    vaultAddress,
    web3Provider,
    dex
)
```

#### 6. `withdraw()`

| param | type |  default | required
| -------- | -------- | -------- | --------
| accountAddress   | string | - | true
| shares           | string \| number \| BigNumber | - | true
| vaultAddress   | string | - | true
| jsonProvider      | [JsonRpcProvider](https://github.com/ethers-io/ethers.js/blob/f97b92bbb1bde22fcc44100af78d7f31602863ab/packages/providers/src.ts/json-rpc-provider.ts#L393) | - | true
| dex   | SupportedDex | - | true
| overrides         | [Overrides](https://github.com/ethers-io/ethers.js/blob/f97b92bbb1bde22fcc44100af78d7f31602863ab/packages/contracts/lib/index.d.ts#L7)  | undefined | false

<br/>
This function facilitates the withdrawal of the specified amount of shares from the vault. As a result, both vault tokens are added to the user's account. The 'shares' parameter can be either a string or a number, representing the number of vault tokens to be withdrawn from the vault, specified in major units. For instance, if 'shares' is equal to 0.5 or '0.5', it signifies 0.5 vault token.

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
    web3Provider,
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

#### 7. `withdrawWithSlippage()`

| param | type |  default | required
| -------- | -------- | -------- | --------
| accountAddress   | string | - | true
| shares           | string \| number \| BigNumber | - | true
| vaultAddress   | string | - | true
| jsonProvider      | [JsonRpcProvider](https://github.com/ethers-io/ethers.js/blob/f97b92bbb1bde22fcc44100af78d7f31602863ab/packages/providers/src.ts/json-rpc-provider.ts#L393) | - | true
| dex   | SupportedDex | - | true
| percentSlippage   | number | 1 | false
| overrides         | [Overrides](https://github.com/ethers-io/ethers.js/blob/f97b92bbb1bde22fcc44100af78d7f31602863ab/packages/contracts/lib/index.d.ts#L7)  | undefined | false

<br/>
Similar to the withdraw() function, this function facilitates the withdrawal of the specified amount of shares from the vault. Furthermore, it enables the setting of the slippage for the withdrawal transaction. By default, the slippage is set to 1%. If the slippage exceeds the specified amount, the transaction will not be executed. Ensure to use the approveVaultToken() function before invoking withdrawWithSlippage().

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
    web3Provider,
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

#### 8. `withdrawNativeToken()`

| param | type |  default | required
| -------- | -------- | -------- | --------
| accountAddress   | string | - | true
| shares           | string \| number \| BigNumber | - | true
| vaultAddress   | string | - | true
| jsonProvider      | [JsonRpcProvider](https://github.com/ethers-io/ethers.js/blob/f97b92bbb1bde22fcc44100af78d7f31602863ab/packages/providers/src.ts/json-rpc-provider.ts#L393) | - | true
| dex   | SupportedDex | - | true
| percentSlippage   | number | 1 | false
| overrides         | [Overrides](https://github.com/ethers-io/ethers.js/blob/f97b92bbb1bde22fcc44100af78d7f31602863ab/packages/contracts/lib/index.d.ts#L7)  | undefined | false

<br/>
Similar to the withdraw() function, this function facilitates the withdrawal of the specified amount of shares from the vault. This function could be used for vaults in which one of the tokens is a wrapped native token of the chain. Both vault tokens are added to the user's account after the withdrawal. Additionally, the wrapped token is converted to the native token. Ensure to use the approveVaultToken() function before invoking withdrawNativeToken().

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
    web3Provider,
    dex
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

#### 9. `isDepositTokenApproved()`

| param | type |  default | required
| -------- | -------- | -------- | --------
| accountAddress   | string | - | true
| tokenIdx           | 0 \| 1 | - | true
| amount   | string \| number, | - | true |
| vaultAddress   | string | - | true |
| jsonProvider      | [JsonRpcProvider](https://github.com/ethers-io/ethers.js/blob/f97b92bbb1bde22fcc44100af78d7f31602863ab/packages/providers/src.ts/json-rpc-provider.ts#L393) | - | true
| dex   | SupportedDex | - | true |

<br/>
This function returns true if the token allowance is non-zero and greater than or equal to the specified amount.
The 'amount' parameter can be either a string or a number, representing the number of tokens in major units. For instance, if the deposit token is wETH, 'amount' being equal to 0.5 or '0.5' signifies 0.5 wETH.

```typescript
import { Web3Provider } from '@ethersproject/providers';
import { isDepositTokenApproved, SupportedDex } from '@ichidao/ichi-vaults-sdk';

const web3Provider = new Web3Provider(YOUR_WEB3_PROVIDER);
const vaultAddress = "0x3ac9...a5f132"
const accountAddress = "0xaaaa...aaaaaa"
const amount = '10.5'
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

#### 10. `isTokenAllowed()`

| param | type |  default | required
| -------- | -------- | -------- | --------
| tokenIdx           | 0 \| 1 | - | true
| vaultAddress   | string | - | true |
| jsonProvider      | [JsonRpcProvider](https://github.com/ethers-io/ethers.js/blob/f97b92bbb1bde22fcc44100af78d7f31602863ab/packages/providers/src.ts/json-rpc-provider.ts#L393) | - | true
| dex   | SupportedDex | - | true |

<br/>
Returns true if deposits of the specified token are allowed.

```typescript
import { Web3Provider } from '@ethersproject/providers';
import { isTokenAllowed, SupportedDex } from '@ichidao/ichi-vaults-sdk';

const web3Provider = new Web3Provider(YOUR_WEB3_PROVIDER);
const vaultAddress = "0x3ac9...a5f132"
const dex = SupportedDex.UniswapV3

const isAllowed = await isTokenAllowed(
    0, // token idx can be 0 or 1
    vaultAddress,
    web3Provider,
    dex
)

```

#### 11. `getMaxDepositAmount()`

| param | type |  default | required
| -------- | -------- | -------- | --------
| tokenIdx           | 0 \| 1 | - | true
| vaultAddress   | string | - | true |
| jsonProvider      | [JsonRpcProvider](https://github.com/ethers-io/ethers.js/blob/f97b92bbb1bde22fcc44100af78d7f31602863ab/packages/providers/src.ts/json-rpc-provider.ts#L393) | - | true
| dex   | SupportedDex | - | true |

<br/>
Returns a BigNumber representing the maximum allowed deposit amount.

```typescript
import { Web3Provider } from '@ethersproject/providers';
import { getMaxDepositAmount, SupportedDex } from '@ichidao/ichi-vaults-sdk';

const web3Provider = new Web3Provider(YOUR_WEB3_PROVIDER);
const vaultAddress = "0x3ac9...a5f132"
const dex = SupportedDex.UniswapV3

const maxAmount = await getMaxDepositAmount(
    0, // token idx can be 0 or 1
    vaultAddress,
    web3Provider,
    dex
)

```

#### 12. `getUserBalance()`

| param | type |  default | required
| -------- | -------- | -------- | --------
| accountAddress   | string | - | true |
| vaultAddress   | string | - | true |
| jsonProvider      | [JsonRpcProvider](https://github.com/ethers-io/ethers.js/blob/f97b92bbb1bde22fcc44100af78d7f31602863ab/packages/providers/src.ts/json-rpc-provider.ts#L393) | - | true
| dex   | SupportedDex | - | true
| raw   | true | undefined | false |

<br/>
This function returns the number of user shares in the vault. If the 'raw' parameter is included, it returns a BigNumber.

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
    web3Provider,
    dex
)

// - or -

const sharesBN: BigNumber = await getUserBalance(
    accountAddress,
    vaultAddress,
    web3Provider,
    dex,
    true
)
```

#### 13. `getUserAmounts()`

| param | type |  default | required
| -------- | -------- | -------- | --------
| accountAddress   | string | - | true |
| vaultAddress   | string | - | true |
| jsonProvider      | [JsonRpcProvider](https://github.com/ethers-io/ethers.js/blob/f97b92bbb1bde22fcc44100af78d7f31602863ab/packages/providers/src.ts/json-rpc-provider.ts#L393) | - | true
| dex   | SupportedDex | - | true
| raw   | true | undefined | false |

<br/>
The getUserAmounts() function returns the amounts of tokens in the vault owned by the user. If 'raw' is specified, it returns BigNumber's.

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
    web3Provider,
    dex
)

// - or -

const amountsBN: [BigNumber, BigNumber] & {amount0: BigNumber, amount1: BigNumber} = await getUserAmounts(
    accountAddress,
    vaultAddress,
    web3Provider,
    dex,
    true
)
```

#### 14. `getAllUserBalances()`

| param | type |  default | required
| -------- | -------- | -------- | --------
| accountAddress   | string | - | true |
| jsonProvider      | [JsonRpcProvider](https://github.com/ethers-io/ethers.js/blob/f97b92bbb1bde22fcc44100af78d7f31602863ab/packages/providers/src.ts/json-rpc-provider.ts#L393) | - | true
| dex   | SupportedDex | - | true
| raw   | true | undefined | false |

<br/>
This function returns user balances for all vaults on the specified decentralized exchange (DEX).

```typescript
import { Web3Provider } from '@ethersproject/providers';
import { getAllUserBalances, SupportedDex, UserBalanceInVault, UserBalanceInVaultBN } from '@ichidao/ichi-vaults-sdk';

const web3Provider = new Web3Provider(YOUR_WEB3_PROVIDER);
const dex = SupportedDex.UniswapV3
const accountAddress = "0xaaaa...aaaaaa"

const userBalancesInVaults: UserBalanceInVault[] = await getAllUserBalances(
    accountAddress,
    web3Provider,
    dex
)

// - or -

const userBalancesInVaultsBN: UserBalanceInVaultBN[] = await getAllUserBalances(
    accountAddress,
    web3Provider,
    dex,
    true
)
```

#### 15. `getAllUserAmounts()`

| param | type |  default | required
| -------- | -------- | -------- | --------
| accountAddress   | string | - | true |
| jsonProvider      | [JsonRpcProvider](https://github.com/ethers-io/ethers.js/blob/f97b92bbb1bde22fcc44100af78d7f31602863ab/packages/providers/src.ts/json-rpc-provider.ts#L393) | - | true
| dex   | SupportedDex | - | true
| raw   | true | undefined | false |

<br/>
This function returns user token amounts in all vaults on the specified decentralized exchange (DEX).

```typescript
import { Web3Provider } from '@ethersproject/providers';
import { getAllUserAmounts, SupportedDex, UserAmountsInVault, UserAmountsInVaultBN } from '@ichidao/ichi-vaults-sdk';

const web3Provider = new Web3Provider(YOUR_WEB3_PROVIDER);
const dex = SupportedDex.UniswapV3
const accountAddress = "0xaaaa...aaaaaa"

const amounts: UserAmountsInVault[] = await getAllUserAmounts(
    accountAddress,
    web3Provider,
    dex,
)

// - or -

const amountsBN: UserAmountsInVaultBN[] = await getAllUserAmounts(
    accountAddress,
    web3Provider,
    dex,
    true
)
```

#### 16. `getTotalSupply()`

| param | type |  default | required
| -------- | -------- | -------- | --------
| vaultAddress   | string | - | true |
| jsonProvider      | [JsonRpcProvider](https://github.com/ethers-io/ethers.js/blob/f97b92bbb1bde22fcc44100af78d7f31602863ab/packages/providers/src.ts/json-rpc-provider.ts#L393) | - | true
| dex   | SupportedDex | - | true
| raw   | true | undefined | false |

<br/>
This function returns the total number of shares in the vault.

```typescript
import { Web3Provider } from '@ethersproject/providers';
import { getTotalSupply, SupportedDex } from '@ichidao/ichi-vaults-sdk';

const web3Provider = new Web3Provider(YOUR_WEB3_PROVIDER);
const vaultAddress = "0x3ac9...a5f132"
const dex = SupportedDex.UniswapV3

const shares: string = await getTotalSupply(
    accountAddress,
    vaultAddress,
    web3Provider,
    dex
)

// - or -

const sharesBN: BigNumber = await getTotalSupply(
    accountAddress,
    vaultAddress,
    web3Provider,
    dex,
    true
)
```

#### 17. `getTotalAmounts()`

| param | type |  default | required
| -------- | -------- | -------- | --------
| vaultAddress   | string | - | true |
| jsonProvider      | [JsonRpcProvider](https://github.com/ethers-io/ethers.js/blob/f97b92bbb1bde22fcc44100af78d7f31602863ab/packages/providers/src.ts/json-rpc-provider.ts#L393) | - | true
| dex   | SupportedDex | - | true
| raw   | true | undefined | false |

<br/>
This function returns the total number of tokens in the vault.

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
    web3Provider,
    dex
)

// - or -

const amountsBN: [BigNumber, BigNumber] & {total0: BigNumber, total1: BigNumber} = await getTotalAmounts(
    accountAddress,
    vaultAddress,
    web3Provider,
    dex,
    true
)
```

#### 18. `getFeesCollected()`

| param | type |  default | required
| -------- | -------- | -------- | --------
| vaultAddress   | string | - | true |
| jsonProvider      | [JsonRpcProvider](https://github.com/ethers-io/ethers.js/blob/f97b92bbb1bde22fcc44100af78d7f31602863ab/packages/providers/src.ts/json-rpc-provider.ts#L393) | - | true
| dex   | SupportedDex | - | true
| rawOrDays   | true or number | undefined | false |
| days   | number | undefined | false |

<br/>
The getFeesCollected() function returns the number of fees collected for the specified number of days. If the 'days' parameter is not included, it returns the number of fees collected since the vault's inception.

```typescript
import { Web3Provider } from '@ethersproject/providers';
import { getFeesCollected, SupportedDex } from '@ichidao/ichi-vaults-sdk';

const web3Provider = new Web3Provider(YOUR_WEB3_PROVIDER);
const vaultAddress = "0x3ac9...a5f132";
const dex = SupportedDex.UniswapV3;
const days = 7;

const amounts: [string, string] & {total0: string, total1: string} = await getFeesCollected(
    vaultAddress,
    web3Provider,
    dex
)

// - or -

const amountsBN: [BigNumber, BigNumber] & {total0: BigNumber, total1: BigNumber} = await getFeesCollected(
    vaultAddress,
    web3Provider,
    dex,
    true
)

// - or -

const amounts: [string, string] & {total0: string, total1: string} = await getFeesCollected(
    vaultAddress,
    web3Provider,
    dex,
    days
)

// - or -

const amountsBN: [BigNumber, BigNumber] & {total0: BigNumber, total1: BigNumber} = await getFeesCollected(
    vaultAddress,
    web3Provider,
    dex,
    true,
    days
)
```

#### 19. `getFeesCollectedInfo()`

| param | type |  default | required
| -------- | -------- | -------- | --------
| vaultAddress   | string | - | true |
| jsonProvider      | [JsonRpcProvider](https://github.com/ethers-io/ethers.js/blob/f97b92bbb1bde22fcc44100af78d7f31602863ab/packages/providers/src.ts/json-rpc-provider.ts#L393) | - | true
| dex   | SupportedDex | - | true
| forDays   | number[] | undefined | false |

<br/>
The getFeesCollectedInfo() function returns an array of FeesInfo objects representing the number of fees collected for the periods of time specified by the 'forDays' parameter, along with the fee Annual Percentage Rate (APR) for those periods.
If 'forDays' is not specified, it returns FeesInfo for time periods of 1, 7, and 30 days.
<br/>

```typescript
import { Web3Provider } from '@ethersproject/providers';
import { getFeesCollectedInfo, SupportedDex } from '@ichidao/ichi-vaults-sdk';

const web3Provider = new Web3Provider(YOUR_WEB3_PROVIDER);
const vaultAddress = "0x3ac9...a5f132";
const dex = SupportedDex.UniswapV3;
const days = [2, 5, 14, 60];

const feesInfo: FeesInfo[] = await getFeesCollectedInfo(
    vaultAddress,
    web3Provider,
    dex
)

// - or -

const feesInfo: FeesInfo[] = await getFeesCollectedInfo(
    vaultAddress,
    web3Provider,
    dex,
    days
)
```

#### 20. `getAverageDepositTokenRatios()`

| param | type |  default | required
| -------- | -------- | -------- | --------
| vaultAddress   | string | - | true |
| jsonProvider      | [JsonRpcProvider](https://github.com/ethers-io/ethers.js/blob/f97b92bbb1bde22fcc44100af78d7f31602863ab/packages/providers/src.ts/json-rpc-provider.ts#L393) | - | true
| dex   | SupportedDex | - | true
| timeIntervals   | number[] | [1, 7, 30] | false |

<br/>
The getAverageDepositTokenRatios() function returns an array of DepositTokenRatio objects representing the average deposit token ratio for the periods of time specified by the 'timeIntervals' parameter.
If 'timeIntervals' is not specified, it returns DepositTokenRatio objects for time periods of 1, 7, and 30 days.

```typescript
import { Web3Provider } from '@ethersproject/providers';
import { getFeesCollectedInfo, SupportedDex } from '@ichidao/ichi-vaults-sdk';

const web3Provider = new Web3Provider(YOUR_WEB3_PROVIDER);
const vaultAddress = "0x3ac9...a5f132";
const dex = SupportedDex.UniswapV3;
const days = [2, 5, 14, 60];

const averageDtr: AverageDepositTokenRatio[] = await getAverageDepositTokenRatios(
    vaultAddress,
    web3Provider,
    dex
)

// - or -

const averageDtr: AverageDepositTokenRatio[] = await getAverageDepositTokenRatios(
    vaultAddress,
    web3Provider,
    dex,
    days
)
```

#### 21. `getLpApr()`

| param | type |  default | required
| -------- | -------- | -------- | --------
| vaultAddress   | string | - | true |
| jsonProvider      | [JsonRpcProvider](https://github.com/ethers-io/ethers.js/blob/f97b92bbb1bde22fcc44100af78d7f31602863ab/packages/providers/src.ts/json-rpc-provider.ts#L393) | - | true
| dex   | SupportedDex | - | true
| timeIntervals   | number[] | [1, 7, 30] | false |

<br/>
The getLpApr() function returns an array of VaultApr objects representing the Annual Percentage Rate (APR) for the periods of time specified by the 'timeIntervals' parameter.
If 'timeIntervals' is not specified, it returns VaultApr objects for time periods of 1, 7, and 30 days.

```typescript
import { Web3Provider } from '@ethersproject/providers';
import { getLpApr, SupportedDex, VaultApr } from '@ichidao/ichi-vaults-sdk';

const web3Provider = new Web3Provider(YOUR_WEB3_PROVIDER);
const vaultAddress = "0x3ac9...a5f132";
const dex = SupportedDex.UniswapV3;
const days = [2, 5, 14, 60];

const averageDtr: VaultApr[] = await getLpApr(
    vaultAddress,
    web3Provider,
    dex
)

// - or -

const averageDtr: VaultApr[] = await getLpApr(
    vaultAddress,
    web3Provider,
    dex,
    days
)
```

#### 22. `getLpPriceChange()`

| param | type |  default | required
| -------- | -------- | -------- | --------
| vaultAddress   | string | - | true |
| jsonProvider      | [JsonRpcProvider](https://github.com/ethers-io/ethers.js/blob/f97b92bbb1bde22fcc44100af78d7f31602863ab/packages/providers/src.ts/json-rpc-provider.ts#L393) | - | true
| dex   | SupportedDex | - | true
| timeIntervals   | number[] | [1, 7, 30] | false |

<br/>
The getLpPriceChange() function returns an array of PriceChange objects representing the relative LP (vault token) price change in percentages for the periods of time specified by the 'timeIntervals' parameter.
If 'timeIntervals' is not specified, it returns PriceChange objects for time periods of 1, 7, and 30 days.

```typescript
import { Web3Provider } from '@ethersproject/providers';
import { getLpPriceChange, SupportedDex } from '@ichidao/ichi-vaults-sdk';

const web3Provider = new Web3Provider(YOUR_WEB3_PROVIDER);
const vaultAddress = "0x3ac9...a5f132";
const dex = SupportedDex.UniswapV3;
const days = [2, 5, 14, 60];

const lpPriceChange: PriceChange[] = await getLpPriceChange(
    vaultAddress,
    web3Provider,
    dex
)

// - or -

const lpPriceChange: PriceChange[] = await getLpPriceChange(
    vaultAddress,
    web3Provider,
    dex,
    days
)
```

#### 23. `getVaultMetrics()`

| param | type |  default | required
| -------- | -------- | -------- | --------
| vaultAddress   | string | - | true |
| jsonProvider      | [JsonRpcProvider](https://github.com/ethers-io/ethers.js/blob/f97b92bbb1bde22fcc44100af78d7f31602863ab/packages/providers/src.ts/json-rpc-provider.ts#L393) | - | true
| dex   | SupportedDex | - | true
| timeIntervals   | number[] | [1, 7, 30] | false |

<br/>
The getVaultMetrics() function returns an array of VaultMetrics objects for the periods of time specified by the 'timeIntervals' parameter.
If 'timeIntervals' is not specified, it returns VaultMetrics objects for time periods of 1, 7, and 30 days.

```typescript
import { Web3Provider } from '@ethersproject/providers';
import { getVaultMetrics, SupportedDex } from '@ichidao/ichi-vaults-sdk';

const web3Provider = new Web3Provider(YOUR_WEB3_PROVIDER);
const vaultAddress = "0x3ac9...a5f132";
const dex = SupportedDex.UniswapV3;
const days = [2, 5, 14, 60];

const vaultMetrics: VaultMetrics[] = await getVaultMetrics(
    vaultAddress,
    web3Provider,
    dex
)

// - or -

const vaultMetrics: VaultMetrics[] = await getVaultMetrics(
    vaultAddress,
    web3Provider,
    dex,
    days
)
```

#### 24. `getIchiVaultInfo()`

| param | type |  default | required
| -------- | -------- | -------- | --------
| chain      | SupportedChain | - | true
| dex   | SupportedDex | - | true
| vaultAddress   | string | - | true |
| jsonProvider   | JsonRpcProvider | - | false |

<br/>
This function returns IchiVault object.

```typescript
import { Web3Provider } from '@ethersproject/providers';
import { getIchiVaultInfo, SupportedDex, SupportedChain, IchiVault } from '@ichidao/ichi-vaults-sdk';

const vaultAddress = "0x3ac9...a5f132"
const dex = SupportedDex.UniswapV3;
const chain = SupportedChain.Polygon;

const vaultInfo = await getIchiVaultInfo(chain, dex, vaultAddress);
if (vaultInfo) {
    const addressTokenA = vaultInfo.tokenA;
}
```

#### 25. `getVaultsByTokens()`

| param | type |  default | required
| -------- | -------- | -------- | --------
| chain      | SupportedChain | - | true
| dex   | SupportedDex | - | true
| depositTokenAddress   | string | - | true |
| pairedTokenAddress   | string | - | true |

<br/>
This function returns an array of all vaults (IchiVault[]) on the specified DEX that contain two tokens defined by the 'depositTokenAddress' and 'pairedTokenAddress' parameters.

```typescript
import { Web3Provider } from '@ethersproject/providers';
import { getVaultsByTokens, SupportedDex, SupportedChain, IchiVault } from '@ichidao/ichi-vaults-sdk';

const depositToken = "0x1b...bfd6"
const pairedToken = "0x11...c4d6"
const dex = SupportedDex.UniswapV3;
const chain = SupportedChain.Polygon;

const vaults = await getVaultsByTokens(chain, dex, depositToken, pairedToken)
if (vaults.length === 0) {
    console.log("Couldn't find vaults with these parameters")
} else {
    const vaultAddress = vaults[0].id;
}

```

#### 26. `getVaultsByPool()`

| param | type |  default | required
| -------- | -------- | -------- | --------
| poolAddress   | string | - | true |
| chain      | SupportedChainId | - | true
| dex   | SupportedDex | - | true

<br/>
This function returns an array of all vaults ({ vault: string }[]) deployed on the specified pool.

```typescript
import { Web3Provider } from '@ethersproject/providers';
import { getVaultsByPool, SupportedDex, SupportedChainId } from '@ichidao/ichi-vaults-sdk';

const poolAddress = "0x1b...2fd6"
const dex = SupportedDex.UniswapV3;
const chain = SupportedChainId.Polygon;

const vaults = await getVaultsByPool(poolAddress, chain, dex)
if (vaults.length === 0) {
    console.log("Couldn't find vaults with these parameters")
} else {
    const vaultAddress = vaults[0].vault;
}
```

#### 27. `getVaultPositions()`

| param | type |  default | required
| -------- | -------- | -------- | --------
| vaultAddress   | string | - | true |
| jsonProvider      | [JsonRpcProvider](https://github.com/ethers-io/ethers.js/blob/f97b92bbb1bde22fcc44100af78d7f31602863ab/packages/providers/src.ts/json-rpc-provider.ts#L393) | - | true
| dex   | SupportedDex | - | true

<br/>
This function returns an object of type VaultPositionsInfo.

```typescript
import { Web3Provider } from '@ethersproject/providers';
import { getVaultPositions, SupportedDex } from '@ichidao/ichi-vaults-sdk';

const web3Provider = new Web3Provider(YOUR_WEB3_PROVIDER);
const vaultAddress = "0x3ac9...a5f132";
const dex = SupportedDex.UniswapV3;

const vaultPositions: VaultPositionsInfo = await getVaultPositions(
    vaultAddress,
    web3Provider,
    dex
);
const currentTick = vaultPositions.currentTick;
```

#### 28. `getSupportedDexes()`

| param | type |  default | required
| -------- | -------- | -------- | --------
| chainId   | SupportedChainId | - | true |

<br/>
This function returns all supported dexes for chain specified by chainId. Result is an array of SupportedDex.

```typescript
import { getSupportedDexes, SupportedChainId, SupportedDex } from '@ichidao/ichi-vaults-sdk';

const chainId = SupportedChainId.polygon;

const dexes: SupportedDex[] = getSupportedDexes(chainId);
```

#### 29. `getChainsForDex()`

| param | type |  default | required
| -------- | -------- | -------- | --------
| dex   | SupportedDex | - | true |

<br/>
This function returns all supported chains for the specified dex. Result is an array of SupportedChainId.

```typescript
import { getChainsForDex, SupportedChainId, SupportedDex } from '@ichidao/ichi-vaults-sdk';

const dex = SupportedChainId.UniswapV3;

const chains: SupportedChainId[] = getChainsForDex(dex);
```

## Types

### SupportedChainId

```typescript
enum SupportedChainId {
  arbitrum = 42161,
  arthera = 10242,
  arthera_testnet = 10243,
  base = 8453,
  berachain = 80084,
  blast = 81457,
  blast_sepolia_testnet = 168587773,
  bsc = 56,
  celo = 42220,
  eon = 7332,
  evmos = 9001,
  fantom = 250,
  flare = 14,
  fuse = 122,
  haven1_devnet = 8110,
  hedera = 295,
  hedera_testnet = 296,
  kava = 2222,
  linea = 59144,
  mainnet = 1,
  mantle = 5000,
  mode = 34443,
  polygon = 137,
  polygon_zkevm = 1101,
  real = 111188,
  rootstock = 30,
  scroll = 534352,
  skale_europa = 2046399126,
  taiko = 167000,
  taiko_hekla = 167009,
  unreal = 18233,
  x_layer_testnet = 195,
  zksync_era = 324,
  zksync_era_testnet = 280,
}
```

### SupportedDex

```typescript
enum SupportedDex {
  Agni = 'Agni',
  Ascent = 'Ascent',
  Blueprint = 'Blueprint',
  Cleo = 'Cleo',
  Crust = 'Crust',
  Equalizer = 'Equalizer',
  Fenix = 'Fenix',
  Forge = 'Forge',
  Haven1 = 'Haven1',
  Henjin = 'Henjin',
  Kim = 'Kim',
  Kinetix = 'Kinetix',
  Kodiak = 'Kodiak',
  Linehub = 'Linehub',
  Lynex = 'Lynex',
  Metavault = 'Metavault',
  Nile = 'Nile',
  Pancakeswap = 'PancakeSwap',
  Pearl = 'Pearl',
  Quickswap = 'QuickSwap',
  Ramses = 'Ramses',
  Retro = 'Retro',
  SaucerSwap = 'SaucerSwap',
  SparkDex = 'SparkDex',
  SparkDexV1 = 'SparkDexV1',
  SpiritSwap = 'SpiritSwap',
  Sushiswap = 'SushiSwap',
  Thena = 'Thena',
  Thirdfy = 'Thirdfy',
  Thruster = 'Thruster',
  Ubeswap = 'Ubeswap',
  UniswapV3 = 'Uniswap V3',
  Velocore = 'Velocore',
  Voltage = 'Voltage',
  XSwap = 'XSwap',
}
```

### IchiVault

```typescript
interface IchiVault {
  id: string; // vault address
  tokenA: string; // token0 address
  tokenB: string; // token1 address
  allowTokenA: boolean;
  allowTokenB: boolean;
  holdersCount?: string // number of vault LP holders
  fee?: string
}
```

### FeesInfo

```typescript
type FeesInfo  = {
  timePeriod: number; // in days
  feeAmount0: string; // in token0
  feeAmount1: string; // in token1
  pctAPR: number; // yearly APR based on the timePeriod
}
```

### AverageDepositTokenRatio

```typescript
type AverageDepositTokenRatio  = {
  timePeriod: number; // in days
  percent: number;
}
```

### VaultApr

```typescript
type VaultApr  = {
  timeInterval: number; // in days
  apr: number; // percent
}
```

### PriceChange

```typescript
type PriceChange  = {
  timeInterval: number; // in days
  priceChange: number; // percent
}
```

### VaultMetrics

```typescript
type VaultMetrics  = {
  timeInterval: number; // in days
  lpPriceChange: number | null;
  lpApr: number | null; // percent
  avgDtr: number;
  feeApr: number;
}
```

### UserAmountsBN

```typescript
type UserAmountsBN =
  [BigNumber, BigNumber] & { amount0: BigNumber; amount1: BigNumber };
```

### UserAmounts

```typescript
type UserAmounts = [string, string] & { amount0: string; amount1: string };
```

### UserAmountsInVault

```typescript
type UserAmountsInVault = {
  vaultAddress: string;
  userAmounts: UserAmounts;
}
```

### UserAmountsInVaultBN

```typescript
type UserAmountsInVaultBN = {
  vaultAddress: string;
  userAmounts: UserAmountsBN;
}
```

### UserBalanceInVault

```typescript
type UserBalanceInVault = {
  vaultAddress: string;
  shares: string;
};
```

### UserBalanceInVaultBN

```typescript
type UserBalanceInVaultBN = {
  vaultAddress: string;
  shares: BigNumber;
};
```

### VaultPositionsInfo

```typescript

type VaultPositionsInfo = {
  currentTick: number,
  currentPrice: number,
  positions: {
    tickLower: number,
    tickUpper: number,
    priceLower: number,
    priceUpper: number,
    liquidity: string;
    amountToken0: string;
    amountToken1: string;
    positionTvl: number; // in deposit tokens
  } [],
}
```
