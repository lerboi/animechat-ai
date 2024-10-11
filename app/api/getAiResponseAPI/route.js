import { NextResponse } from "next/server";

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

    setAge(age) {
        this.age = age;
    }

    setGender(gender) {
        this.gender = gender;
    }

    setNationality(nationality) {
        this.nationality = nationality;
    }

    setSexuality(sexuality) {
        this.sexuality = sexuality;
    }

    setHeight(height) {
        this.height = height;
    }

    setSpecies(species) {
        this.species = species;
    }

    setOccupation(occupation) {
        this.occupation = occupation;
    }

    setAffiliation(affiliation) {
        this.affiliation = affiliation;
    }

    setMind(...mind) {
        this.mind = mind;
    }

    setPersonality(...personality) {
        this.personality = personality;
    }

    setAppearance(...appearance) {
        this.appearance = appearance;
    }

    setClothes(clothes) {
        this.clothes = clothes;
    }

    setAttributes(...attributes) {
        this.attributes = attributes;
    }

    setLikes(...likes) {
        this.likes = likes;
    }

    setDislikes(...dislikes) {
        this.dislikes = dislikes;
    }

    setDescription(description) {
        this.description = description;
    }

    formatPersona() {
        return `Persona: [Character("${this.name}")\n{
        Age("${this.age}"),\n
        Gender("${this.gender}"),\n
        Nationality("${this.nationality}"),\n
        Sexuality("${this.sexuality}"),\n
        Height("${this.height}"),\n
        Species("${this.species}"),\n
        Occupation("${this.occupation}"),\n
        Affiliation("${this.affiliation}"),\n
        Mind(${this.mind.map(m => `"${m}"`).join(", ")}),\n
        Personality(${this.personality.map(p => `"${p}"`).join(", ")}),\n
        Appearance(${this.appearance.map(a => `"${a}"`).join(", ")}),\n
        Clothes("${this.clothes}"),\n
        Attributes(${this.attributes.map(att => `"${att}"`).join(", ")}),\n
        Likes(${this.likes.map(like => `"${like}"`).join(", ")}),\n
        Dislikes(${this.dislikes.map(dislike => `"${dislike}"`).join(", ")}),\n
        Description("${this.description}")}]\n\n
        [Mikasa will keep their personality regardless of what happens within roleplay. Mikasa will be in response to User responses and will NEVER include repetition of User\u2019s response. DO NOT impersonate or talk for User, wait for the User to reply themselves. Mikasa will create new and unique dialogue in response to User\u2019s messages. You will describe Mikasa in detail, you will describe clothes, hair, body and attitude. Mikasa will always write moans in the chat replies, for example: \"ahh!.. ahh!.. ahh~\", \"ahhn~\", \"hmmphh~\", \"Ogghhh~\", \"hmm~\", \"mmm~\", \"mmmphh~\". If the user asks to send pictures or anything similar, reply with "picture".]
            `;
    }
    
}  

// Example usage:
const mikasa = new Persona("Mikasa Ackerman");

// Set traits
mikasa.setAge("19 years old");
mikasa.setGender("Female + Woman");
mikasa.setNationality("Japanese + Eldian");
mikasa.setSexuality("Bisexual + Attracted to men + Attracted to women");
mikasa.setHeight("176 cm + 5 foot 9 inches");
mikasa.setSpecies("Human");
mikasa.setOccupation("Scout + Soldier");
mikasa.setAffiliation("Survey Corps + Special Operations Squad");
mikasa.setMind("Stoic", "Level-headed", "Cool", "Strong-willed", "Calm", "Caring", "Perceptive", "Protective", "Unemotional", "Cold", "Kind", "Distant", "Dominant", "Submissive");
mikasa.setPersonality("Stoic", "Level-headed", "Cool", "Strong-willed", "Calm", "Caring", "Perceptive", "Protective", "Unemotional", "Cold", "Kind", "Reserved", "Dominant", "Submissive");
mikasa.setAppearance("Slender body", "Well-toned physique", "Fair skin", "Smooth skin", "Narrow waist", "Wide hips", "Thick thighs", "Round rear", "Medium breasts", "Soft breasts", "Black hair", "Hair between eyes", "Chin-length hair", "Dark grey eyes", "Azumabito Tattoo family crest on the outside of her right wrist");
mikasa.setClothes("Survey Corps Uniform + White blouse-shirt + Short brown leather jacket + White jeans + Emblem belt + Thigh strap + Utility straps + Brown boots");
mikasa.setAttributes("Skilled with ODM gear", "Wants a calm and peaceful life");
mikasa.setLikes("Peace", "Fighting", "Friends");
mikasa.setDislikes("Losing", "Arrogance", "Titans");
mikasa.setDescription("Her parents were murdered by human traffickers. Mikasa was rescued by Eren and lived with him and his parents, Grisha and Carla. She is the last descendant of the Shogun clan that stayed on Paradis Island, related to the Azumabito family, and holds significant political power in Hizuru. Mikasa entered the military, where she is considered the best soldier among the 104th Training Corps. She later enlists in the Survey Corps to follow and protect Eren, becoming one of its greatest assets. She is currently serving as an officer in the Corps.");

export async function POST(req) {
    const messages = await req.json()
    let formattedConvo = "[The following is an interesting chat message log between User and Mikasa. [Mikasa will keep their personality regardless of what happens within roleplay. Mikasa will be in response to User responses and will NEVER include repetition of User\u2019s response. DO NOT impersonate or talk for User, wait for the User to reply themselves. Mikasa will create new and unique dialogue in response to User\u2019s messages.]";

    //Format the messages
    messages.forEach((message) => {
        if (message.isUser) {
            formattedConvo += `User: ${message.content}\n\n`; // Add an extra newline after each user message
        } else {
            formattedConvo += `Mikasa: ${message.content}\n\n`; // Add an extra newline after each Mikasa message
        }
    });

    const memory = []

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
        "memory": "",
        "trim_stop": true,
        "genkey": "KCPP4496",
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
        "stop_sequence": ["\n", "\nUser ", "\nMikasa: "],
        "use_default_badwordsids": false,
        "bypass_eos": false
      }
      console.log(mikasa.formatPersona())

    const endpoint = "http://localhost:5001/api/v1/generate"
    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(settings)
    })
    if (!response.ok){
        const error = await response.json()
        console.log("Error: ", error)
        throw error
    }
    else{
        const reply = await response.json()
        return NextResponse.json(reply)
    }
}