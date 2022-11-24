import express from "express";
import { getAuth } from "firebase-admin/auth";
import { checkDate, getUsers } from "./admin";
import cors from 'cors'
import bodyParser from 'body-parser'
// import { newData } from "./admin";


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true}));
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json())

app.use(cors())


// app.use("/add-user",newData);

app.get("/get-data",async (req, res) => {
  if(await checkDate()){
    res.status(200).json("already exist")
    return;
  }
  console.log(checkDate())
  getUsers()
    .then(() => {
      res.status(200).json("ok");
    })
    .catch((e) => {
      console.log(e);
    });
});

app.get("/api/users",(req, res) => {
  const users = [];
  getAuth()
    .listUsers(1000, "/")
    .then((listUsersResult) => {
      listUsersResult.users
        .filter((user) => user.displayName !== "Admin")
        .forEach((user) => {
          users.push({
            uid: user.uid,
            name: user.displayName,
            email: user.email,
          });
        });
      res.status(200).json(users);
      console.log(users);
    });
});

app.use("/api/get-date", (req, res) => {
  let date = new Date();
  res.status(200).json(date);
});

// export const getUsers = async () => {
//   const users = [];
//   getAuth()
//     .listUsers(1000, "/")
//     .then((listUsersResult) => {
//       listUsersResult.users
//         .filter((user) => user.displayName !== "Admin")
//         .forEach((user) => {
//           users.push({
//             uid: user.uid,
//             name: user.displayName,
//             email: user.email,
//           });
//         });
//       addFoodData(users);
//     });
// };

// setInterval(() => {
//   getUsers();
// }, 100000);

// app.use("/get-date", (req, res) => {
//   getDate()
//     .then(() => {
//       res.status(200).send("date");
//     })
//     .catch((e) => {
//       console.log(e);
//     });
// });

app.listen(8000, () => console.log("server is running in port 8000"));
