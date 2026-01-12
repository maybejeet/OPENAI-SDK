import "dotenv/config";
import { Agent , run , tool} from "@openai/agents"
import {z} from "zod"
import fs from "node:fs/promises"


const availablePlans = tool({
    name: "Available plans",
    description: "It lists the available internet plans available",
    parameters: z.object({}),
    execute: async function () {
        return [
            { "planID": 1 , "price": 399 , "speed": "20MB/s"},
            { "planID": 2 , "price": 999 , "speed": "50MB/s"},
            { "planID": 3 , "price": 1499 , "speed": "100MB/s"},
        ]
    }
})



const processRefund = tool({
    name: "Process refund",
    description: "It processess the user refund",
    parameters: z.object({
        customerId: z.string().describe("ID of the customer"),
        reason: z.string().describe("Reason for refund")
    }),
    execute: async function (customerId , reason) {
        await fs.appendFile('./refunds.txt',`Refund for customer ID ${customerId.customerId} and the reason was ${customerId.reason} \n`,'utf-8')
        return { refundIssued : true}
    }
})

const salesAgent = new Agent({
    name: "Sales Agent",
    instructions: "You are a sales agent for an internet service provide company that will resolve the user queries on sales",
    model: "gpt-4o-mini",
    tools: [availablePlans, 
    //     refundAgent.asTool({
    //     toolName: 'refund_expert',
    //     toolDescription: 'Handles refund questions and requests.',
    // })
]
})

const refundAgent = new Agent({
    name: "Refund Agent",
    instructions: "You are a refund agent that will help user get their refund. If the user asks about sales or available, hand off to the sales agent.",
    model: "gpt-4o-mini",
    tools: [processRefund],
    handoffs: [salesAgent]
})


// run(salesAgent, "Hi,can you help me with the refund. customer id cus456 and my reason is that i dont like the internet speed and also tell me the available plans")
// .then((response)=>{
//     console.log(response.finalOutput)
// })

run(refundAgent, "Hi,Can you tell me about the available internet plans")
.then((response)=>{
    console.log(response.finalOutput)
})