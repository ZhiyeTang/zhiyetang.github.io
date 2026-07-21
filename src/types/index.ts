export interface BilingualText {
  en: string;
  zh: string;
}

export interface PersonalInfo {
  name: string;
  title: BilingualText;
  bio: BilingualText;
  avatar: string;
}

export interface Skill {
  name: string;
  proficiency: number;
}

export interface SkillGroup {
  category: BilingualText;
  items: Skill[];
}

export interface Project {
  title: BilingualText;
  description: BilingualText;
  tags: string[];
  githubUrl: string;
  demoUrl: string;
}

export interface Publication {
  title: string;
  authors: string[];
  venue: string;
  year: number;
  doi: string;
  abstract: BilingualText;
}

export interface Patent {
  title: BilingualText;
  inventors: string[];
  patentNumber: string;
  description: BilingualText;
}

export interface Experience {
  company: BilingualText;
  role: BilingualText;
  period: string;
  description: BilingualText;
  logo?: string;
}

export interface Education {
  school: BilingualText;
  degree: BilingualText;
  period: string;
  gpa: string;
  logo?: string;
}

export interface ContactInfo {
  email: string;
  github: string;
  linkedin: string;
}
