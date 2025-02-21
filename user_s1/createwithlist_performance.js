import http from 'k6/http';
import { check } from 'k6';
import { Trend } from 'k6/metrics';

// Metrik tambahan
let responseTime = new Trend('response_time');

export const options = {
  vus: 400, // Jumlah VUs
  duration: '1m', // Durasi pengujian
};

export default function () {
  // Membuat payload unik berdasarkan VU ID
  const payload = JSON.stringify([
    {
      id: __VU, // Gunakan ID VU sebagai ID user unik
      username: `user_${__VU}`, // Gunakan ID VU dalam username
      firstName: `First_${__VU}`,
      lastName: `Last_${__VU}`,
      email: `user${__VU}@example.com`,
      password: `password${__VU}`,
      phone: `08123${__VU}45678`,
      userStatus: 1,
    },
  ]);

  const headers = { 'Content-Type': 'application/json' };

  // Kirim request ke API
  const res = http.post(
    'https://petstore.swagger.io/v2/user/createWithList',
    payload,
    { headers }
  );

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
