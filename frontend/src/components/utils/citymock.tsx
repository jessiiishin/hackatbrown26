import type { Stop } from "../Home";

export const cities: Record<string, Stop[]> = {
    'New York': [
      {
        id: '1',
        name: 'Joe\'s Pizza',
        type: 'restaurant',
        cuisine: 'Italian',
        description: 'Iconic NYC slice joint serving classic New York-style pizza since 1975',
        price: 8,
        duration: 30,
        address: 'Greenwich Village',
        dietaryOptions: ['vegetarian'],
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
        openTime: '10:00',
        closeTime: '04:00'
      },
      {
        id: '2',
        name: 'Statue of Liberty',
        type: 'landmark',
        description: 'Iconic symbol of freedom and democracy',
        price: 0,
        duration: 20,
        address: 'Liberty Island',
        dietaryOptions: [],
        image: 'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?w=800',
        openTime: '09:00',
        closeTime: '17:00'
      },
      {
        id: '3',
        name: 'Katz\'s Delicatessen',
        type: 'restaurant',
        cuisine: 'Deli',
        description: 'Famous deli known for pastrami sandwiches and old-school NYC charm',
        price: 22,
        duration: 45,
        address: 'Lower East Side',
        dietaryOptions: ['gluten-free'],
        image: 'https://images.unsplash.com/photo-1619880437374-5dde0d6e01f8?w=800',
        openTime: '08:00',
        closeTime: '23:00'
      },
      {
        id: '4',
        name: 'Central Park',
        type: 'landmark',
        description: 'Urban oasis in the heart of Manhattan',
        price: 0,
        duration: 25,
        address: 'Midtown',
        dietaryOptions: [],
        image: 'https://images.unsplash.com/photo-1572347194075-7114f6d19e3d?w=800',
        openTime: '06:00',
        closeTime: '01:00'
      },
      {
        id: '5',
        name: 'Xi\'an Famous Foods',
        type: 'restaurant',
        cuisine: 'Chinese',
        description: 'Hand-pulled noodles and spicy cumin lamb burgers',
        price: 15,
        duration: 35,
        address: 'Chinatown',
        dietaryOptions: ['vegan', 'vegetarian'],
        image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800',
        openTime: '11:00',
        closeTime: '21:00'
      },
      {
        id: '6',
        name: 'Brooklyn Bridge',
        type: 'landmark',
        description: 'Historic suspension bridge with stunning skyline views',
        price: 0,
        duration: 30,
        address: 'Brooklyn Bridge',
        dietaryOptions: [],
        image: 'https://images.unsplash.com/photo-1543716091-a840c05249ec?w=800',
        openTime: '00:00',
        closeTime: '23:59'
      },
      {
        id: '7',
        name: 'Levain Bakery',
        type: 'restaurant',
        cuisine: 'Bakery',
        description: 'World-famous oversized cookies and pastries',
        price: 6,
        duration: 20,
        address: 'Upper West Side',
        dietaryOptions: ['vegetarian'],
        image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800',
        openTime: '07:00',
        closeTime: '20:00'
      },
      {
        id: '8',
        name: 'The Halal Guys',
        type: 'restaurant',
        cuisine: 'Middle Eastern',
        description: 'Legendary street food with chicken and rice platters',
        price: 10,
        duration: 25,
        address: 'Midtown',
        dietaryOptions: ['gluten-free', 'halal'],
        image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800',
        openTime: '10:00',
        closeTime: '04:00'
      }
    ],
    'San Francisco': [
      {
        id: '9',
        name: 'Tartine Bakery',
        type: 'restaurant',
        cuisine: 'Bakery',
        description: 'Artisanal breads and morning buns that define SF breakfast',
        price: 12,
        duration: 30,
        address: 'Mission District',
        dietaryOptions: ['vegetarian', 'vegan'],
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
        openTime: '08:00',
        closeTime: '16:00'
      },
      {
        id: '10',
        name: 'Golden Gate Bridge',
        type: 'landmark',
        description: 'Iconic suspension bridge and San Francisco landmark',
        price: 0,
        duration: 25,
        address: 'Golden Gate',
        dietaryOptions: [],
        image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800',
        openTime: '00:00',
        closeTime: '23:59'
      },
      {
        id: '11',
        name: 'Mission Chinese Food',
        type: 'restaurant',
        cuisine: 'Chinese',
        description: 'Creative Sichuan-inspired dishes with SF twist',
        price: 25,
        duration: 50,
        address: 'Mission District',
        dietaryOptions: ['vegetarian', 'vegan'],
        image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800',
        openTime: '17:00',
        closeTime: '22:00'
      },
      {
        id: '12',
        name: 'Fisherman\'s Wharf',
        type: 'landmark',
        description: 'Waterfront area with sea lions and maritime history',
        price: 0,
        duration: 20,
        address: 'Fisherman\'s Wharf',
        dietaryOptions: [],
        image: 'https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=800',
        openTime: '09:00',
        closeTime: '20:00'
      },
      {
        id: '13',
        name: 'Swan Oyster Depot',
        type: 'restaurant',
        cuisine: 'Seafood',
        description: 'Classic seafood counter serving fresh oysters since 1912',
        price: 30,
        duration: 40,
        address: 'Nob Hill',
        dietaryOptions: ['gluten-free', 'pescatarian'],
        image: 'https://images.unsplash.com/photo-1559579312-23d4f96d6c0f?w=800',
        openTime: '10:30',
        closeTime: '17:00'
      },
      {
        id: '14',
        name: 'La Taqueria',
        type: 'restaurant',
        cuisine: 'Mexican',
        description: 'Award-winning tacos and burritos in the Mission',
        price: 14,
        duration: 30,
        address: 'Mission District',
        dietaryOptions: ['vegetarian', 'vegan', 'gluten-free'],
        image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800',
        openTime: '11:00',
        closeTime: '21:00'
      },
      {
        id: '15',
        name: 'Alcatraz Island',
        type: 'landmark',
        description: 'Historic former prison with bay views',
        price: 0,
        duration: 30,
        address: 'Alcatraz',
        dietaryOptions: [],
        image: 'https://images.unsplash.com/photo-1590619948936-1778dc487175?w=800',
        openTime: '08:30',
        closeTime: '16:00'
      }
    ],
    'Tokyo': [
      {
        id: '16',
        name: 'Tsukiji Outer Market',
        type: 'restaurant',
        cuisine: 'Japanese',
        description: 'Fresh sushi and street food at the famous fish market',
        price: 18,
        duration: 45,
        address: 'Tsukiji',
        dietaryOptions: ['pescatarian'],
        image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800',
        openTime: '05:00',
        closeTime: '14:00'
      },
      {
        id: '17',
        name: 'Senso-ji Temple',
        type: 'landmark',
        description: 'Ancient Buddhist temple in Asakusa',
        price: 0,
        duration: 30,
        address: 'Asakusa',
        dietaryOptions: [],
        image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800',
        openTime: '06:00',
        closeTime: '17:00'
      },
      {
        id: '18',
        name: 'Ichiran Ramen',
        type: 'restaurant',
        cuisine: 'Japanese',
        description: 'Individual booth dining for perfect tonkotsu ramen',
        price: 12,
        duration: 35,
        address: 'Shibuya',
        dietaryOptions: [],
        image: 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=800',
        openTime: '00:00',
        closeTime: '23:59'
      },
      {
        id: '19',
        name: 'Tokyo Tower',
        type: 'landmark',
        description: 'Iconic communications tower with observation decks',
        price: 0,
        duration: 25,
        address: 'Minato',
        dietaryOptions: [],
        image: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=800',
        openTime: '09:00',
        closeTime: '23:00'
      },
      {
        id: '20',
        name: 'Afuri Ramen',
        type: 'restaurant',
        cuisine: 'Japanese',
        description: 'Light yuzu-infused ramen and craft beer',
        price: 14,
        duration: 30,
        address: 'Harajuku',
        dietaryOptions: ['vegetarian', 'vegan'],
        image: 'https://images.unsplash.com/photo-1623341214825-9f4f963727da?w=800',
        openTime: '11:00',
        closeTime: '23:00'
      },
      {
        id: '21',
        name: 'Shibuya Crossing',
        type: 'landmark',
        description: 'World\'s busiest pedestrian crossing',
        price: 0,
        duration: 15,
        address: 'Shibuya',
        dietaryOptions: [],
        image: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800',
        openTime: '00:00',
        closeTime: '23:59'
      },
      {
        id: '22',
        name: 'Tempura Kondo',
        type: 'restaurant',
        cuisine: 'Japanese',
        description: 'Michelin-starred tempura artistry',
        price: 45,
        duration: 60,
        address: 'Ginza',
        dietaryOptions: ['pescatarian'],
        image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800',
        openTime: '11:30',
        closeTime: '20:30'
      }
    ],
    'Paris': [
      {
        id: '23',
        name: 'L\'As du Fallafel',
        type: 'restaurant',
        cuisine: 'Middle Eastern',
        description: 'Famous falafel in the Marais district',
        price: 8,
        duration: 25,
        address: 'Le Marais',
        dietaryOptions: ['vegetarian', 'vegan'],
        image: 'https://images.unsplash.com/photo-1593007791459-8a9e4c7c4a4e?w=800',
        openTime: '11:00',
        closeTime: '23:30'
      },
      {
        id: '24',
        name: 'Eiffel Tower',
        type: 'landmark',
        description: 'Iconic iron lattice tower',
        price: 0,
        duration: 30,
        address: 'Champ de Mars',
        dietaryOptions: [],
        image: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800',
        openTime: '09:30',
        closeTime: '23:45'
      },
      {
        id: '25',
        name: 'Breizh Café',
        type: 'restaurant',
        cuisine: 'French',
        description: 'Authentic Breton crêpes with organic ingredients',
        price: 16,
        duration: 40,
        address: 'Le Marais',
        dietaryOptions: ['vegetarian', 'gluten-free'],
        image: 'https://images.unsplash.com/photo-1519676867240-f03562e64548?w=800',
        openTime: '10:00',
        closeTime: '23:00'
      },
      {
        id: '26',
        name: 'Louvre Museum',
        type: 'landmark',
        description: 'World\'s largest art museum',
        price: 0,
        duration: 25,
        address: 'Louvre',
        dietaryOptions: [],
        image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800',
        openTime: '09:00',
        closeTime: '18:00'
      },
      {
        id: '27',
        name: 'Pierre Hermé',
        type: 'restaurant',
        cuisine: 'Bakery',
        description: 'World-renowned macarons and pastries',
        price: 10,
        duration: 20,
        address: 'Saint-Germain-des-Prés',
        dietaryOptions: ['vegetarian'],
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
        openTime: '10:00',
        closeTime: '20:00'
      },
      {
        id: '28',
        name: 'Notre-Dame',
        type: 'landmark',
        description: 'Medieval Catholic cathedral',
        price: 0,
        duration: 20,
        address: 'Île de la Cité',
        dietaryOptions: [],
        image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
        openTime: '08:00',
        closeTime: '18:45'
      },
      {
        id: '29',
        name: 'Septime',
        type: 'restaurant',
        cuisine: 'French',
        description: 'Modern French cuisine in a casual setting',
        price: 38,
        duration: 75,
        address: '11th Arrondissement',
        dietaryOptions: ['vegetarian'],
        image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
        openTime: '12:15',
        closeTime: '22:00'
      }
    ]
  };
  
  // if (cities[city]) return cities[city];

  // // Dynamic Generation for "Any City"
  // const cuisines = ['Local Delicacy', 'Fusion', 'Street Food', 'Traditional', 'Modern'];
  // const types = ['restaurant', 'landmark', 'restaurant', 'landmark', 'restaurant'];
  
  // return Array.from({ length: 8 }).map((_, i) => {
  //   const isRestaurant = types[i % types.length] === 'restaurant';
  //   const cuisine = cuisines[i % cuisines.length];
  //   return {
  //     id: `dynamic-${i}`,
  //     name: isRestaurant ? `${city} ${cuisine} Hub` : `Historic ${city} Square`,
  //     type: isRestaurant ? 'restaurant' : 'landmark',
  //     cuisine: isRestaurant ? cuisine : undefined,
  //     description: isRestaurant 
  //       ? `A top-rated spot for ${cuisine.toLowerCase()} in the heart of ${city}.`
  //       : `A significant historical landmark reflecting the culture of ${city}.`,
  //     price: isRestaurant ? 10 + (i * 5) : 0,
  //     duration: 30 + (i * 10),
  //     address: `${city} District ${i + 1}`,
  //     dietaryOptions: i % 2 === 0 ? ['vegetarian', 'vegan'] : ['gluten-free'],
  //     image: `https://images.unsplash.com/photo-${1500000000000 + i}?w=800&city=${city}`,
  //     openTime: '09:00',
  //     closeTime: '22:00'
  //   };
  // });

export const coordinates: Record<string, Record<string, { lat: number; lng: number }>> = {
    'New York': {
    'Greenwich Village': { lat: 40.7336, lng: -74.0027 },
    'Liberty Island': { lat: 40.6892, lng: -74.0445 },
    'Lower East Side': { lat: 40.7209, lng: -73.9840 },
    'Midtown': { lat: 40.7549, lng: -73.9840 },
    'Chinatown': { lat: 40.7157, lng: -73.9970 },
    'Brooklyn Bridge': { lat: 40.7061, lng: -73.9969 },
    'Upper West Side': { lat: 40.7870, lng: -73.9754 }
    },
    'San Francisco': {
    'Mission District': { lat: 37.7599, lng: -122.4148 },
    'Golden Gate': { lat: 37.8199, lng: -122.4783 },
    'Fisherman\'s Wharf': { lat: 37.8080, lng: -122.4177 },
    'Nob Hill': { lat: 37.7923, lng: -122.4155 },
    'Alcatraz': { lat: 37.8267, lng: -122.4230 }
    },
    'Tokyo': {
    'Tsukiji': { lat: 35.6654, lng: 139.7707 },
    'Asakusa': { lat: 35.7148, lng: 139.7967 },
    'Shibuya': { lat: 35.6595, lng: 139.7004 },
    'Minato': { lat: 35.6586, lng: 139.7454 },
    'Harajuku': { lat: 35.6702, lng: 139.7027 },
    'Ginza': { lat: 35.6712, lng: 139.7650 }
    },
    'Paris': {
    'Le Marais': { lat: 48.8566, lng: 2.3626 },
    'Champ de Mars': { lat: 48.8556, lng: 2.2986 },
    'Louvre': { lat: 48.8606, lng: 2.3376 },
    'Saint-Germain-des-Prés': { lat: 48.8540, lng: 2.3330 },
    'Île de la Cité': { lat: 48.8556, lng: 2.3477 },
    '11th Arrondissement': { lat: 48.8566, lng: 2.3799 }
    },
    'London': {
    'London District 1': { lat: 51.5074, lng: -0.1278 },
    'London District 2': { lat: 51.5033, lng: -0.1195 },
    'London District 3': { lat: 51.5117, lng: -0.1233 },
    'London District 4': { lat: 51.5150, lng: -0.1419 }
    },
    'Rome': {
    'Rome District 1': { lat: 41.9028, lng: 12.4964 },
    'Rome District 2': { lat: 41.8902, lng: 12.4922 },
    'Rome District 3': { lat: 41.8986, lng: 12.4769 },
    'Rome District 4': { lat: 41.9009, lng: 12.4833 }
    }
};