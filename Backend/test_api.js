import { signAccessToken } from './src/modules/taxi/services/tokenService.js';
import { connectDB } from './src/config/db.js';
import http from 'http';

async function run() {
  await connectDB();
  
  const token = signAccessToken({
    sub: '6a142f94ce0bf53bba7930b7',
    role: 'user'
  });

  const meOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/taxi/users/me',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  };

  const req = http.request(meOptions, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('GET /me Status:', res.statusCode);
      console.log('GET /me Response:', data);
    });
  });
  req.end();
  
  setTimeout(() => {
    const wOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/taxi/users/wallet',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    };

    const wReq = http.request(wOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('GET /wallet Status:', res.statusCode);
        console.log('GET /wallet Response:', data);
      });
    });
    wReq.end();
  }, 1000);
  
  setTimeout(() => {
    const rOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/taxi/users/wallet/razorpay/order',
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const rReq = http.request(rOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('POST /wallet/razorpay/order Status:', res.statusCode);
        console.log('POST /wallet/razorpay/order Response:', data);
      });
    });
    rReq.write(JSON.stringify({ amount: 500 }));
    rReq.end();
  }, 2000);
  
  setTimeout(() => process.exit(0), 4000);
}

run().catch(console.error);
