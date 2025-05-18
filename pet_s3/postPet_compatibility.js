import http from 'k6/http';
import {
  check
} from 'k6';

export let options = {
  vus: 10,
  iterations: 10, // 30 request dengan variasi yang berbeda
};

export default function () {
  let url = 'https://petstore.swagger.io/v2/pet';

  let payloads = [
    // // Payload valid
    // JSON.stringify({
    //   id: __ITER, // Gunakan iterasi sebagai ID pet unik
    //   category: {
    //     id: 1,
    //     name: 'Category1',
    //   },
    //   name: `Pet_${__ITER}`, // Nama pet unik berdasarkan iterasi
    //   photoUrls: ['https://example.com/photo1.jpg'], // URL foto
    //   tags: [{
    //     id: 1,
    //     name: 'Tag1',
    //   }, ],
    //   status: 'available', // Status pet
    // }),
    // Payload invalid
    // JSON.stringify({
    //   id: "invalid_id", // ID tidak valid (string alih-alih angka)
    //   category: {
    //     id: "invalid_category_id", // ID kategori tidak valid
    //     name: 12345, // Nama kategori tidak valid (angka alih-alih string)
    //   },
    //   name: "", // Nama pet kosong
    //   photoUrls: [], // URL foto kosong
    //   tags: [{
    //     id: "invalid_tag_id", // ID tag tidak valid
    //     name: null, // Nama tag null
    //   }, ],
    //   status: "unknown_status", // Status tidak valid
    // }),
    // Payload ekstrem
    JSON.stringify({
      id: 999999999999999999999999999999, // ID sangat besar
      category: {
        id: 999999999999999999999999999999, // ID kategori sangat besar
        name: 'x'.repeat(10000), // Nama kategori sangat panjang
      },
      name: 'x'.repeat(10000), // Nama pet sangat panjang
      photoUrls: Array(1000).fill('https://example.com/photo.jpg'), // 1000 URL foto
      tags: Array(1000).fill({
        id: 999999999999999999999999999999,
        name: 'x'.repeat(10000)
      }), // 1000 tag dengan data ekstrem
      status: 'available', // Status pet
    }),
  ];

  let headersList = [{
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0'
    }, // Simulasi browser
    {
      'Content-Type': 'application/json',
      'User-Agent': 'PostmanRuntime'
    }, // Simulasi Postman
    {
      'Content-Type': 'application/json',
      'User-Agent': 'MobileApp/1.0'
    }, // Simulasi aplikasi mobile
  ];

  let payload = payloads[__ITER % payloads.length]; // Variasi payload berdasarkan iterasi
  let headers = headersList[__ITER % headersList.length]; // Variasi headers

  let res = http.post(url, payload, {
    headers
  });

  // console.log(`Iteration: ${__ITER} | Status: ${res.status} | Payload: ${payload} | Headers: ${JSON.stringify(headers)}`);

  check(res, {
    'Status is 200': (r) => r.status === 200,
    'Status is 400': (r) => r.status === 400,
    'Status is 415': (r) => r.status === 415,
    'Status is 429': (r) => r.status === 429,
    'Status is 500': (r) => r.status === 500,
    'Response time < 500ms': (r) => r.timings.duration < 500,
  });
}