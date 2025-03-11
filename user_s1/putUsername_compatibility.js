import http from 'k6/http';
import { check } from 'k6';

export let options = {
    vus: 10, 
    iterations: 30, // 30 request dengan variasi yang berbeda
};

export default function () {
    let baseUrl = 'https://petstore.swagger.io/v2/user';

    let usernames = [
        "user1", // ✅ Valid username
        // " ", // ❌ Invalid username
        // "longusername".repeat(1000) // ❌ Extremely long username
    ];

    let payloads = [
        JSON.stringify({
            id: 1,
            username: "user1",
            firstName: "First1",
            lastName: "Last1",
            email: "user1@example.com",
            password: "password1",
            phone: "0812312345678",
            userStatus: 1
        }), // ✅ Valid payload
        // JSON.stringify({
        //     id: "abc",
        //     username: 123,
        //     firstName: true,
        //     lastName: null,
        //     email: "invalid_email",
        //     password: "short",
        //     phone: "invalid_phone",
        //     userStatus: "active"
        // }), // ❌ Invalid payload
        // JSON.stringify({
        //     id: 9999999999999,
        //     username: "longusername".repeat(1000),
        //     firstName: "x".repeat(1000),
        //     lastName: "y".repeat(1000),
        //     email: "x".repeat(1000) + "@example.com",
        //     password: "longpassword".repeat(1000),
        //     phone: "08123".repeat(1000),
        //     userStatus: 1
        // }) // ❌ Extremely long payload
    ];

    let headersList = [
        // { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0' }, // Simulasi browser
        // { 'Content-Type': 'application/json', 'User-Agent': 'PostmanRuntime' }, // Simulasi Postman
        { 'Content-Type': 'application/json', 'User-Agent': 'MobileApp/1.0' } // Simulasi aplikasi mobile
    ];

    let username = usernames[__ITER % usernames.length]; // Variasi username berdasarkan iterasi
    let payload = payloads[__ITER % payloads.length]; // Variasi payload berdasarkan iterasi
    let headers = headersList[__ITER % headersList.length]; // Variasi headers

    let url = `${baseUrl}/${username}`;

    let res = http.put(url, payload, { headers });

    console.log(`Iteration: ${__ITER} | Status: ${res.status} | Username: ${username} | Payload: ${payload} | Headers: ${JSON.stringify(headers)}`);

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