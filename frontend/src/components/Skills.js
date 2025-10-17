import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import styled from 'styled-components';

const SkillsContainer = styled.section`
  min-height: 100vh;
  padding: 80px 0;
  background: linear-gradient(135deg, rgba(10, 10, 10, 0.9) 0%, rgba(26, 26, 26, 0.9) 100%);
`;

const Container = styled.div`
  max-width: 1200px;
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

const SkillsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`;

const SkillCategory = styled(motion.div)`
  background: rgba(26, 26, 26, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--border-radius);
  padding: 2rem;
  transition: var(--transition);

  &:hover {
    transform: translateY(-5px);
    border-color: rgba(0, 212, 255, 0.3);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }
`;

const CategoryTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: var(--accent-blue);
`;

const SkillTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const SkillTag = styled(motion.span)`
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
  color: var(--accent-blue);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: var(--transition);

  &:hover {
    background: var(--accent-blue);
    color: var(--primary-bg);
    transform: scale(1.05);
  }
`;

const SkillDetails = styled(motion.div)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(10, 10, 10, 0.95);
  backdrop-filter: blur(30px);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: var(--border-radius);
  padding: 2rem;
  max-width: 500px;
  width: 90vw;
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
  top: 10px;
  right: 15px;
  background: none;
  border: none;
  color: var(--accent-blue);
  font-size: 1.5rem;
  cursor: pointer;
`;

const Skills = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedSkill, setSelectedSkill] = useState(null);
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const skillCategories = {
    'DevOps & Infrastructure': {
      color: '#00d4ff',
      skills: [
        { name: 'Kubernetes', experience: '5+ years', description: 'Container orchestration, K3s, K8s, Rancher, Traefik ingress' },
        { name: 'Docker', experience: '6+ years', description: 'Containerization, Docker Compose, multi-stage builds, registries' },
        { name: 'Terraform', experience: '4+ years', description: 'Infrastructure as Code, multi-cloud provisioning, state management' },
        { name: 'Ansible', experience: '7+ years', description: 'Configuration management, automation, playbooks, Galaxy roles' },
        { name: 'Puppet', experience: '3+ years', description: 'Configuration management, infrastructure automation' },
        { name: 'GitLab CI/CD', experience: '5+ years', description: 'Pipeline automation, deployment workflows, GitLab Runner' },
        { name: 'Jenkins', experience: '4+ years', description: 'Build automation, CI/CD pipelines, Blue Ocean' },
        { name: 'GitHub Actions', experience: '3+ years', description: 'Workflow automation, deployment pipelines, OIDC' },
        { name: 'ArgoCD', experience: '2+ years', description: 'GitOps continuous delivery, Kubernetes deployments' },
        { name: 'Helm', experience: '3+ years', description: 'Kubernetes package manager, chart templating' },
        { name: 'Istio', experience: '2+ years', description: 'Service mesh, traffic management, security policies' },
        { name: 'Vault', experience: '3+ years', description: 'Secret management, PKI, dynamic credentials' },
        { name: 'Consul', experience: '2+ years', description: 'Service discovery, configuration management' },
        { name: 'Traefik', experience: '4+ years', description: 'Cloud-native edge router, load balancing, Let\'s Encrypt' },
        { name: 'Cloudflare', experience: '5+ years', description: 'DNS management, CDN, DDoS protection, Workers' },
        { name: 'Let\'s Encrypt', experience: '6+ years', description: 'Automated SSL/TLS certificate management' }
      ]
    },
    'Cloud Platforms': {
      color: '#64ffda',
      skills: [
        { name: 'AWS', experience: '6+ years', description: 'EC2, S3, Lambda, RDS, CloudFormation' },
        { name: 'Microsoft Azure', experience: '4+ years', description: 'Azure Bicep, Azure Arc, cloud migrations' },
        { name: 'Google Cloud', experience: '2+ years', description: 'GCP services, Terraform integration' },
        { name: 'Azure Arc', experience: '2+ years', description: 'Hybrid cloud management, monitoring' },
        { name: 'OpenStack', experience: '3+ years', description: 'Private cloud infrastructure' }
      ]
    },
    'Programming Languages': {
      color: '#8b5cf6',
      skills: [
        { name: 'Python', experience: '8+ years', description: 'Automation, APIs, data processing, ML workflows, AI applications' },
        { name: 'Bash/Shell', experience: '12+ years', description: 'System administration, automation scripts, domain management' },
        { name: 'JavaScript/TypeScript', experience: '4+ years', description: 'Web development, Node.js applications, trading bots' },
        { name: 'Go', experience: '2+ years', description: 'System programming, microservices, Terraform providers' },
        { name: 'Ruby', experience: '3+ years', description: 'Automation scripts, configuration management' },
        { name: 'PHP', experience: '8+ years', description: 'Web development, API integrations, TGPX, gallery systems' },
        { name: 'Java', experience: '3+ years', description: 'Enterprise applications' },
        { name: 'Swift', experience: '4+ years', description: 'iOS application development, BLE mesh networking' },
        { name: 'Dart/Flutter', experience: '2+ years', description: 'Mobile app development' },
        { name: 'C#', experience: '4+ years', description: 'Unity game development, .NET applications, powerlifting simulators' },
        { name: 'HCL', experience: '4+ years', description: 'Terraform configuration, infrastructure as code' },
        { name: 'PowerShell', experience: '5+ years', description: 'Windows automation, Hyper-V management, Azure operations' }
      ]
    },
    'Python Libraries & Frameworks': {
      color: '#ff6b6b',
      skills: [
        { name: 'FastAPI', experience: '3+ years', description: 'High-performance REST APIs, async programming' },
        { name: 'Django', experience: '4+ years', description: 'Web applications, admin interfaces' },
        { name: 'Flask', experience: '5+ years', description: 'Microservices, lightweight web apps' },
        { name: 'SQLAlchemy', experience: '4+ years', description: 'Database ORM, query optimization' },
        { name: 'Pydantic', experience: '3+ years', description: 'Data validation, API schemas' },
        { name: 'Pandas', experience: '4+ years', description: 'Data analysis, CSV processing, lottery prediction' },
        { name: 'NumPy', experience: '3+ years', description: 'Numerical computing, data science' },
        { name: 'Selenium', experience: '3+ years', description: 'Web automation, testing' },
        { name: 'Pytest', experience: '4+ years', description: 'Testing framework, API testing' },
        { name: 'TensorFlow', experience: '3+ years', description: 'Machine learning, AI workflows, LLMs from scratch' },
        { name: 'PyTorch', experience: '2+ years', description: 'Deep learning, neural networks, LLM implementation' },
        { name: 'OpenAI API', experience: '2+ years', description: 'AI integration, NLP applications, blog generation' },
        { name: 'Jupyter Notebooks', experience: '4+ years', description: 'Data analysis, ML experimentation, LLM development' },
        { name: 'Scikit-learn', experience: '3+ years', description: 'Machine learning algorithms, model training' },
        { name: 'UV Packaging', experience: '1+ years', description: 'Modern Python packaging, dependency management' },
        { name: 'Celery', experience: '3+ years', description: 'Distributed task queue, async processing' },
        { name: 'Coinbase API', experience: '2+ years', description: 'Cryptocurrency trading, portfolio management' },
        { name: 'Odoo ORM', experience: '2+ years', description: 'Odoo framework, model development, business logic' },
        { name: 'XML-RPC', experience: '2+ years', description: 'Odoo external API integration' },
        { name: 'Odoo Modules', experience: '2+ years', description: 'Custom module development, manifest files' }
      ]
    },
    'AI & Machine Learning': {
      color: '#6c5ce7',
      skills: [
        { name: 'LLMs from Scratch', experience: '2+ years', description: 'Building language models, transformer architecture' },
        { name: 'OpenAI Integration', experience: '3+ years', description: 'GPT API, embeddings, fine-tuning, blog automation' },
        { name: 'Hugging Face', experience: '2+ years', description: 'Transformers, model deployment, inference' },
        { name: 'Langchain', experience: '2+ years', description: 'LLM application framework, chains, agents' },
        { name: 'Vector Databases', experience: '2+ years', description: 'Pinecone, Weaviate, embeddings storage' },
        { name: 'MLOps', experience: '2+ years', description: 'Model deployment, monitoring, CI/CD for ML' },
        { name: 'Computer Vision', experience: '2+ years', description: 'Image processing, object detection' }
      ]
    },
    'Cryptocurrency & Trading': {
      color: '#fdcb6e',
      skills: [
        { name: 'Coinbase Pro API', experience: '3+ years', description: 'Automated trading, portfolio management, order execution' },
        { name: 'Binance API', experience: '2+ years', description: 'Crypto trading bots, market data analysis' },
        { name: 'DeFi Protocols', experience: '2+ years', description: 'Decentralized finance, yield farming strategies' },
        { name: 'Blockchain Analysis', experience: '3+ years', description: 'Transaction monitoring, wallet tracking' },
        { name: 'Trading Algorithms', experience: '4+ years', description: 'Algorithmic trading, backtesting, strategy optimization' },
        { name: 'Market Data APIs', experience: '3+ years', description: 'Real-time price feeds, historical data analysis' }
      ]
    },
    'Databases & Storage': {
      color: '#4ecdc4',
      skills: [
        { name: 'PostgreSQL', experience: '6+ years', description: 'Advanced queries, performance tuning' },
        { name: 'MySQL', experience: '8+ years', description: 'Database administration, clustering' },
        { name: 'MSSQL', experience: '4+ years', description: 'Enterprise database management' },
        { name: 'Redis', experience: '5+ years', description: 'Caching, session storage' },
        { name: 'Elasticsearch', experience: '4+ years', description: 'Search, log analysis, clustering' },
        { name: 'CephFS', experience: '3+ years', description: 'Distributed storage systems' },
        { name: 'SQLite', experience: '5+ years', description: 'Embedded databases, local storage' }
      ]
    },
    'System Administration': {
      color: '#feca57',
      skills: [
        { name: 'Linux (RHEL/CentOS)', experience: '12+ years', description: 'System administration, performance tuning' },
        { name: 'Windows Server', experience: '8+ years', description: 'Administration, Active Directory' },
        { name: 'FreeBSD', experience: '6+ years', description: 'Unix system administration' },
        { name: 'Proxmox', experience: '5+ years', description: 'Virtualization platform management' },
        { name: 'Hyper-V', experience: '3+ years', description: 'Microsoft virtualization' },
        { name: 'KVM', experience: '6+ years', description: 'Linux virtualization' },
        { name: 'Foreman/Katello', experience: '3+ years', description: 'Lifecycle management, provisioning' }
      ]
    },
    'Monitoring & Security': {
      color: '#ff9ff3',
      skills: [
        { name: 'Grafana', experience: '4+ years', description: 'Metrics visualization, dashboards, alerting' },
        { name: 'Prometheus', experience: '4+ years', description: 'Metrics collection, time series database, PromQL' },
        { name: 'CheckMK', experience: '2+ years', description: 'Infrastructure monitoring' },
        { name: 'OpenSearch', experience: '2+ years', description: 'Log analysis, security monitoring' },
        { name: 'CyberArk', experience: '1+ years', description: 'Privileged access management' },
        { name: 'HAProxy', experience: '5+ years', description: 'Load balancing, high availability' },
        { name: 'Nginx', experience: '8+ years', description: 'Web server, reverse proxy, NPM' },
        { name: 'PCI/HIPAA Compliance', experience: '5+ years', description: 'Security auditing, compliance' },
        { name: 'Jaeger', experience: '2+ years', description: 'Distributed tracing, performance monitoring' },
        { name: 'Fluentd/Fluent Bit', experience: '3+ years', description: 'Log collection and forwarding' },
        { name: 'Loki', experience: '2+ years', description: 'Log aggregation system, Grafana integration' }
      ]
    },
    'Container & Orchestration': {
      color: '#ff7675',
      skills: [
        { name: 'K3s', experience: '4+ years', description: 'Lightweight Kubernetes, edge computing, IoT deployments' },
        { name: 'Rancher', experience: '3+ years', description: 'Kubernetes management platform, multi-cluster operations' },
        { name: 'Docker Registry', experience: '5+ years', description: 'Private registries, Harbor, image management' },
        { name: 'Containerd', experience: '4+ years', description: 'Container runtime, CRI interface' },
        { name: 'Podman', experience: '2+ years', description: 'Daemonless container engine, rootless containers' },
        { name: 'Buildah', experience: '2+ years', description: 'Container image building, OCI compliance' },
        { name: 'Skopeo', experience: '2+ years', description: 'Container image operations, multi-registry sync' }
      ]
    },
    'Web Development': {
      color: '#a8e6cf',
      skills: [
        { name: 'React', experience: '3+ years', description: 'Frontend development, hooks, component libraries' },
        { name: 'Node.js', experience: '4+ years', description: 'Backend APIs, Express.js, microservices' },
        { name: 'WebSockets', experience: '2+ years', description: 'Real-time communication, Socket.IO' },
        { name: 'REST APIs', experience: '6+ years', description: 'API design, integration, OpenAPI/Swagger' },
        { name: 'GraphQL', experience: '2+ years', description: 'Query language, Apollo, schema design' },
        { name: 'HTML/CSS', experience: '8+ years', description: 'Frontend markup, CSS Grid, Flexbox, responsive design' },
        { name: 'Vite', experience: '2+ years', description: 'Build tool, HMR, modern bundling' },
        { name: 'Amplify', experience: '2+ years', description: 'AWS full-stack development, serverless' },
        { name: 'Unity', experience: '2+ years', description: 'Game development, 3D applications, C# scripting' }
      ]
    },
    'ERP & Business Systems': {
      color: '#ffd93d',
      skills: [
        { name: 'Odoo ERP', experience: '2+ years', description: 'Custom module development, retail solutions, inventory management' },
        { name: 'Odoo Studio', experience: '2+ years', description: 'Custom app development, workflow automation' },
        { name: 'Odoo API Integration', experience: '2+ years', description: 'Third-party system integrations, XML-RPC, REST APIs' },
        { name: 'BigCommerce API', experience: '1+ years', description: 'E-commerce integrations' },
        { name: 'ETL Pipelines', experience: '3+ years', description: 'Data transformation workflows' },
        { name: 'POS Systems', experience: '2+ years', description: 'Point-of-sale integrations with Odoo' },
        { name: 'Inventory Management', experience: '3+ years', description: 'Automated inventory tracking and optimization' }
      ]
    }
  };

  const filters = ['all', ...Object.keys(skillCategories)];

  const filteredCategories = activeFilter === 'all' 
    ? skillCategories 
    : { [activeFilter]: skillCategories[activeFilter] };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
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
    <SkillsContainer id="skills" ref={ref}>
      <Container>
        <Title
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          Technical <span className="gradient-text">Skills</span>
        </Title>

        <FilterContainer>
          {filters.map((filter, index) => (
            <FilterButton
              key={filter}
              active={activeFilter === filter}
              onClick={() => setActiveFilter(filter)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: index * 0.1 }}
            >
              {filter === 'all' ? 'All Skills' : filter}
            </FilterButton>
          ))}
        </FilterContainer>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          <SkillsGrid>
            {Object.entries(filteredCategories).map(([category, data]) => (
              <SkillCategory
                key={category}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
              >
                <CategoryTitle style={{ color: data.color }}>
                  {category}
                </CategoryTitle>
                <SkillTags>
                  {data.skills.map((skill, index) => (
                    <SkillTag
                      key={skill.name}
                      onClick={() => setSelectedSkill(skill)}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {skill.name}
                    </SkillTag>
                  ))}
                </SkillTags>
              </SkillCategory>
            ))}
          </SkillsGrid>
        </motion.div>

        <AnimatePresence>
          {selectedSkill && (
            <>
              <Overlay
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedSkill(null)}
              />
              <SkillDetails
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 50 }}
              >
                <CloseButton onClick={() => setSelectedSkill(null)}>
                  ×
                </CloseButton>
                <h3 className="gradient-text" style={{ marginBottom: '1rem' }}>
                  {selectedSkill.name}
                </h3>
                <p style={{ color: 'var(--accent-blue)', marginBottom: '1rem' }}>
                  Experience: {selectedSkill.experience}
                </p>
                <p style={{ color: 'var(--secondary-text)', lineHeight: '1.6' }}>
                  {selectedSkill.description}
                </p>
              </SkillDetails>
            </>
          )}
        </AnimatePresence>
      </Container>
    </SkillsContainer>
  );
};

export default Skills;