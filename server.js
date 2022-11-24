import express from "express";
import { getAuth } from "firebase-admin/auth";
import cors from 'cors'

// import { newData } from "./admin";
//SERVICE
import * as dotenv from "dotenv";
dotenv.config();

//
import admin from "firebase-admin";
import { Timestamp } from "firebase-admin/firestore";



const key = {
  type: process.env.type,
  project_id: process.env.project_id,
  private_key_id: process.env.private_key_id,
  private_key: process.env.private_key.replace(/\\n/g, '\n'),
  client_email: process.env.client_email,
  client_id: process.env.client_id,
  auth_uri: process.env.auth_uri,
  token_uri: process.env.token_uri,
  auth_provider_x509_cert_url: process.env.auth_provider_x509_cert_url,
  client_x509_cert_url: process.env.client_x509_cert_url,
};

admin.initializeApp({
  credential: admin.credential.cert(key),
});

export const getUsers = async () => {
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
      addFoodData(users);
    });
};

const day = new Date();
day.setDate(day.getDate() + 8)

let dateString = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(
  2,
  "0"
)}-${String(day.getDate()).padStart(2, "0")}`;

export const addFoodData = async (users) => {
  const foodData = {
    morning: true,
    noon: true,
    night: true,
  };
  let count = 0
  users.forEach(async (user) => {
    const result = await admin
      .firestore()
      .collection(dateString)
      .doc(user?.uid)
      .set({
        createdAt: Timestamp.now(),
        day: dateString,
        email: user?.email,
        name: user?.name,
        foodData,
      })
      .catch((e) => {
        console.log(e);
      });
  });
};

export const checkDate = async () => {
  let condition = false
  await admin.firestore().collection(dateString).get().then((snapshot) => {
    if(!snapshot.empty){
      condition = true
    }
    else condition = false
  }
  )
  return condition
}

// export const getDate = async () => {
//   const userList = [];
//   admin
//     .firestore()
//     .collection("users")
//     .get()
//     .then((snapshot) => {
//       snapshot.docs.forEach((doc) => {
//         [doc.data()]
//           .filter((doc) => doc.displayName !== undefined)
//           .forEach((name) => {
//             userList.push(name);
//           });
//       });
//     });
// };


//




//


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
