import http from 'k6/http';
import { check } from 'k6';
import { Trend } from 'k6/metrics';

// Metrik tambahan
let responseTime = new Trend('response_time');

export const options = {
  vus: 150, // Jumlah VUs
  duration: '10m', // Durasi pengujian
};

export default function () {
  const url = `https://petstore.swagger.io/v2/user/logout`;

  const headers = { 'Content-Type': 'application/json' };

  // Kirim request ke API
  const res = http.get(url, { headers });

  // Menyimpan metrik tambahan
  responseTime.add(res.timings.duration);

  // console.log(`Response Status: ${res.status}`);
  // console.log(`Response Body: ${res.body}`);

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