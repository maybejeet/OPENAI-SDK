import "dotenv/config"
import { Agent , run , tool , OutputGuardrailTripwireTriggered } from "@openai/agents"
import { z } from "zod"
import nodemailer from "nodemailer";

const outputGuardrailAgent = new Agent({
    name: "Output guardrail agent",
    instructions: `Strictly checks if the email sent is regarding the weather details or not.
        Rules:
        - If the email talks about temperature, weather conditions, climate, rain, clouds, etc. → TRUE
        - Otherwise → FALSE`,
    outputType: z.object({
        isValidQuery: z.boolean().describe("Checks if the email is regaring the info of weather of a city"),
        reason: z.string()
    }),
    model: "gpt-4o-mini"
})

const outputGuardrail = {
    name: "Output guardrail",
    runInParallel: false,
    execute: async({agentOutput}) => {
        console.log("Final Output ---> ", agentOutput)
        const result = await run(outputGuardrailAgent, agentOutput)
        return {
            tripwireTriggered: !result.finalOutput.isValidQuery,
            outputInfo: result.finalOutput.reason
        }
    }

}

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

const sendEmail = tool({
    name: "Send Email Agent",
    description: "Sends gmail to the given user.",
    parameters: z.object({
        to: z.string().email(),
        subject: z.string().max(50),
        text: z.string()
    }),
    async execute({to, subject, text}){
        console.log("To - ",to);
        console.log("Subject - ",subject);
        console.log("Body - ",text);
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_MY_EMAIL,
                pass: process.env.GMAIL_APP_PASS
            }
        });
        return await transporter.sendMail({
            from: process.env.GMAIL_MY_EMAIL,
            to,
            subject,
            text
        });
        
    }
})

const sendEmailAgent = new Agent({
    name: "Email Sending Agent",
    instructions: "You are an Email sending agent that sends the email to given user",
    //model: "gpt-4o-mini",
    outputGuardrails: [outputGuardrail],
    tools: [sendEmail,getWeather],
})


async function main(q = '') {
    try {
        const result = await run(sendEmailAgent,q)
        console.log("🤖", result.finalOutput)
    } catch (error) {
        if(error instanceof OutputGuardrailTripwireTriggered){
            console.log("Error---", error.message)
        }
    }

}
main( "Send an email to the email id jeetkumarprasad69@gmail.com, telling them happy holi")

``` 
This is a code using openai sdk. I have made a sendEmailAgent that only sends email regarding the information of weather. And i have used outputguardrail to prevent it from emailing anything else. But here the agent first emails about any query then checks for the outputguardrail. So how can i fix that?
```