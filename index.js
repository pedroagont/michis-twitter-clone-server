const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const Filter = require('bad-words');
const rateLimit = require("express-rate-limit");

app.use(cors());
app.use(express.json());
app.use(rateLimit({
  windowMs: 30 * 1000, // 30 sec
  max: 5 // limit each IP to 5 requests per windowMs
}));

const admin = require('firebase-admin');
const serviceAccount = {
  "project_id": process.env.FIREBASE_PROJECT_ID,
  "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
  "private_key": process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  "client_email": process.env.FIREBASE_CLIENT_EMAIL,
  "client_id": process.env.FIREBASE_CLIENT_ID,
}


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://michis-michis.firebaseio.com"
});

const db = admin.firestore();
const filter = new Filter();

app.get('/', (req, res) => res.send('Hello World!'));

const isValidMiau = (miau) => {
  return miau.name && miau.name.toString().trim() !== '' &&
         miau.content && miau.content.toString().trim() !== '';
}

app.post('/miaus', async (req, res) => {
  if(isValidMiau(req.body)) {
    const { name, content } = req.body
    const miau = {
      name: filter.clean(name.toString()),
      content: filter.clean(content.toString()),
      timestamp: new Date(),
    }
    await db.collection('miaus').doc().set(miau)
      .then(response => {
        console.log(response);
        res.status(201).json({ response, miau, message: 'Buen Michi :)' });
      })
      .catch(error => console.log(error));
  } else {
    console.log('Mal michi :(');
    res.status(422).json({ message: 'Un michi tiene que tener nombre y miau' });
  }
});

app.get('/miaus', async (req, res) => {
  const miaus = [];
  try {
    const snapshot = await db.collection('miaus').orderBy('timestamp', 'desc').get();
    snapshot.forEach(doc => {
      miaus.push(doc.data());
    });
    res.status(200).json(miaus);
  } catch (e) {
    console.log(e);
  }
});

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));
