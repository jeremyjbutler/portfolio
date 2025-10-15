import React, { useState } from 'react';
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
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: start;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const ContactInfo = styled(motion.div)`
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
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(26, 26, 26, 0.5);
  border-radius: var(--border-radius);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: var(--transition);

  &:hover {
    border-color: rgba(0, 212, 255, 0.3);
    transform: translateX(10px);
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

const ContactForm = styled(motion.form)`
  background: rgba(26, 26, 26, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--border-radius);
  padding: 2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;

  label {
    display: block;
    color: var(--accent-blue);
    font-weight: 500;
    margin-bottom: 0.5rem;
  }

  input, textarea {
    width: 100%;
    padding: 1rem;
    background: rgba(10, 10, 10, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: var(--border-radius);
    color: var(--primary-text);
    font-family: 'Inter', sans-serif;
    transition: var(--transition);

    &:focus {
      outline: none;
      border-color: var(--accent-blue);
      box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.2);
    }

    &::placeholder {
      color: var(--secondary-text);
    }
  }

  textarea {
    resize: vertical;
    min-height: 120px;
  }
`;

const SubmitButton = styled(motion.button)`
  width: 100%;
  background: var(--gradient);
  border: none;
  color: white;
  padding: 1rem 2rem;
  border-radius: var(--border-radius);
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 1.1rem;
  cursor: pointer;
  transition: var(--transition);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(0, 212, 255, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const StatusMessage = styled(motion.div)`
  padding: 1rem;
  margin-top: 1rem;
  border-radius: var(--border-radius);
  text-align: center;
  font-weight: 500;

  &.success {
    background: rgba(0, 255, 136, 0.1);
    border: 1px solid rgba(0, 255, 136, 0.3);
    color: #00ff88;
  }

  &.error {
    background: rgba(255, 68, 68, 0.1);
    border: 1px solid rgba(255, 68, 68, 0.3);
    color: #ff4444;
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`;

const SocialLink = styled(motion.a)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 50%;
  color: var(--accent-blue);
  font-size: 1.2rem;
  text-decoration: none;
  transition: var(--transition);

  &:hover {
    background: var(--accent-blue);
    color: var(--primary-bg);
    transform: translateY(-3px);
  }
`;

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: result.message });
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus({ type: 'error', message: 'Failed to send message. Please try again.' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactMethods = [
    {
      icon: '📧',
      label: 'Email',
      value: process.env.REACT_APP_CONTACT_EMAIL || 'jeremy@devop.foo',
      href: `mailto:${process.env.REACT_APP_CONTACT_EMAIL || 'jeremy@devop.foo'}`
    },
    {
      icon: '💼',
      label: 'LinkedIn',
      value: 'Connect with me',
      href: 'https://linkedin.com/in/jeremy-butler-devops'
    },
    {
      icon: '🐙',
      label: 'GitHub',
      value: 'View my projects',
      href: 'https://github.com/jeremyjbutler'
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
                Whether you need DevOps expertise, Odoo ERP solutions, 
                or cloud infrastructure architecture, I'd love to hear 
                about your challenges and how we can solve them together.
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

              <SocialLinks>
                <SocialLink
                  href="https://linkedin.com/in/jeremy-butler-devops"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  💼
                </SocialLink>
                <SocialLink
                  href="https://github.com/jeremyjbutler"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  🐙
                </SocialLink>
              </SocialLinks>
            </ContactInfo>

            <ContactForm
              variants={itemVariants}
              onSubmit={handleSubmit}
            >
              <FormGroup>
                <label htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  required
                />
              </FormGroup>

              <FormGroup>
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  required
                />
              </FormGroup>

              <FormGroup>
                <label htmlFor="subject">Subject *</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Project inquiry, collaboration, etc."
                  required
                />
              </FormGroup>

              <FormGroup>
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell me about your project, challenges, or how I can help..."
                  required
                />
              </FormGroup>

              <SubmitButton
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </SubmitButton>

              {status && (
                <StatusMessage
                  className={status.type}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {status.message}
                </StatusMessage>
              )}
            </ContactForm>
          </ContactContent>
        </motion.div>
      </Container>
    </ContactContainer>
  );
};

export default Contact;