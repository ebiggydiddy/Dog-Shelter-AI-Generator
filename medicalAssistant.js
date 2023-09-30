const form = document.getElementById('chat-form');
const inputBox = document.getElementById('inputBox');
const responseTextarea = document.getElementById('response');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const gpt_prompt = `Give me specific medical and behavioral recommendations for the dog breed ${inputBox.value}.`;
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${'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'}`,
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: gpt_prompt }],
                temperature: 1.0,
                top_p: 0.7,
                n: 1,
                stream: false,
                presence_penalty: 0,
                frequency_penalty: 0,
            }),
        });

        if (response.ok) {
            const data = await response.json();
            responseTextarea.value = data.choices[0].message.content;        
        } else {
            responseTextarea.value = 'Error: Unable to process your request.';
            throw new Error('Unable to process your request.');
        }
    } catch (error) {
        console.error(error);
        responseTextarea.value = 'Error: Unable to process your request.';
    }
});