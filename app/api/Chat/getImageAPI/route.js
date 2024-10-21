import { NextResponse } from 'next/server';
import Replicate from 'replicate';

export async function POST(req) {
  const { prompt } = await req.json();
  const API = process.env['REPLICATE_API_TOKEN']
  try {
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

    const prediction = await replicate.predictions.create({
      version: "6afe2e6b27dad2d6f480b59195c221884b6acc589ff4d05ff0e5fc058690fbb9",
      input
    });
    
    //function to check for status succeed
    async function checkPredictionStatus(predictionId) {
      const startTime = Date.now();
      const maxWaitTime = 40000; // 20 seconds
      const interval = 2000; // 2 seconds

      while (Date.now() - startTime < maxWaitTime) {
        const predictionResponse = await fetch(`${predictionId}`, {
          headers: {
            "Authorization": `Bearer ${API}`
          }
        });
        const prediction = await predictionResponse.json()
        console.log(prediction.status)

        if (prediction.status === "succeeded") {
          const img = await fetch(`${predictionId}`, {
            headers: {
              "Authorization": `Bearer ${API}`
            }
          });
          const imgData = await img.json()
          return imgData; 
        }
    
        // Wait for the specified interval before checking again
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    
      throw new Error("Prediction did not succeed in the given time frame");
    };
    
    try {
      const imageData = await checkPredictionStatus(prediction.urls.get);
      if(!imageData){
        return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
      }
      else{
        return NextResponse.json(imageData.output)
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
    
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
  }
}