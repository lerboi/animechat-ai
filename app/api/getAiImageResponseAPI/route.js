import MistralClient from '@mistralai/mistralai';
import { NextResponse } from 'next/server';

const apiKey = process.env.MISTRAL_API_KEY || 'your_api_key';

const client = new MistralClient(apiKey);

export async function POST(){
    const chatResponse = await client.chat({
        model: 'open-mistral-nemo',
        messages: [{role: 'user', content: 'What is the best French cheese?'}],
        responseFormat: {type: 'json_object'},
      });

      console.log('Chat:', chatResponse.choices[0].message.content);
}