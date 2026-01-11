import "dotenv/config"
import { Agent , run , tool} from "@openai/agents"
import { z } from "zod"
import nodemailer from "nodemailer";

const getWeather = tool({
    name: "Weather agent",
    description: "Returns the weather of a given city.",
    parameters: z.object({cityname : z.string().toLowerCase() }),
    async execute({cityname}){
        const weatherUrl = `https://wttr.in/${cityname}?format=%C+%t`
        const response = await fetch(weatherUrl)
        return `The weather of ${cityname} is ${await response.text()}`;
    }
})
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_MY_EMAIL,
        pass: process.env.GMAIL_APP_PASS
    }
});

const sendEmail = tool({
    name: "Send Email Agent",
    description: "Sends gmail to the given user.",
    parameters: z.object({
        to: z.string().email(),
        subject: z.string().max(50),
        text: z.string()
    }),
    async execute({to, subject, text}){
        //console.log("To - ",to);
        //console.log("Subject - ",subject);
        //console.log("Body - ",text);
        return await transporter.sendMail({
            from: process.env.GMAIL_MY_EMAIL,
            to,
            subject,
            text
        });
        
    }
})


const agent = new Agent({
    name: "Pika",
    instructions: "You are an AI pikachu that solves the user query",
    model: "gpt-4o-mini",
    tools: [getWeather, sendEmail]
    
})

const result = run(agent, "Email me the weather of siliguri at jeetkumarprasad69@gmail.com")
.then( (response) => { console.log(response.finalOutput)})
