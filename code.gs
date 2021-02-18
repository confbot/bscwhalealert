// Bot https://t.me/bscwhalealert
var TELEGRAM_TOKEN = '';
var WEBAPP_URL = '';
var CHANNEL_ID = '@bscwhalealert';

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
    threshold: 22
  },
  {
    token: '0x55d398326f99059ff775485246999027b3197955', // USDT
    threshold: 1000000,
  },
];

function queryBSC(entry, since) {
  // refer https://graphql.bitquery.io/ide/vGoogYKa3R
  return `query {
    ethereum(network: bsc) {
      transfers(
        options: {desc: "block.timestamp.time", limit: 10}
        amount: {gt: ${entry.threshold}}
        time: {since: "${since}", till: null}
        currency: {is: "${entry.token}"}
      ) {
        block {
          timestamp {
            time(format: "%Y-%m-%d %H:%M:%S")
          }
          height
        }
        sender {
          address
          annotation
        }
        receiver {
          address
          annotation
        }
        transaction {
          hash
        }
        amount
        currency {
          symbol
        }
        external
      }
    }
  }
  `;
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

function parseBSCResult(response, entry) {
  var json = JSON.parse(response);
  if (json.data && json.data.ethereum && json.data.ethereum.transfers && json.data.ethereum.transfers.length > 0) {
    var txs = json.data.ethereum.transfers;
    return txs.map(tx => {
      let senderAlias = ADDR_ALIAS[tx.sender.address];
      let receiverAlias = ADDR_ALIAS[tx.receiver.address];

      let sender = tx.sender.annotation || senderAlias || 'Unknown';
      let receiver = tx.receiver.annotation || receiverAlias || 'Unknown';
      let amount = numberWithCommas(tx.amount).split('.')[0];
      let symbol = tx.currency.symbol;
      let hash = tx.transaction.hash;
      let scale = Math.max(Math.floor(Math.log2(tx.amount / entry.threshold)), 0);
      let defaultEmoji = '🚨';

      let emoji = defaultEmoji;
      for (let i=1; i <= scale; i++) {
        emoji += defaultEmoji;
      }
      return `${emoji} ${amount} #${symbol} transferred from ${sender} to ${receiver} Wallet\nTx: https://bscscan.com/tx/${hash}`;
    }).join('\n\n');
  }
  return null;
}

function checkBSC() {
  var graphql = 'https://graphql.bitquery.io/';
  var now = Date.now();
  var since = new Date(now - 15 * 60 * 1000).toISOString(); // 15min

  MONITOR_TOKENS.forEach((entry, i) => {
    Utilities.sleep(3000);
    let options = { 
      'method': 'post',
      'contentType': 'application/json',
      'payload': JSON.stringify({
        query: queryBSC(entry, since)
      })
    };
    // Logger.log(queryBSC(entry, since));
    let response = UrlFetchApp.fetch(graphql, options);
    let msg = parseBSCResult(response.getContentText(), entry);
    //Logger.log(msg);
    if (typeof msg === 'string') {
      sendMessage(msg);
    }
  })
}

// BOT SPECIFIC CODE
var TELEGRAM_API = 'https://api.telegram.org/bot' + TELEGRAM_TOKEN + '/';

// run setWebhook in Scripts Editor after deploy to register the webhook to the telegram bot
function setWebhook(e) {
  var TELEGRAM_WEBHOOK = TELEGRAM_API + 'setWebhook?url=' + WEBAPP_URL;
  const result = UrlFetchApp.fetch(TELEGRAM_WEBHOOK);
  Logger.log(result.getContentText());
}

function sendMessage(msg='hello') {
    const options = {
      'method' : 'post',
      'contentType': 'application/json',
      'payload' : JSON.stringify({
        'chat_id': CHANNEL_ID,
        'text': msg
      })
    };
    
    const response = UrlFetchApp.fetch(TELEGRAM_API + 'sendMessage', options);
      
    if (response.getResponseCode() == 200) {
      return JSON.parse(response.getContentText());
    }
    return false;
}
