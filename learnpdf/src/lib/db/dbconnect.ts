import mongoose, { ConnectOptions } from "mongoose";

type connectiontype={
    isConnected?:number
}

const connection:connectiontype={}

async function dbconnect():Promise<void>{
      if(connection.isConnected){
        console.log("db connection already exists")
        return
      }
      try {
        const db=await mongoose.connect(`${process.env.MONGODB_URL}/${process.env.DB_NAME}`,{
          serverSelectionTimeoutMS: 30000,
          useUnifiedTopology: true,
          useNewUrlParser: true,
        } as ConnectOptions) // Add 'as ConnectOptions' to specify the type
        connection.isConnected=db.connections[0].readyState
        console.log("db connected")
      } catch (error) {
        console.log(error)
       
      }
}

export default dbconnect