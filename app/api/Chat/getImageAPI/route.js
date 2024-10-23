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
      "negative_prompt": "blurry eyes, asymmetrical eyes, extra eyes, fused eyes, discolored eyes, cross-eyed, lazy eye, low-resolution eyes, dull pupils, missing iris, distorted face, extra hands, extra fingers, deformed hands, incorrect anatomy, mismatched hand size, fused fingers, mutated limbs, unnatural gestures, twisted hand poses, pixelated fingers, glitchy anatomy, overexposed, no nipples",
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
        console.log("Creating Image: " + prediction.status)

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
      //change url image format logic
      const response = await fetch("https://api.cloudconvert.com/v2/jobs", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${process.env.CLOUDCONVERT_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          tasks: {
            import: {
              operation: 'import/url',
              url: imageData.output,
            },
            convert: {
              operation: 'convert',
              input: 'import',
              output_format: 'webp',
              options: {
                quality: 90,
              },
            },
            export: {
              operation: 'export/url',
              input: 'convert',
            },
          },
        })
      })

      const job = await response.json()
      const exportTaskId = job.data.tasks.find(task => task.name === 'export').id;
      
      // Polling to check the status of the export task
      let statusCheckCount = 0;
      const maxChecks = 20; // Maximum of 20 checks (20 seconds)
      
      while (statusCheckCount < maxChecks) {
        const statusResponse = await fetch(`https://api.cloudconvert.com/v2/tasks/${exportTaskId}`, {
          headers: {
            'Authorization': `Bearer ${process.env.CLOUDCONVERT_API_KEY}`,
          },
        });

        const statusData = await statusResponse.json();
        const exportTaskStatus = statusData.data.status;
        console.log("Converting Image format: " + exportTaskStatus)
        if (exportTaskStatus === 'finished') {
          const webpLink = statusData.data.result.files[0].url;

          //write logic here to blur image if no tokens
          
          return NextResponse.json(webpLink, {status: 200})
        }

        if (exportTaskStatus === 'error') {
          return NextResponse.json({ error: 'Image conversion failed.' }, {status: 500});
        }

        // Wait for 1 second before checking again
        await new Promise(resolve => setTimeout(resolve, 1000));
        statusCheckCount++;
      }
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
    
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
  }
}