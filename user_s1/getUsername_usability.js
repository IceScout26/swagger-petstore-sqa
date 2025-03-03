import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 1,
  // duration: '10s',
};

export default function () {
  // Membuat username unik berdasarkan VU ID
  // let username = `user1`; //correct username
  let username = 1234; //incorrect username
  let url = `https://petstore.swagger.io/v2/user/${username}`;

  let params = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  // Kirim request ke API
  let res = http.get(url, params);

  check(res, {
    'Status is 200': (r) => r.status === 200,
    'Status is 400': (r) => r.status === 400,
    'Status is 404': (r) => r.status === 404,
    'Status is 429': (r) => r.status === 429,
    'Status is 500': (r) => r.status === 500,
    'response contains message': (r) => r.body.includes('message'),
    // 'Error message is present': (r) => r.body.includes("something bad happened"),
  });
}