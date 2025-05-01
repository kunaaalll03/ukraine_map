const express = require('express');
const path = require('path');

const app = express(); // 'app' should be declared only ONCE here
const port = process.env.PORT || 3000; // 'port' should be declared only ONCE here

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Route for the main map page
app.get('/', (req, res) => {
  // Send the map.html file from the 'public' directory
  res.sendFile(path.join(__dirname, 'public', 'map.html'));
});

// Start the server
app.listen(port, () => {
  // Log the listening port to the console (visible in Firebase Studio terminal)
  console.log(`Server listening at http://localhost:${port}`);
  console.log(`If running in a cloud environment, check the assigned URL.`);
});