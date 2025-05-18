import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 1,
  // duration: '10s',
};

export default function () {
  let url = 'https://petstore.swagger.io/v2/pet';

  // let payload = JSON.stringify({
  //   id: __VU, // Gunakan ID VU sebagai ID pet unik
  //   category: {
  //     id: 1,
  //     name: 'Category1',
  //   },
  //   name: `Pet_${__VU}`, // Nama pet unik berdasarkan VU ID
  //   photoUrls: ['https://example.com/photo1.jpg'], // URL foto
  //   tags: [
  //     {
  //       id: 1,
  //       name: 'Tag1',
  //     },
  //   ],
  //   status: 'available', // Status pet
  // });

  let payload = JSON.stringify({
    id: "invalid_id", // ID tidak valid (string alih-alih angka)
    category: {
      id: "invalid_category_id", // ID kategori tidak valid
      name: 12345, // Nama kategori tidak valid (angka alih-alih string)
    },
    name: "", // Nama pet kosong
    photoUrls: [], // URL foto kosong
    tags: [
      {
        id: "invalid_tag_id", // ID tag tidak valid
        name: null, // Nama tag null
      },
    ],
    status: "unknown_status", // Status tidak valid
  });

  let params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  let res = http.post(url, payload, params);

  check(res, {
    'Status is 200': (r) => r.status === 200,
    'Status is 400': (r) => r.status === 400,
    'Status is 429': (r) => r.status === 429,
    'Status is 500': (r) => r.status === 500,
    'response contains message': (r) => r.body.includes('message'),
  });

  console.log(`Response Status: ${res.status}`);
  console.log(`Response Body: ${res.body}`);
}