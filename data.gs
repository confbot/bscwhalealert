// All lower case
const ADDR_ALIAS = {
  '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c': 'BTC',
  '0x55d398326f99059ff775485246999027b3197955': 'USDt',
  '0x2170ed0880ac9a755fd29b2688956bd959f933f8': 'ETH',
  '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d': 'USDC',
  '0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3': 'DAI',
  '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c': 'Wrapped BNB',
  '0xe9e7cea3dedca5984780bafc599bd69add087d56': 'BUSD',
};

// over ~1,000,000 USD
const MONITOR_TOKENS = [
  {
    token: '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c', // BTC
    threshold: 17
  },
  {
    token: '0x55d398326f99059ff775485246999027b3197955', // USDT
    threshold: 1000000,
  },
];
