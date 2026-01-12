import "dotenv/config"
import { Agent , run , InputGuardrailTripwireTriggered} from "@openai/agents"

import {z} from "zod"

const mathsInputGuardrailAgent = new Agent({
    name: "Maths Input Guardrail Agent",
    instructions: "You are a maths input guardrail agent that checks if the given query is a maths question or not",
    outputType: z.object({
        isValidMathsQuestion : z.boolean().describe("Is a maths question or not"),
        reason: z.string()
    }),
    model: 'gpt-4o-mini'
})

// mathsInputGuardrail is an object
const mathsInputGuardrail = {
    name: " Maths Input Guardrail",
    runInParallel: false,
    execute: async ({ input }) => {
        const result = await run(mathsInputGuardrailAgent, input) //Calling Maths Input Guardrail Agent
        return{
            tripwireTriggered: !result.finalOutput.isValidMathsQuestion,
            outputInfo: result.finalOutput.reason
        }
    },
}


const mathsAgent = new Agent({
    name: "Maths Agent",
    instructions: `You are an expert maths ai agent.
    RULES-
    - The question should strictly be a maths equation and their explanation only
    - Reject any other type of queries.
    `,
    inputGuardrails: [mathsInputGuardrail],
    model: "gpt-4o-mini"
})

async function main(q = ' '){
    try {
        const result = await run(mathsAgent, q)
        console.log("🤖",result.finalOutput)
    } catch (error) {
        if(error instanceof InputGuardrailTripwireTriggered){
            console.log("Invalid output...", error.message)
        }
    }
}
main("What is this keyword in java")