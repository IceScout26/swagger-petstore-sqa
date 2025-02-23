// import http from 'k6/http';
// import { check } from 'k6';

// export let options = {
//     vus: 10,
//     duration: '1m',
// };

// export default function () {
//     let url = 'https://petstore.swagger.io/v2/user/createWithList';

//     let jsonPayload = JSON.stringify([{
//         id: 1,
//         username: "user1",
//         email: "user1@example.com"
//     }]);

//     let xmlPayload = `<users><user><id>1</id><username>user1</username></user></users>`;

//     let jsonRes = http.post(url, jsonPayload, {
//         headers: {
//             'Content-Type': 'application/json'
//         }
//     });

//     let xmlRes = http.post(url, xmlPayload, {
//         headers: {
//             'Content-Type': 'application/xml'
//         }
//     });

//     // Logging Response JSON
//     console.log(`JSON Response Status: ${jsonRes.status}`);
//     console.log(`JSON Response Body: ${jsonRes.body}`);

//     // Logging Response XML
//     console.log(`XML Response Status: ${xmlRes.status}`);
//     console.log(`XML Response Body: ${xmlRes.body}`);

//     check(jsonRes, {
//         'JSON Response is 200': (r) => r.status === 200,
//         'JSON Response is 400': (r) => r.status === 400,
//         'JSON Response is 500': (r) => r.status === 500,
//     });

//     check(xmlRes, {
//         'XML Response is 415': (r) => r.status === 415, // API biasanya hanya mendukung JSON
//         'XML Response is 400': (r) => r.status === 400,
//         'XML Response is 500': (r) => r.status === 500,
//     });
// }

import http from 'k6/http';
import { check } from 'k6';

export let options = {
    vus: 10, 
    iterations: 30, // 30 request dengan variasi yang berbeda
};

export default function () {
    let url = 'https://petstore.swagger.io/v2/user/createWithList';

    let payloads = [
        JSON.stringify([{ id: 1, username: "user1", email: "user1@example.com" }]), // ✅ Valid JSON
        JSON.stringify([{ id: "abc", username: 123, email: true }]), // ❌ Format data tidak sesuai
        JSON.stringify([{ id: 9999999999999, username: "longusername", email: "x".repeat(1000) + "@example.com" }]) // ❌ Data ekstrem
    ];

    let headersList = [
        { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0' }, // Simulasi browser
        { 'Content-Type': 'application/json', 'User-Agent': 'PostmanRuntime' }, // Simulasi Postman
        { 'Content-Type': 'application/json', 'User-Agent': 'MobileApp/1.0' } // Simulasi aplikasi mobile
    ];

    let payload = payloads[__ITER % payloads.length]; // Variasi payload berdasarkan iterasi
    let headers = headersList[__ITER % headersList.length]; // Variasi headers

    let res = http.post(url, payload, { headers });

    console.log(`Iteration: ${__ITER} | Status: ${res.status} | Payload: ${payload} | Headers: ${JSON.stringify(headers)}`);

    check(res, {
        'Status is 200': (r) => r.status === 200,
        'Status is 400': (r) => r.status === 400,
        'Status is 415': (r) => r.status === 415,
        'Status is 429': (r) => r.status === 429,
        'Status is 500': (r) => r.status === 500,
        'Response time < 500ms': (r) => r.timings.duration < 500,
    });
}
