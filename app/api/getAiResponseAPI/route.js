import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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

    formatPersona() {
        return (
            `You are roleplaying as ${this.name}. Stay in character at all times, responding only as ${this.name}. Do not imitate the user or predict what the user will say next. Respond from your perspective, reflecting your personality and experiences.
            Character Details:
            - Name: ${this.name}
            - Age: ${this.age}
            - Gender: ${this.gender}
            - Nationality: ${this.nationality}
            - Sexuality: ${this.sexuality}
            - Height: ${this.height}
            - Species: ${this.species}
            - Occupation: ${this.occupation}
            - Affiliation: ${this.affiliation}

            Personality:
            - ${this.personality.join(", ")}

            Appearance:
            - ${this.appearance.join(", ")}

            Attributes:
            - ${this.attributes.join(", ")}

            Likes:
            - ${this.likes.join(", ")}

            Dislikes:
            - ${this.dislikes.join(", ")}

            Description:
            - ${this.description}
            `
        );
    }
}

export async function POST(req) {
    const { messages, characterId, userId } = await req.json();
    console.log(messages, characterId, userId)
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
        const { personaData } = character;

        const persona = new Persona(character.name);
        persona.setAge(personaData.age);
        persona.setGender(personaData.gender);
        persona.setNationality(personaData.nationality);
        persona.setSexuality(personaData.sexuality);
        persona.setHeight(personaData.height);
        persona.setSpecies(personaData.species);
        persona.setOccupation(personaData.occupation);
        persona.setAffiliation(personaData.affiliation);
        persona.setMind(...personaData.mind?.split(',').map(m => m.trim()));
        persona.setPersonality(...personaData.personality?.split(',').map(p => p.trim()));
        persona.setAppearance(...personaData.appearance?.split(',').map(a => a.trim()));
        persona.setClothes(personaData.clothes);
        persona.setAttributes(...personaData.attributes?.split(',').map(att => att.trim()));
        persona.setLikes(...personaData.likes?.split(',').map(like => like.trim()));
        persona.setDislikes(...personaData.dislikes?.split(',').map(dislike => dislike.trim()));
        persona.setDescription(personaData.description);

        // Helper function to truncate chat history to the last 20 messages
        function getTruncatedMessages(messages, limit = 20) {
            return messages.slice(-limit); // Retrieve only the last 20 messages
        }

        let truncatedMessages = getTruncatedMessages(messages);

        let formattedConvo = `
        [System Note: You are ${character.name}. Respond only as yourself, drawing from your background, traits, and emotions. Do not imitate the user or predict what the user will say next.]

        [Chat History]
        `;

        truncatedMessages.forEach((message) => {
            if (message.isUser) {
                formattedConvo += `User: "${message.content}"\n\n${character.name}: `;
            } else {
                formattedConvo += `${character.name}: "${message.content}"\n`;
            }
        });

        formattedConvo += "[End of System Note]";

        let settings = {
            "n": 1,
            "max_context_length": 4096,
            "max_length": 200,
            "rep_pen": 1.07,
            "temperature": 0.7,
            "top_p": 0.92,
            "top_k": 100,
            "top_a": 0,
            "typical": 1,
            "tfs": 1,
            "rep_pen_range": 360,
            "rep_pen_slope": 0.7,
            "sampler_order": [6, 0, 1, 3, 4, 2, 5],
            "memory": persona.formatPersona(),
            "trim_stop": true,
            "genkey": "KCPP4490",
            "min_p": 0.2,
            "dynatemp_range": 0,
            "dynatemp_exponent": 1,
            "smoothing_factor": 0,
            "banned_tokens": [],
            "render_special": false,
            "presence_penalty": 0,
            "logit_bias": {},
            "prompt": formattedConvo,
            "quiet": true,
            "stop_sequence": [],
            "use_default_badwordsids": false,
            "bypass_eos": false
        };

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