import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 1,
  // duration: '10s',
};

export default function () {
  // Pilih salah satu status dengan meng-uncomment baris yang relevan
  // const status = 'available'; // Uji status "available"
  // const status = 'pending'; // Uji status "pending"
  // const status = 'sold'; // Uji status "sold"
  const status = 'invalid_status'; // Uji status tidak valid

  // const statuses = ['available', 'pending', 'sold'];
  // const status = typeof status === 'undefined' ? statuses[__ITER % statuses.length] : status;

  const url = `https://petstore.swagger.io/v2/pet/findByStatus?status=${status}`;

  let res = http.get(url);

  check(res, {
    'Status is 200': (r) => r.status === 200,
    'Status is 400': (r) => r.status === 400,
    'Status is 404': (r) => r.status === 404,
    'Status is 429': (r) => r.status === 429,
    'Status is 500': (r) => r.status === 500,
    'response contains message': (r) => r.body.includes('message'),
  });

  console.log(`Queried Status: ${status} | Response Status: ${res.status}`);
  // console.log(`Response Body: ${res.body}`);
}