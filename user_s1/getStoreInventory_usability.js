import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 1,
  // duration: '10s',
};

export default function () {
  const url = `https://petstore.swagger.io/v2/store/inventory`;

  const params = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  // Kirim request ke API
  const res = http.get(url, params);

  check(res, {
    'Status is 200': (r) => r.status === 200,
    'Status is 400': (r) => r.status === 400,
    'Status is 414': (r) => r.status === 414,
    'Status is 429': (r) => r.status === 429,
    'Status is 500': (r) => r.status === 500,
    'response contains message': (r) => r.body.includes('message'),
    // 'Error message is present': (r) => r.body.includes("something bad happened"),
  });
}