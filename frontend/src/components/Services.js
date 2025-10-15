import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import styled from 'styled-components';

const ServicesContainer = styled.section`
  min-height: 100vh;
  padding: 80px 0;
  background: linear-gradient(135deg, rgba(10, 10, 10, 0.95) 0%, rgba(26, 26, 26, 0.95) 100%);
  position: relative;
  overflow: hidden;
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const Title = styled(motion.h2)`
  font-size: clamp(2.5rem, 6vw, 4rem);
  text-align: center;
  margin-bottom: 2rem;
`;

const Slogan = styled(motion.h3)`
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  text-align: center;
  margin-bottom: 4rem;
  color: var(--accent-blue);
  font-weight: 400;
  font-style: italic;
`;

const ServicesGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ServiceCard = styled(motion.div)`
  background: rgba(26, 26, 26, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--border-radius);
  padding: 2.5rem;
  transition: var(--transition);
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-10px);
    border-color: var(--accent-blue);
    box-shadow: 0 25px 50px rgba(0, 212, 255, 0.2);
  }

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: var(--gradient);
    opacity: 0;
    transition: var(--transition);
  }

  &:hover:before {
    opacity: 1;
  }
`;

const ServiceIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const ServiceTitle = styled.h3`
  font-size: 1.8rem;
  color: var(--accent-blue);
  margin-bottom: 1rem;
  text-align: center;
`;

const ServiceDescription = styled.p`
  color: var(--secondary-text);
  line-height: 1.7;
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
`;

const ServiceBenefits = styled.ul`
  list-style: none;
  padding: 0;
  
  li {
    position: relative;
    padding-left: 1.5rem;
    margin-bottom: 0.8rem;
    color: var(--primary-text);
    
    &:before {
      content: '✓';
      position: absolute;
      left: 0;
      color: var(--accent-text);
      font-weight: bold;
      font-size: 1.1rem;
    }
  }
`;

const ServiceTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1.5rem;
`;

const ServiceTag = styled.span`
  background: rgba(100, 255, 218, 0.1);
  border: 1px solid rgba(100, 255, 218, 0.3);
  color: var(--accent-text);
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 0.85rem;
`;

const CTASection = styled(motion.div)`
  background: rgba(0, 212, 255, 0.05);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: var(--border-radius);
  padding: 3rem;
  text-align: center;
  margin-top: 4rem;
`;

const CTATitle = styled.h3`
  font-size: 2rem;
  color: var(--accent-blue);
  margin-bottom: 1rem;
`;

const CTADescription = styled.p`
  font-size: 1.2rem;
  color: var(--secondary-text);
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const CTAButton = styled(motion.a)`
  display: inline-block;
  background: var(--gradient);
  color: white;
  padding: 1rem 2rem;
  border-radius: var(--border-radius);
  text-decoration: none;
  font-weight: 600;
  font-size: 1.1rem;
  transition: var(--transition);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 30px rgba(0, 212, 255, 0.4);
  }
`;

const Services = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const services = [
    {
      icon: '⚡',
      title: 'Workflow & Process Optimization',
      description: 'Transform your chaotic workflows into streamlined, automated processes that save time and reduce stress for your entire team.',
      benefits: [
        'Eliminate repetitive manual tasks through intelligent automation',
        'Reduce human errors by 90% with automated validation',
        'Cut processing time in half with optimized workflows',
        'Improve team productivity and job satisfaction',
        'Create scalable processes that grow with your business'
      ],
      tags: ['Automation', 'Process Design', 'Workflow Tools', 'Integration', 'Efficiency']
    },
    {
      icon: '💻',
      title: 'Personalized Software Engineering',
      description: 'Custom software solutions designed specifically for your unique business challenges, no matter how complex or specialized your requirements.',
      benefits: [
        'Solve problems that off-the-shelf software cannot address',
        'Integrate seamlessly with your existing systems',
        'Scale from prototype to enterprise-level solutions',
        'Future-proof architecture that adapts to changes',
        'Full ownership of your custom solution'
      ],
      tags: ['Custom Development', 'API Integration', 'Scalable Architecture', 'Modern Frameworks']
    },
    {
      icon: '🔄',
      title: 'Data Migration & AI Training',
      description: 'Safely migrate your valuable data to better systems and leverage AI to unlock insights that drive smarter business decisions.',
      benefits: [
        'Zero data loss with comprehensive migration strategies',
        'Transform legacy data into modern, accessible formats',
        'Train AI models on your specific business data',
        'Automate data processing and analysis workflows',
        'Gain competitive insights from your historical data'
      ],
      tags: ['Data Migration', 'AI/ML', 'ETL Pipelines', 'Database Optimization', 'Analytics']
    },
    {
      icon: '☁️',
      title: 'Cloud Cost Optimization',
      description: 'Dramatically reduce your cloud spending while improving performance and customer satisfaction through strategic optimization.',
      benefits: [
        'Cut cloud costs by 30-60% without sacrificing performance',
        'Implement auto-scaling to handle traffic efficiently',
        'Optimize resource allocation and eliminate waste',
        'Improve application speed and reliability',
        'Set up monitoring to prevent cost surprises'
      ],
      tags: ['AWS', 'Azure', 'Cost Optimization', 'Auto-scaling', 'Performance Tuning']
    },
    {
      icon: '📈',
      title: 'Marketing Automation',
      description: 'Transform your marketing efforts with intelligent automation that delivers better results while requiring less manual work.',
      benefits: [
        'Automate lead nurturing and customer journeys',
        'Personalize marketing at scale with AI-driven insights',
        'Reduce marketing costs while improving conversion rates',
        'Track and optimize campaigns with detailed analytics',
        'Integrate all marketing tools into unified workflows'
      ],
      tags: ['Marketing Automation', 'CRM Integration', 'Lead Generation', 'Analytics', 'Personalization']
    },
    {
      icon: '🚀',
      title: 'DevOps & Deployment Acceleration',
      description: 'Speed up your software delivery with automated testing, continuous deployment, and infrastructure that scales with your success.',
      benefits: [
        'Deploy new features daily instead of monthly',
        'Reduce bugs in production by 95% with automated testing',
        'Scale infrastructure automatically based on demand',
        'Improve team collaboration and development velocity',
        'Get to market faster and start generating revenue sooner'
      ],
      tags: ['CI/CD', 'Kubernetes', 'Automated Testing', 'Infrastructure as Code', 'Monitoring']
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
    <ServicesContainer id="services" ref={ref}>
      <Container>
        <Title
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          My <span className="gradient-text">Services</span>
        </Title>

        <Slogan
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          "Mr. Stress Relief - Make Your Day Easier and More Productive"
        </Slogan>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          <ServicesGrid>
            {services.map((service, index) => (
              <ServiceCard
                key={service.title}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
              >
                <ServiceIcon>{service.icon}</ServiceIcon>
                <ServiceTitle>{service.title}</ServiceTitle>
                <ServiceDescription>{service.description}</ServiceDescription>
                
                <ServiceBenefits>
                  {service.benefits.map((benefit, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={inView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: index * 0.2 + idx * 0.1 }}
                    >
                      {benefit}
                    </motion.li>
                  ))}
                </ServiceBenefits>

                <ServiceTags>
                  {service.tags.map((tag) => (
                    <ServiceTag key={tag}>{tag}</ServiceTag>
                  ))}
                </ServiceTags>
              </ServiceCard>
            ))}
          </ServicesGrid>
        </motion.div>

        <CTASection
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <CTATitle>Ready to Eliminate Your Technology Stress?</CTATitle>
          <CTADescription>
            No matter how complex your challenges or what software and hardware you're using, 
            I'll refine and automate your electronic processes to make your team's workday 
            less stressful, more efficient, and more organized.
          </CTADescription>
          <CTAButton
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Let's Make Your Day Easier
          </CTAButton>
        </CTASection>
      </Container>
    </ServicesContainer>
  );
};

export default Services;