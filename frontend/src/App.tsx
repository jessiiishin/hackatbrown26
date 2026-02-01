import { useState, useEffect } from 'react';
import Home from './components/Home';
import { LoadingScreen } from './components/LoadingScreen';
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/clerk-react";


export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      {/* Full-screen login/signup when signed out */}
      <SignedOut>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#FDF8EF',
          }}
        >
          <img
            src="/munch.png"
            alt="Munchy"
            style={{ width: '96px', height: '96px', marginBottom: '24px' }}
          />
          <h1
            style={{
              fontSize: '3rem',
              fontWeight: 'bold',
              letterSpacing: '-0.05em',
              marginBottom: '8px',
              color: '#242116',
              fontFamily: 'Parkinsans',
            }}
          >
            Munchy Munchy
          </h1>
          <p
            style={{
              fontSize: '1.125rem',
              marginBottom: '32px',
              color: '#242116',
              opacity: 0.7,
            }}
          >
            Sign in to start your food crawl adventure
          </p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <SignInButton mode="modal">
              <button
                style={{
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontWeight: 600,
                  color: 'white',
                  backgroundColor: '#F59F00',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem',
                }}
              >
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button
                style={{
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontWeight: 600,
                  border: '2px solid #F59F00',
                  color: '#F59F00',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  fontSize: '1rem',
                }}
              >
                Sign Up
              </button>
            </SignUpButton>
          </div>
        </div>
      </SignedOut>

      {/* Main app when signed in */}
      <SignedIn>
        <header
          style={{
            background: '#FDF8EF',
            padding: '1rem',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '1rem',
            position: 'fixed',
            top: 0,
            right: 0,
            zIndex: 1000,
          }}
        >
          <UserButton afterSignOutUrl="/" />
        </header>
        <div style={{ backgroundColor: '#FDF8EF' }}>
          <Home />
        </div>
      </SignedIn>
    </>
  );
}
