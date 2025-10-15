import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import styled from 'styled-components';

const ProjectsContainer = styled.section`
  min-height: 100vh;
  padding: 80px 0;
  background: linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(10, 10, 10, 0.9) 100%);
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const Title = styled(motion.h2)`
  font-size: clamp(2.5rem, 6vw, 4rem);
  text-align: center;
  margin-bottom: 3rem;
`;

const FilterContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 3rem;
`;

const FilterButton = styled(motion.button)`
  background: ${props => props.active ? 'var(--gradient)' : 'transparent'};
  border: 2px solid var(--accent-blue);
  color: ${props => props.active ? 'white' : 'var(--accent-blue)'};
  padding: 10px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.active ? 'var(--gradient)' : 'var(--accent-blue)'};
    color: white;
    transform: scale(1.05);
  }
`;

const ProjectsGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ProjectCard = styled(motion.div)`
  background: rgba(26, 26, 26, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--border-radius);
  overflow: hidden;
  cursor: pointer;
  transition: var(--transition);

  &:hover {
    transform: translateY(-10px);
    border-color: rgba(0, 212, 255, 0.3);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
  }
`;

const ProjectHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const ProjectTitle = styled.h3`
  font-size: 1.5rem;
  color: var(--accent-blue);
  margin-bottom: 0.5rem;
`;

const ProjectType = styled.span`
  background: rgba(100, 255, 218, 0.1);
  border: 1px solid rgba(100, 255, 218, 0.3);
  color: var(--accent-text);
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 0.8rem;
`;

const ProjectContent = styled.div`
  padding: 1.5rem;
`;

const ProjectDescription = styled.p`
  color: var(--secondary-text);
  line-height: 1.6;
  margin-bottom: 1.5rem;
`;

const TechStack = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const TechTag = styled.span`
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
  color: var(--accent-blue);
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
`;

const ProjectFeatures = styled.ul`
  list-style: none;
  padding: 0;
  margin-bottom: 1.5rem;
  
  li {
    position: relative;
    padding-left: 1.5rem;
    margin-bottom: 0.5rem;
    color: var(--secondary-text);
    font-size: 0.9rem;
    
    &:before {
      content: '✓';
      position: absolute;
      left: 0;
      color: var(--accent-text);
      font-weight: bold;
    }
  }
`;

const ProjectLinks = styled.div`
  display: flex;
  gap: 1rem;
`;

const ProjectLink = styled.a`
  background: var(--gradient);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: var(--transition);

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 5px 15px rgba(0, 212, 255, 0.3);
  }
`;

const ProjectModal = styled(motion.div)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(10, 10, 10, 0.95);
  backdrop-filter: blur(30px);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: var(--border-radius);
  padding: 2rem;
  max-width: 800px;
  width: 90vw;
  max-height: 80vh;
  overflow-y: auto;
  z-index: 1000;
`;

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 999;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 20px;
  background: none;
  border: none;
  color: var(--accent-blue);
  font-size: 1.5rem;
  cursor: pointer;
`;

const Projects = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState(null);
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const projects = [
    {
      title: "Odoo ERP Retail Solutions",
      type: "ERP Development",
      category: "enterprise",
      description: "Comprehensive Odoo ERP implementations for retail businesses, featuring custom modules for inventory management, POS integration, and automated workflows.",
      detailedDescription: "Led the development and implementation of enterprise-grade Odoo ERP solutions specifically tailored for retail businesses. This project involved creating custom Python modules, designing automated workflows, and integrating various third-party systems to create a seamless business management platform.",
      techStack: ["Odoo", "Python", "PostgreSQL", "JavaScript", "XML", "Docker", "Kubernetes", "GitLab CI/CD"],
      features: [
        "Custom inventory management modules with automated reordering",
        "POS system integration with real-time synchronization",
        "Advanced reporting dashboards with business intelligence",
        "Multi-location inventory tracking and management",
        "Automated workflow orchestration for retail operations",
        "Third-party API integrations (payment processors, shipping providers)",
        "Mobile-responsive interface for field operations"
      ],
      achievements: [
        "Improved inventory accuracy by 95% through automated tracking",
        "Reduced manual data entry by 80% via API integrations",
        "Increased operational efficiency by 40% with workflow automation"
      ]
    },
    {
      title: "BigCommerce to Odoo Sync Platform",
      type: "Data Integration",
      category: "integration",
      description: "Automated data synchronization platform connecting BigCommerce e-commerce stores with Odoo ERP systems, handling products, orders, and customer data.",
      detailedDescription: "Developed a comprehensive ETL pipeline that synchronizes data between BigCommerce e-commerce platforms and Odoo ERP systems. The solution handles complex data transformations, conflict resolution, and real-time synchronization of products, orders, customers, and inventory levels.",
      techStack: ["Python", "FastAPI", "PostgreSQL", "BigCommerce API", "Odoo API", "Docker", "Redis", "Celery"],
      features: [
        "Real-time bidirectional data synchronization",
        "Automated conflict resolution algorithms",
        "Custom field mapping and data transformation",
        "Comprehensive logging and error handling",
        "Performance monitoring and alerting",
        "Batch processing for large data sets",
        "RESTful API for external integrations"
      ],
      achievements: [
        "Synchronized 100,000+ products across multiple platforms",
        "Achieved 99.9% data accuracy with automated validation",
        "Reduced manual data entry errors by 95%"
      ]
    },
    {
      title: "MLOps Infrastructure Platform",
      type: "MLOps",
      category: "infrastructure",
      description: "Kubernetes-based MLOps platform for healthcare AI workflows, featuring automated model training, deployment, and monitoring with strict compliance requirements.",
      detailedDescription: "Architected and implemented a comprehensive MLOps platform for healthcare AI applications, ensuring HIPAA compliance while providing data scientists with powerful tools for model development, training, and deployment. The platform integrates multiple ML frameworks and provides automated CI/CD for machine learning workflows.",
      techStack: ["Kubernetes", "Kubeflow", "TensorFlow", "PyTorch", "Jupyter", "MLflow", "Grafana", "Prometheus", "Azure"],
      features: [
        "Automated model training pipelines with Kubeflow",
        "Jupyter notebook environments with GPU acceleration",
        "Model versioning and experiment tracking",
        "Automated model deployment and A/B testing",
        "Comprehensive monitoring and alerting",
        "HIPAA-compliant data processing workflows",
        "Integration with healthcare data sources"
      ],
      achievements: [
        "Reduced model deployment time from days to minutes",
        "Improved model accuracy by 25% through automated hyperparameter tuning",
        "Achieved 100% compliance with healthcare security standards"
      ]
    },
    {
      title: "Multi-Cloud Infrastructure Automation",
      type: "Infrastructure",
      category: "infrastructure",
      description: "Terraform-based infrastructure automation spanning AWS, Azure, and on-premises environments with GitOps workflows and compliance monitoring.",
      detailedDescription: "Designed and implemented a comprehensive infrastructure-as-code solution that manages resources across multiple cloud providers and on-premises systems. The platform features automated provisioning, configuration management, and compliance monitoring with self-healing capabilities.",
      techStack: ["Terraform", "Ansible", "Kubernetes", "GitLab CI/CD", "AWS", "Azure", "Grafana", "Vault"],
      features: [
        "Multi-cloud resource provisioning with Terraform",
        "GitOps-based configuration management",
        "Automated compliance scanning and remediation",
        "Self-healing infrastructure with monitoring integration",
        "Cost optimization through automated resource scaling",
        "Disaster recovery automation",
        "Security policy enforcement across environments"
      ],
      achievements: [
        "Managed 500+ cloud resources across 3 providers",
        "Reduced infrastructure provisioning time by 90%",
        "Achieved 99.95% uptime with automated recovery"
      ]
    },
    {
      title: "Powerlifting Training Simulator",
      type: "Game Development",
      category: "personal",
      description: "Unity-based 3D powerlifting simulation game with realistic physics, progressive training programs, and competition modes.",
      detailedDescription: "Developed a comprehensive powerlifting simulation game using Unity and C#, featuring realistic physics simulation, progressive training algorithms, and competitive gameplay modes. The game includes detailed biomechanics simulation and educational content about powerlifting techniques.",
      techStack: ["Unity", "C#", "Blender", "SQLite", "Python", "Git LFS"],
      features: [
        "Realistic physics simulation for powerlifting movements",
        "Progressive training program algorithms",
        "3D character animation and biomechanics",
        "Competition mode with leaderboards",
        "Educational content and technique tutorials",
        "Cross-platform deployment (PC, Mobile)",
        "Performance analytics and progress tracking"
      ],
      achievements: [
        "Implemented realistic physics for 3 major powerlifting movements",
        "Created educational content used by 1000+ athletes",
        "Developed proprietary training progression algorithms"
      ]
    },
    {
      title: "BLE Mesh Chat Application",
      type: "Mobile Development",
      category: "personal",
      description: "iOS application enabling mesh networking communication via Bluetooth Low Energy, allowing offline group messaging in remote areas.",
      detailedDescription: "Built a innovative iOS application that creates mesh networks using Bluetooth Low Energy technology, enabling users to communicate without cellular or WiFi coverage. The app features automatic network discovery, message routing, and group chat capabilities.",
      techStack: ["Swift", "iOS", "Bluetooth LE", "Core Bluetooth", "Xcode"],
      features: [
        "Bluetooth LE mesh networking protocol",
        "Automatic device discovery and network formation",
        "Multi-hop message routing algorithms",
        "Group chat with up to 20 participants",
        "Offline message queuing and delivery",
        "Battery-optimized communication protocols",
        "End-to-end encryption for secure messaging"
      ],
      achievements: [
        "Achieved 500m+ communication range through mesh routing",
        "Implemented battery-efficient protocols with 12+ hour operation",
        "Developed custom mesh networking protocol"
      ]
    }
  ];

  const categories = ['all', 'enterprise', 'infrastructure', 'integration', 'personal'];
  const categoryLabels = {
    all: 'All Projects',
    enterprise: 'Enterprise',
    infrastructure: 'Infrastructure',
    integration: 'Integration',
    personal: 'Personal'
  };

  const filteredProjects = activeFilter === 'all' 
    ? projects 
    : projects.filter(project => project.category === activeFilter);

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
    <ProjectsContainer id="projects" ref={ref}>
      <Container>
        <Title
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          Featured <span className="gradient-text">Projects</span>
        </Title>

        <FilterContainer>
          {categories.map((category, index) => (
            <FilterButton
              key={category}
              active={activeFilter === category}
              onClick={() => setActiveFilter(category)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: index * 0.1 }}
            >
              {categoryLabels[category]}
            </FilterButton>
          ))}
        </FilterContainer>

        <ProjectsGrid
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {filteredProjects.map((project, index) => (
            <ProjectCard
              key={project.title}
              variants={itemVariants}
              onClick={() => setSelectedProject(project)}
              whileHover={{ scale: 1.02 }}
            >
              <ProjectHeader>
                <ProjectTitle>{project.title}</ProjectTitle>
                <ProjectType>{project.type}</ProjectType>
              </ProjectHeader>
              
              <ProjectContent>
                <ProjectDescription>{project.description}</ProjectDescription>
                
                <TechStack>
                  {project.techStack.slice(0, 6).map((tech) => (
                    <TechTag key={tech}>{tech}</TechTag>
                  ))}
                  {project.techStack.length > 6 && (
                    <TechTag>+{project.techStack.length - 6} more</TechTag>
                  )}
                </TechStack>

                <ProjectFeatures>
                  {project.features.slice(0, 3).map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ProjectFeatures>

                <ProjectLinks>
                  <ProjectLink href="#" onClick={(e) => { e.stopPropagation(); }}>
                    View Details
                  </ProjectLink>
                </ProjectLinks>
              </ProjectContent>
            </ProjectCard>
          ))}
        </ProjectsGrid>

        <AnimatePresence>
          {selectedProject && (
            <>
              <Overlay
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedProject(null)}
              />
              <ProjectModal
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 50 }}
              >
                <CloseButton onClick={() => setSelectedProject(null)}>×</CloseButton>
                
                <h2 className="gradient-text" style={{ marginBottom: '1rem' }}>
                  {selectedProject.title}
                </h2>
                
                <ProjectType style={{ marginBottom: '1.5rem' }}>
                  {selectedProject.type}
                </ProjectType>
                
                <p style={{ color: 'var(--secondary-text)', lineHeight: '1.6', marginBottom: '2rem' }}>
                  {selectedProject.detailedDescription}
                </p>
                
                <h3 style={{ color: 'var(--accent-blue)', marginBottom: '1rem' }}>
                  Key Features
                </h3>
                <ProjectFeatures>
                  {selectedProject.features.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ProjectFeatures>
                
                {selectedProject.achievements && (
                  <>
                    <h3 style={{ color: 'var(--accent-blue)', marginBottom: '1rem' }}>
                      Achievements
                    </h3>
                    <ProjectFeatures>
                      {selectedProject.achievements.map((achievement, idx) => (
                        <li key={idx}>{achievement}</li>
                      ))}
                    </ProjectFeatures>
                  </>
                )}
                
                <h3 style={{ color: 'var(--accent-blue)', marginBottom: '1rem' }}>
                  Technology Stack
                </h3>
                <TechStack style={{ marginBottom: '2rem' }}>
                  {selectedProject.techStack.map((tech) => (
                    <TechTag key={tech}>{tech}</TechTag>
                  ))}
                </TechStack>
              </ProjectModal>
            </>
          )}
        </AnimatePresence>
      </Container>
    </ProjectsContainer>
  );
};

export default Projects;