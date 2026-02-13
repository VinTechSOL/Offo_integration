import { Order, MenuItem, OrderStatus, Customer } from './types';

export const initialOrders: Order[] = [
  { 
    id: '#UR3347', customerName: 'Priya Sharma', customerAddress: 'Urban Road, 3rd floor Tower c.',
    items: [{ id: 'i1', name: 'Chicken Tikka Fry', imageUrl: '../../assets/food items/chickentikka.jpg', quantity: 1, price: 199.00 }], 
    total: 199.00, payment: 'Paid', status: OrderStatus.Incoming, createdAt: new Date(Date.now() - 5 * 60000)
  },
  { 
    id: '#UR3348', customerName: 'Rajesh M', customerAddress: 'Urban Road, 3rd floor Tower c.',
    items: [{ id: 'i2', name: 'Coffee', imageUrl: '../../assets/food items/coffeee.jpg', quantity: 1, price: 20.00 }], 
    total: 20.00, payment: 'Paid', status: OrderStatus.Incoming, createdAt: new Date(Date.now() - 10 * 60000)
  },
  { 
    id: '#UR3349', customerName: 'Primya Sharma', customerAddress: 'Urban Road, 3rd floor Tower c.',
    items: [{ id: 'i1a', name: 'Chicken Tikka Fry', imageUrl: '../../assets/food items/chickentikka.jpg', quantity: 1, price: 199.00 }], 
    total: 199.00, payment: 'Paid', status: OrderStatus.Incoming, createdAt: new Date(Date.now() - 12 * 60000)
  },
  { 
    id: '#002046', customerName: 'Rohan M', customerAddress: 'Corporate Greens, 5th Floor',
    items: [{ id: 'i3', name: 'Veg Biryani', imageUrl: '../../assets/food items/food3.jpg', quantity: 2, price: 180.00 }], 
    total: 360.00, payment: 'Paid', status: OrderStatus.Preparing, createdAt: new Date(Date.now() - 30 * 60000)
  },
  { 
    id: '#002045', customerName: 'Anjali Verma', customerAddress: 'Cyber City, Tower B',
    items: [{ id: 'i4', name: 'Paneer Butter Masala', imageUrl: '../../assets/food items/chickentikka.jpg', quantity: 1, price: 220.00 }], 
    total: 220.00, payment: 'Not paid', status: OrderStatus.Ready, createdAt: new Date(Date.now() - 65 * 60000)
  },
   { 
    id: '#002044', customerName: 'Suresh Kumar', customerAddress: 'Galaxy Apartments, A-Wing',
    items: [{ id: 'i5', name: 'Mutton Rogan Josh', imageUrl: '../../assets/food items/mutton.jpeg', quantity: 1, price: 350.00 }], 
    total: 350.00, payment: 'Paid', status: OrderStatus.PickedUp, createdAt: new Date(Date.now() - 120 * 60000)
  },
  { 
    id: '#002043', customerName: 'Deepa Singh', customerAddress: 'DLF Phase 3',
    items: [{ id: 'm3', name: 'Idly', imageUrl: '../../assets/food items/idaly.jpg', quantity: 2, price: 30.00 }], 
    total: 60.00, payment: 'Paid', status: OrderStatus.PickedUp, createdAt: new Date(Date.now() - 180 * 60000)
  },
];

export const initialMenuItems: MenuItem[] = [
  { id: 'm1', name: 'Chicken Tikka Fry', imageUrl: '../../assets/food items/chickentikka.jpg', price: 299.00, category: 'Lunch', available: false, foodType: 'non-veg' },
  { id: 'm2', name: 'Butter Chicken', imageUrl: '../../assets/food items/buttur chicken.jpg', price: 320.00, category: 'Dinner', available: true, foodType: 'non-veg' },
  { id: 'm3', name: 'Idly (2 pieces)', imageUrl: '../../assets/food items/idaly.jpg', price: 30.00, category: 'Breakfast', available: true, foodType: 'veg' },
  { id: 'm4', name: 'Veg Biryani', imageUrl: '../../assets/food items/food3.jpg', price: 180.00, category: 'Lunch', available: true, foodType: 'veg' },
  { id: 'm5', name: 'Paneer Butter Masala', imageUrl: '../../assets/food items/chickentikka.jpg', price: 220.00, category: 'Dinner', available: false, foodType: 'veg' },
  { id: 'm6', name: 'Mutton Rogan Josh', imageUrl: '../../assets/food items/mutton.jpg', price: 350.00, category: 'Dinner', available: true, foodType: 'non-veg' },
  { id: 'm7', name: 'Masala Dosa', imageUrl: '../../assets/food items/dosa.jpg', price: 90.00, category: 'Breakfast', available: true, foodType: 'veg' },
  { id: 'm8', name: 'Samosa (2 pieces)', imageUrl: '../../assets/food items/food3.jpg', price: 40.00, category: 'Snacks', available: true, foodType: 'veg' },
  { id: 'm10', name: 'Espresso Coffee', imageUrl: '../../assets/food items/coffeee.jpg', price: 50.00, category: 'Beverages', available: true, foodType: 'veg' },
];

export const initialCustomers: Customer[] = [
  {
    id: 'c1', name: 'Priya Sharma', phone: '+91 9876543210',
    totalOrders: 5
  },
  {
    id: 'c2', name: 'Rajesh M', phone: '+91 9876543211',
    totalOrders: 8
  },
  {
    id: 'c3', name: 'Anjali Verma', phone: '+91 9876543212',
    totalOrders: 3
  },
  {
    id: 'c4', name: 'Suresh Kumar', phone: '+91 9876543213',
    totalOrders: 12
  },
  {
    id: 'c5', name: 'Deepa Singh', phone: '+91 9876543214',
    totalOrders: 6
  },
  {
    id: 'c6', name: 'Rohan M', phone: '+91 9876543215',
    totalOrders: 10
  },
  {
    id: 'c7', name: 'Primya Sharma', phone: '+91 9876543216',
    totalOrders: 2
  },
];