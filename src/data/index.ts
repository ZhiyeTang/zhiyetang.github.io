import type {
  PersonalInfo,
  SkillGroup,
  Project,
  Publication,
  Experience,
  Education,
  ContactInfo,
} from '../types';

export const personalInfo: PersonalInfo = {
  name: 'Zhiye Tang',
  title: {
    en: 'Postgraduate Researcher',
    zh: '硕士研究生',
  },
  bio: {
    en: 'Postgraduate student at the Research Institute for Future Media Computing (FMC), Shenzhen University, under the supervision of Dr. Xu Wang. Working in the field of Deep Reinforcement Learning and Volumetric Video Streaming.',
    zh: '深圳大学未来媒体计算研究所（FMC）硕士研究生，导师为王旭博士。研究方向为深度强化学习与体积视频流媒体。',
  },
  avatar: '',
};

export const skills: SkillGroup[] = [
  {
    category: { en: 'Research Areas', zh: '研究方向' },
    items: [
      { name: 'Deep Reinforcement Learning', proficiency: 90 },
      { name: 'Volumetric Video Streaming', proficiency: 92 },
      { name: '3D Gaussian Splatting', proficiency: 85 },
    ],
  },
  {
    category: { en: 'Multimedia & Streaming', zh: '多媒体与流媒体' },
    items: [
      { name: 'Point Cloud Processing', proficiency: 88 },
      { name: 'Viewport Prediction', proficiency: 85 },
      { name: 'Bitrate Adaptation', proficiency: 88 },
    ],
  },
  {
    category: { en: 'Programming & Tools', zh: '编程与工具' },
    items: [
      { name: 'Python', proficiency: 92 },
      { name: 'PyTorch', proficiency: 88 },
      { name: 'C/C++', proficiency: 80 },
    ],
  },
  {
    category: { en: 'Computer Vision', zh: '计算机视觉' },
    items: [
      { name: 'Eye Tracking & Saliency', proficiency: 85 },
      { name: 'Scene Reconstruction', proficiency: 82 },
      { name: 'User Behavior Analysis', proficiency: 86 },
    ],
  },
];

export const projects: Project[] = [];

export const publications: Publication[] = [
  {
    title: 'Eye Fixation and Saliency Field based Greedy Method for Volumetric Video Streaming',
    authors: ['Zhiye Tang', 'Kai Wang', 'Qiudan Zhang', 'Haowen Mo', 'Yelang Gao', 'Lei Zhang', 'Xu Wang'],
    venue: 'Under Review',
    year: 2024,
    doi: '',
    abstract: {
      en: 'In this paper, we propose a greedy method named GES tailored for volumetric video streaming, which exploits human eye fixation data and saliency field to allocate bitrates for different tiles decomposed from point cloud scenes under a given bandwidth constraint. Moreover, to evaluate the performance of GES, we construct a platform to collect user head posture and eye fixation data, accumulating 40 user viewing behavior trajectories in total.',
      zh: '本文提出了一种名为GES的贪心方法，专为体积视频流媒体设计，利用人眼注视数据和显著性场在给定带宽约束下为点云场景分解的不同瓦片分配比特率。此外，为了评估GES的性能，我们构建了一个平台来收集用户头部姿态和眼动注视数据，共积累了40条用户观看行为轨迹。',
    },
  },
  {
    title: 'GSStream: 3D Gaussian Splatting based Volumetric Scene Streaming System',
    authors: ['Zhiye Tang', 'Qiudan Zhang', 'Kai Wang', 'Lei Zhang', 'Xu Wang', 'Jianmin Jiang'],
    venue: 'Under Review',
    year: 2024,
    doi: '',
    abstract: {
      en: 'In this paper, we propose GSStream, a novel volumetric scene streaming system to support 3DGS data format. Specifically, GSStream integrates a collaborative viewport prediction module to better predict users\' future behaviors by learning collaborative priors and historical priors from multiple users and users\' viewport sequences, and a DRL-based bitrate adaptation module to tackle the state and action space variability challenge of the bitrate adaptation problem, achieving efficient 3DGS content delivery. Besides, we first build a user viewport trajectory dataset for 3DGS scenes to support the training and streaming simulation.',
      zh: '本文提出了GSStream，一种新型体积场景流媒体系统，支持3DGS数据格式。具体而言，GSStream集成了协作视口预测模块，通过学习多用户的协作先验和用户视口序列的历史先验来更好地预测用户未来行为，以及基于DRL的比特率自适应模块来解决比特率自适应问题中状态和动作空间可变性的挑战，实现高效的3DGS内容传输。此外，我们首次构建了3DGS场景的用户视口轨迹数据集，以支持训练和流媒体仿真。',
    },
  },
];

export const experience: Experience[] = [
  {
    company: {
      en: 'Research Institute for Future Media Computing (FMC), Shenzhen University',
      zh: '深圳大学未来媒体计算研究所（FMC）',
    },
    role: { en: 'Postgraduate Researcher', zh: '硕士研究生' },
    period: '2022.09 - 2025.07',
    description: {
      en: 'Conducting research on Deep Reinforcement Learning and Volumetric Video Streaming under the supervision of Dr. Xu Wang. Published papers on eye fixation-based streaming optimization and 3D Gaussian Splatting streaming systems.',
      zh: '在王旭博士指导下从事深度强化学习与体积视频流媒体研究。发表了关于基于眼动注视的流媒体优化和3D高斯泼溅流媒体系统的论文。',
    },
  },
  {
    company: {
      en: 'ACM Multimedia (ACMMM) 2024',
      zh: 'ACM多媒体（ACMMM）2024',
    },
    role: { en: 'Conference Reviewer', zh: '会议审稿人' },
    period: '2024.04',
    description: {
      en: 'Served as a reviewer for ACM Multimedia 2024 conference.',
      zh: '担任ACM Multimedia 2024会议审稿人。',
    },
  },
];

export const education: Education[] = [
  {
    school: { en: 'Shenzhen University', zh: '深圳大学' },
    degree: { en: 'Master of Engineering - MEng, Computer Software Engineering', zh: '工学硕士，计算机软件工程' },
    period: '2022.09 - 2025.07',
    gpa: '',
  },
  {
    school: { en: 'City University of Hong Kong', zh: '香港城市大学' },
    degree: { en: 'Visiting Research Student, Computer Science', zh: '访问研究生，计算机科学' },
    period: '2024.12 - 2025.02',
    gpa: '',
  },
  {
    school: { en: 'Shenzhen University', zh: '深圳大学' },
    degree: { en: 'Bachelor of Engineering - BE, Mechatronics, Robotics, and Automation Engineering', zh: '工学学士，机电、机器人与自动化工程' },
    period: '2018.09 - 2022.07',
    gpa: '',
  },
];

export const contact: ContactInfo = {
  email: 'zhiyetang2022@foxmail.com',
  github: 'https://github.com/ZhiyeTang',
  linkedin: 'https://www.linkedin.com/in/zhiye-tang-05316a376/',
};
