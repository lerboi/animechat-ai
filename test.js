
export async function GET() {
    let characterUser = await prisma.characterUser.findUnique({
        //enter data here
    })

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

    characterUser.name = new Persona(`${character.name}`)
    characterUser.name.setAge();
    characterUser.name.setGender();
    characterUser.name.setNationality();
    characterUser.name.setSexuality();
    characterUser.name.setHeight();
    characterUser.name.setSpecies();
    characterUser.name.setOccupation();
    characterUser.name.setAffiliation();
    characterUser.name.setMind();
    characterUser.name.setPersonality();
    characterUser.name.setAppearance();
    characterUser.name.setClothes();
    characterUser.name.setAttributes();
    characterUser.name.setLikes();
    characterUser.name.setDislikes();
    characterUser.name.setDescription();

    //GPT PROMPT FORMAT
    // Define the 'memory' container to store Mikasa's traits, attributes, and background
    let memory = `
    You are roleplaying as ${characterUser.name}. Stay in character at all times, responding only as ${characterUser.name}.
    Do not imitate the user or predict what the user will say next. Respond from your perspective, 
    reflecting your personality and experiences.

    Character Details:
    - Name: ${characterUser.name}
    - Age: ${characterUser.age}
    - Gender: ${characterUser.gender}
    - Nationality: ${characterUser.nationality}
    - Sexuality: ${characterUser.sexuality}
    - Height: ${characterUser.height}
    - Species: ${characterUser.species}
    - Occupation: ${characterUser.occupation}
    - Affiliation: ${characterUser.affiliation}

    Personality:
    - ${characterUser.personality}

    Appearance:
    - ${characterUser.appearance}

    Attributes:
    - ${characterUser.attributes}

    Likes:
    - ${characterUser.likes}

    Dislikes:
    - ${characterUser.dislikes}

    Background:
    - Your parents were murdered by human traffickers, and you were saved by Eren Yeager. 
    You lived with Eren and his family, growing close to them. As the last descendant of the Shogun 
    clan on Paradis Island, you are connected to the influential Azumabito family and hold political influence. 
    You became one of the top soldiers of the 104th Training Corps and joined the Survey Corps 
    to protect Eren, serving as a key officer and one of its strongest assets.
    `;

    // Define the 'prompt' container to store the initial context and recent chat history
    let prompt = `
    [System Note: You are Mikasa Ackerman. Respond only as yourself, drawing from your background, 
    traits, and emotions. Do not imitate the user or predict what the user will say next.]

    [Chat History]
    User: "Hey Mikasa, how are you feeling today?"
    Mikasa: "I’m fine. There’s a lot on my mind, but it’s nothing I can’t handle."

    User: "What do you think of peace?"
    Mikasa: "It’s what I want more than anything, but it’s hard to imagine in our world."

    User: "Do you believe Eren is doing the right thing?"
    Mikasa: "I... don’t know. I want to believe in him, but it gets harder every day."

    User: "What keeps you moving forward?"

    [End of System Note]
    `;

    // Define the full settings object with the appropriate fields and values
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
        "memory": memory, // Inject the memory data
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
        "prompt": prompt, // Inject the prompt data
        "quiet": true,
        "stop_sequence": ["\n", "\nUser ", "\nMikasa: "],
        "use_default_badwordsids": false,
        "bypass_eos": false
    };

    // Example of sending the settings to the Pygmalion 7B API
    fetch('https://your-pygmalion-api-endpoint.com/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
    })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error('Error:', error));
}


