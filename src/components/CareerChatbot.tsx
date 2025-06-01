import React, { useState, useRef, useEffect } from 'react';
import { getTopMatches } from '../utils/matchJobs';

const chatSteps = [
  { question: "Hi there! 👋 I'm your career assistant. What's your name?", key: "name" },
  { question: "What's your email? (optional)", key: "email", optional: true },
  { question: "What technical or soft skills do you have? (comma separated)", key: "skills" },
  { question: "Do you specialize in any programming languages, tools, or frameworks?", key: "specialization" },
  { question: "How many years of experience do you have in your main field?", key: "years" },
  { question: "What type of job are you looking for?", key: "job_type", options: ["Remote", "On-site", "Freelance"] },
  { question: "What industries or domains interest you the most?", key: "industry" },
  { question: "Preferred job roles?", key: "roles" },
  { question: "Any preferred job locations?", key: "location", optional: true },
  { question: "What's your expected salary range?", key: "salary", optional: true }
];

export default function CareerChatbot() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [input, setInput] = useState('');
  const [matches, setMatches] = useState([]);
  const chatContainerRef = useRef(null);

  // Auto scroll to bottom when new messages appear
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [answers, step]);

  const handleSend = () => {
    if (!input && !chatSteps[step].optional) return;
    setAnswers((prev) => ({ ...prev, [chatSteps[step].key]: input }));
    setInput('');
    if (step < chatSteps.length - 1) {
      setStep(step + 1);
    } else {
      const topMatches = getTopMatches({ ...answers, [chatSteps[step].key]: input });
      setMatches(topMatches);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-[600px]">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 py-4 flex-shrink-0">
        <h2 className="text-center text-white text-2xl font-bold">CareerConnect</h2>
      </div>
      
      <div className="p-6 flex-1 flex flex-col overflow-hidden">
        {/* Chat container with scrollbar */}
        <div 
          ref={chatContainerRef}
          className="space-y-4 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pr-2"
        >
          {Object.entries(answers).map(([key, value], idx) => (
            <div key={key} className="bg-gray-50 p-3 rounded-lg">
              <div className="font-medium text-gray-700">{chatSteps[idx].question}</div>
              <div className="text-blue-600 mt-1">{value}</div>
            </div>
          ))}
          
          {matches.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Top Job Matches for You:</h3>
              
              <div className="space-y-4">
                {matches.map((job) => (
                  <div key={job.title} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-gray-900">{job.title}</h4>
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{job.score}% match</span>
                    </div>
                    
                    <div className="mt-1 text-gray-600 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      {job.location}
                    </div>
                    
                    <div className="mt-2 text-gray-600">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2a1 1 0 00-1-1H7a1 1 0 00-1 1v2a1 1 0 01-1 1H3a1 1 0 01-1-1V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                        </svg>
                        Industry: {job.industry}
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <span className="text-sm text-gray-500">Skills:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {job.skills.map((skill) => (
                          <span key={skill} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <a 
                      href={job.applyLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-3 inline-block px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
                    >
                      Apply Now
                    </a>
                  </div>
                ))}
              </div>
              
              {answers.email && (
                <div className="mt-6">
                  <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                    <span className="flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      Send more jobs to my email
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Input area - fixed at bottom */}
        {matches.length === 0 && (
          <div className="bg-blue-50 p-4 rounded-lg mt-4 flex-shrink-0">
            <div className="font-medium text-gray-800 mb-2">{chatSteps[step].question}</div>
            
            {chatSteps[step].options ? (
              <div className="flex flex-wrap gap-2 mt-3">
                {chatSteps[step].options.map(opt => (
                  <button 
                    key={opt} 
                    onClick={() => { setInput(opt); handleSend(); }} 
                    className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-full transition-colors"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Type your answer..."
                />
                <button 
                  onClick={handleSend} 
                  className="mt-3 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center"
                >
                  <span>Send</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}