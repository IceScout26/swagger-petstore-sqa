import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 1,
  // duration: '10s',
};

export default function () {
  // Membuat username unik berdasarkan VU ID
  const username = ` `;

  const url = `https://petstore.swagger.io/v2/user/${username}`;

  const params = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  // Kirim request ke API
  const res = http.del(url, null, params);

  // Log response status
  console.log(`Response Status: ${res.status}`);

  check(res, {
    'Status is 200': (r) => r.status === 200,
    'Status is 400': (r) => r.status === 400,
    'Status is 404': (r) => r.status === 404,
    'Status is 414': (r) => r.status === 414,
    'Status is 415': (r) => r.status === 415,
    'Status is 429': (r) => r.status === 429,
    'Status is 500': (r) => r.status === 500,
    'response contains message': (r) => r.body.includes('message'),
    // 'Error message is present': (r) => r.body.includes("something bad happened"),
  });
}