import http from 'k6/http';
import { check } from 'k6';

export let options = {
    vus: 10, 
    iterations: 10, // 30 request dengan variasi yang berbeda
};

export default function () {
    let baseUrl = 'https://petstore.swagger.io/v2/pet';

    let petIds = [
        // 1, // ✅ Valid pet ID
        // 9999999999999, // ❌ Extremely large pet ID/
        "invalid_id", // ❌ Invalid pet ID (string instead of number)
    ];

    let headersList = [
        // { 'User-Agent': 'Mozilla/5.0' }, // Simulasi browser
        // { 'User-Agent': 'PostmanRuntime' }, // Simulasi Postman
        // { 'User-Agent': 'MobileApp/1.0' }, // Simulasi aplikasi mobile
    ];

    let petId = petIds[__ITER % petIds.length]; // Variasi pet ID berdasarkan iterasi
    let headers = headersList[__ITER % headersList.length]; // Variasi headers

    let url = `${baseUrl}/${petId}/uploadImage`;

    // Membuat payload form-data untuk mengunggah gambar
    const payload = {
        file: http.file('D:/Document/Semester 8/SQA/swagger-petstore-sqa/pet_s3/cat.jpeg'), // Pastikan file ada di direktori yang sama
        additionalMetadata: `Metadata for pet ${petId}`, // Metadata opsional
    };

    let res = http.post(url, payload, { headers });

    console.log(`Iteration: ${__ITER} | Status: ${res.status} | Pet ID: ${petId} | Headers: ${JSON.stringify(headers)}`);

    check(res, {
        'Status is 200': (r) => r.status === 200,
        'Status is 400': (r) => r.status === 400,
        'Status is 415': (r) => r.status === 415,
        'Status is 429': (r) => r.status === 429,
        'Status is 500': (r) => r.status === 500,
        'Response time < 500ms': (r) => r.timings.duration < 500,
    });
}