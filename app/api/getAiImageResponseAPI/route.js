import MistralClient from '@mistralai/mistralai';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import Replicate from 'replicate';

const apiKey = process.env.MISTRAL_API_KEY || 'your_api_key';
const client = new MistralClient(apiKey);

export async function POST(req) {
  const { messages, characterId, userId } = await req.json();

  try {
    // Fetch chat history with persona data
    const userCharacter = await prisma.userCharacter.findFirst({
      where: {
        userId: userId,
        characterId: characterId,
      },
      include: {
        character: {
          include: {
            personaData: true,
          },
        },
      },
    });

    if (!userCharacter) {
      return NextResponse.json({ error: 'User character not found' }, { status: 404 });
    }

    const chatHistory = messages;
    const persona = userCharacter.character.personaData;

    // Get the last 15 messages
    const last15Messages = chatHistory.slice(-15);

    // Format chat history for AI prompt
    const formattedChatHistory = last15Messages.map(message => {
      const [sender, content] = message.split(':', 2);
      return { role: sender.toLowerCase() === 'user' ? 'user' : 'assistant', content: content.trim() };
    });

    // Use MistralAI to format the chat history into an ideal prompt
    const chatResponse = await client.chat({
      model: 'open-mistral-nemo',
      messages: [
        { role: 'system', content: 'You are an AI assistant that analyzes chat history and deduces the current action of a character. Format your response as a concise prompt for image generation.' },
        { role: 'user', content: `Analyze this chat history and deduce the current action of the character named ${userCharacter.character.name}:\n${JSON.stringify(formattedChatHistory)}` },
      ],
      responseFormat: { type: 'json_object' },
    });

    const deducedAction = JSON.parse(chatResponse.choices[0].message.content).action;

    // Format the final prompt
    const finalPrompt = {
      prompt: `1girl, ${userCharacter.character.name}, ${userCharacter.character.animename || ''}, ${persona.appearance || ''}, ${deducedAction}, ${persona.clothes || ''}`
    };

    // Image Generation Section
    const replicate = new Replicate();

    const input = {
      "width": 896,
      "height": 1152,
      "prompt": finalPrompt,
      "guidance_scale": 7,
      "style_selector": "Anime",
      "negative_prompt": "blurry eyes, asymmetrical eyes, extra eyes, fused eyes, discolored eyes, cross-eyed, lazy eye, low-resolution eyes, dull pupils, missing iris, distorted face, extra hands, extra fingers, deformed hands, incorrect anatomy, mismatched hand size, fused fingers, mutated limbs, unnatural gestures, twisted hand poses, pixelated fingers, glitchy anatomy, overexposed",
      "quality_selector": "Standard v3.1",
      "num_inference_steps": 28
    }

    const output = await replicate.run("cjwbw/animagine-xl-3.1:6afe2e6b27dad2d6f480b59195c221884b6acc589ff4d05ff0e5fc058690fbb9", { input });
    console.log(output)
    //=> "https://replicate.delivery/pbxt/eoW2VutuKlU6VCWExLyif2ET...

    return NextResponse.json({ finalPrompt });
  } catch (error) {
    console.error('Error generating image prompt:', error);
    return NextResponse.json({ error: 'Failed to generate image prompt' }, { status: 500 });
  }
}