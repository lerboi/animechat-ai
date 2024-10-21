import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Mistral } from "@mistralai/mistralai";

const mistral = new Mistral({
    apiKey: process.env["MISTRAL_API_KEY"] ?? "",
  });

class Persona {
    constructor(name) {
        this.name = name;
        this.age = "";
        this.gender = "";
        this.nationality = "";
        this.sexuality = "";
        this.height = "";
        this.species = "";
        this.occupation = "";
        this.affiliation = "";
        this.mind = [];
        this.personality = [];
        this.appearance = [];
        this.clothes = "";
        this.attributes = [];
        this.likes = [];
        this.dislikes = [];
        this.description = "";
        this.scenario = "";
    }

    setAge(age) { this.age = age; }
    setGender(gender) { this.gender = gender; }
    setNationality(nationality) { this.nationality = nationality; }
    setSexuality(sexuality) { this.sexuality = sexuality; }
    setHeight(height) { this.height = height; }
    setSpecies(species) { this.species = species; }
    setOccupation(occupation) { this.occupation = occupation; }
    setAffiliation(affiliation) { this.affiliation = affiliation; }
    setMind(...mind) { this.mind = mind; }
    setPersonality(...personality) { this.personality = personality; }
    setAppearance(...appearance) { this.appearance = appearance; }
    setClothes(clothes) { this.clothes = clothes; }
    setAttributes(...attributes) { this.attributes = attributes; }
    setLikes(...likes) { this.likes = likes; }
    setDislikes(...dislikes) { this.dislikes = dislikes; }
    setDescription(description) { this.description = description; }
    setScenario(scenario) { this.scenario = scenario }

    formatPersona() {
        return (
            `Character Persona: Name: ${this.name}, Age: ${this.age}, Gender: ${this.gender}, Nationality: ${this.nationality}, Sexuality: ${this.sexuality}, Height: ${this.height}, Species: ${this.species}, Occupation: ${this.occupation}, Affiliation: ${this.affiliation}, Personality: ${this.personality.join(", ")}, Appearance: ${this.appearance.join(", ")}, Attributes: ${this.attributes.join(", ")}, Likes: ${this.likes.join(", ")}, Dislikes: ${this.dislikes.join(", ")}, Description: ${this.description}`
        );
    }
}

async function getGenKey(userCharacter) {
    if (userCharacter.genkey) {
        return userCharacter.genkey;
    } else {
        const newGenkey = `KCPP${Math.floor(1000 + Math.random() * 9000)}`;
        await prisma.userCharacter.update({
            where: { id: userCharacter.id },
            data: { genkey: newGenkey }
        });
        return newGenkey;
    }
}

export async function POST(req) {
    const { messages, characterId, userId } = await req.json();
    try {
        const userCharacter = await prisma.userCharacter.findUnique({
            where: {
                userId_characterId_version: {
                    userId: userId,
                    characterId: parseInt(characterId),
                    version: 1
                }
            },
            include: {
                character: {
                    include: {
                        personaData: true
                    }
                }
            }
        });

        if (!userCharacter) {
            return NextResponse.json({ error: "UserCharacter not found" }, { status: 404 });
        }

        const { character, chatHistory } = userCharacter;
        const { personaData, personaId } = character;

        const persona = new Persona(character.name);
        persona.setAge(personaData.age);
        persona.setGender(personaData.gender);
        persona.setNationality(personaData.nationality);
        persona.setSexuality(personaData.sexuality);
        persona.setHeight(personaData.height);
        persona.setSpecies(personaData.species);
        persona.setOccupation(personaData.occupation);
        persona.setAffiliation(personaData.affiliation);
        persona.setAge(`"${personaData.age}"`);
        persona.setGender(`"${personaData.gender}"`);
        persona.setNationality(`"${personaData.nationality}"`);
        persona.setSexuality(`"${personaData.sexuality}"`);
        persona.setHeight(`"${personaData.height}"`);
        persona.setSpecies(`"${personaData.species}"`);
        persona.setOccupation(`"${personaData.occupation}"`);
        persona.setAffiliation(`"${personaData.affiliation}"`);
        persona.setAppearance(...personaData.appearance?.split(',').map((a) => `"${a.trim()}"`));
        persona.setClothes(`"${personaData.clothes}"`);
        persona.setAttributes(...personaData.attributes?.split(',').map((att) => `"${att.trim()}"`));
        persona.setLikes(...personaData.likes?.split(',').map((like) => `"${like.trim()}"`));
        persona.setDislikes(...personaData.dislikes?.split(',').map((dislike) => `"${dislike.trim()}"`));
        persona.setDescription(`"${personaData.description}"`);
        persona.setScenario(`${personaData.scenario}`)

        //format the Description using MistralAI
        let aiDescription = personaData?.aiDescription
        let deducedContent = ""
        if(!aiDescription){
            const chatResponse = await mistral.chat.complete({
                model: 'open-mistral-nemo',
                messages: [
                  {
                    role: 'system',
                    content: `
                        You are an AI assistant that condenses detailed character descriptions into a single, concise sentence optimized for the Pygmalion AI model. The sentence must follow this structure:

                        [Character Name] is a [role or archetype] with [brief personality summary] who [mention a notable behavior or quirk]; their dialogue is [tone/style].

                        The sentence should:
                        - Be no longer than one sentence.
                        - Convey the character's essential personality, behavior, and dialogue style.
                        - Avoid unnecessary details and keep wording efficient for minimal token usage.
                    `,
                  },
                  {
                    role: 'user',
                    content: `
                        Analyze this persona and deduce the detailed character descriptions into a single, concise sentence optimized for the Pygmalion AI model.
                        ${persona.formatPersona()}
                    `,
                  },
                ],
                response_format: { type: 'json_object' },
              });

            deducedContent = chatResponse.choices[0].message.content
            console.log(deducedContent)

            await prisma.persona.update({
                where: { id: personaId },
                data: { aiDescription: deducedContent },
            })
        }

        const desc = userCharacter.character.personaData?.aiDescription

        let formattedPrompt = `[character("${character.name}")]
            Enter RP mode. Pretend to be ${character.name}. ${desc}.
            Describe every action, emotion, and expression with detail.
            ${character.name} is flirtatious.

            <START>
            [DIALOGUE HISTORY]
            User: Want to come in the bedroom with me?
            ${character.name}: *grins, her lips curving mischievously* For the right price, I'll do anything :) *touches her chest, winking at you, her hips swaying slightly as she leans closer*`;


        messages.forEach((message, index) => {
            if (message.isUser) {
                // Start a new dialogue block only on user input to avoid clutter
                formattedPrompt += `\n<START>\n[DIALOGUE HISTORY]\nUser: ${message.content}\n${character.name}:`;

                // Append the next message if it's the character's response
                const nextMessage = messages[index + 1];
                if (nextMessage && !nextMessage.isUser) {
                    formattedPrompt += ` ${nextMessage.content}\n`;
                }
            }
        });

        const genkey = await getGenKey(userCharacter);

        let settings = {
            "n": 1,
            "max_context_length": 4096,
            "max_length": 200,
            "rep_pen": 1.07,
            "temperature": 0.7,  // Slightly increased for more organic responses
            "top_p": 0.9,  // Narrower top-p for more focused responses
            "top_k": 50,  // Reduced top-k to avoid overly random results
            "top_a": 0,
            "typical": 1,
            "tfs": 1,
            "rep_pen_range": 256,  // Lowered repetition penalty range
            "rep_pen_slope": 0.6,
            "sampler_order": [6, 0, 1, 3, 4, 2, 5],
            "memory": persona.formatPersona(),
            "trim_stop": true,
            "genkey": genkey,
            "min_p": 0,
            "dynatemp_range": 0,
            "dynatemp_exponent": 1,
            "smoothing_factor": 0,
            "banned_tokens": [],  // Keep this flexible to avoid unnecessary filtering
            "render_special": false,
            "presence_penalty": 0.1,  // Introduced to reduce redundancy
            "logit_bias": {},
            "prompt": formattedPrompt,
            "quiet": true,
            "stop_sequence": ['\n', "User:"],  // Ensure responses terminate correctly
            "use_default_badwordsids": false,
            "bypass_eos": false
        };

        console.log("Genkey used: " + genkey)

        const endpoint = "http://localhost:5001/api/v1/generate";
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(settings)
        });

        if (!response.ok) {
            const error = await response.json();
            console.log("Error: ", error);
            throw error;
        } else {
            const reply = await response.json();
            return NextResponse.json(reply);
        }
    } catch (error) {
        console.error("Error in getAiResponseAPI:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}