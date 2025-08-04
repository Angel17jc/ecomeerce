import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const products = [
  {
    id: 1,
    name: 'Camiseta Oversize',
    price: 25,
    category: 'Hombre',
    image: 'https://images.unsplash.com/photo-1593032465171-8cbbcf2b1d90',
  },
  {
    id: 2,
    name: 'Vestido Floral',
    price: 40,
    category: 'Mujer',
    image: 'https://images.unsplash.com/photo-1612423284934-b0bb19db68aa',
  },
  {
    id: 3,
    name: 'Gorra Clásica',
    price: 15,
    category: 'Accesorios',
    image: 'https://images.unsplash.com/photo-1621784564114-d1d5f68065f2',
  },
];

export default function StyleHubHome() {
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState([]);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      <h1 className="text-4xl font-bold mb-6 text-center">🛍️ StyleHub</h1>
      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="Buscar productos..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-md"
        />
        <Badge className="text-sm">Carrito: {cart.length} items</Badge>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filtered.map((product) => (
          <Card key={product.id} className="hover:shadow-xl transition">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-56 object-cover rounded-t-2xl"
            />
            <CardContent className="p-4 space-y-2">
              <h2 className="text-xl font-semibold">{product.name}</h2>
              <p className="text-gray-500">Categoría: {product.category}</p>
              <p className="text-lg font-bold">${product.price}</p>
              <Button onClick={() => addToCart(product)} className="w-full">
                Añadir al carrito
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
