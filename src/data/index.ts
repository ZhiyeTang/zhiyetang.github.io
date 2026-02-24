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
    en: 'Computer Vision Algorithm Engineer @ vivo',
    zh: 'vivo 影像算法工程师',
  },
  bio: {
    en: 'Algorithm engineer at vivo, focusing on multimodal large model-based data annotation, on-device visual perception, and model deployment. Previously a postgraduate researcher at Shenzhen University (FMC Lab), working on Deep Reinforcement Learning, Volumetric Video Streaming, and 3D Gaussian Splatting.',
    zh: 'vivo影像规划预研部算法工程师，主要从事基于多模态大模型的数据自动标注、端侧视觉感知模型等技术的预研、开发与部署。此前于深圳大学未来媒体计算研究所（FMC）从事深度强化学习、体积视频流媒体与3D高斯泼溅相关研究。',
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
    title: 'ProGS: Towards Progressive Coding for 3D Gaussian Splatting',
    authors: ['Zhiye Tang', 'Liang Liu', 'Shengxiang Jiao', 'Qiudan Zhang', 'Jianqiang Hou', 'Yong Yang', 'Xu Wang'],
    venue: 'IEEE Transactions on Image Processing (TIP), Under Review',
    year: 2025,
    doi: '',
    abstract: {
      en: 'We propose a progressive coding scheme for 3DGS by organizing scenes into octrees for LoD layering, with multi-granularity optimization and mutual information enhancement. A custom CUDA operator is developed for anchor parent-child retrieval. Achieves over 140x compression with less than 10% SSIM degradation.',
      zh: '提出3DGS的渐进式编码方案，将场景组织成八叉树实现LoD分层，引入多粒度优化与互信息增强。独立开发CUDA算子进行锚点父子关系检索。在代表数据集上实现超过140倍压缩，视觉质量（SSIM）下降低于10%。',
    },
  },
  {
    title: 'GSStream: 3D Gaussian Splatting based Volumetric Scene Streaming System',
    authors: ['Zhiye Tang', 'Qiudan Zhang', 'Lei Zhang', 'Jianqiang Hou', 'Yong Yang', 'Xu Wang'],
    venue: 'IEEE Transactions on Circuits and Systems for Video Technology (TCSVT), Under Review',
    year: 2025,
    doi: '',
    abstract: {
      en: 'We propose GSStream, a volumetric scene streaming system for 3DGS. It integrates collaborative viewport prediction and DRL-based bitrate adaptation to tackle state/action space variability. We built a dataset of 860K+ frames of real user behavior, achieving viewport prediction with <5cm position error and <3° angular error, and 118% average visual quality improvement over existing methods.',
      zh: '提出GSStream体积场景流媒体系统，集成协作视口预测与基于DRL的码率自适应模块。构造了超86万帧真实用户行为数据集，视口预测位置误差小于5cm、角度误差小于3°，码率自适应算法较现有方法平均视觉质量提升118%。',
    },
  },
  {
    title: 'Geometry-Adaptive 3D Convex Polyhedron for Tomographic Reconstruction',
    authors: ['Yaobin Xu', 'Zhiye Tang', 'Liang Zou', 'Xu Wang', 'Rui Li'],
    venue: 'Proceedings of the AAAI Conference on Artificial Intelligence (AAAI), Under Review',
    year: 2025,
    doi: '',
    abstract: {
      en: 'A geometry-adaptive 3D convex polyhedron method for tomographic reconstruction.',
      zh: '一种用于断层重建的几何自适应三维凸多面体方法。',
    },
  },
  {
    title: 'SeCo-GS: Towards Semantic Feature Compression for 3D Gaussian Splatting',
    authors: ['Liang Liu', 'Zhiye Tang', 'Qiudan Zhang', 'Xu Wang'],
    venue: 'ACM Transactions on Multimedia Computing, Communications, and Applications (TOMM), Under Review',
    year: 2025,
    doi: '',
    abstract: {
      en: 'A semantic feature compression method for 3D Gaussian Splatting.',
      zh: '一种面向3D高斯泼溅的语义特征压缩方法。',
    },
  },
  {
    title: 'Eye Fixation and Saliency Field based Greedy Method for Volumetric Video Streaming',
    authors: ['Zhiye Tang', 'Kai Wang', 'Qiudan Zhang', 'Haowen Mo', 'Yelang Gao', 'Lei Zhang', 'Jiali Li', 'Xu Wang'],
    venue: 'IEEE International Symposium on Machine Learning and Media Computing (MLMC) 2025',
    year: 2025,
    doi: 'https://ieeexplore.ieee.org/abstract/document/11189305',
    abstract: {
      en: 'We propose GES, a greedy method for volumetric video streaming that exploits eye fixation data and saliency field to allocate bitrates for tiles decomposed from point cloud scenes under bandwidth constraints. We built a platform collecting 40 user viewing behavior trajectories.',
      zh: '提出GES贪心方法，利用人眼注视数据和显著性场在带宽约束下为点云场景瓦片分配比特率。构建了数据采集平台，积累40条用户观看行为轨迹。',
    },
  },
];

export const experience: Experience[] = [
  {
    company: { en: 'vivo Mobile Communication Co., Ltd.', zh: 'vivo移动通信有限公司' },
    role: { en: 'Computer Vision Algorithm Engineer, Image Planning & Pre-research Dept.', zh: '影像规划预研部 影像算法工程师' },
    period: '2025.05 - Present',
    description: {
      en: 'R&D on multimodal large model-based data auto-annotation, on-device visual perception model development and deployment. Key projects: (1) Dual-device (smart glasses + phone) occlusion detection & segmentation — developed INT8 quantized models via AIMET/QNN for glasses and FP16 single-backbone dual-head models for phone, achieving 97%+ detection accuracy and 86%+ segmentation Soft-IoU, surpassing Meta Ray-Ban AI. (2) AI visual effect recommendation for phone album — deployed GLM-4.1V-9B-Thinking on Kunlun P800 XPU with 30x inference speedup, built 200K image dataset, and implemented XPU-native differentiable sorting operators with 260x speedup over NumPy.',
      zh: '主要从事基于多模态大模型的数据自动标注、端侧视觉感知模型等技术的预研、开发与部署。核心项目：(1) 眼镜-手机双端遮挡检测与分割——使用AIMET/QNN框架开发INT8量化模型（眼镜端）和FP16单骨干双头模型（手机端），检测准确率超97%，分割Soft-IoU超86%，显著超越Meta Ray-Ban AI眼镜。(2) 手机相册AI视效智能推荐——在昆仑芯P800 XPU上部署GLM-4.1V-9B-Thinking实现30倍推理加速，构建20万张图像数据集，实现XPU原生可微排序算子较NumPy取得数百倍加速。',
    },
  },
  {
    company: {
      en: 'Research Institute for Future Media Computing (FMC), Shenzhen University',
      zh: '深圳大学未来媒体计算研究所（FMC）',
    },
    role: { en: 'Postgraduate Researcher', zh: '硕士研究生' },
    period: '2022.09 - 2025.07',
    description: {
      en: 'Research on Deep Reinforcement Learning, Volumetric Video Streaming, and 3D Gaussian Splatting under the supervision of Dr. Xu Wang. First-authored papers on progressive 3DGS coding (ProGS), 3DGS streaming (GSStream), and eye fixation-based streaming optimization. Developed CUDA operators and built large-scale user behavior datasets (860K+ frames).',
      zh: '在王旭博士指导下从事深度强化学习、体积视频流媒体与3D高斯泼溅研究。以第一作者发表了渐进式3DGS编码（ProGS）、体积场景流媒体（GSStream）、基于眼动注视的流媒体优化等论文。开发CUDA算子，构建超过86万帧的大规模用户行为数据集。',
    },
  },
  {
    company: { en: 'ACM Multimedia (ACMMM) 2024', zh: 'ACM多媒体（ACMMM）2024' },
    role: { en: 'Conference Reviewer', zh: '会议审稿人' },
    period: '2024.04',
    description: {
      en: 'Served as a reviewer for ACM Multimedia 2024 conference.',
      zh: '担任ACM Multimedia 2024会议审稿人。',
    },
  },
  {
    company: { en: 'Tencent Game AI Invitational 2022', zh: '2022年腾讯开悟Game AI人工智能邀请赛' },
    role: { en: 'Team Leader', zh: '队长' },
    period: '2022',
    description: {
      en: 'Led a team using PPO-based deep reinforcement learning to train game AI agents. Designed multi-route MoE modules for hero-specific expertise and tuned reward functions. Achieved Diamond-rank level performance, ranking 8th nationally.',
      zh: '带领团队使用基于PPO的深度强化学习算法训练游戏智能体。设计多路MoE模块实现英雄专精，调整奖励函数微调模型。达到星耀段位水平，获得全国第8名。',
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
