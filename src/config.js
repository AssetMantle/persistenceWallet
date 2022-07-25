export const DefaultChainInfo = {
    counterpartyChainId: process.env.CHAIN_ID,
    chainName: process.env.REACT_APP_CHAIN_NAME,
    prefix: "mantle",
    ledgerAppName: "cosmos",
    currency: {
        coinDenom: '$MNTL',
        coinMinimalDenom: 'umntl',
        coinDecimals: 6,
        coinGeckoId: 'assetmantle',
    },
    coinType: 118,
    uTokenValue:1000000,
};

export const AccountInfo = {
    maxAccountIndex: 2147483647,
    maxAccountNumber: 2147483647,
};

export const PstakeInfo = {
    coinDenom: 'PSTAKE',
    coinMinimalDenom: 'ibc/A6E3AF63B3C906416A9AF7A556C59EA4BD50E617EFFE6299B99700CCB780E444',
    baseDenom: 'gravity0xfB5c6815cA3AC72Ce9F5006869AE67f18bF77006',
    coinDecimals: 18,
};

export const GasInfo ={
    gas: 250000,
    minGas: 80000,
    maxGas : 2000000,
};

export const FeeInfo ={
    lowFee: 0,
    averageFee: 0.025,
    highFee: 0.04,
    defaultFee: "5000",
    vestingAccountFee: "0",
};

export const IBCConfiguration = {
    timeoutTimestamp: 1000,
    ibcRevisionHeightIncrement: 1000,
    ibcRemoteHeightIncrement: 150,
    ibcDefaultPort: "transfer",
};

export const TestIBCChainInfos = [
    {
        counterpartyChainId: '',
        chainName: "Persistence",
        sourceChannelId: "channel-30",
        portID: "transfer",
        prefix:'persistence',
    }
];

export const IBCChainInfos = [
    {
        counterpartyChainId: 'osmosis-1',
        chainName:'Osmosis',
        sourceChannelId: 'channel-0',
        portID:'transfer',
        coinMinimalDenom: 'uosmo',
        prefix:'osmo'
    },
    {
        counterpartyChainId: 'juno-1',
        chainName:'Juno',
        sourceChannelId: 'channel-2',
        portID:'transfer',
        coinMinimalDenom: 'ujuno',
        prefix:'juno'
    },
    {
        counterpartyChainId: 'crescent-1',
        chainName:'Crescent',
        sourceChannelId: 'channel-3',
        portID:'transfer',
        coinMinimalDenom: 'ucre',
        prefix:'cre'
    },
    {
        counterpartyChainId: 'evmos_9001-2',
        chainName:'Evmos',
        sourceChannelId: 'channel-4',
        portID:'transfer',
        coinMinimalDenom: 'aevmos',
        prefix:'evmos'
    },
    {
        counterpartyChainId: 'stargaze-1',
        chainName:'Stargaze',
        sourceChannelId: 'channel-5',
        portID:'transfer',
        coinMinimalDenom: 'ustars',
        prefix:'stars'
    },
    {
        counterpartyChainId: 'gravity-bridge-3',
        chainName:'Gravity',
        sourceChannelId: 'channel-8',
        portID:'transfer',
        coinMinimalDenom: 'ugraviton',
        prefix:'gravity'
    },
];


export const ExternalChains = [
    {
        rpc: 'https://rpc.core.persistence.one/',
        rest: 'https://rest.core.persistence.one/',
        chainId: 'core-1',
        chainName: 'Persistence',
        portID: 'transfer',
        currency: {
            coinDenom: 'XPRT',
            coinMinimalDenom: 'uxprt',
            coinDecimals: 6,
            coinGeckoId: 'persistence',
        },
        coinType: 750,
    },
    {
        rpc: 'https://rpc.osmosis-1.audit.one/',
        rest: 'https://rest.osmosis-1.audit.one/',
        chainId: 'osmosis-1',
        chainName: 'Osmosis',
        portID: 'transfer',
        currency: {
            coinDenom: 'OSMO',
            coinMinimalDenom: 'uosmo',
            coinDecimals: 6,
            coinGeckoId: 'osmosis',
        },
        coinType: 118,
    },
    {
        rpc: 'https://rpc.cosmoshub-4.audit.one/',
        rest: 'https://rest.cosmoshub-4.audit.one/',
        chainId: 'cosmoshub-4',
        chainName: 'Cosmos',
        currency: {
            coinDenom: 'COSMOS',
            coinMinimalDenom: 'uatom',
            coinDecimals: 6,
            coinGeckoId: 'cosmos',
        },
        coinType: 118,
    },
    {
        rpc: 'https://api.gravity.audit.one/rpc/',
        rest: 'https://api.gravity.audit.one/lcd/',
        chainId: 'cosmoshub-4',
        chainName: 'Cosmos',
        currency: {
            coinDenom: 'GRAV',
            coinMinimalDenom: 'ugraviton',
            coinDecimals: 6,
            coinGeckoId: '',
        },
        coinType: 118,
    },
];

export const TestNetFoundationNodes = [
    "persistencevaloper1xepyv8lf99pa4x0w2ptr3vx3rr7wfs6msh2m76"
];

export const MainNetFoundationNodes = [
    "mantlevaloper10pfr9vg8vnvre6r2g6hdct52tutcz94a3nyx0w",
    "mantlevaloper1nhke5405lsfp8kz89waqnxef6r49ymqz05zvuc",
    "mantlevaloper1897wx73f4lxndtur9cy3luvxg7jky7khjqccxp",
    "mantlevaloper1gg7dwkpptnajn8kfxy4qkudun8aknwpyuhpw05",
    "mantlevaloper1ehe4etw8wc6ey556l2hwrg2jxdl0j7htwcqtrd"
];


