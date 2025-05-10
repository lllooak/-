import React from 'react';
    import { Outlet } from 'react-router-dom';
    import { Navigation } from './Navigation'; // Ensure this is a named import
    import { Footer } from './Footer';

    export function Layout() {
      return (
        <div className="min-h-screen flex flex-col">
          <Navigation />
          <main className="flex-grow">
            <Outlet />
          </main>
          <Footer />
        </div>
      );
    }
