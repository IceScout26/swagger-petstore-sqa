import http from 'k6/http';
import { check } from 'k6';
import { Trend } from 'k6/metrics';

// Metrik tambahan
let responseTime = new Trend('response_time');

export const options = {
  vus: 40, // Jumlah VUs
  iterations: 40,
};

export default function () {
  // Pilih salah satu status dengan meng-uncomment baris yang relevan
  const status = 'available'; // Uji status "available"
  // const status = 'pending'; // Uji status "pending"
  // const status = 'sold'; // Uji status "sold"

  // const statuses = ['available', 'pending', 'sold']; // Status yang tersedia
  // const status = typeof status === 'undefined' ? statuses[__ITER % statuses.length] : status;

  const url = `https://petstore.swagger.io/v2/pet/findByStatus?status=${status}`;

  // Kirim request ke API
  const res = http.get(url);

  // Menyimpan metrik tambahan
  responseTime.add(res.timings.duration);

  // console.log(`Iteration: ${__ITER} | Queried Status: ${status} | Response Time: ${res.timings.duration}ms`);
  // console.log(`Response Body: ${res.body}`); // Tambahkan log untuk melihat respons jika diperlukan

  // Cek apakah response status 200
  check(res, {
    'Status is 200': (r) => r.status === 200,
    'Status is 400': (r) => r.status === 400,
    'Status is 429': (r) => r.status === 429,
    'Status is 500': (r) => r.status === 500,
    'Response time < 200ms': (r) => r.timings.duration < 200,
    'Response time < 350ms': (r) => r.timings.duration < 350,
    'Response time < 500ms': (r) => r.timings.duration < 500,
    'Response time < 1000ms': (r) => r.timings.duration < 1000,
  });
}