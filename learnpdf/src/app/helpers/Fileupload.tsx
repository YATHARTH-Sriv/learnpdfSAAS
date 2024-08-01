'use client';

import {
  MultiFileDropzone,
  type FileState,
} from "@/components/Multiplefiledropzone";
import { useEdgeStore } from '@/lib/edgestore';
import { useMutation } from "@tanstack/react-query";
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Bottleneck from 'bottleneck';

const limiter = new Bottleneck({
  minTime: 200, // Minimum time between requests (adjust based on rate limits)
});

export function Fileupload() {
  const router = useRouter();
  const [fileStates, setFileStates] = useState<FileState[]>([]);
  const { edgestore } = useEdgeStore();

  const { mutate } = useMutation({
    mutationFn: async ({
      file_key,
      file_name,
      file_url,
    }: {
      file_key: string;
      file_name: string;
      file_url: string;
    }) => {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/create-chat`, {
        file_key,
        file_name,
        file_url,
      });
      return response.data;
    },
  });

  async function updateFileProgress(key: string, progress: FileState['progress']) {
    setFileStates((fileStates) => {
      const newFileStates = structuredClone(fileStates);
      const fileState = newFileStates.find(
        (fileState) => fileState.key === key,
      );
      if (fileState) {
        fileState.progress = progress;
      }
      return newFileStates;
    });
  }

  return (
    <div>
      <MultiFileDropzone
        value={fileStates}
        onChange={(files) => {
          setFileStates(files);
          console.log(files);
        }}
        onFilesAdded={async (addedFiles) => {
          setFileStates([...fileStates, ...addedFiles]);
          await Promise.all(
            addedFiles.map(async (addedFileState) => {
              try {
                const res = await edgestore.publicFiles.upload({
                  file: addedFileState.file,
                  onProgressChange: async (progress) => {
                    updateFileProgress(addedFileState.key, progress);
                    if (progress === 100) {
                      // wait 1 second to set it to complete
                      // so that the user can see the progress bar at 100%
                      await new Promise((resolve) => setTimeout(resolve, 1000));
                      updateFileProgress(addedFileState.key, 'COMPLETE');
                    }
                  },
                });

                // Extract the file URL from the response
                const file_url = res.url; // Adjust based on actual response structure

                // Use the key and name from addedFileState
                const file_key = addedFileState.key; // Highlighted change
                const file_name = addedFileState.file.name; // Highlighted change
                console.log(file_key, file_name);

                // Save file key, file name, and file URL to the database
                await limiter.schedule(async () => mutate({ file_key, file_name, file_url }, {
                  onSuccess: ({ chat_id }) => {
                    toast.success("Chat created!");
                    router.push(`/chat/${chat_id}`);
                  },
                  onError: (err) => {
                    toast.error("Error creating chat");
                    console.error(err);
                  },
                }));

                console.log(res);
              } catch (err) {
                updateFileProgress(addedFileState.key, 'ERROR');
              }
            }),
          );
        }}
      />
    </div>
  );
}
