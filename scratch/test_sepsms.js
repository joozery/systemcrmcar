const axios = require('axios');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NTU1LCJlbWFpbCI6Im5hcmF2aWNoc2FuZ3Rob25nMjUzNEBnbWFpbC5jb20iLCJuYW1lIjoi4LiZ4Lij4Lin4Li04LiK4LiN4LmMIOC5geC4quC4h-C4l-C4reC4hyIsInBob25lIjoiMDYyODc4MjgyNSIsInN0YXR1cyI6ImFjdGl2ZSIsImNyZWF0ZWRBdCI6IjIwMjUtMTItMTRUMTY6MTU6MTMuMzg2WiIsInVwZGF0ZWRBdCI6IjIwMjUtMTItMTRUMTY6MTU6MTMuMzg2WiIsImFiaWxpdGllcyI6WyJzbXNfc2VuZCIsInNtc19oaXN0b3J5Iiwic21zX2V4cG9ydCIsImFwaV9zbXNfc2VuZCIsImFwaV9zbXNfaGlzdG9yeSIsImFwaV9zbXNfZXhwb3J0IiwiYXBpX2JhbGFuY2UiXSwicmVmZXJyYWxDb2RlIjoiWTNDOVlSUVciLCJsb25nTGl2ZVRva2VuIjp0cnVlLCJpYXQiOjE3NjU3MzQ2NjUsImV4cCI6MTc5NzI5MjI2NX0.yaFK5sqA1279pb0oXiPebaO7e8m0GUCoj2mT7IQXC_k';

async function testSEPSMS() {
    try {
        console.log('Testing SEPSMS with working token...');
        const response = await axios.post('https://api.sepsms.com/v1/messages', {
            msisdn: '0838346686',
            content: 'รหัส OTP ของคุณคือ 123456',
            sender: 'NARAVICH'
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('SEPSMS Success:', response.data);
    } catch (error) {
        console.log('SEPSMS Error:', error.response?.data || error.message);
    }
}

testSEPSMS();
