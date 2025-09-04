import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const url = "http://20.244.56.144/evaluation-service/logs"

async function Log(stack, level, myPackage, message) {
    const body = {
        stack,
        level,
        package: myPackage,
        message
    }
    try {
        const response = await axios.post(url, body, {
            headers: {
                "Authorization": `Bearer ${process.env.access_token}`
            }
        })
    
        const data = response.data
        console.log(data)
    } catch (error) {
        console.log(error)
    }
}

Log("backend", "error", "handler", "received string, expected bool")