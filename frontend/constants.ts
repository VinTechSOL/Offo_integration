import type { Cafe, FoodItem, Order } from './types';

const getFutureDate = (days: number): Date => {
  const today = new Date();
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + days);
  return futureDate;
};

export const CAFES: Cafe[] = [
  { id: 1, name: 'Cozy Corner', location: 'Urban Roast, 1st Floor, Tower A', image: '../../assets/cafes/coffee-shop.jpg', status: 'Open' },
  { id: 2, name: 'Urban Roast', location: '2nd Floor, Tower B', image: '../../assets/cafes/busiesscafe.jpg', status: 'Open' },
  { id: 3, name: 'Fresh Bites', location: 'Ground Floor, Tower C', image: '../../assets/cafes/busiess cafe.jpg', status: 'Closed' },
  { id: 4, name: 'Caffeine Fix', location: '3rd Floor, Tower A', image: 'https://picsum.photos/seed/cafe4/200/200', status: 'Open' },
];

export const FOOD_ITEMS: FoodItem[] = [
  { id: 1, name: 'Chicken Tikka Fry', price: 199.00, image: '../../assets/food items/chickentikka.jpg', cafe: 'Cozy Corner', isVeg: false, category: 'Appetizers' },
  { id: 2, name: 'Egg Rice', price: 59.00, image: '../../assets/food items/eggrice.jpg', cafe: 'Cozy Corner', isVeg: false, category: 'Main Course' },
  { id: 3, name: 'Hot Coffee', price: 40.00, image: '../../assets/food items/hotcoffee.jpg', cafe: 'Urban Roast', isVeg: true, category: 'Beverages' },
  { id: 4, name: 'Green Salad', price: 179.00, image: '../../assets/food items/greensalad.jpg', cafe: 'Fresh Bites', isVeg: true, category: 'Appetizers' },
  { id: 5, name: 'Chicken Noodles', price: 210.00, image: '../../assets/food items/chickennodels.jpg', cafe: 'Cozy Corner', isVeg: false, category: 'Main Course' },
  { id: 6, name: 'Masala Dosa', price: 30.00, image: '../../assets/food items/masaladoasa.jpg', cafe: 'Urban Roast', isVeg: true, category: 'Snacks' },
  { id: 7, name: 'Idly', price: 25.00, image: '../../assets/food items/idaly1.jpg', cafe: 'Urban Roast', isVeg: true, category: 'Snacks' },
  { id: 8, name: 'South Meals', price: 130.00, image: '../../assets/food items/southmeals.jpg', cafe: 'Fresh Bites', isVeg: true, category: 'Main Course' },
  { id: 9, name: 'Paneer Biryani', price: 199.00, image: '../../assets/food items/panieerbiryani.jpg', cafe: 'Cozy Corner', isVeg: true, category: 'Main Course' },
  { id: 10, name: 'Chicken Burger', price: 99.00, image: '../../assets/food items/chicken-burger.jpg', cafe: 'Caffeine Fix', isVeg: false, category: 'Snacks' },
  
];


export const ORDERS_DATA: Order[] = [
    {
        id: 'ODS56781',
        cafe: 'Cozy Corner',
        date: new Date(new Date().setDate(new Date().getDate() + 2)), // Scheduled for 2 days from now
        items: [
            { item: FOOD_ITEMS[8], quantity: 1 }, // Paneer Biryani
            { item: FOOD_ITEMS[2], quantity: 1 }, // Hot Coffee
        ],
        total: FOOD_ITEMS[8].price + FOOD_ITEMS[2].price,
        status: 'Scheduled',
        placedAt: new Date(),
    },
     {
        id: 'OD12349',
        cafe: 'Urban Roast',
        date: new Date(),
        items: [
            { item: FOOD_ITEMS[2], quantity: 2 }, // Hot Coffee
        ],
        total: FOOD_ITEMS[2].price * 2,
        status: 'Accepted',
        placedAt: new Date(Date.now() - 2 * 60 * 1000), // Placed 2 minutes ago
    },
    {
        id: 'OD12350',
        cafe: 'Caffeine Fix',
        date: new Date(),
        items: [
            { item: FOOD_ITEMS[9], quantity: 1 },
        ],
        total: FOOD_ITEMS[9].price,
        status: 'Ready for Pickup',
        placedAt: new Date(Date.now() - 10 * 60 * 1000),
    },
    {
        id: 'OD12351',
        cafe: 'Cozy Corner',
        date: new Date(),
        items: [
            { item: FOOD_ITEMS[1], quantity: 1 },
        ],
        total: FOOD_ITEMS[1].price,
        status: 'Out for Delivery',
        placedAt: new Date(Date.now() - 15 * 60 * 1000),
    },
    {
        id: 'OD12345',
        cafe: 'Cozy Corner',
        date: new Date('2024-06-25T12:30:00'),
        items: [
            { item: FOOD_ITEMS[0], quantity: 1 }, // Chicken Tikka Fry
            { item: FOOD_ITEMS[4], quantity: 1 }, // Chicken Noodles
        ],
        total: FOOD_ITEMS[0].price + FOOD_ITEMS[4].price,
        status: 'Delivered',
        placedAt: new Date('2024-06-25T12:30:00'),
    },
    {
        id: 'OD12347',
        cafe: 'Fresh Bites',
        date: new Date('2024-06-22T19:00:00'),
        items: [
            { item: FOOD_ITEMS[3], quantity: 1 }, // Green Salad
            { item: FOOD_ITEMS[7], quantity: 1 }, // South Meals
        ],
        total: FOOD_ITEMS[3].price + FOOD_ITEMS[7].price,
        status: 'Cancelled',
        placedAt: new Date('2024-06-22T19:00:00'),
    },
];
