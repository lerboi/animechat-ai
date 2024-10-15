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


let formattedPrompt = `[character("${character.name}"){\nPersona(${persona.personality})\nMind(${persona.mind}\n)}\n\n<START>\n[EXAMPLE DIALOGUE HISTORY]\nYou: hey whats up?\n[CHARACTER]: what do you want? you got treasure for me?\n\n<START>\n[DIALOGUE HISTORY]\nYou: Want to come in the bedroom with me?\n[CHARACTER]:*grins at you* for the right price, ill do anything :)\n\n]`;

messages.forEach((message, index) => {
    // Start a new dialogue block only if it's a user message
    if (message.isUser) {
        formattedPrompt += `\n<START>\n[DIALOGUE HISTORY]\n`;
        formattedPrompt += `You: ${message.content}\n`;

        // Check if the next message is a character response
        const nextMessage = messages[index + 1];
        if (nextMessage && !nextMessage.isUser) {
            formattedPrompt += `[CHARACTER]: ${nextMessage.content}\n`;
        }
    }
});

const genkey = await getGenKey(userCharacter);

let settings = {
    "n": 1,
    "max_context_length": 4096,
    "max_length": 200,
    "rep_pen": 1.07,
    "temperature": 0.6,
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
    "genkey": genkey,
    "min_p": 0,
    "dynatemp_range": 0,
    "dynatemp_exponent": 1,
    "smoothing_factor": 0,
    "banned_tokens": [],
    "render_special": false,
    "presence_penalty": 0,
    "logit_bias": {},
    "prompt": formattedConvo,
    "quiet": true,
    "stop_sequence": [`${character.name}:`, '\n', "User:"],
    "use_default_badwordsids": false,
    "bypass_eos": false
};