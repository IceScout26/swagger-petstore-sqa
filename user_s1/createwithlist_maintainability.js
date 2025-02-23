import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
    stages: [
        { duration: '2m', target: 60 },  // Load normal
        { duration: '6m', target: 600 }, // Lonjakan (simulasi kegagalan)
        { duration: '2m', target: 60 },  // Pemulihan (cek kapan kembali ke normal)
    ],
};

let failureTime = null;  // Waktu pertama API gagal
let recoveryTime = null; // Waktu API pulih

export default function () {
    let url = 'https://petstore.swagger.io/v2/user/createWithList';
    let payload = JSON.stringify([{ id: __VU, username: `user_${__VU}`, email: `user${__VU}@example.com` }]);
    let params = { headers: { 'Content-Type': 'application/json' } };

    let res = http.post(url, payload, params);
    let currentTime = Date.now(); // Waktu saat request dilakukan

    // Cek apakah response status adalah 200
    let isSuccess = res.status === 200;

    // Jika response BUKAN 200 dan ini pertama kalinya API gagal, catat waktu kegagalan
    if (!isSuccess && failureTime === null) {
        failureTime = currentTime;
        console.log(`🚨 API failure at ${new Date(failureTime).toISOString()} with status ${res.status}`);
    }

    // Jika API kembali ke status 200 setelah sebelumnya gagal, hitung waktu pemulihan
    if (isSuccess && failureTime !== null && recoveryTime === null) {
        recoveryTime = currentTime;
        let mttr = (recoveryTime - failureTime) / 1000; // Waktu pemulihan dalam detik
        console.log(`✅ API recovered in ${mttr} seconds (${new Date(recoveryTime).toISOString()})`);
    }

    // Cek status response di akhir
    check(res, {
        'Status is 200': (r) => r.status === 200,
        'Status is 400': (r) => r.status === 400,
        'Status is 429': (r) => r.status === 429,
        'Status is 500': (r) => r.status === 500,
        'Status is unexpected': (r) => ![200, 400, 429, 500].includes(r.status),
    });

    sleep(1); // Jeda agar simulasi lebih realistis
}
