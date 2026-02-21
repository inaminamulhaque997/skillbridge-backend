import app from './app.js';

const PORT = process.env.PORT || 5000;

// Only start the server if not running on Vercel (local development)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

// Export app for Vercel serverless functions
export default app;