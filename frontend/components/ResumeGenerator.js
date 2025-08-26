'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Download, FileText, Plus, Trash2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ResumeGenerator = () => {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [template, setTemplate] = useState('modern');

  const [formData, setFormData] = useState({
    personal_info: {
      name: user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : '',
      email: user?.email || '',
      phone: user?.phone || '',
      location: '',
      title: '',
      summary: '',
      linkedin: '',
      github: '',
      portfolio: '',
    },
    education: [
      { institution: '', degree: '', field: '', graduation_year: '', gpa: '', location: '', description: '' },
    ],
    experience: [
      { company: '', position: '', start_date: '', end_date: '', location: '', description: '', current: false },
    ],
    skills: [
      { name: '', level: 'Intermediate' },
    ],
    projects: [
      { name: '', description: '', technologies: [], github_url: '', live_url: '' },
    ],
  });

  const handleInputChange = (section, index, field, value) => {
    setFormData((prev) => {
      const newData = { ...prev };
      if (index !== undefined) {
        newData[section][index][field] = value;
      } else {
        newData[section][field] = value;
      }
      return newData;
    });
  };

  const addItem = (section) => {
    setFormData((prev) => {
      const newData = { ...prev };
      const templateItem = {
        education: { institution: '', degree: '', field: '', graduation_year: '', gpa: '', location: '', description: '' },
        experience: { company: '', position: '', start_date: '', end_date: '', location: '', description: '', current: false },
        skills: { name: '', level: 'Intermediate' },
        projects: { name: '', description: '', technologies: [], github_url: '', live_url: '' },
      };
      newData[section].push(templateItem[section]);
      return newData;
    });
  };

  const removeItem = (section, index) => {
    if (formData[section].length > 1) {
      setFormData((prev) => {
        const newData = { ...prev };
        newData[section].splice(index, 1);
        return newData;
      });
    }
  };

  const handleGenerateResume = async () => {
    setIsGenerating(true);
    try {
      const response = await axios.post(
        'http://localhost:8000/api/auth/generate-resume/',
        { ...formData, template },
        { responseType: 'blob' }
      );

      // Download the blob as a file
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const cleanName = formData.personal_info.name.replace(/\s+/g, '_');
      link.href = url;
      link.download = `resume_${cleanName}_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Resume generated successfully!');
    } catch (error) {
      console.error('Error generating resume:', error);
      toast.error('Failed to generate resume. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const templates = [
    { id: 'modern', name: 'Modern Clean', description: 'Professional layout with modern styling' },
    { id: 'professional', name: 'Corporate Professional', description: 'Traditional format for corporate roles' },
    { id: 'creative', name: 'Creative Design', description: 'Modern design for creative roles' },
  ];

  const TemplatePreview = ({ template, isSelected, onSelect }) => {
  const previewStyles = {
    modern: 'bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200',
    professional: 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200',
    creative: 'bg-gradient-to-br from-purple-50 to-pink-100 border-purple-200'
  };

  return (
    <div
      onClick={onSelect}
      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
        isSelected
          ? 'border-primary dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
      }`}
    >
      <div className={`h-32 rounded-md ${previewStyles[template.id]} mb-3 flex items-center justify-center`}>
        <FileText className="h-8 w-8 text-primary dark:text-blue-400" />
      </div>
      <h4 className="font-semibold text-gray-800 dark:text-white">{template.name}</h4>
      <p className="text-sm text-gray-600 dark:text-gray-400">{template.description}</p>
    </div>
  );
};

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Resume Generator</h2>



      {/* Template Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Choose Template</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              onClick={() => setTemplate(tpl.id)}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                template === tpl.id
                  ? 'border-primary dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              <FileText className="h-8 w-8 text-primary dark:text-blue-400 mb-2" />
              <h4 className="font-semibold text-gray-800 dark:text-white">{tpl.name}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{tpl.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="flex space-x-8">
          {['personal', 'education', 'experience', 'skills', 'projects'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-primary dark:border-blue-400 text-primary dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </nav>
      </div>

      {/* Form Sections */}
      <div className="max-h-96 overflow-y-auto mb-6 space-y-6">
        {/* Personal Info */}
        {activeTab === 'personal' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['name', 'title', 'email', 'phone', 'location', 'summary'].map((field, idx) => (
              <div key={field} className={idx >= 4 ? 'md:col-span-2' : ''}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ')}
                </label>
                {field === 'summary' ? (
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={formData.personal_info[field]}
                    onChange={(e) => handleInputChange('personal_info', undefined, field, e.target.value)}
                  />
                ) : (
                  <input
                    type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={formData.personal_info[field]}
                    onChange={(e) => handleInputChange('personal_info', undefined, field, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {activeTab === 'education' && (
          <div className="space-y-4">
            {formData.education.map((edu, idx) => (
              <div key={idx} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-gray-800 dark:text-white">Education #{idx + 1}</h4>
                  <button
                    onClick={() => removeItem('education', idx)}
                    className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {['institution', 'degree', 'field', 'graduation_year', 'gpa', 'location', 'description'].map((fld) => (
                  <div key={fld} className="md:grid md:grid-cols-2 gap-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {fld.charAt(0).toUpperCase() + fld.slice(1).replace('_', ' ')}
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={edu[fld]}
                      onChange={(e) => handleInputChange('education', idx, fld, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            ))}
            <button
              onClick={() => addItem('education')}
              className="flex items-center text-primary dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Education
            </button>
          </div>
        )}

        {/* Experience */}
        {activeTab === 'experience' && (
          <div className="space-y-4">
            {formData.experience.map((exp, idx) => (
              <div key={idx} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-gray-800 dark:text-white">Experience #{idx + 1}</h4>
                  <button
                    onClick={() => removeItem('experience', idx)}
                    className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {['company', 'position', 'start_date', 'end_date', 'location', 'description'].map((fld) => (
                  <div key={fld} className="md:grid md:grid-cols-2 gap-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {fld.charAt(0).toUpperCase() + fld.slice(1).replace('_', ' ')}
                    </label>
                    <input
                      type={fld.includes('date') ? 'date' : 'text'}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={exp[fld]}
                      onChange={(e) => handleInputChange('experience', idx, fld, e.target.value)}
                    />
                  </div>
                ))}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exp.current}
                    onChange={(e) => handleInputChange('experience', idx, 'current', e.target.checked)}
                    className="mr-2"
                  />
                  <label className="text-sm text-gray-700 dark:text-gray-300">Present</label>
                </div>
              </div>
            ))}
            <button
              onClick={() => addItem('experience')}
              className="flex items-center text-primary dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Experience
            </button>
          </div>
        )}

        {/* Skills */}
        {activeTab === 'skills' && (
          <div className="space-y-4">
            {formData.skills.map((skill, idx) => (
              <div key={idx} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-gray-800 dark:text-white">Skill #{idx + 1}</h4>
                  <button
                    onClick={() => removeItem('skills', idx)}
                    className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="md:grid md:grid-cols-2 gap-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={skill.name}
                    onChange={(e) => handleInputChange('skills', idx, 'name', e.target.value)}
                  />
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Level</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={skill.level}
                    onChange={(e) => handleInputChange('skills', idx, 'level', e.target.value)}
                  >
                    {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                      <option key={lvl} value={lvl}>{lvl}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
            <button
              onClick={() => addItem('skills')}
              className="flex items-center text-primary dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Skill
            </button>
          </div>
        )}

        {/* Projects */}
        {activeTab === 'projects' && (
          <div className="space-y-4">
            {formData.projects.map((project, idx) => (
              <div key={idx} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-gray-800 dark:text-white">Project #{idx + 1}</h4>
                  <button
                    onClick={() => removeItem('projects', idx)}
                    className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {['name', 'description', 'github_url', 'live_url'].map((fld) => (
                  <div key={fld} className="md:grid md:grid-cols-2 gap-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {fld.charAt(0).toUpperCase() + fld.slice(1).replace('_', ' ')}
                    </label>
                    <input
                      type={fld.includes('url') ? 'url' : 'text'}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={project[fld]}
                      onChange={(e) => handleInputChange('projects', idx, fld, e.target.value)}
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Technologies (comma-separated)</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={project.technologies.join(', ')}
                    onChange={(e) =>
                      handleInputChange(
                        'projects',
                        idx,
                        'technologies',
                        e.target.value.split(',').map((t) => t.trim())
                      )
                    }
                  />
                </div>
              </div>
            ))}
            <button
              onClick={() => addItem('projects')}
              className="flex items-center text-primary dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Project
            </button>
          </div>
        )}
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerateResume}
        disabled={isGenerating}
        className="w-full bg-primary dark:bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-700 transition-colors font-medium flex items-center justify-center disabled:opacity-50"
      >
        {isGenerating ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Generating Resume...
          </>
        ) : (
          <>
            <Download className="h-5 w-5 mr-2" />
            Generate &amp; Download Resume
          </>
        )}
      </button>
    </div>
  );
};

export default ResumeGenerator;
