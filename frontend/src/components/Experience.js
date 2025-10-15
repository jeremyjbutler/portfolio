import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import styled from 'styled-components';

const ExperienceContainer = styled.section`
  min-height: 100vh;
  padding: 80px 0;
  background: var(--primary-bg);
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const Title = styled(motion.h2)`
  font-size: clamp(2.5rem, 6vw, 4rem);
  text-align: center;
  margin-bottom: 4rem;
`;

const Timeline = styled.div`
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: 2px;
    height: 100%;
    background: var(--gradient);
    
    @media (max-width: 768px) {
      left: 20px;
    }
  }
`;

const ExperienceItem = styled(motion.div)`
  position: relative;
  margin-bottom: 4rem;
  
  &:nth-child(odd) .experience-content {
    margin-left: calc(50% + 2rem);
    
    @media (max-width: 768px) {
      margin-left: 3rem;
    }
  }
  
  &:nth-child(even) .experience-content {
    margin-right: calc(50% + 2rem);
    text-align: right;
    
    @media (max-width: 768px) {
      margin-right: 0;
      margin-left: 3rem;
      text-align: left;
    }
  }
`;

const TimelineDot = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 20px;
  background: var(--accent-blue);
  border: 4px solid var(--primary-bg);
  border-radius: 50%;
  z-index: 2;
  
  @media (max-width: 768px) {
    left: 20px;
  }
`;

const ExperienceContent = styled.div`
  background: rgba(26, 26, 26, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--border-radius);
  padding: 2rem;
  max-width: 500px;
  transition: var(--transition);

  &:hover {
    transform: translateY(-5px);
    border-color: rgba(0, 212, 255, 0.3);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }
`;

const Company = styled.h3`
  font-size: 1.8rem;
  color: var(--accent-blue);
  margin-bottom: 0.5rem;
`;

const Position = styled.h4`
  font-size: 1.3rem;
  color: var(--primary-text);
  margin-bottom: 1rem;
`;

const Duration = styled.p`
  color: var(--accent-text);
  font-weight: 500;
  margin-bottom: 1.5rem;
`;

const Description = styled.p`
  color: var(--secondary-text);
  line-height: 1.6;
  margin-bottom: 1.5rem;
`;

const Achievements = styled.ul`
  list-style: none;
  padding: 0;
  
  li {
    position: relative;
    padding-left: 1.5rem;
    margin-bottom: 0.8rem;
    color: var(--secondary-text);
    line-height: 1.5;
    
    &:before {
      content: '▶';
      position: absolute;
      left: 0;
      color: var(--accent-blue);
      font-size: 0.8rem;
    }
  }
`;

const TechStack = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const TechTag = styled.span`
  background: rgba(100, 255, 218, 0.1);
  border: 1px solid rgba(100, 255, 218, 0.3);
  color: var(--accent-text);
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 0.8rem;
`;

const Experience = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const experiences = [
    {
      company: "Mission Critical Inc",
      position: "DevOps Engineer",
      duration: "2025 - Present",
      description: "Developing cutting-edge solutions for Odoo ERP software, specializing in retail business automation and infrastructure optimization.",
      achievements: [
        "Architected and implemented Odoo ERP solutions for retail clients, streamlining inventory management and sales processes",
        "Developed custom Python modules and integrations for Odoo, improving operational efficiency by 40%",
        "Designed containerized deployment strategies for Odoo instances using Docker and Kubernetes",
        "Automated Odoo deployment pipelines with GitLab CI/CD and Ansible playbooks",
        "Implemented monitoring and logging solutions for Odoo production environments",
        "Created API integrations between Odoo and third-party retail systems (POS, inventory, CRM)"
      ],
      techStack: ["Odoo", "Python", "PostgreSQL", "Docker", "Kubernetes", "GitLab CI/CD", "Ansible", "REST APIs", "XML", "JavaScript"]
    },
    {
      company: "Healthcare Fraud Shield",
      position: "DevOps Engineer",
      duration: "2024 - 2025",
      description: "Specialized in MLOps & AI Infrastructure, optimizing machine learning workflows and managing secure, compliant environments for healthcare data processing.",
      achievements: [
        "Optimized ML workflows and infrastructure for data science teams using Kubeflow and Jupyter Notebooks",
        "Implemented NLP, Flask, OpenAI, and TensorFlow solutions in containerized environments",
        "Managed highly restricted environments, addressing security vulnerabilities and compliance requirements",
        "Developed Python applications integrating CyberArk API for secure credential management",
        "Led Azure cloud migrations and automated provisioning with Azure Bicep & Ansible",
        "Onboarded on-premises infrastructure to Azure Arc for enhanced monitoring and security"
      ],
      techStack: ["Kubeflow", "Jupyter", "TensorFlow", "OpenAI", "Flask", "Azure", "Azure Bicep", "Azure Arc", "CyberArk", "Python", "Docker"]
    },
    {
      company: "CQG",
      position: "DevOps & Automation Specialist",
      duration: "2023 - Present",
      description: "Leading infrastructure automation and CI/CD implementation, managing cloud and containerized environments for financial technology solutions.",
      achievements: [
        "Designed automated provisioning workflows using Foreman, Katello, Ansible, Puppet, and Terraform",
        "Developed custom Terraform provisioner for Microsoft Hyper-V environments",
        "Integrated Foreman with GitLab CI/CD to automate provisioning and software deployment",
        "Managed Kubernetes (K3s, K8s), Rancher, Docker, and Podman across multiple environments",
        "Implemented observability and security compliance solutions using Grafana, CheckMK, and OpenSearch",
        "Automated cloud and on-premises infrastructure with Azure, AWS, and Proxmox"
      ],
      techStack: ["Kubernetes", "Terraform", "GitLab", "Ansible", "Puppet", "Docker", "Foreman", "Katello", "Hyper-V", "Red Hat Linux", "Azure", "AWS"]
    },
    {
      company: "MojoHost",
      position: "Manager → Systems Administrator",
      duration: "2011 - 2023",
      description: "Progressed from Systems Administrator to Manager, leading infrastructure teams and managing large-scale hosting environments.",
      achievements: [
        "Led team of System Administrators, managing infrastructure, automation, and client support",
        "Implemented GitLab workflows for system automation and infrastructure provisioning",
        "Managed 2,000+ bare metal servers across multiple data centers",
        "Developed backup automation integrating CephFS, Ansible, and WHMCS",
        "Configured high-availability clusters (Elasticsearch, Redis, HAProxy, MySQL, Nginx)",
        "Specialized in DNS, email server configuration, and security compliance"
      ],
      techStack: ["Linux", "FreeBSD", "Windows Server", "Proxmox", "KVM", "Docker", "Kubernetes", "MySQL", "Redis", "Nginx", "HAProxy"]
    }
  ];

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
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  return (
    <ExperienceContainer id="experience" ref={ref}>
      <Container>
        <Title
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          Professional <span className="gradient-text">Experience</span>
        </Title>

        <Timeline>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
          >
            {experiences.map((exp, index) => (
              <ExperienceItem
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
              >
                <TimelineDot />
                <ExperienceContent className="experience-content">
                  <Company>{exp.company}</Company>
                  <Position>{exp.position}</Position>
                  <Duration>{exp.duration}</Duration>
                  <Description>{exp.description}</Description>
                  
                  <Achievements>
                    {exp.achievements.map((achievement, achIndex) => (
                      <motion.li
                        key={achIndex}
                        initial={{ opacity: 0, x: -20 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ delay: index * 0.3 + achIndex * 0.1 }}
                      >
                        {achievement}
                      </motion.li>
                    ))}
                  </Achievements>

                  <TechStack>
                    {exp.techStack.map((tech, techIndex) => (
                      <motion.div
                        key={tech}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={inView ? { opacity: 1, scale: 1 } : {}}
                        transition={{ delay: index * 0.3 + techIndex * 0.05 }}
                      >
                        <TechTag>{tech}</TechTag>
                      </motion.div>
                    ))}
                  </TechStack>
                </ExperienceContent>
              </ExperienceItem>
            ))}
          </motion.div>
        </Timeline>
      </Container>
    </ExperienceContainer>
  );
};

export default Experience;