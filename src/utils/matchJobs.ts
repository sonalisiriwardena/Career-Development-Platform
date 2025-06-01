const jobs = [
  {
    title: "Frontend Developer",
    skills: ["React", "HTML", "CSS", "JavaScript"],
    experience: "1-3 years",
    location: "Remote",
    industry: "Software Development",
    applyLink: "https://example.com/frontend"
  },
  {
    title: "Data Analyst",
    skills: ["Python", "SQL", "Tableau"],
    experience: "2-5 years",
    location: "On-site",
    industry: "Finance",
    applyLink: "https://example.com/data-analyst"
  }
];

export function calculateMatchScore(user: any, job: any) {
  let score = 0;
  // Skills
  const userSkills = (user.skills || '').split(',').map((s: string) => s.trim().toLowerCase());
  const jobSkills = job.skills.map((s: string) => s.toLowerCase());
  const skillMatches = userSkills.filter((s: string) => jobSkills.includes(s)).length;
  score += skillMatches * 20;

  // Experience
  if (job.experience.includes(user.years)) score += 20;

  // Location
  if (user.location && job.location.toLowerCase() === user.location.toLowerCase()) score += 20;

  // Industry
  if (user.industry && job.industry.toLowerCase() === user.industry.toLowerCase()) score += 20;

  return Math.min(score, 100);
}

export function getTopMatches(user: any, topN = 3) {
  const scored = jobs.map(job => ({
    ...job,
    score: calculateMatchScore(user, job)
  }));
  return scored.sort((a, b) => b.score - a.score).slice(0, topN);
} 