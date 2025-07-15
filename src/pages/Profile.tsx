import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

interface ProfileState {
  firstName?: string;
  lastName?: string;
  email?: string;
  profile?: {
    title?: string;
    bio?: string;
    skills?: string[];
    experience?: Array<{
      title: string;
      company: string;
      startDate: string;
      endDate?: string;
      current: boolean;
      description: string;
    }>;
    education?: Array<{
      school: string;
      degree: string;
      field: string;
      startDate: string;
      endDate?: string;
      current: boolean;
    }>;
  };
}

interface ExperienceForm {
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface EducationForm {
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  current: boolean;
}

export default function Profile() {
  const { user, isLoading: loading, error, updateProfile } = useAuthStore();
  const [profile, setProfile] = useState<ProfileState>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    profile: {
      title: user?.profile?.title || '',
      bio: user?.profile?.bio || '',
      skills: user?.profile?.skills || [],
      experience: user?.profile?.experience || [],
      education: user?.profile?.education || []
    }
  });
  const [updating, setUpdating] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [showExperienceForm, setShowExperienceForm] = useState(false);
  const [showEducationForm, setShowEducationForm] = useState(false);
  const [experienceForm, setExperienceForm] = useState<ExperienceForm>({
    title: '',
    company: '',
    startDate: '',
    endDate: '',
    current: false,
    description: ''
  });
  const [educationForm, setEducationForm] = useState<EducationForm>({
    school: '',
    degree: '',
    field: '',
    startDate: '',
    endDate: '',
    current: false
  });

  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profile: {
          title: user.profile?.title || '',
          bio: user.profile?.bio || '',
          skills: user.profile?.skills || [],
          experience: user.profile?.experience || [],
          education: user.profile?.education || []
        }
      });
    }
  }, [user]);

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    try {
      setUpdating(true);
      
      // Clean and validate the profile data before sending
      const cleanProfile = {
        ...profile,
        profile: {
          ...profile.profile,
          skills: profile.profile?.skills?.filter(skill => skill.trim() !== '') || [],
          experience: profile.profile?.experience?.filter(exp => 
            exp.title.trim() !== '' && exp.company.trim() !== '' && exp.startDate
          ) || [],
          education: profile.profile?.education?.filter(edu => 
            edu.school.trim() !== '' && edu.degree.trim() !== '' && edu.field.trim() !== '' && edu.startDate
          ) || []
        }
      };
      
      await updateProfile(cleanProfile);
      alert('Profile updated successfully!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.error || 'Error updating profile';
      alert(errorMessage);
    } finally {
      setUpdating(false);
    }
  }

  const addSkill = () => {
    if (newSkill.trim() && !profile.profile?.skills?.includes(newSkill.trim())) {
      setProfile(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          skills: [...(prev.profile?.skills || []), newSkill.trim()]
        }
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setProfile(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        skills: prev.profile?.skills?.filter(skill => skill !== skillToRemove) || []
      }
    }));
  };

  const addExperience = () => {
    if (experienceForm.title && experienceForm.company && experienceForm.startDate) {
      setProfile(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          experience: [...(prev.profile?.experience || []), { ...experienceForm }]
        }
      }));
      setExperienceForm({
        title: '',
        company: '',
        startDate: '',
        endDate: '',
        current: false,
        description: ''
      });
      setShowExperienceForm(false);
    }
  };

  const removeExperience = (index: number) => {
    setProfile(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        experience: prev.profile?.experience?.filter((_, i) => i !== index) || []
      }
    }));
  };

  const addEducation = () => {
    if (educationForm.school && educationForm.degree && educationForm.startDate) {
      setProfile(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          education: [...(prev.profile?.education || []), { ...educationForm }]
        }
      }));
      setEducationForm({
        school: '',
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
        current: false
      });
      setShowEducationForm(false);
    }
  };

  const removeEducation = (index: number) => {
    setProfile(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        education: prev.profile?.education?.filter((_, i) => i !== index) || []
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center text-gray-500 py-8">
        Please sign in to view your profile
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6">Profile</h2>
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleUpdateProfile} className="space-y-8">
          {/* Basic Information */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={profile.firstName || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, firstName: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={profile.lastName || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, lastName: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={profile.email || ''}
                disabled
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
              />
            </div>
          </div>

          {/* Professional Information */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold mb-4">Professional Information</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Professional Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={profile.profile?.title || ''}
                  onChange={(e) => setProfile(prev => ({
                    ...prev,
                    profile: { ...prev.profile, title: e.target.value }
                  }))}
                  placeholder="e.g., Senior Software Engineer"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                  Bio
                </label>
                <textarea
                  id="bio"
                  rows={4}
                  value={profile.profile?.bio || ''}
                  onChange={(e) => setProfile(prev => ({
                    ...prev,
                    profile: { ...prev.profile, bio: e.target.value }
                  }))}
                  placeholder="Tell us about yourself..."
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold mb-4">Skills</h3>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill"
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.profile?.skills?.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Experience */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold mb-4">Experience</h3>
            <div className="space-y-4">
              {profile.profile?.experience?.map((exp, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold">{exp.title}</h4>
                      <p className="text-gray-600">{exp.company}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(exp.startDate).toLocaleDateString()} - 
                        {exp.current ? ' Present' : exp.endDate ? ` ${new Date(exp.endDate).toLocaleDateString()}` : ''}
                      </p>
                      <p className="text-sm mt-2">{exp.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeExperience(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              
              {showExperienceForm ? (
                <div className="border rounded-lg p-4 bg-blue-50">
                  <h4 className="font-semibold mb-3">Add Experience</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Job Title</label>
                      <input
                        type="text"
                        value={experienceForm.title}
                        onChange={(e) => setExperienceForm(prev => ({ ...prev, title: e.target.value }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Company</label>
                      <input
                        type="text"
                        value={experienceForm.company}
                        onChange={(e) => setExperienceForm(prev => ({ ...prev, company: e.target.value }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Start Date</label>
                      <input
                        type="date"
                        value={experienceForm.startDate}
                        onChange={(e) => setExperienceForm(prev => ({ ...prev, startDate: e.target.value }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">End Date</label>
                      <input
                        type="date"
                        value={experienceForm.endDate}
                        onChange={(e) => setExperienceForm(prev => ({ ...prev, endDate: e.target.value }))}
                        disabled={experienceForm.current}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={experienceForm.current}
                        onChange={(e) => setExperienceForm(prev => ({ ...prev, current: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">I currently work here</span>
                    </label>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={experienceForm.description}
                      onChange={(e) => setExperienceForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={addExperience}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Add Experience
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowExperienceForm(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowExperienceForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Add Experience
                </button>
              )}
            </div>
          </div>

          {/* Education */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold mb-4">Education</h3>
            <div className="space-y-4">
              {profile.profile?.education?.map((edu, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold">{edu.degree}</h4>
                      <p className="text-gray-600">{edu.school}</p>
                      <p className="text-sm text-gray-500">{edu.field}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(edu.startDate).toLocaleDateString()} - 
                        {edu.current ? ' Present' : edu.endDate ? ` ${new Date(edu.endDate).toLocaleDateString()}` : ''}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeEducation(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              
              {showEducationForm ? (
                <div className="border rounded-lg p-4 bg-blue-50">
                  <h4 className="font-semibold mb-3">Add Education</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">School</label>
                      <input
                        type="text"
                        value={educationForm.school}
                        onChange={(e) => setEducationForm(prev => ({ ...prev, school: e.target.value }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Degree</label>
                      <input
                        type="text"
                        value={educationForm.degree}
                        onChange={(e) => setEducationForm(prev => ({ ...prev, degree: e.target.value }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Field of Study</label>
                      <input
                        type="text"
                        value={educationForm.field}
                        onChange={(e) => setEducationForm(prev => ({ ...prev, field: e.target.value }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Start Date</label>
                      <input
                        type="date"
                        value={educationForm.startDate}
                        onChange={(e) => setEducationForm(prev => ({ ...prev, startDate: e.target.value }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">End Date</label>
                      <input
                        type="date"
                        value={educationForm.endDate}
                        onChange={(e) => setEducationForm(prev => ({ ...prev, endDate: e.target.value }))}
                        disabled={educationForm.current}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={educationForm.current}
                        onChange={(e) => setEducationForm(prev => ({ ...prev, current: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">I am currently studying here</span>
                    </label>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={addEducation}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Add Education
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEducationForm(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowEducationForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Add Education
                </button>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={updating}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 font-medium"
          >
            {updating ? 'Updating Profile...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}