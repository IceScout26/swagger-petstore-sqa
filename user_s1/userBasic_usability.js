import http from 'k6/http';
import {
  check
} from 'k6';

export let options = {
  vus: 1,
  // duration: '10s',
};

export default function () {
  let url = 'https://petstore.swagger.io/v2/user';
  // let invalidPayload = JSON.stringify({
  //     id: "missing_id_field"
  //   } // ID string
  // );
  let payload = JSON.stringify({
    id: __VU, // Gunakan ID VU sebagai ID user unik
    username: `user_${__VU}`, // Gunakan ID VU dalam username
    firstName: `First_${__VU}`,
    lastName: `Last_${__VU}`,
    email: `user${__VU}@example.com`,
    password: `password${__VU}`,
    phone: `08123${__VU}45678`,
    userStatus: 1,
  }, );

  let params = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  // let res = http.post(url, invalidPayload, params);
  let res = http.post(url, payload, params);

  check(res, {
    'Status is 200': (r) => r.status === 200,
    'Status is 400': (r) => r.status === 400,
    'Status is 429': (r) => r.status === 429,
    'Status is 500': (r) => r.status === 500,
    'response contains message': (r) => r.body.includes('message'),
    // 'Error message is present': (r) => r.body.includes("something bad happened"),
  });
}