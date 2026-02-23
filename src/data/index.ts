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
  name: 'Zhiye TANG',
  title: {
    en: 'Image Algorithm Engineer',
    zh: '影像算法工程师',
  },
  bio: {
    en: 'Passionate about computer vision and image processing. Building intelligent systems that see and understand the world.',
    zh: '专注于计算机视觉与图像处理，致力于构建能够感知和理解世界的智能系统。',
  },
  avatar: '',
};

export const skills: SkillGroup[] = [
  {
    category: {
      en: 'Computer Vision',
      zh: '计算机视觉',
    },
    items: [
      { name: 'Computer Vision', proficiency: 90 },
      { name: 'Image Processing', proficiency: 88 },
      { name: 'Object Detection', proficiency: 85 },
    ],
  },
  {
    category: {
      en: 'Deep Learning',
      zh: '深度学习',
    },
    items: [
      { name: 'Deep Learning', proficiency: 85 },
      { name: 'PyTorch', proficiency: 88 },
      { name: 'TensorFlow', proficiency: 80 },
    ],
  },
  {
    category: {
      en: 'Programming Languages',
      zh: '编程语言',
    },
    items: [
      { name: 'Python', proficiency: 95 },
      { name: 'C++', proficiency: 80 },
      { name: 'TypeScript', proficiency: 82 },
    ],
  },
  {
    category: {
      en: 'Tools & Libraries',
      zh: '工具与库',
    },
    items: [
      { name: 'OpenCV', proficiency: 92 },
      { name: 'NumPy', proficiency: 90 },
      { name: 'CUDA', proficiency: 78 },
    ],
  },
];

export const projects: Project[] = [
  {
    title: {
      en: 'Real-time Object Detection System',
      zh: '实时目标检测系统',
    },
    description: {
      en: 'A high-performance object detection system using YOLOv8 and CUDA optimization for real-time inference on edge devices.',
      zh: '基于YOLOv8和CUDA优化的高性能目标检测系统，支持边缘设备实时推理。',
    },
    tags: ['Python', 'PyTorch', 'CUDA', 'YOLOv8'],
    githubUrl: 'https://github.com/zhiyetang/object-detection',
    demoUrl: 'https://demo.example.com/detection',
  },
  {
    title: {
      en: 'Image Enhancement Pipeline',
      zh: '图像增强处理管道',
    },
    description: {
      en: 'An end-to-end image enhancement pipeline combining traditional image processing and deep learning techniques for low-light and degraded image restoration.',
      zh: '结合传统图像处理和深度学习技术的端到端图像增强管道，用于低光和退化图像恢复。',
    },
    tags: ['C++', 'OpenCV', 'Deep Learning'],
    githubUrl: 'https://github.com/zhiyetang/image-enhancement',
    demoUrl: 'https://demo.example.com/enhancement',
  },
  {
    title: {
      en: 'Semantic Segmentation Framework',
      zh: '语义分割框架',
    },
    description: {
      en: 'A flexible semantic segmentation framework supporting multiple architectures (U-Net, DeepLab, SegFormer) with easy model switching and deployment.',
      zh: '支持多种架构（U-Net、DeepLab、SegFormer）的灵活语义分割框架，易于模型切换和部署。',
    },
    tags: ['Python', 'PyTorch', 'Segmentation'],
    githubUrl: 'https://github.com/zhiyetang/segmentation-framework',
    demoUrl: 'https://demo.example.com/segmentation',
  },
];

export const publications: Publication[] = [
  {
    title: 'Efficient Real-time Object Detection on Edge Devices',
    authors: ['Zhiye TANG', 'John Smith', 'Jane Doe'],
    venue: 'IEEE Conference on Computer Vision and Pattern Recognition',
    year: 2023,
    doi: '10.1109/CVPR.2023.12345',
    abstract: {
      en: 'This paper presents an efficient object detection method optimized for edge devices with limited computational resources. We propose a novel pruning strategy combined with quantization to achieve real-time inference.',
      zh: '本文提出了一种针对计算资源有限的边缘设备优化的高效目标检测方法。我们提出了一种新颖的剪枝策略与量化相结合的方法以实现实时推理。',
    },
  },
  {
    title: 'Deep Learning for Low-Light Image Enhancement',
    authors: ['Zhiye TANG', 'Alice Johnson'],
    venue: 'International Journal of Computer Vision',
    year: 2023,
    doi: '10.1007/s11263-023-01234-5',
    abstract: {
      en: 'We propose a deep learning approach for enhancing low-light images while preserving fine details and reducing noise. Our method outperforms traditional methods on multiple benchmarks.',
      zh: '我们提出了一种深度学习方法用于增强低光图像，同时保留细节并降低噪声。我们的方法在多个基准上优于传统方法。',
    },
  },
  {
    title: 'Semantic Segmentation with Transformer Architecture',
    authors: ['Zhiye TANG', 'Bob Wilson', 'Carol White', 'David Brown'],
    venue: 'IEEE Transactions on Pattern Analysis and Machine Intelligence',
    year: 2024,
    doi: '10.1109/TPAMI.2024.56789',
    abstract: {
      en: 'This work explores the application of transformer architectures to semantic segmentation tasks. We demonstrate that transformers can achieve state-of-the-art results with improved efficiency.',
      zh: '本工作探索了变换器架构在语义分割任务中的应用。我们证明了变换器可以以改进的效率实现最先进的结果。',
    },
  },
];

export const experience: Experience[] = [
  {
    company: {
      en: 'Tech Vision Inc.',
      zh: '科技视觉公司',
    },
    role: {
      en: 'Senior Image Algorithm Engineer',
      zh: '高级影像算法工程师',
    },
    period: '2022 - Present',
    description: {
      en: 'Led the development of real-time object detection systems and image enhancement pipelines. Optimized algorithms for edge device deployment achieving 10x performance improvement.',
      zh: '领导实时目标检测系统和图像增强管道的开发。优化了边缘设备部署的算法，性能提升10倍。',
    },
  },
  {
    company: {
      en: 'AI Research Lab',
      zh: '人工智能研究实验室',
    },
    role: {
      en: 'Computer Vision Engineer',
      zh: '计算机视觉工程师',
    },
    period: '2020 - 2022',
    description: {
      en: 'Developed semantic segmentation models and conducted research on deep learning optimization. Published 3 papers in top-tier conferences.',
      zh: '开发了语义分割模型并进行了深度学习优化研究。在顶级会议上发表了3篇论文。',
    },
  },
];

export const education: Education[] = [
  {
    school: {
      en: 'University of Technology',
      zh: '科技大学',
    },
    degree: {
      en: 'Master of Science in Computer Science',
      zh: '计算机科学硕士',
    },
    period: '2018 - 2020',
    gpa: '3.8/4.0',
  },
  {
    school: {
      en: 'National University',
      zh: '国立大学',
    },
    degree: {
      en: 'Bachelor of Science in Computer Science',
      zh: '计算机科学学士',
    },
    period: '2014 - 2018',
    gpa: '3.7/4.0',
  },
];

export const contact: ContactInfo = {
  email: 'jeric@example.com',
  github: 'https://github.com/zhiyetang',
  linkedin: 'https://linkedin.com/in/zhiyetang',
};
