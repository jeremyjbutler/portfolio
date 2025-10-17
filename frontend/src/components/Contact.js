import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import styled from 'styled-components';

const ContactContainer = styled.section`
  min-height: 100vh;
  padding: 80px 0;
  background: var(--primary-bg);
  display: flex;
  align-items: center;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  width: 100%;
`;

const Title = styled(motion.h2)`
  font-size: clamp(2.5rem, 6vw, 4rem);
  text-align: center;
  margin-bottom: 3rem;
`;

const ContactContent = styled.div`
  display: flex;
  justify-content: center;
  max-width: 600px;
  margin: 0 auto;
`;

const ContactInfo = styled(motion.div)`
  text-align: center;
  
  h3 {
    font-size: 2rem;
    color: var(--accent-blue);
    margin-bottom: 2rem;
  }

  p {
    color: var(--secondary-text);
    line-height: 1.8;
    margin-bottom: 2rem;
    font-size: 1.1rem;
  }
`;

const ContactMethod = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  padding: 1rem 2rem;
  background: rgba(26, 26, 26, 0.5);
  border-radius: var(--border-radius);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: var(--transition);
  text-decoration: none;
  color: inherit;

  &:hover {
    border-color: rgba(0, 212, 255, 0.3);
    transform: translateY(-5px);
  }

  .icon {
    font-size: 1.5rem;
    color: var(--accent-blue);
    margin-right: 1rem;
    min-width: 2rem;
  }

  .content {
    .label {
      color: var(--accent-text);
      font-weight: 500;
      font-size: 0.9rem;
      margin-bottom: 0.25rem;
    }

    .value {
      color: var(--primary-text);
      font-size: 1.1rem;
    }
  }
`;

const Contact = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const contactMethods = [
    {
      icon: "📧",
      label: "Email",
      value: "jeremyjamesnc@gmail.com",
      href: "mailto:jeremyjamesnc@gmail.com"
    },
    {
      icon: "💼", 
      label: "LinkedIn",
      value: "jeremy-butler-231bb3102",
      href: "https://www.linkedin.com/in/jeremy-butler-231bb3102/"
    },
    {
      icon: "🐙",
      label: "GitHub",
      value: "jeremyjbutler", 
      href: "https://github.com/jeremyjbutler"
    },
    {
      icon: "💬",
      label: "Telegram",
      value: "@jaybutt",
      href: "https://t.me/jaybutt"
    },
    {
      icon: "🌐",
      label: "Location",
      value: "Charlotte, NC",
      href: null
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <ContactContainer id="contact" ref={ref}>
      <Container>
        <Title
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          Get In <span className="gradient-text">Touch</span>
        </Title>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          <ContactContent>
            <ContactInfo variants={itemVariants}>
              <h3>Let's Work Together</h3>
              <p>
                I'm always interested in discussing new opportunities, 
                innovative projects, and ways to help organizations optimize 
                their infrastructure and development workflows.
              </p>
              <p>
                Whether you need DevOps expertise, AI/ML solutions, cloud infrastructure, 
                or cryptocurrency trading systems, I'd love to hear about your challenges 
                and how we can solve them together.
              </p>

              {contactMethods.map((method, index) => (
                <ContactMethod
                  key={method.label}
                  variants={itemVariants}
                  as={method.href ? "a" : "div"}
                  href={method.href}
                  target={method.href?.startsWith('http') ? '_blank' : undefined}
                  rel={method.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  <div className="icon">{method.icon}</div>
                  <div className="content">
                    <div className="label">{method.label}</div>
                    <div className="value">{method.value}</div>
                  </div>
                </ContactMethod>
              ))}
            </ContactInfo>
          </ContactContent>
        </motion.div>
      </Container>
    </ContactContainer>
  );
};

export default Contact;