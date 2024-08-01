import { OpenAIApi, Configuration } from "openai-edge";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY as string,
});

const openai = new OpenAIApi(config);

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getEmbeddings(text: string, retries = 3) {
  try {
    const response = await openai.createEmbedding({
      model: "text-embedding-ada-002",
      input: text.replace(/\n/g, " "),
    });

    if (!response.ok) {
      const errorDetails = await response.json();
      console.error(`OpenAI API Error: ${response.statusText}`, errorDetails);
      
      if (response.status === 429 && retries > 0) {
        console.log(`Rate limited, retrying in ${1000 * (4 - retries)} ms...`);
        await sleep(1000 * (4 - retries));
        return getEmbeddings(text, retries - 1);
      } else if (response.status === 401) {
        throw new Error("Unauthorized: Check your OpenAI API key.");
      } else if (response.status === 400) {
        throw new Error("Bad Request: Invalid input or request parameters.");
      }
      
      throw new Error(`OpenAI API returned an error: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.data || result.data.length === 0 || !result.data[0].embedding) {
      throw new Error("OpenAI API returned an invalid response");
    }

    return result.data[0].embedding as number[];
  } catch (error) {
    console.error("Error calling OpenAI embeddings API:", error);
    throw error;
  }
}
