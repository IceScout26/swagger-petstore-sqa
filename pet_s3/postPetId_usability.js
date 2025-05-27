import http from 'k6/http';
import { check } from 'k6';

export let options = {
    vus: 1,
    // duration: '10s',
};

export default function () {
    // Membuat petId unik berdasarkan VU ID
    const petId = __VU; // Gunakan ID VU sebagai petId unik
    // const petId = "invalid_id"; // ID yang tidak valid

    const url = `https://petstore.swagger.io/v2/pet/${petId}`;

    // Payload form-data sesuai dokumentasi (bukan JSON)
    const payload = {
        name: `Pet_${petId}`,
        status: 'available',
    };

    // Kirim request POST dengan form data
    const res = http.post(url, payload);

    // Cek apakah response status 200
    check(res, {
        'Status is 200': (r) => r.status === 200,
        'Status is 400': (r) => r.status === 400,
        'Status is 404': (r) => r.status === 404,
        'Status is 405': (r) => r.status === 405,
        'Status is 415': (r) => r.status === 415,
        'Status is 429': (r) => r.status === 429,
        'Status is 500': (r) => r.status === 500,
        'response contains message': (r) => r.body.includes('message'),
    });

    // Log respons untuk debugging
    console.log(`Response Status: ${res.status}`);
    console.log(`Response Body: ${res.body}`);
}