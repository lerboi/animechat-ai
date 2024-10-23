const { default: Replicate } = require("replicate");

// Image Generation Section
const replicate = new Replicate({
    auth: process.env.NEXT_PUBLIC_REPLICATE_API_TOKEN,
  });

  const imageResponse = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization" : `Bearer ${process.env.REPLICATE_API_TOKEN}`,
      "Prefer": "wait"
    },
    data: {
      "version": "6afe2e6b27dad2d6f480b59195c221884b6acc589ff4d05ff0e5fc058690fbb9",
      "input": {
        "width": 896,
        "height": 1152,
        "prompt": prompt,
        "guidance_scale": 7,
        "style_selector": "Anime",
        "negative_prompt": "blurry eyes, asymmetrical eyes, extra eyes, fused eyes, discolored eyes, cross-eyed, lazy eye, low-resolution eyes, dull pupils, missing iris, distorted face, extra hands, extra fingers, deformed hands, incorrect anatomy, mismatched hand size, fused fingers, mutated limbs, unnatural gestures, twisted hand poses, pixelated fingers, glitchy anatomy, overexposed",
        "quality_selector": "Standard v3.1",
        "num_inference_steps": 28
      }
    }
  })
  
//js method
const replicate = new Replicate()
const input = {
  "width": 896,
        "height": 1152,
        "prompt": prompt,
        "guidance_scale": 7,
        "style_selector": "Anime",
        "negative_prompt": "blurry eyes, asymmetrical eyes, extra eyes, fused eyes, discolored eyes, cross-eyed, lazy eye, low-resolution eyes, dull pupils, missing iris, distorted face, extra hands, extra fingers, deformed hands, incorrect anatomy, mismatched hand size, fused fingers, mutated limbs, unnatural gestures, twisted hand poses, pixelated fingers, glitchy anatomy, overexposed",
        "quality_selector": "Standard v3.1",
        "num_inference_steps": 28
}

const output = await replicate.run("cjwbw/animagine-xl-3.1:6afe2e6b27dad2d6f480b59195c221884b6acc589ff4d05ff0e5fc058690fbb9", { input });