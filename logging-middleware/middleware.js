import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const LOGGING_SERVICE_URL = "http://20.244.56.144/evaluation-service/logs";
const AUTH_SERVICE_URL = "http://20.244.56.144/evaluation-service/auth";

let accessToken = null;
let tokenExpiry = 0;

async function getAccessToken() {
    if (accessToken && Date.now() < tokenExpiry) {
        return accessToken;
    }

    try {
        const response = await axios.post(AUTH_SERVICE_URL, {
            email: process.env.email,
            name: process.env.name,
            rollNo: process.env.rollNo,
            accessCode: process.env.accessCode,
            clientID: process.env.clientID,
            clientSecret: process.env.clientSecret
        }, {
            timeout: 5000
        });

        if (response.data && response.data.access_token) {
            accessToken = response.data.access_token;
            tokenExpiry = Date.now() + (50 * 60 * 1000);
            return accessToken;
        }
        throw new Error('No access token received');
    } catch (error) {
        console.error('Failed to get access token:', error.message);
        return null;
    }
}

async function Log(stack, level, myPackage, message) {
    const logEntry = {
        stack,
        level,
        package: myPackage,
        message: typeof message === 'string' ? message : JSON.stringify(message),
        timestamp: new Date().toISOString()
    };

    try {
        const token = await getAccessToken();
        if (!token) {
            console.error('No valid access token available for logging');
            return;
        }

        console.log('Sending log entry:', JSON.stringify(logEntry, null, 2));
        
        const response = await axios.post(LOGGING_SERVICE_URL, logEntry, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            timeout: 5000,
            validateStatus: () => true // This ensures we get the full response even on error
        });

        console.log(response.data)
    } catch (error) {
        if (error.response) {
            console.error('Logging service error:', {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
                headers: error.response.headers
            });
        } else if (error.request) {
            console.error('No response from logging service:', error.request);
        } else {
            console.error('Error setting up logging request:', error.message);
        }
    }
}

export default Log;

Log("backend", "error", "handler", "received string, expected bool")