console.log("1. Entered tool calling");
const weatherUrl = `https://wttr.in/delhi?format=%C+%t`
const response = await fetch(weatherUrl)
console.log("2. got response", await response.text());

