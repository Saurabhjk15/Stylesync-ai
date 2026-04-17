import axios from 'axios';

async function testSignup() {
    try {
        console.log('Testing sending request to http://localhost:8080/api/auth/signup');
        await axios.post('http://localhost:8080/api/auth/signup', {});
    } catch (error) {
        if (error.response) {
            console.log('Response Status:', error.response.status);
            console.log('Response Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

testSignup();
