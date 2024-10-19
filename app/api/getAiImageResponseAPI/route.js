import { Mistral } from '@mistralai/mistralai';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import Replicate from 'replicate';

const mistral = new Mistral({
  apiKey: process.env["MISTRAL_API_KEY"] ?? "",
});

const replicate = new Replicate({
  auth: process.env["REPLICATE_API_TOKEN"]
});

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

    const chatHistory = userCharacter.chatHistory;
    const persona = userCharacter.character.personaData;

    // Get the last 15 messages
    const last15Messages = chatHistory.slice(-15);

    // Format chat history for AI prompt
    const formattedChatHistory = last15Messages.map(message => {
      const [sender, content] = message.split(':', 2);
      return { role: sender.toLowerCase() === 'user' ? 'user' : 'assistant', content: content.trim() };
    });

    // Use MistralAI to format the chat history into an ideal prompt
    const chatResponse = await mistral.chat.complete({
      model: 'open-mistral-nemo',
      messages: [
        {
          role: 'system',
          content: `
            You are an AI assistant that analyzes chat history and creates a detailed, concise prompt for image generation.
            Extract the following information:
            1. **Current Action**: What is the character doing or interacting with? Aside from detailing this, ensure to add the general action the Character is performing.
            2. **Current Attire**: Describe the character's clothing, accessories, or visible traits in this scene.
            3. **Clothing State**: Based on the chat, always add one of the following: "fully naked", "half naked", or "clothed".
            
            Format the response as a **single sentence** prompt like this:
            "{clothing_state}, {attire}, {action}, {environment or objects if relevant}"
    
            Ensure that the clothing state is relevant to the context and always included.
          `,
        },
        {
          role: 'user',
          content: `
            Analyze this chat history and deduce the current action, attire, and the degree of clothing of the character named ${userCharacter.character.name}:
            ${JSON.stringify(formattedChatHistory)}
          `,
        },
      ],
      responseFormat: { type: 'json_object' },
    });
    
    const deducedContent = chatResponse.choices[0].message.content;
  
    // Format the final prompt with persona data and AI-deduced content
    const finalPrompt = {
      prompt: `1girl, ${userCharacter.character.name}, ${userCharacter.character.animename || ''}, ${persona.appearance || ''}, ${deducedContent}`,
    };
    
    // Image Generation Section
    const output = await replicate.predictions.create(
      {
        version: "6afe2e6b27dad2d6f480b59195c221884b6acc589ff4d05ff0e5fc058690fbb9",
        input: {
          "width": 896,
          "height": 1152,
          "prompt": finalPrompt.prompt,
          "guidance_scale": 7,
          "style_selector": "Anime",
          "negative_prompt": "blurry eyes, asymmetrical eyes, extra eyes, fused eyes, discolored eyes, cross-eyed, lazy eye, low-resolution eyes, dull pupils, missing iris, distorted face, extra hands, extra fingers, deformed hands, incorrect anatomy, mismatched hand size, fused fingers, mutated limbs, unnatural gestures, twisted hand poses, pixelated fingers, glitchy anatomy, overexposed",
          "quality_selector": "Standard v3.1",
          "num_inference_steps": 28
        }
      }
    );

    if (output) {
      return NextResponse.json(output , { status: 200 });
    } else {
      throw new Error("Unexpected output format from Replicate API");
    }

  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
  }
}