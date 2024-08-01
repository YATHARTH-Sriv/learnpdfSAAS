import { Pinecone, PineconeRecord } from "@pinecone-database/pinecone";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import md5 from "md5";
import {
  Document,
  RecursiveCharacterTextSplitter,
} from "@pinecone-database/doc-splitter";
import { getEmbeddings } from "./embedding";
import { convertToAscii } from "./utils";
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import os from 'os';
import Bottleneck from 'bottleneck';

const limiter = new Bottleneck({
  minTime: 200, // Minimum time between requests (adjust based on rate limits)
  maxConcurrent: 5 // Maximum number of concurrent requests (adjust based on rate limits)
});


export const getPineconeClient = () => {
  return new Pinecone({
    apiKey: process.env.PINCONE_API_KEY as string,
  });
};

type PDFPage = {
  pageContent: string;
  metadata: {
    loc: { pageNumber: number };
  };
};

const urldownload = async (file_url: string): Promise<string> => {
  try {
    const tempDir = os.tmpdir();
    const fileName = path.resolve(tempDir, `yatharth${Date.now().toString()}.pdf`);
    const writer = fs.createWriteStream(fileName);

    const response = await axios({
      url: file_url,
      method: 'GET',
      responseType: 'stream',
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(fileName));
      writer.on('error', reject);
    });
  } catch (error) {
    console.log('Error downloading file:', error);
    throw error;
  }
};

export async function loadpdfIntoPinecone(file_url: string, fileKey: string) {
  console.log("Downloading PDF into file system...");
  const fileName = await urldownload(file_url);
  console.log(`PDF successfully saved to: ${fileName}`);

  // Verify the downloaded file size
  const stats = fs.statSync(fileName as string);
  console.log(`Downloaded File Size: ${stats.size} bytes`);

  const loader = new PDFLoader(fileName as string);
  console.log("Loader:", loader);

  try {
    const pages = await loader.load();
    console.log("Pages:", pages);

    if (pages.length === 0) {
      console.log("No pages were parsed from the PDF.");
    }

    const documents = await Promise.all(pages.map(prepareDocument));
    const vectors = await Promise.all(documents.flat().map(embedDocument));
    const client = await getPineconeClient();
    const pineconeIndex = await client.index("learnpdf");
    const namespace = pineconeIndex.namespace(convertToAscii(fileKey));
    console.log("Inserting vectors into Pinecone");
    await namespace.upsert(vectors);

    // Cleanup the temporary file
    fs.unlinkSync(fileName);

    return documents[0];
  } catch (error) {
    console.error('Error loading PDF into Pinecone:', error);
    throw error;
  }
}

async function embedDocument(doc: Document) {
  try {
    console.log("Embedding document:", doc.pageContent);
    const embeddings = await getEmbeddings(doc.pageContent);

    // Log the embeddings response
    console.log("Embeddings:", embeddings);

    if (!embeddings || !embeddings[0]) {
      throw new Error("Embeddings API returned an invalid response");
    }

    const hash = md5(doc.pageContent);

    return {
      id: hash,
      values: embeddings,
      metadata: {
        text: doc.metadata.text,
        pageNumber: doc.metadata.pageNumber,
      },
    } as PineconeRecord;
  } catch (error) {
    console.error("Error embedding document:", error);
    throw error;
  }
}

export const truncateStringByBytes = (str: string, bytes: number) => {
  const enc = new TextEncoder();
  return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
};

async function prepareDocument(document: Document) {
  let { pageContent, metadata } = document;
  pageContent = pageContent.replace(/\n/g, "");
  // Split the docs
  const splitter = new RecursiveCharacterTextSplitter();
  const docs = await splitter.splitDocuments([
    new Document({
      pageContent,
      metadata: {
        loc: metadata.loc,
        text: truncateStringByBytes(pageContent, 36000),
      },
    }),
  ]);
  return docs;
}
