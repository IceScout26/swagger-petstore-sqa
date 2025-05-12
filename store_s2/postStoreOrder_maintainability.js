import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';

export let options = {
    stages: [
        { duration: '10s', target: 350 },  // Load normal
        { duration: '30s', target: 3500 }, // Lonjakan (simulasi kegagalan)
        { duration: '20s', target: 350 },  // Pemulihan (cek kapan kembali ke normal)
    ],
};

// Counter untuk kegagalan dan pemulihan
let totalFailures = new Counter('total_failures');
let totalRecoveries = new Counter('total_recoveries');

// Counter untuk hasil check()
let checkSuccess = new Counter('check_success');
let checkFail400 = new Counter('check_fail_400');
let checkFail429 = new Counter('check_fail_429');
let checkFail500 = new Counter('check_fail_500');
let checkUnexpectedError = new Counter('check_unexpected_error');
let checkSlowResponse = new Counter('check_slow_response');

let failureOngoing = false;

export default function () {
    const payload = JSON.stringify({
        id: __VU, // Gunakan ID VU sebagai ID order unik
        petId: __VU, // Gunakan ID VU sebagai ID pet unik
        quantity: Math.floor(Math.random() * 10) + 1, // Jumlah random antara 1-10
        shipDate: new Date().toISOString(), // Tanggal pengiriman saat ini
        status: 'placed', // Status order
        complete: true, // Order selesai
    });

    const url = `https://petstore.swagger.io/v2/store/order`;

    const params = {
        headers: {
            'Content-Type': 'application/json'
        }
    };

    let res;

    try {
        res = http.post(url, payload, params);
    } catch (error) {
        console.log(`🚨 API FAILURE DETECTED! Status: 0 at ${new Date().toISOString()} (Connection Error)`);
        if (!failureOngoing) {
            totalFailures.add(1);
            failureOngoing = true;
        }
        checkUnexpectedError.add(1); // Connection error dihitung sebagai unexpected error
        sleep(1);
        return;
    }

    let isSuccess = res.status === 200;

    if (!isSuccess) {
        if (!failureOngoing) {
            totalFailures.add(1);
            failureOngoing = true;
            console.log(`🚨 API FAILURE DETECTED! Status: ${res.status} at ${new Date().toISOString()}`);
        }
    } else {
        if (failureOngoing) {
            totalRecoveries.add(1);
            failureOngoing = false;
            console.log(`✅ API RECOVERED at ${new Date().toISOString()}!`);
        }
    }

    check(res, {
        '✅ Status is 200 (Success)': (r) => {
            let result = r.status === 200;
            if (result) checkSuccess.add(1);
            return result;
        },
        '❌ Status is 400 (Bad Request)': (r) => {
            let result = r.status === 400;
            if (result) checkFail400.add(1);
            return result;
        },
        '⚠️ Status is 429 (Rate Limit Exceeded)': (r) => {
            let result = r.status === 429;
            if (result) checkFail429.add(1);
            return result;
        },
        '🔥 Status is 500 (Server Error)': (r) => {
            let result = r.status === 500;
            if (result) checkFail500.add(1);
            return result;
        },
        '⚡ Unexpected Error (Other)': (r) => {
            let result = ![200, 400, 429, 500].includes(r.status);
            if (result) checkUnexpectedError.add(1);
            return result;
        },
        '⏱️ Response time > 1000ms (Slow)': (r) => {
            let result = r.timings.duration >= 1000;
            if (result) checkSlowResponse.add(1);
            return result;
        },
    });

    sleep(1);
}

// Fungsi untuk menampilkan ringkasan di akhir pengujian
export function handleSummary(data) {
    let failureCount = data.metrics['total_failures']?.values?.count || 0;
    let recoveryCount = data.metrics['total_recoveries']?.values?.count || 0;

    let successCount = data.metrics['check_success']?.values?.count || 0;
    let fail400Count = data.metrics['check_fail_400']?.values?.count || 0;
    let fail429Count = data.metrics['check_fail_429']?.values?.count || 0;
    let fail500Count = data.metrics['check_fail_500']?.values?.count || 0;
    let unexpectedErrorCount = data.metrics['check_unexpected_error']?.values?.count || 0;
    let slowCount = data.metrics['check_slow_response']?.values?.count || 0;

    let summaryText = `
**Ringkasan Pengujian:**
Total Failures: ${failureCount}
Total Recoveries: ${recoveryCount}

**Hasil Check Status:**
Success (200): ${successCount}
Bad Request (400): ${fail400Count}
Rate Limit Exceeded (429): ${fail429Count}
Server Error (500): ${fail500Count}
Unexpected Error (Other & Connection Error): ${unexpectedErrorCount}

**Performance Metrics:**
Slow Responses (>1s): ${slowCount}
    `;

    return {
        'stdout': summaryText,
    };
}