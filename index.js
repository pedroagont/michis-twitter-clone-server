const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const admin = require('firebase-admin');
const serviceAccount = require(`./${process.env.FIREBASE_JSON}`);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://michis-michis.firebaseio.com"
});

const db = admin.firestore();

app.get('/', (req, res) => res.send('Hello World!'));

const isValidMiau= (miau) => {
  return miau.name && miau.name.toString().trim() !== '' &&
         miau.content && miau.content.toString().trim() !== '';
}

app.post('/miaus', async (req, res) => {
  if(isValidMiau(req.body)) {
    const { name, content } = req.body
    const miau = {
      name: name.toString(),
      content: content.toString(),
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

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));
