import http from 'k6/http';
import { check } from 'k6';

export let options = {
    vus: 1, 
    iterations: 1, 
};

export default function () {
    let baseUrl = 'https://petstore.swagger.io/v2/store/order';

    let orderIds = [
        10, // ✅ Valid order ID
        // 99999999999999999999999999999999999999999999999999999999999999999999, // ❌ Extremely large order ID
        // "invalid_id", // ❌ Invalid order ID (string instead of number)
    ];

    let headersList = [
        // { 'User-Agent': 'MobileApp/1.0' }, // Simulasi aplikasi mobile
        // { 'User-Agent': 'PostmanRuntime' }, // Simulasi Postman
        // { 'User-Agent': 'Mozilla/5.0' }, // Simulasi browser
    ];

    let orderId = orderIds[__ITER % orderIds.length]; // Variasi order ID berdasarkan iterasi
    let headers = headersList[__ITER % headersList.length]; // Variasi headers

    let url = `${baseUrl}/${orderId}`;

    let res = http.del(url, null, { headers });

    console.log(`Iteration: ${__ITER} | Status: ${res.status} | Order ID: ${orderId} | Headers: ${JSON.stringify(headers)}`);

    check(res, {
        'Status is 200': (r) => r.status === 200,
        'Status is 404': (r) => r.status === 404,
        'Status is 400': (r) => r.status === 400,
        'Status is 429': (r) => r.status === 429,
        'Status is 500': (r) => r.status === 500,
        'Response time < 500ms': (r) => r.timings.duration < 500,
    });
}