const axios = require('axios');

const appKey = 'ljYL3qWENgv5f4z3DG-CLZxiyhxXSc';
const appSecret = 'n42kp_WXUZ2cSzrChGxuBNRholBXnW';
const auth = Buffer.from(`${appKey}:${appSecret}`).toString('base64');

async function testOTP() {
    try {
        console.log('Testing OTP v2 path...');
        const response = await axios.post('https://api-v2.thaibulksms.com/v2/otp/request', {
            key: appKey,
            msisdn: '66812345678'
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${auth}`
            }
        });
        console.log('OTP v2 Success:', response.data);
    } catch (error) {
        console.log('OTP v2 Error:', error.response?.data || error.message);
    }

    try {
        console.log('Testing OTP root path...');
        const response = await axios.post('https://api-v2.thaibulksms.com/otp/request', {
            key: appKey,
            msisdn: '66812345678'
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${auth}`
            }
        });
        console.log('OTP root Success:', response.data);
    } catch (error) {
        console.log('OTP root Error:', error.response?.data || error.message);
    }
}

async function testSMS() {
    try {
        console.log('Testing User Snippet (Standard SMS)...');
        const response = await axios.post('https://api-v2.thaibulksms.com/sms', {
            msisdn: '0838346686',
            message: 'ทดสอบส่ง OTP จากระบบ: 123456 (Ref: TEST)',
            sender: 'Demo',
            force: 'standard'
        }, {
            auth: {
                username: appKey,
                password: appSecret
            },
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log('User Snippet Success:', response.data);
    } catch (error) {
        console.log('User Snippet Error:', error.response?.data || error.message);
    }
}

async function testV1() {
    try {
        console.log('Testing V1 API...');
        const response = await axios.get('https://www.thaibulksms.com/sms_api.php', {
            params: {
                username: appKey,
                password: appSecret,
                msisdn: '0838346686',
                message: 'Test V1',
                sender: 'NARAVICH'
            }
        });
        console.log('V1 Success:', response.data);
    } catch (error) {
        console.log('V1 Error:', error.response?.data || error.message);
    }
}

async function testBearer() {
    try {
        console.log('Testing Bearer Token...');
        const response = await axios.post('https://api-v2.thaibulksms.com/sms', {
            msisdn: '66838346686',
            message: 'Test Bearer',
            sender: 'NARAVICH'
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${appKey}`
            }
        });
        console.log('Bearer Success:', response.data);
    } catch (error) {
        console.log('Bearer Error:', error.response?.data || error.message);
    }
}

async function testSEPSMS() {
    try {
        console.log('Testing SEPSMS API...');
        const response = await axios.post('https://api.sepsms.com/v1/messages', {
            msisdn: '0838346686',
            content: 'Test SEPSMS',
            sender: 'NARAVICH'
        }, {
            headers: {
                'Authorization': `Bearer ${appKey}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('SEPSMS Success:', response.data);
    } catch (error) {
        console.log('SEPSMS Error:', error.response?.data || error.message);
    }
}

testOTP();
testSMS();
testV1();
testBearer();
testSEPSMS();
