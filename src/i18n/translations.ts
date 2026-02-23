export const translations = {
  en: {
    // Navbar
    nav_about: 'About',
    nav_skills: 'Skills',
    nav_projects: 'Projects',
    nav_publications: 'Publications',
    nav_experience: 'Experience',
    nav_education: 'Education',
    nav_contact: 'Contact',
    // Hero
    hero_greeting: 'Hi, I\'m',
    hero_title: 'Postgraduate Researcher',
    hero_bio: 'Working in the field of Deep Reinforcement Learning and Volumetric Video Streaming at Shenzhen University.',
    hero_cta_projects: 'View Publications',
    hero_cta_contact: 'Contact Me',
    hero_scroll: 'Scroll Down',
    // Sections
    section_skills: 'Skills',
    section_projects: 'Projects',
    section_publications: 'Publications',
    section_experience: 'Experience',
    section_education: 'Education',
    section_contact: 'Contact',
    // Skills
    skills_subtitle: 'Technologies and tools I work with',
    // Projects
    projects_subtitle: 'Some things I\'ve built',
    projects_github: 'GitHub',
    projects_demo: 'Demo',
    // Publications
    publications_subtitle: 'Academic research and papers',
    publications_abstract: 'Abstract',
    publications_show_abstract: 'Show Abstract',
    publications_hide_abstract: 'Hide Abstract',
    // Experience
    experience_subtitle: 'My professional journey',
    // Education
    education_subtitle: 'Academic background',
    education_gpa: 'GPA',
    // Contact
    contact_subtitle: 'Get in touch',
    contact_email: 'Email',
    contact_github: 'GitHub',
    contact_linkedin: 'LinkedIn',
  },
  zh: {
    // Navbar
    nav_about: '关于',
    nav_skills: '技能',
    nav_projects: '项目',
    nav_publications: '发表',
    nav_experience: '经历',
    nav_education: '教育',
    nav_contact: '联系',
    // Hero
    hero_greeting: '你好，我是',
    hero_title: '硕士研究生',
    hero_bio: '深圳大学未来媒体计算研究所，研究方向为深度强化学习与体积视频流媒体。',
    hero_cta_projects: '查看发表',
    hero_cta_contact: '联系我',
    hero_scroll: '向下滚动',
    // Sections
    section_skills: '技能',
    section_projects: '项目',
    section_publications: '学术发表',
    section_experience: '经历',
    section_education: '教育背景',
    section_contact: '联系方式',
    // Skills
    skills_subtitle: '我使用的技术和工具',
    // Projects
    projects_subtitle: '我构建的一些项目',
    projects_github: 'GitHub',
    projects_demo: '演示',
    // Publications
    publications_subtitle: '学术研究与论文',
    publications_abstract: '摘要',
    publications_show_abstract: '展开摘要',
    publications_hide_abstract: '收起摘要',
    // Experience
    experience_subtitle: '我的经历',
    // Education
    education_subtitle: '学术背景',
    education_gpa: '绩点',
    // Contact
    contact_subtitle: '与我联系',
    contact_email: '邮箱',
    contact_github: 'GitHub',
    contact_linkedin: 'LinkedIn',
  },
}

export type TranslationKey = keyof typeof translations.en
