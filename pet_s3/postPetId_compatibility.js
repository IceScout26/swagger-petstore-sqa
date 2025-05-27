import http from 'k6/http';
import { check } from 'k6';

export let options = {
    vus: 10, 
    iterations: 10, // 10 request dengan variasi yang berbeda
};

export default function () {
    let baseUrl = 'https://petstore.swagger.io/v2/pet';

    let petIds = [
        1, // ✅ Valid pet ID
        // "9999999999999".repeat(1000), // ❌ Extremely large pet ID
        // "invalid_id", // ❌ Invalid pet ID (string instead of number)
    ];

    let headersList = [
        { 'User-Agent': 'Mozilla/5.0' }, // Simulasi browser
        { 'User-Agent': 'PostmanRuntime' }, // Simulasi Postman
        { 'User-Agent': 'MobileApp/1.0' }, // Simulasi aplikasi mobile
    ];

    let petId = petIds[__ITER % petIds.length]; // Variasi pet ID berdasarkan iterasi
    let headers = headersList.length > 0 ? headersList[__ITER % headersList.length] : {};

    let url = `${baseUrl}/${petId}`;

    // Payload form-data sesuai dokumentasi (bukan JSON)
    const payload = {
        name: `Pet_${petId}`,
        status: 'available',
    };

    let res = http.post(url, payload, { headers });

    console.log(`Iteration: ${__ITER} | Status: ${res.status} | Pet ID: ${petId} | Headers: ${JSON.stringify(headers)}`);

    check(res, {
        'Status is 200': (r) => r.status === 200,
        'Status is 400': (r) => r.status === 400,
        'Status is 404': (r) => r.status === 404,
        'Status is 405': (r) => r.status === 405,
        'Status is 414': (r) => r.status === 414,
        'Status is 415': (r) => r.status === 415,
        'Status is 429': (r) => r.status === 429,
        'Status is 500': (r) => r.status === 500,
        'Response time < 500ms': (r) => r.timings.duration < 500,
    });
}