import axios from 'axios';

const MAX_RETRIES = 5;
const RETRY_DELAY = 2000; // 2 seconds

export async function getEmbeddings(text: string): Promise<number[]> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/embeddings',
        {
          input: text,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data && response.data.data) {
        return response.data.data;
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (error) {
      console.error('Error calling OpenAI embeddings API:', error);

      if (attempt < MAX_RETRIES - 1) {
        console.log(`Rate limited, retrying in ${RETRY_DELAY} ms...`);
        await sleep(RETRY_DELAY);
      } else {
        throw new Error(`Failed to get embeddings after ${MAX_RETRIES}`);
      }
    }
  }
  throw new Error('Failed to get embeddings');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
