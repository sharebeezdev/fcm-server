const admin = require('firebase-admin');
const express = require('express');
const bodyParser = require('body-parser');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const util = require('util');

// Initialize the Secret Manager client
const client = new SecretManagerServiceClient();

// Function to access the secret
async function accessSecretVersion(secretName) {
  const [version] = await client.accessSecretVersion({ name: secretName });
  const payload = version.payload.data.toString('utf8');
  return JSON.parse(payload);
}

// Initialize Firebase Admin SDK
async function initializeFirebase() {
  const secretName = 'projects/fcm-server-435813/secrets/fem-service-configuration-key-json/versions/latest';
  const serviceAccount = await accessSecretVersion(secretName);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Create and configure Express application
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

// Initialize Firebase and start the server
initializeFirebase().then(() => {
  const port = process.env.PORT || 8080;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}).catch(error => {
  console.error('Failed to initialize Firebase:', error);
  process.exit(1);
});
