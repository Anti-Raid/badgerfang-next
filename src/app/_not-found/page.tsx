import React from 'react';

const ErrorPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <h1 className="text-6xl font-bold font-cabin text-primary mb-4 animate-bounce">Oops!</h1>
      <p className="text-2xl font-monster text-muted-foreground mb-8">Something went wrong.</p>
      <div className="max-w-md text-center">
        <p className="text-lg font-inter text-secondary-foreground mb-6">
          We're sorry, but an unexpected error occurred. Please try again later or contact support if the issue persists.
        </p>
        <button
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-lora hover:bg-secondary transition-colors"
          onClick={() => window.location.reload()}
        >
          Reload Page
        </button>
      </div>
    </div>
  );
};

export default ErrorPage;