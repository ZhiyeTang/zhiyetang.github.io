import type {
  PersonalInfo,
  SkillGroup,
  Project,
  Publication,
  Patent,
  Experience,
  Education,
  ContactInfo,
} from '../types';

export const personalInfo: PersonalInfo = {
  name: 'Zhiye Tang',
  title: {
    en: 'Image Algorithm Engineer @ vivo',
    zh: 'vivo 影像算法工程师',
  },
  bio: {
    en: 'Image algorithm engineer at vivo, focusing on multimodal large model-based data annotation, on-device visual perception, and model deployment. Previously a postgraduate research student at Shenzhen University (FMC Lab), working on Progressive Coding and Efficient Transmission for 3D Gaussian Splatting.',
    zh: 'vivo影像规划预研部算法工程师，主要从事基于多模态大模型的数据自动标注、端侧视觉感知模型等技术的预研、开发与部署。此前于深圳大学未来媒体计算研究所（FMC）攻读硕士研究生，研究方向为三维高斯泼溅数据的渐进式编码与高效传输。',
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
    authors: ['Zhiye Tang', 'Lingzhuo Liu', 'Shengjie Jiao', 'Qiudan Zhang', 'Junhui Hou', 'Yong Yang', 'Xu Wang'],
    venue: 'arXiv',
    year: 2026,
    doi: 'https://arxiv.org/abs/2603.09703',
    abstract: {
      en: 'With the emergence of 3D Gaussian Splatting (3DGS), numerous pioneering efforts have been made to address the effective compression issue of massive 3DGS data. 3DGS offers an efficient and scalable representation of 3D scenes by utilizing learnable 3D Gaussians, but the large size of the generated data has posed significant challenges for storage and transmission. Existing methods, however, have been limited by their inability to support progressive coding, a crucial feature in streaming applications with varying bandwidth. To tackle this limitation, this paper introduce a novel approach that organizes 3DGS data into an octree structure, enabling efficient progressive coding. The proposed ProGS is a streaming-friendly codec that facilitates progressive coding for 3D Gaussian splatting, and significantly improves both compression efficiency and visual fidelity. The proposed method incorporates mutual information enhancement mechanisms to mitigate structural redundancy, leveraging the relevance between nodes in the octree hierarchy. By adapting the octree structure and dynamically adjusting the anchor nodes, ProGS ensures scalable data compression without compromising the rendering quality. ProGS achieves a remarkable 45× reduction in file storage compared to the original 3DGS format, while simultaneously improving visual performance by over 10%. This demonstrates that ProGS can provide a robust solution for real-time applications with varying network conditions.',
      zh: '随着3D高斯泼溅（3DGS）的出现，大量开创性工作致力于解决海量3DGS数据的有效压缩问题。3DGS通过可学习的三维高斯提供了高效且可扩展的三维场景表示，但生成数据的庞大体量给存储和传输带来了重大挑战。然而，现有方法无法支持渐进式编码——这在带宽变化的流媒体应用中是一项关键特性。为解决这一局限，本文提出了一种将3DGS数据组织为八叉树结构的新方法，实现高效的渐进式编码。所提出的ProGS是一种流媒体友好的编解码器，支持3DGS的渐进式编码，并显著提升了压缩效率和视觉保真度。该方法引入互信息增强机制以减少结构冗余，利用八叉树层级中节点间的相关性。通过自适应调整八叉树结构和动态调整锚点节点，ProGS在不损害渲染质量的前提下实现了可扩展的数据压缩。与原始3DGS格式相比，ProGS实现了45倍的文件存储缩减，同时视觉性能提升超过10%，为网络条件多变的实时应用提供了稳健的解决方案。',
    },
  },
  {
    title: 'RoCo-GS: Robust and Compact Dynamic Scene Representation for 4D Gaussian Streaming',
    authors: ['Jianzhao Wang†', 'Zhiye Tang†', 'Qiudan Zhang', 'Yun Zhang', 'Xu Wang'],
    venue: 'Under Review',
    year: 2026,
    doi: '',
    abstract: {
      en: 'While dynamic 3DGS video technology enables high-fidelity dynamic scene rendering, its excessive storage footprint severely impedes efficient transmission and real-time playback. To address this, we propose RoCo-GS, a novel framework designed to harmonize robust reconstruction with ultra-compact representation. To mitigate initialization errors and temporal drift, we introduce a Delayed Holistic Perturbation strategy that establishes a generalized canonical space. For efficient dynamics modeling, we propose an Implicit Binarized Motion Grid coupled with a lightweight decoder, alongside a Gaussian Mixture Entropy Model to deeply compress attribute redundancies. Furthermore, a Full-Attribute Deformation strategy is integrated to resolve complex occlusions and fine-grained deformations via comprehensive attribute evolution. Extensive experiments demonstrate that our proposed RoCo-GS reduces the average frame size to ~70KB (90x reduction over uncompressed baselines) while maintaining state-of-the-art rendering quality and real-time decoding speeds.',
      zh: '动态三维高斯泼溅视频技术能够实现高保真的动态场景渲染，但其过大的存储占用严重阻碍了高效传输和实时播放。为此，我们提出RoCo-GS，一种旨在协调鲁棒重建与超紧凑表示的新型框架。为缓解初始化误差和时间漂移，我们引入延迟整体扰动策略以建立广义规范空间。在高效动态建模方面，我们提出隐式二值化运动网格搭配轻量级解码器，以及高斯混合熵模型来深度压缩属性冗余。此外，集成全属性变形策略，通过全面的属性演化解决复杂遮挡和细粒度变形。大量实验表明，RoCo-GS将平均帧大小降至约70KB（相比未压缩基线缩减90倍），同时保持最先进的渲染质量和实时解码速度。',
    },
  },
  {
    title: 'SeCo-GS: Towards Semantic Feature Compression for 3D Gaussian Splatting',
    authors: ['Lingzhuo Liu', 'Zhiye Tang', 'Qiudan Zhang', 'Xu Wang'],
    venue: 'Under Review',
    year: 2026,
    doi: '',
    abstract: {
      en: 'Recent approaches in 3D Gaussian Splatting (3DGS) have revolutionized the representation of 3D scenes, and the emergence of semantic-enhanced variants such as Feature3DGS has further extended this line of work by enabling a wide range of semantic-aware applications. However, the practical deployment of these models is still hindered by the high storage requirements and transmission costs that come with maintaining high-dimensional semantic features. While several compression methods for 3DGS have been proposed, most of them concentrate on geometric and appearance attributes, without explicitly considering the compression of semantic information. To address this limitation, we propose SeCo-GS, a compression framework specifically designed for 3DGS with semantic features. Our method reduces the number of Gaussians while keeping the performance competitive by incorporating learnable masking, and further alleviates the clustering difficulties of high-dimensional vector quantization by decomposing semantic features into multiple subspaces. In addition, semantic fidelity is improved through distance-aware regularization. Extensive experiments demonstrate that SeCo-GS achieves a storage efficiency gain of more than 35x over vanilla Feature3DGS, while still preserving semantic information and rendering quality at a comparable level.',
      zh: '近年来3D高斯泼溅（3DGS）的方法革新了三维场景表示，语义增强变体如Feature3DGS的出现进一步拓展了语义感知应用。然而，维护高维语义特征所带来的高存储需求和传输成本仍阻碍着这些模型的实际部署。现有3DGS压缩方法大多集中于几何和外观属性，未明确考虑语义信息的压缩。为解决这一局限，我们提出SeCo-GS，一种专为带语义特征的3DGS设计的压缩框架。该方法通过引入可学习掩码减少高斯数量同时保持竞争力，并通过将语义特征分解为多个子空间来缓解高维向量量化的聚类困难。此外，通过距离感知正则化提升语义保真度。大量实验表明，SeCo-GS相比原始Feature3DGS实现了超过35倍的存储效率提升，同时在语义信息和渲染质量上保持了可比水平。',
    },
  },
  {
    title: 'Geometry-Adaptive 3D Convex Polyhedron for Tomographic Reconstruction',
    authors: ['Yaojian Xu', 'Zhiye Tang', 'Longhao Zou', 'Xu Wang', 'Rui Li'],
    venue: 'Under Review',
    year: 2026,
    doi: '',
    abstract: {
      en: 'While Gaussian-based methods advance novel view synthesis, they struggle to capture the complex density fields and hard boundaries essential for computed tomography. We propose a novel reconstruction framework based on geometryadaptive 3D convex polyhedral primitives. Our method employs a set of deformable 3D convex polyhedral primitives that adaptively tailor spatial-varying density distributions in the tomographic scene. Each primitive is parameterized by bounding planes and an associated density field, enabling more flexible shape representation to model complex internal structures than Gaussian-based representations, such as sharp boundaries and spiky shapes, particularly suitable for computed tomography applications. For efficient optimization, we introduce a fast differentiable rasterizer tailored to X-ray physics imaging, simulating X-ray images through an unordered convex density-accumulation strategy, unlike alpha-blending in RGB images. Experiments on diverse Xray datasets demonstrate our method outperforms prior methods in novel view synthesis by 3.66 dB in PSNR and 1.40% in SSIM, showing better geometric interpretability.',
      zh: '虽然基于高斯的方法推动了新视角合成的发展，但它们难以捕捉计算机断层扫描所需的复杂密度场和硬边界。我们提出了一种基于几何自适应三维凸多面体基元的新型重建框架。该方法采用一组可变形的三维凸多面体基元，自适应地拟合断层场景中空间变化的密度分布。每个基元由边界平面和关联的密度场参数化，相比高斯表示能够更灵活地建模复杂内部结构，如尖锐边界和尖刺形状，特别适用于计算机断层扫描应用。为实现高效优化，我们引入了针对X射线物理成像的快速可微光栅化器，通过无序凸密度累积策略模拟X射线图像，区别于RGB图像中的alpha混合。在多种X射线数据集上的实验表明，该方法在新视角合成上超越先前方法，PSNR提升3.66 dB，SSIM提升1.40%，展现出更好的几何可解释性。',
    },
  },
  {
    title: 'RetinexGS: Enhancing 3D Gaussian Splatting for Low-Light Scenes via Retinex-Guided Decomposition',
    authors: ['Xu Wang', 'Langren Xie', 'Zhiye Tang', 'Qiudan Zhang', 'Longhao Zou', 'You Yang', 'Wenhui Wu'],
    venue: 'IEEE Transactions on Multimedia (T-MM)',
    year: 2026,
    doi: '',
    abstract: {
      en: '3D Gaussian Splatting (3DGS) is an emerging technique for novel view synthesis and performs well when multi-view images are captured under sufficient illumination. However, it fails to deliver high-quality reconstruction and enhancement directly in low-light conditions. Existing low-light image enhancement (LLIE) approaches, while producing reasonable brightness gains, either impose strict acquisition constraints or compromise fidelity. Applying pre- or post-LLIE to 3DGS can brighten inputs but often introduces multi-view inconsistency and model generalization issues. In this paper, we present RetinexGS, a Retinex Decomposition based 3DGS framework that directly enhances low-light sRGB inputs during training in an unsupervised manner. Inspired by the Retinex theory, our proposed method performs illumination-aware decomposition of 3D scene color radiance, enabling simultaneous scene reconstruction and illumination enhancement. Furthermore, we integrate hash encoding into feature decomposition for high-frequency detail preservation, coupled with depth distortion to regularize scene\'s geometry. The proposed framework is modular and can be plugged into existing 3DGS pipelines with minimal modification. Experimental results demonstrate that our proposed RetinexGS outperforms existing state-of-the-art LLIE and 3DGS approaches.',
      zh: '3D高斯泼溅（3DGS）是一种新兴的新视角合成技术，在充足光照下采集的多视角图像上表现优异。然而，它无法在低光条件下直接实现高质量的重建和增强。现有的低光图像增强（LLIE）方法虽然能产生合理的亮度提升，但要么施加严格的采集约束，要么牺牲保真度。将3DGS应用前置或后置LLIE可以提亮输入，但往往引入多视角不一致性和模型泛化问题。本文提出RetinexGS，一种基于Retinex分解的3DGS框架，以无监督方式在训练过程中直接增强低光sRGB输入。受Retinex理论启发，该方法对三维场景颜色辐射进行光照感知分解，实现场景重建与光照增强的同步进行。此外，将哈希编码集成到特征分解中以保留高频细节，并通过深度畸变正则化场景几何。该框架是模块化的，可以以最小修改插入现有的3DGS流水线。实验结果表明，RetinexGS优于现有最先进的LLIE和3DGS方法。',
    },
  },
  {
    title: 'GSStream: 3D Gaussian Splatting based Volumetric Scene Streaming System',
    authors: ['Zhiye Tang', 'Qiudan Zhang', 'Lei Zhang', 'Junhui Hou', 'Yong Yang', 'Xu Wang'],
    venue: 'arXiv 2026',
    year: 2026,
    doi: 'https://arxiv.org/abs/2603.09718',
    abstract: {
      en: 'Recently, the 3D Gaussian splatting (3DGS) technique for real-time radiance field rendering has revolutionized the field of volumetric scene representation, providing users with an immersive experience. But in return, it also poses a large amount of data volume, which is extremely bandwidth-intensive. Cutting-edge researchers have tried to introduce different approaches and construct multiple variants for 3DGS to obtain a more compact scene representation, but it is still challenging for real-time distribution. In this paper, we propose GSStream, a novel volumetric scene streaming system to support 3DGS data format. Specifically, GSStream integrates a collaborative viewport prediction module to better predict users\' future behaviors by learning collaborative priors and historical priors from multiple users and users\' viewport sequences and a deep reinforcement learning (DRL)-based bitrate adaptation module to tackle the state and action space variability challenge of the bitrate adaptation problem, achieving efficient volumetric scene delivery. Besides, we first build a user viewport trajectory dataset for volumetric scenes to support the training and streaming simulation. Extensive experiments prove that our proposed GSStream system outperforms existing representative volumetric scene streaming systems in visual quality and network usage. Demo video: https://youtu.be/3WEe8PN8yvA.',
      zh: '近年来，用于实时辐射场渲染的3D高斯泼溅（3DGS）技术革新了体积场景表示领域，为用户提供了沉浸式体验，但同时也带来了大量数据，对带宽要求极高。前沿研究者尝试引入不同方法并构建多种3DGS变体以获得更紧凑的场景表示，但实时分发仍面临挑战。本文提出GSStream，一种支持3DGS数据格式的新型体积场景流媒体系统。具体而言，GSStream集成了协作视口预测模块，通过学习多用户的协作先验和用户视口序列的历史先验来预测用户未来行为，以及基于深度强化学习（DRL）的码率自适应模块来解决码率自适应问题中状态和动作空间可变性的挑战，实现高效的体积场景传输。此外，我们首次构建了体积场景的用户视口轨迹数据集以支持训练和流媒体仿真。大量实验证明，所提出的GSStream系统在视觉质量和网络利用率方面优于现有代表性体积场景流媒体系统。',
    },
  },
  {
    title: 'Eye Fixation and Saliency Field based Greedy Method for Volumetric Video Streaming',
    authors: ['Zhiye Tang', 'Kai Wang', 'Qiudan Zhang', 'Haowen Mo', 'Yelang Gao', 'Lei Zhang', 'Jun Li', 'Xu Wang'],
    venue: 'IEEE International Symposium on Machine Learning and Media Computing (MLMC)',
    year: 2025,
    doi: 'https://ieeexplore.ieee.org/abstract/document/11189305',
    abstract: {
      en: 'Metaverse megatrend sparks interest in volumetric videos, especially point cloud data format. However, point cloud videos usually contain large amounts of data, which makes it quite difficult to achieve efficient transmission under limited bandwidth. In this paper, we propose a greedy method named GES tailored for volumetric video streaming, which exploits human eye fixation data and saliency field to allocate bitrates for different tiles decomposed from point cloud scenes under a given bandwidth constraint. Moreover, to evaluate the performance of GES, we construct a platform to collect user head posture and eye fixation data, accumulating 40 user viewing behavior trajectories in total. Extensive experiments illustrate that our proposed method achieves superior performance than existing representative methods on real user behavior data, especially in visual performance.',
      zh: '元宇宙趋势激发了对体积视频尤其是点云数据格式的兴趣。然而，点云视频通常包含大量数据，在有限带宽下实现高效传输极具挑战。本文提出一种名为GES的贪心方法，专为体积视频流媒体设计，利用人眼注视数据和显著性场在给定带宽约束下为点云场景分解的不同瓦片分配比特率。此外，为评估GES的性能，我们构建了一个平台来收集用户头部姿态和眼动注视数据，共积累40条用户观看行为轨迹。大量实验表明，所提方法在真实用户行为数据上取得了优于现有代表性方法的性能，尤其在视觉表现方面。',
    },
  },
];

export const patents: Patent[] = [
  {
    title: {
      en: 'A Method, Device, Terminal and Medium for Volumetric Video Streaming Scheduling',
      zh: '一种体积视频流式调度方法、装置、终端及介质',
    },
    inventors: ['Xu Wang', 'Zhiye Tang', 'Qiudan Zhang', 'Yu Zhou'],
    patentNumber: 'ZL 202410355282.0',
    description: {
      en: 'A volumetric video streaming scheduling method for efficient content delivery.',
      zh: '一种用于高效内容传输的体积视频流式调度方法。',
    },
  },
  {
    title: {
      en: 'A 3DGS-based Volumetric Scene Streaming Method, Device and Medium',
      zh: '基于3DGS的体积场景流式传输方法、装置及介质',
    },
    inventors: ['Xu Wang', 'Zhiye Tang', 'Qiudan Zhang', 'Yaojian Xu', 'Jianmin Jiang'],
    patentNumber: 'ZL 202411095681.4',
    description: {
      en: 'A streaming method for volumetric scenes based on 3D Gaussian Splatting.',
      zh: '一种基于3D高斯泼溅的体积场景流式传输方法。',
    },
  },
];


export const experience: Experience[] = [
  {
    company: { en: 'vivo Mobile Communication Co., Ltd.', zh: 'vivo移动通信有限公司' },
    role: { en: 'Image Algorithm Engineer, Image Planning and Pre-research Dept.', zh: '影像规划预研部 影像算法工程师' },
    period: '2025.05 - Present',
    description: {
      en: '',
      zh: '',
    },
    logo: '/logos/vivo-logo.png',
  },
  {
    company: {
      en: 'Shenzhen University',
      zh: '深圳大学',
    },
    role: { en: 'Postgraduate Research Student, Research Institute for Future Media Computing (FMC)', zh: '未来媒体计算研究所（FMC） 硕士研究生' },
    period: '2022.09 - 2025.07',
    description: {
      en: '',
      zh: '',
    },
    logo: '/logos/szu-logo.png',
  },
];

export const education: Education[] = [
  {
    school: { en: 'Shenzhen University', zh: '深圳大学' },
    degree: { en: 'Master of Engineering, Software Engineering', zh: '电子信息硕士 软件工程' },
    period: '2022.09 - 2025.07',
    gpa: '',
    logo: '/logos/szu-logo.png',
  },
  {
    school: { en: 'City University of Hong Kong', zh: '香港城市大学' },
    degree: { en: 'Visiting Research Student, Computer Science', zh: '访问研究生 计算机科学' },
    period: '2024.12 - 2025.02',
    gpa: '',
    logo: '/logos/cityuhk-logo.png',
  },
  {
    school: { en: 'Shenzhen University', zh: '深圳大学' },
    degree: { en: 'Bachelor of Engineering, Automation', zh: '工学学士 自动化' },
    period: '2018.09 - 2022.07',
    gpa: '',
    logo: '/logos/szu-logo.png',
  },
];

export const contact: ContactInfo = {
  email: 'zhiyetang2022@foxmail.com',
  github: 'https://github.com/ZhiyeTang',
  linkedin: 'https://www.linkedin.com/in/zhiye-tang-05316a376/',
};
