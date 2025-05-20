import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 10,
  iterations: 10, // 10 request dengan variasi yang berbeda
};

export default function () {
  // Pilih salah satu status dengan meng-uncomment baris yang relevan
  // const status = 'available'; // Uji status "available"
  // const status = 'pending'; // Uji status "pending"
  // const status = 'sold'; // Uji status "sold"
  // const status = 'invalid_status'; // Uji status tidak valid
  const status = 918932198379812734981789347189371897398138289; // Uji status tidak valid (angka besar)

  // Jika tidak ada yang di-uncomment, gunakan variasi status berdasarkan iterasi
  // const statuses = ['available', 'pending', 'sold'];
  // const status = typeof status === 'undefined' ? statuses[__ITER % statuses.length] : status;

  const url = `https://petstore.swagger.io/v2/pet/findByStatus?status=${status}`;

  let headersList = [
    { 'User-Agent': 'Mozilla/5.0' }, // Simulasi browser
    { 'User-Agent': 'PostmanRuntime' }, // Simulasi Postman
    { 'User-Agent': 'MobileApp/1.0' }, // Simulasi aplikasi mobile
  ];

  let headers = headersList[__ITER % headersList.length]; // Variasi headers

  let res = http.get(url, { headers });

  // console.log(`Iteration: ${__ITER} | Status: ${res.status} | Queried Status: ${status} | Headers: ${JSON.stringify(headers)}`);

  check(res, {
    'Status is 200': (r) => r.status === 200,
    'Status is 400': (r) => r.status === 400,
    'Status is 415': (r) => r.status === 415,
    'Status is 429': (r) => r.status === 429,
    'Status is 500': (r) => r.status === 500,
    'Response time < 500ms': (r) => r.timings.duration < 500,
  });
}