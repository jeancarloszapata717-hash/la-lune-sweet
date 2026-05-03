export const MOCK_PRODUCTS = [
  {
    id: 'pavlova-fiesta',
    name: 'Pavlova Fiesta',
    basePrice: 12.00,
    shortDesc: 'Nuestra exquisita pavlova con los mejores toppings.',
    longDesc: 'Una deliciosa base crujiente por fuera y como nube por dentro, coronada con crema y las más frescas combinaciones.',
    image: '/pavlovaf.png',
    category: 'PAVLOVA',
    isNew: true,
    modifiers: [
      {
        id: 'top-1',
        name: 'Elige tu Topping',
        isRequired: true,
        options: [
          { id: 'fresa', name: 'Fresas Frescas', plusPrice: 0 },
          { id: 'mix', name: 'Mix de Berries', plusPrice: 2 },
          { id: 'durazno', name: 'Durazno Melocotón', plusPrice: 0 }
        ]
      }
    ]
  },
  {
    id: 'sweet-bites-box',
    name: 'Caja Sweet Bites',
    basePrice: 24.00,
    shortDesc: 'Surtido de nuestros mejores bocados.',
    longDesc: 'Una selección curada de 12 mini galletas y brookies. Ideal para compartir o regalar. Incluye sabores de temporada.',
    image: '/CAJALL.png',
    category: 'CAJAS VARIADAS',
    isNew: false,
  },
  {
    id: 'bombs-choco',
    name: 'BOMBS',
    basePrice: 6.00,
    packPrices: { '1 BOMB': 6.00, 'PROMO DE 2': 10.00 },
    shortDesc: 'Trufas gigantes rellenas de magia.',
    longDesc: 'Cruce crujiente por fuera, corazón derretido por dentro. Una explosión de sabor en cada mordisco.',
    image: '/PORTADABOMBS.png',
    images: [
      '/PORTADABOMBS.png',
      '/chipsahoy.png',
      'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1614083547144-f8b8a74e5033?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1514846326710-096e481b2dae?auto=format&fit=crop&q=80&w=800'
    ],
    category: 'IMPERDIBLES',
    isNew: true,
    hasPackOptions: true,
    flavors: [
      { id: 'f-chipsahoy', name: 'CHIPSAHOY', plusPrice: 0 },
      { id: 'f-cricri', name: 'CRICRI', plusPrice: 1.00 },
      { id: 'f-cremareal', name: 'CREMA REAL', plusPrice: 0 },
      { id: 'f-lotus', name: 'LOTUS', plusPrice: 1.00 },
      { id: 'f-pistacho', name: 'PISTACHO', plusPrice: 2.00 }
    ]
  },
  {
    id: 'cookie-red-velvet',
    name: 'Red Velvet Pop',
    basePrice: 8.00,
    shortDesc: 'El sabor clásico en formato chupeta.',
    longDesc: 'Nuestra famosa masa red velvet cubierta con una fina capa de chocolate blanco artesanal.',
    image: 'https://images.unsplash.com/photo-1621236378699-859feaf13efa?auto=format&fit=crop&q=80&w=800',
    category: 'PORCIONES PEQUEÑAS',
    isNew: false,
  },
  {
    id: 'cookie-matcha',
    name: 'Luna de Matcha',
    basePrice: 9.50,
    shortDesc: 'Inspiración oriental, dulzura local.',
    longDesc: 'Galleta suave infundida con matcha ceremonial de primera calidad, trozos de chocolate blanco y un toque de sal marina.',
    image: 'https://images.unsplash.com/photo-1616421008620-1b7782ccbed8?auto=format&fit=crop&q=80&w=800',
    category: 'COOKIES',
    isNew: false,
  },
  {
    id: 'alfajor-lune',
    name: 'Alfajor La Lune',
    basePrice: 10.00,
    shortDesc: 'Relleno extra generoso de dulce de leche.',
    longDesc: 'Dos suaves galletas de maicena que se deshacen en la boca, abrazando un abundante centro de dulce de leche artesanal, bordeado con coco rallado tostado.',
    image: 'https://images.unsplash.com/photo-1615594042857-41cbd8add9a0?auto=format&fit=crop&q=80&w=800',
    category: 'PROMOS DEL DIA',
    isNew: false,
  }
];

export const LOCATIONS = [
  { city: 'Amalfi Maracay', address: 'Las Delicias, Maracay', phone: '+58 414 123 4567', image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800' },
  { city: 'Amalfi Cargas', address: 'Zona Norte', phone: '+58 424 987 6543', image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=800' }
];
