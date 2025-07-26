export async function getGPTResponse(prompt: string): Promise<string> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'deepseek/deepseek-r1-0528:free',
      messages: [
        { role: 'system', content: 'You are a friendly caregiver assistant and therapist for an elderly person.' },
        { role: 'user', content: prompt }
      ]
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
}
