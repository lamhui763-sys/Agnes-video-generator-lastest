import fetch from 'node-fetch';

async function test(modelName) {
    const key = "cpk-CJxrCSyiu9BWsE1yzwrPX2REloaU8cgoPeGH4daMV6NcVSm8";
    const res = await fetch("https://apihub.agnes-ai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${key}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: modelName,
            messages: [{ role: "user", content: "Hello" }]
        })
    });
    console.log(res.status);
    console.log(await res.text());
}
test("agnes-2.0-flash");
