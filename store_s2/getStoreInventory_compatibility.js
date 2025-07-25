import http from 'k6/http';
import { check } from 'k6';

export let options = {
    vus: 10, 
    iterations: 30, // 30 request dengan variasi yang berbeda
};

export default function () {
    let baseUrl = 'https://petstore.swagger.io/v2/store/inventory';

    let headersList = [
        { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0' }, // Simulasi browser
        // { 'Content-Type': 'application/json', 'User-Agent': 'PostmanRuntime' }, // Simulasi Postman
        // { 'Content-Type': 'application/json', 'User-Agent': 'MobileApp/1.0' } // Simulasi aplikasi mobile
    ];

    let headers = headersList[__ITER % headersList.length]; // Variasi headers

    let url = `${baseUrl}`;

    let res = http.get(url, { headers });

    console.log(`Iteration: ${__ITER} | Status: ${res.status} | Headers: ${JSON.stringify(headers)}`);

    check(res, {
        'Status is 200': (r) => r.status === 200,
        'Status is 400': (r) => r.status === 400,
        'Status is 404': (r) => r.status === 404,
        'Status is 414': (r) => r.status === 414,
        'Status is 415': (r) => r.status === 415,
        'Status is 429': (r) => r.status === 429,
        'Status is 500': (r) => r.status === 500,
        'Response time < 500ms': (r) => r.timings.duration < 500,
    });
}