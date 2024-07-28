
import { Button } from "@/components/ui/button"
import dbconnect from "@/lib/db/dbconnect";
import {UserButton} from '@clerk/nextjs'
import { auth } from "@clerk/nextjs/server";
import { LogIn } from "lucide-react";
import Link from "next/link";
import { Fileupload } from "./helpers/Fileupload";


export default async function Home() {
  try {
    dbconnect()
    console.log("db connected")
  } catch (error) {
    console.log(error)
  }
  const { userId } : { userId: string | null } = await auth();
  const isAuth = !!userId;
  return (
    <div className="w-screen min-h-screen bg-gradient-to-r from-rose-100 to-teal-100">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center">
            <h1 className="mr-3 text-5xl font-semibold">Chat with any PDF</h1>
             <UserButton afterSwitchSessionUrl="/" /> 
          </div>
          {/* <div className="flex mt-2">
            {isAuth && firstChat && (
              <>
                <Link href={`/chat/${firstChat.id}`}>
                  <Button>
                    Go to Chats <ArrowRight className="ml-2" />
                  </Button>
                </Link>
                <div className="ml-3">
                  <SubscriptionButton isPro={isPro} />
                </div>
              </>
            )}
          </div> */}

          <p className="max-w-xl mt-1 text-lg text-slate-600">
            Finding it difficult to understand the whole pdf or any research paper
            Get instant answer to your questions with LearnPDF
          </p>
           

          <div className="w-full mt-4">
            {isAuth ? (
               <Fileupload/>
            ) : (
              <Link href="/sign-in">
                <Button>
                  Login to get Started!
                  <LogIn className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
