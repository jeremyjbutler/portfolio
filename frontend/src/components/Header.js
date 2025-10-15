import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';

const HeaderContainer = styled(motion.header)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(10, 10, 10, 0.9);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
`;

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Logo = styled(motion.div)`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--accent-blue);
  cursor: pointer;
`;

const NavLinks = styled.ul`
  display: flex;
  list-style: none;
  gap: 2rem;
  margin: 0;
  padding: 0;

  @media (max-width: 768px) {
    display: ${props => props.isOpen ? 'flex' : 'none'};
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    flex-direction: column;
    background: rgba(10, 10, 10, 0.95);
    padding: 2rem;
    gap: 1rem;
  }
`;

const NavLink = styled(motion.li)`
  a {
    color: ${props => props.active ? 'var(--accent-blue)' : 'var(--secondary-text)'};
    text-decoration: none;
    font-weight: 500;
    transition: color 0.3s ease;
    cursor: pointer;

    &:hover {
      color: var(--accent-blue);
    }
  }
`;

const MobileToggle = styled.button`
  display: none;
  background: none;
  border: none;
  color: var(--primary-text);
  font-size: 1.5rem;
  cursor: pointer;

  @media (max-width: 768px) {
    display: block;
  }
`;

const Header = ({ activeSection }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'services', label: 'Services' },
    { id: 'skills', label: 'Skills' },
    { id: 'experience', label: 'Experience' },
    { id: 'projects', label: 'Projects' },
    { id: 'contact', label: 'Contact' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileOpen(false);
  };

  return (
    <HeaderContainer
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        background: isScrolled ? 'rgba(10, 10, 10, 0.95)' : 'rgba(10, 10, 10, 0.7)'
      }}
    >
      <Nav>
        <Logo
          whileHover={{ scale: 1.05 }}
          onClick={() => scrollToSection('home')}
        >
          &lt;JB /&gt;
        </Logo>

        <NavLinks isOpen={isMobileOpen}>
          {navItems.map((item, index) => (
            <NavLink
              key={item.id}
              active={activeSection === item.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <a onClick={() => scrollToSection(item.id)}>
                {item.label}
              </a>
            </NavLink>
          ))}
        </NavLinks>

        <MobileToggle onClick={() => setIsMobileOpen(!isMobileOpen)}>
          ☰
        </MobileToggle>
      </Nav>
    </HeaderContainer>
  );
};

export default Header;