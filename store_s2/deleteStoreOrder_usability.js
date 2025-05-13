import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 1,
  // duration: '10s',
};

export default function () {
  // Membuat orderId unik berdasarkan VU ID
  // const orderId = __VU; // Order ID valid
  // const orderId = "invalid_id"; // Order ID tidak valid
  // const orderId = null; // Order ID null (tidak valid)

  const url = `https://petstore.swagger.io/v2/store/order/${orderId}`;

  console.log(`Order ID: ${orderId}`);
  // Kirim request DELETE ke API
  const res = http.del(url);

  check(res, {
    'Status is 200': (r) => r.status === 200,
    'Status is 400': (r) => r.status === 400,
    'Status is 404': (r) => r.status === 404,
    'Status is 429': (r) => r.status === 429,
    'Status is 500': (r) => r.status === 500,
    'response contains message': (r) => r.body.includes('message'),
  });
}