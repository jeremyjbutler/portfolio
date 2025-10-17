import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import Skills from './components/Skills';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Contact from './components/Contact';
import WebSocketStatus from './components/WebSocketStatus';
import { useWebSocket } from './hooks/useWebSocket';
import './App.css';

function App() {
  const [activeSection, setActiveSection] = useState('home');
  
  // Use dynamic WebSocket URL based on environment
  const getWebSocketUrl = () => {
    if (process.env.NODE_ENV === 'development') {
      return 'http://localhost:3001';
    }
    // In production, use the same origin but target the backend service
    return window.location.origin;
  };
  
  const { status, sendMessage } = useWebSocket(getWebSocketUrl());

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'services', 'skills', 'experience', 'projects', 'contact'];
      const scrollPosition = window.scrollY + 100;

      sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Router>
      <div className="App">
        <div className="cyber-grid"></div>
        
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Header activeSection={activeSection} />
            <WebSocketStatus status={status} />
            
            <main>
              <Hero />
              <Services />
              <Skills />
              <Experience />
              <Projects />
              <Contact />
            </main>
          </motion.div>
        </AnimatePresence>
      </div>
    </Router>
  );
}

export default App;