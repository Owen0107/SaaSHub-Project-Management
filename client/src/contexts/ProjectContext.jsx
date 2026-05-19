import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const ProjectContext = createContext(null);

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data);
      
      if (data.length === 0) {
        setCurrentProject(null);
        localStorage.removeItem('currentProjectId');
      } else {
        const saved = localStorage.getItem('currentProjectId');
        const found = data.find(p => p._id === saved);
        if (currentProject) {
          const stillExists = data.find(p => p._id === currentProject._id);
          if (!stillExists) setCurrentProject(found || data[0]);
        } else {
          setCurrentProject(found || data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const switchProject = (project) => {
    setCurrentProject(project);
    localStorage.setItem('currentProjectId', project._id);
  };

  return (
    <ProjectContext.Provider value={{ projects, currentProject, loading, fetchProjects, switchProject }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProject must be used within ProjectProvider');
  return context;
};
