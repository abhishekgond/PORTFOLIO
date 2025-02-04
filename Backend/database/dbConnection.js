import mongoose from "mongoose";

export const dbConnection = () => {
  mongoose
    .connect(process.env.MONGO_URI, {
      dbName: "MERN_STACK_PERSONAL_PORTFOLIO",
    })
    .then(() => {
      console.log("Connection Successfull to DataBase");
    })
    .catch((err) => {
      console.log(`Some Error Occur ${err}`);
    });
};
export default dbConnection;
