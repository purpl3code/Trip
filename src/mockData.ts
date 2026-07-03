export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  banner: string;
  bio: string;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
}

export interface Comment {
  id: string;
  user: User;
  content: string;
  rating?: number; // 1-5 stars (optional)
  verdict?: 'Gostei' | 'Não gostei'; // optional
  createdAt: string;
}

export interface Post {
  id: string;
  user: User;
  content: string;
  location: string;
  rating: number; // 1-5 stars (author's rating)
  verdict: 'Gostei' | 'Não gostei'; // author's verdict
  photos: string[];
  likesCount: number;
  isLiked?: boolean;
  comments: Comment[];
  createdAt: string;
}

export const mockUsers: User[] = [
  {
    id: 'user-1',
    username: 'michael_travels',
    displayName: 'Michael Silva',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
    banner: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
    bio: 'Viajando pelo mundo com a Sophia ✈️ | Amante da boa culinária e de fotografar momentos inesquecíveis.',
    followersCount: 142,
    followingCount: 98,
    isFollowing: false,
  },
  {
    id: 'user-2',
    username: 'sophia_adventures',
    displayName: 'Sophia Costa',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
    banner: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    bio: 'Colecionando memórias ao redor do globo. Compartilhando meu amor por café, praias e fotos espontâneas 📸💛',
    followersCount: 215,
    followingCount: 110,
    isFollowing: true,
  },
  {
    id: 'user-3',
    username: 'foodie_chef',
    displayName: 'Chef Rodrigo',
    avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=150&h=150&q=80',
    banner: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80',
    bio: 'Crítico gastronômico informal. Se a comida for boa, eu elogio; se for ruim, eu avalio com sinceridade! 🍔🍝',
    followersCount: 892,
    followingCount: 345,
    isFollowing: false,
  }
];

export const mockPosts: Post[] = [
  {
    id: 'post-1',
    user: mockUsers[1], // Sophia Costa
    content: 'Jantamos ontem nessa trattoria escondida em Roma e a massa carbonara estava simplesmente surreal! O atendimento foi super acolhedor, parecia que estávamos na casa de uma nonna italiana.',
    location: 'Osteria da Fortunata, Roma',
    rating: 5,
    verdict: 'Gostei',
    photos: [
      'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&w=800&q=80'
    ],
    likesCount: 24,
    isLiked: true,
    createdAt: '2026-07-02T20:30:00Z',
    comments: [
      {
        id: 'c-1',
        user: mockUsers[0], // Michael Silva
        content: 'Foi incrível mesmo! A massa fresca feita na hora na vitrine é um show à parte. Para mim é 5 estrelas fácil.',
        rating: 5,
        verdict: 'Gostei',
        createdAt: '2026-07-02T20:45:00Z'
      },
      {
        id: 'c-2',
        user: mockUsers[2], // Chef Rodrigo
        content: 'Excelente escolha. A massa guanciale deles tem a cura perfeita, mas o pecorino estava um pouco salgado na minha visita. Dou 4 estrelas pelo tempo.',
        rating: 4,
        verdict: 'Gostei',
        createdAt: '2026-07-02T21:15:00Z'
      }
    ]
  },
  {
    id: 'post-2',
    user: mockUsers[2], // Chef Rodrigo
    content: 'Visitei o famoso bistrô no centro histórico. Visual lindo, digno de filme, mas o filé estava frio e o molho béarnaise completamente desandado. Pelo preço cobrado, a experiência foi bem decepcionante.',
    location: 'Le Bistrot Parisien, Paris',
    rating: 2,
    verdict: 'Não gostei',
    photos: [
      'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80'
    ],
    likesCount: 45,
    isLiked: false,
    createdAt: '2026-07-01T14:15:00Z',
    comments: [
      {
        id: 'c-3',
        user: mockUsers[1], // Sophia Costa
        content: 'Nossa, que pena! Quando fui no ano passado adorei o tartar de salmão deles. Talvez mudou o chef?',
        createdAt: '2026-07-01T15:00:00Z'
      },
      {
        id: 'c-4',
        user: mockUsers[0], // Michael Silva
        content: 'Iria jantar lá na nossa próxima viagem, mas depois dessa avaliação acho que vou procurar outra opção no bairro.',
        createdAt: '2026-07-01T16:22:00Z'
      }
    ]
  },
  {
    id: 'post-3',
    user: mockUsers[0], // Michael Silva
    content: 'Café da manhã de hoje no topo da falésia em Bali! Uma tigela de açaí com frutas frescas e um expresso duplo com essa vista inacreditável. Definição de paz.',
    location: 'Single Fin, Uluwatu, Bali',
    rating: 5,
    verdict: 'Gostei',
    photos: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=80'
    ],
    likesCount: 88,
    isLiked: false,
    createdAt: '2026-06-30T08:00:00Z',
    comments: [
      {
        id: 'c-5',
        user: mockUsers[1], // Sophia Costa
        content: 'O melhor amanhecer da viagem! Quero voltar correndo para esse paraíso 🌅🌊',
        rating: 5,
        verdict: 'Gostei',
        createdAt: '2026-06-30T08:05:00Z'
      }
    ]
  }
];
