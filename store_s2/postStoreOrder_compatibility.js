import http from 'k6/http';
import { check } from 'k6';

export let options = {
    vus: 10, 
    iterations: 30, // 30 request dengan variasi yang berbeda
};

export default function () {
    let baseUrl = 'https://petstore.swagger.io/v2/store/order';

    let payloads = [
        // JSON.stringify({
        //     id: 1,
        //     petId: 101,
        //     quantity: 2,
        //     shipDate: new Date().toISOString(),
        //     status: 'placed',
        //     complete: true
        // }), // ✅ Valid payload
        // JSON.stringify({
        //     id: "invalid_id", // ❌ Invalid ID (string instead of number)
        //     petId: null, // ❌ Invalid petId (null value)
        //     quantity: -5, // ❌ Invalid quantity (negative number)
        //     shipDate: "invalid_date", // ❌ Invalid date format
        //     status: 123, // ❌ Invalid status (number instead of string)
        //     complete: "not_boolean" // ❌ Invalid complete (string instead of boolean)
        // }), // ❌ Invalid payload
        JSON.stringify({
            id: 999999999999999, // ❌ Extremely large ID
            petId: 999999999999999, // ❌ Extremely large petId
            quantity: 1000000, // ❌ Extremely large quantity
            shipDate: "9999-12-31T23:59:59.999Z", // ❌ Far future date
            status: 'x'.repeat(1000), // ❌ Extremely long status string
            complete: true
        }), // ❌ Extreme data payload
    ];

    let headersList = [
        // { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0' }, // Simulasi browser
        // { 'Content-Type': 'application/json', 'User-Agent': 'PostmanRuntime' }, // Simulasi Postman
        { 'Content-Type': 'application/json', 'User-Agent': 'MobileApp/1.0' } // Simulasi aplikasi mobile
    ];

    let payload = payloads[__ITER % payloads.length]; // Variasi payload berdasarkan iterasi
    let headers = headersList[__ITER % headersList.length]; // Variasi headers

    let res = http.post(baseUrl, payload, { headers });

    console.log(`Iteration: ${__ITER} | Status: ${res.status} | Payload: ${payload} | Headers: ${JSON.stringify(headers)}`);

    check(res, {
        'Status is 200': (r) => r.status === 200,
        'Status is 400': (r) => r.status === 400,
        'Status is 404': (r) => r.status === 404,
        'Status is 414': (r) => r.status === 414,
        'Status is 429': (r) => r.status === 429,
        'Status is 500': (r) => r.status === 500,
        'Response time < 500ms': (r) => r.timings.duration < 500,
    });
}