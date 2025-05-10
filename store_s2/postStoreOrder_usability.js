import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 1,
  // duration: '10s',
};

export default function () {
  // Membuat payload unik berdasarkan VU ID
  const payload = JSON.stringify({
    id: __VU, // Gunakan ID VU sebagai ID order unik
    petId: __VU, // Gunakan ID VU sebagai ID pet unik
    quantity: Math.floor(Math.random() * 10) + 1, // Jumlah random antara 1-10
    shipDate: new Date().toISOString(), // Tanggal pengiriman saat ini
    status: 'placed', // Status order
    complete: true, // Order selesai
  });

  const url = `https://petstore.swagger.io/v2/store/order`;

  const params = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  console.log(`Payload: ${payload}`);
  // Kirim request ke API
  const res = http.post(url, payload, params);

  check(res, {
    'Status is 200': (r) => r.status === 200,
    'Status is 400': (r) => r.status === 400,
    'Status is 429': (r) => r.status === 429,
    'Status is 500': (r) => r.status === 500,
    'response contains message': (r) => r.body.includes('message'),
  });
}