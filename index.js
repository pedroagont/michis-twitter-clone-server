const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send('Hello World!'));

const isValidMiau= (miau) => {
  return miau.name && miau.name.toString().trim() !== '' &&
         miau.content && miau.content.toString().trim() !== '';
}

app.post('/miaus', (req, res) => {
  if(isValidMiau(req.body)) {
    const { name, content } = req.body
    const miau = {
      name: name.toString(),
      content: content.toString(),
    }
    console.log(miau);
    res.status(201).json({ miau, message: 'Buen Michi' });
  } else {
    console.log('Mal michi :(');
    res.status(422);
    res.json({ message: 'Un michi tiene que tener nombre y miau' });
  }
});

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));
