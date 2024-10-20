import { Mistral } from '@mistralai/mistralai';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const mistral = new Mistral({
  apiKey: process.env["MISTRAL_API_KEY"] ?? "",
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
  
    console.log("Final Prompt: " + JSON.stringify(finalPrompt));

    return NextResponse.json({ finalPrompt }, { status: 200 });

  } catch (error) {
    console.error('Error generating prompt:', error);
    return NextResponse.json({ error: 'Failed to generate prompt' }, { status: 500 });
  }
}