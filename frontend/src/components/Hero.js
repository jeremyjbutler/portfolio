import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';

const HeroContainer = styled.section`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
`;

const HeroContent = styled.div`
  text-align: center;
  z-index: 2;
  max-width: 800px;
  padding: 0 2rem;
`;

const Title = styled(motion.h1)`
  font-size: clamp(2.5rem, 8vw, 6rem);
  font-weight: 700;
  margin-bottom: 1rem;
  line-height: 1.1;
`;

const Subtitle = styled(motion.h2)`
  font-size: clamp(1.2rem, 4vw, 2rem);
  font-weight: 300;
  margin-bottom: 2rem;
  color: var(--secondary-text);
`;

const TypeWriter = styled.span`
  color: var(--accent-blue);
`;

const Description = styled(motion.p)`
  font-size: 1.2rem;
  color: var(--secondary-text);
  margin-bottom: 3rem;
  line-height: 1.6;
`;

const CTAButtons = styled(motion.div)`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const FloatingElements = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
`;

const FloatingIcon = styled(motion.div)`
  position: absolute;
  font-size: 2rem;
  color: var(--accent-blue);
  opacity: 0.1;
`;

const Hero = () => {
  const [typeWriterText, setTypeWriterText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const titles = [
    'DevOps Engineer',
    'Software Developer', 
    'Cloud Architect',
    'Automation Expert'
  ];

  useEffect(() => {
    const timeout = setTimeout(() => {
      const currentTitle = titles[currentIndex];
      
      if (!isDeleting) {
        if (typeWriterText.length < currentTitle.length) {
          setTypeWriterText(currentTitle.substring(0, typeWriterText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (typeWriterText.length > 0) {
          setTypeWriterText(currentTitle.substring(0, typeWriterText.length - 1));
        } else {
          setIsDeleting(false);
          setCurrentIndex((prevIndex) => (prevIndex + 1) % titles.length);
        }
      }
    }, isDeleting ? 50 : 100);

    return () => clearTimeout(timeout);
  }, [typeWriterText, currentIndex, isDeleting, titles]);

  const floatingIcons = ['⚡', '🚀', '⚙️', '💻', '🔧', '📡', '🌐', '🔮'];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  return (
    <HeroContainer id="home">
      <FloatingElements>
        {floatingIcons.map((icon, index) => (
          <FloatingIcon
            key={index}
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              rotate: 0
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              rotate: 360
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            {icon}
          </FloatingIcon>
        ))}
      </FloatingElements>

      <HeroContent>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Title variants={itemVariants}>
            Hi, I'm{' '}
            <span className="gradient-text">Jeremy Butler</span>
          </Title>
          
          <Subtitle variants={itemVariants}>
            <TypeWriter>{typeWriterText}</TypeWriter>
            <span className="terminal-cursor"></span>
          </Subtitle>
          
          <Description variants={itemVariants}>
            <strong style={{ color: 'var(--accent-blue)', fontSize: '1.1em' }}>
              "Mr. Stress Relief - Make Your Day Easier and More Productive"
            </strong>
            <br /><br />
            I specialize in workflow optimization, process automation, and solving 
            complex business problems. From data migrations to cloud optimization, 
            I eliminate the stress from your technology challenges so you can focus 
            on what matters most - growing your business.
          </Description>
          
          <CTAButtons variants={itemVariants}>
            <motion.a
              href="#projects"
              className="btn-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });
              }}
            >
              View My Work
            </motion.a>
            <motion.a
              href="#contact"
              className="btn-secondary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Get In Touch
            </motion.a>
          </CTAButtons>
        </motion.div>
      </HeroContent>
    </HeroContainer>
  );
};

export default Hero;