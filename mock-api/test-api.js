const crypto = require('crypto');
const axios = require('axios');

async function test() {
  const url = '/device/real/query';
  const token = 'interview_token_123';
  const timestamp = Date.now().toString();
  
  const signature = crypto
    .createHash('md5')
    .update(url + token + timestamp)
    .digest('hex');
  
  try {
    const response = await axios.post('http://localhost:3000/device/real/query', {
      sn_list: ['SN-000', 'SN-001']
    }, {
      headers: {
        'signature': signature,
        'timestamp': timestamp
      }
    });
    
    console.log('Success!');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

test();