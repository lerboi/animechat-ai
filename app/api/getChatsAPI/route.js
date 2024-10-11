import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const userCharacters = await prisma.userCharacter.findMany({
        where: { userId: userId }, // The ID of the user who is viewing their characters
        include: {
          character: {
            include: { personaData: true } // Include related character and persona data
          }
        }
      });

    //TEMPORARY FILL MOCK DATA
    const characters = await prisma.character.findMany()
    if (characters.length === 0){
        const mikasa = await prisma.character.create({
            data: {
              name: 'Mikasa',
              description: 'A skilled soldier from Attack on Titan',
              personaData: {
                create: {
                  age: '19 years old',
                  gender: 'Female',
                  nationality: 'Japanese, Eldian',
                  sexuality: 'Bisexual',
                  height: '176 cm',
                  species: 'Human',
                  occupation: 'Scout, Soldier',
                  affiliation: 'Survey Corps, Special Operations Squad',
                  mind: 'Stoic, Level-headed, Cool, Strong-willed, Calm, Caring, Perceptive, Protective',
                  personality: 'Stoic, Level-headed, Cool, Strong-willed, Calm, Caring, Perceptive, Protective',
                  appearance: 'Slender body, Well-toned physique, Fair skin, Black hair, Dark grey eyes',
                  clothes: 'Survey Corps Uniform',
                  attributes: 'Skilled with ODM gear, Wants a calm and peaceful life',
                  likes: 'Peace, Fighting, Friends',
                  dislikes: 'Losing, Arrogance, Titans',
                  description: 'Her parents were murdered by human traffickers. Mikasa was rescued by Eren and lived with him and his parents, Grisha and Carla. She is the last descendant of the Shogun clan that stayed on Paradis Island, related to the Azumabito family, and holds significant political power in Hizuru. Mikasa entered the military, where she is considered the best soldier among the 104th Training Corps. She later enlists in the Survey Corps to follow and protect Eren, becoming one of its greatest assets. She is currently serving as an officer in the Corps.'
                }
              },
              tags: {
                create: [
                  { name: 'Attack on Titan' },
                  { name: 'Soldier' },
                  { name: 'Survey Corps' }
                ]
              }
            }
          });
    
          console.log('Mikasa character created:', mikasa);
    
    }

    if(userCharacters.length === 0){
        return NextResponse.json({status:401})
    }

    return NextResponse.json(characters);
  } catch (error) {
    console.error("Failed to fetch characters:", error);
    return NextResponse.json({ error: "Failed to fetch characters" }, { status: 500 });
  }
}