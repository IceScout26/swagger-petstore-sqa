import http from 'k6/http';
import { check } from 'k6';
import { Trend } from 'k6/metrics';

// Metrik tambahan
let responseTime = new Trend('response_time');

export const options = {
  vus: 1700,
  iterations: 1700,
};

export default function () {
  const petId = __VU;
  const url = `https://petstore.swagger.io/v2/pet/${petId}`;

  // Payload form-data sesuai dokumentasi
  const payload = {
    name: `Pet_${petId}`,
    status: 'available',
  };

  // Kirim request POST dengan form data
  const res = http.post(url, payload);

  responseTime.add(res.timings.duration);

  check(res, {
    'Status is 200': (r) => r.status === 200,
    'Status is 400': (r) => r.status === 400,
    'Status is 404': (r) => r.status === 404,
    'Status is 405': (r) => r.status === 405,
    'Status is 429': (r) => r.status === 429,
    'Status is 500': (r) => r.status === 500,
    'Response time < 200ms': (r) => r.timings.duration < 200,
    'Response time < 350ms': (r) => r.timings.duration < 350,
    'Response time < 500ms': (r) => r.timings.duration < 500,
    'Response time < 1000ms': (r) => r.timings.duration < 1000,
  });
}