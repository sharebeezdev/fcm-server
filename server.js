const admin = require('firebase-admin');
const express = require('express');
const bodyParser = require('body-parser');

// Initialize the Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
app.use(bodyParser.json());

app.post('/send', async (req, res) => {
  const { token, title, body } = req.body;

  const message = {
    notification: {
      title: title,
      body: body,
    },
    token: token,
  };

  try {
    const response = await admin.messaging().send(message);
    res.status(200).send(`Successfully sent message: ${response}`);
  } catch (error) {
    res.status(500).send(`Error sending message: ${error}`);
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

