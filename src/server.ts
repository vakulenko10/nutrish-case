import app from './app';

const port = 5000;

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
