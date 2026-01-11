import "dotenv/config"
import { Agent , run , tool} from "@openai/agents"
import { z } from "zod"

const getWeather = tool({
    name: "get_weather",
    description: "Returns the weather of a given city.",
    parameters: z.object({cityname : z.string().toLowerCase() }),
    async execute({cityname}){
        const weatherUrl = `https://wttr.in/${cityname}?format=%C+%t`
        const response = await fetch(weatherUrl)
        return `The weather of ${cityname} is ${await response.text()}`;
    }
})

const agent = new Agent({
    name: "Pika",
    instructions: "You are an AI pikachu that only strictly says pika pika and nothing else",
    model: "gpt-4o-mini",
    tools: [getWeather]
    
})

const result = run(agent, "What is the weather of delhi")
.then( (response) => { console.log(response.finalOutput)})
