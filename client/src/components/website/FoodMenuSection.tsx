import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFoodOrder } from '../../context/FoodOrderContext';
import { useLanguage } from '../../context/LanguageContext';
import { FoodMenuItem } from '../../types/food';
export type { FoodMenuItem };
import {
  Utensils,
  Flame,
  Leaf,
  Coffee,
  Wine,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Search,
  Check,
  X,
  Info,
  Clock,
  Award,
  ShoppingBag,
  Plus
} from 'lucide-react';

export const FOOD_MENU_DATA: FoodMenuItem[] = [
  // ── ETHIOPIAN TRADITIONAL & CULTURAL DISHES ─────────────────────────────
  {
    id: 'doro-wat',
    name: 'Classic Doro Wat with Boiled Egg & Ayib',
    amharicName: 'ዶሮ ወጥ',
    category: 'cultural',
    price: 750.00,
    image: '/images/food/doro-wat.jpg',
    description: 'Slow-simmered tender chicken drumsticks cooked in rich, aromatic berbere sauce, spiced clarified butter (Niter Kibbeh), served with hard-boiled egg, cottage cheese (Ayib), and warm sourdough Injera.',
    ingredients: 'Free-range chicken, Ethiopian berbere, caramelized red onions, niter kibbeh, garlic, ginger, boiled eggs, fresh injera',
    badge: 'Cultural Signature',
    isSpicy: true,
    servingTime: 'Lunch & Dinner',
    pairing: 'Chilled Tej Honey Wine or Ambo Mineral Water',
  },
  {
    id: 'kitfo',
    name: 'Authentic Gurage Kitfo with Ayib & Gomen',
    amharicName: 'ክትፎ',
    category: 'cultural',
    price: 700.00,
    image: '/images/food/kitfo.jpg',
    description: 'Finely minced lean prime beef gently warmed with spiced clarified butter (Niter Kibbeh) and fiery Mitmita chili, served with soft Ayib cottage cheese, collard greens (Gomen), and freshly baked Kocho or Injera.',
    ingredients: 'Prime tenderloin beef, niter kibbeh, mitmita chili, ayib cheese, seasoned collard greens, injera/kocho',
    badge: "Chef's Special",
    isSpicy: true,
    servingTime: 'Lunch & Dinner',
    pairing: 'Pure Ethiopian Tej or Bedele Special Beer',
  },
  {
    id: 'siga-tibs',
    name: 'Special Habesha Siga Tibs with Injera',
    amharicName: 'የበሬ ሥጋ ጥብስ',
    category: 'traditional',
    price: 650.00,
    image: '/images/food/siga-tibs.jpg',
    description: 'Sizzling prime beef cubes pan-seared with caramelized onions, garlic, fresh rosemary sprigs, and green chilies. Served bubbling hot on a traditional clay burner with soft injera and zesty awaze sauce.',
    ingredients: 'Prime cubed beef, rosemary, garlic, red onions, jalapeños, niter kibbeh, awaze dip, warm injera',
    badge: 'Guest Favorite',
    isSpicy: true,
    servingTime: 'Lunch & Dinner',
    pairing: 'Fresh Tej or St. George Lager',
  },
  {
    id: 'shiro-tegabino',
    name: 'Clay Pot Shiro Tegabino with Salad',
    amharicName: 'ሽሮ ተጋቢኖ',
    category: 'traditional',
    price: 380.00,
    image: '/images/food/shiro-tegabino.jpg',
    description: 'Sun-dried roasted chickpeas finely ground and simmered in garlic, ginger, and berbere until thick and velvety. Served bubbling hot in a traditional clay pot alongside fresh tomato salad and warm injera.',
    ingredients: 'Organic chickpea flour, berbere, garlic, onions, cardamom, virgin sunflower oil, fresh tomato salad, teff injera',
    badge: 'Popular Vegetarian / Fasting',
    isVegetarian: true,
    servingTime: 'All Day Dining',
    pairing: 'Fresh Tropical Spris or Hot Spiced Tea',
  },
  {
    id: 'beyeayinet',
    name: 'Fasting Beyaynetu Veggie Feast',
    amharicName: 'የፆም በያይነቱ',
    category: 'traditional',
    price: 480.00,
    image: '/images/food/beyeayinet.jpg',
    description: 'A colorful tapestry of Ethiopian plant-based stews: spicy red lentils (Misir Wat), yellow split peas (Kik Alicha), braised collard greens (Gomen), spiced cabbage & carrots, and beetroot salad layered over teff injera.',
    ingredients: 'Red lentils, yellow peas, collard greens, potatoes, carrots, cabbage, beetroot, garlic, teff injera',
    badge: 'Vegan & Fasting',
    isVegetarian: true,
    servingTime: 'Lunch & Dinner',
    pairing: 'Ambo sparkling water with lime slice',
  },
  {
    id: 'fish-tibs',
    name: 'Lake Tana Pan-Fried Fish Tibs',
    amharicName: 'የዓሣ ጥብስ',
    category: 'dinner',
    price: 620.00,
    image: '/images/food/fish-tibs.jpg',
    description: 'Crispy pan-seared freshwater tilapia cubes sautéed with sweet red onions, garlic, mild Ethiopian chili, and fresh lemon juice. Served with warm injera and mild senafich mustard.',
    ingredients: 'Fresh tilapia fillet, red onion, garlic, lemon, sweet peppers, mild senafich, teff injera',
    badge: 'Fresh Catch',
    servingTime: 'Dinner',
    pairing: 'Castel Ethiopian Dry White Wine',
  },
  {
    id: 'injera-teff',
    name: 'Freshly Baked Teff Injera Basket',
    amharicName: 'የሀበሻ ጤፍ እንጀራ',
    category: 'traditional',
    price: 150.00,
    image: '/images/food/injera.jpg',
    description: 'Soft, naturally fermented, slightly sour sourdough flatbread prepared from 100% pure Ethiopian brown and white teff grain. Gluten-free, rich in iron, and freshly made daily in our hotel kitchen.',
    ingredients: '100% pure Ethiopian teff grain, natural yeast culture, mountain spring water',
    badge: 'Gluten-Free Grain',
    isVegetarian: true,
    servingTime: 'All Day Dining',
    pairing: 'Accompanies all Ethiopian stews',
  },

  // ── BREAKFAST SELECTIONS ────────────────────────────────────────────────
  {
    id: 'chechebsa-ful',
    name: 'Habesha Morning Breakfast (Chechebsa & Ful)',
    amharicName: 'ጨጨብሳ እና ፉል',
    category: 'breakfast',
    price: 550.00,
    image: '/images/food/chechebsa-ful.jpg',
    description: 'Torn fresh flatbread pan-fried in clarified butter, honey, and mild berbere, served alongside slow-simmered spiced fava beans with olive oil, diced tomatoes, fresh scrambled eggs, and warm bread rolls.',
    ingredients: 'Handmade flatbread, pure honey, niter kibbeh, fava beans, olive oil, organic eggs, fresh bread',
    badge: 'Morning Special',
    isVegetarian: true,
    servingTime: '06:30 - 11:30 AM',
    pairing: 'Freshly Roasted Ethiopian Buna Coffee',
  },
  {
    id: 'nice-food-spread',
    name: 'Continental & Habesha Morning Spread',
    category: 'breakfast',
    price: 480.00,
    image: '/images/food/nice-food.jpg',
    description: 'Freshly baked butter croissants, artisan muffins, local cheeses, tropical sliced fruits (papaya, mango, watermelon), fruit preserves, and your choice of fresh juice or hot tea.',
    ingredients: 'Butter croissants, artisan pastries, Gouda cheese, tropical fruits, honey, butter, freshly squeezed juice',
    badge: 'Continental Style',
    isVegetarian: true,
    servingTime: '06:30 - 11:00 AM',
    pairing: 'Cappuccino or Ethiopian Spiced Tea',
  },
  {
    id: 'poached-eggs',
    name: 'Artisan Poached Eggs on Toasted Brioche',
    category: 'breakfast',
    price: 420.00,
    image: '/images/food/food-photo.avif',
    description: 'Two golden farm-fresh eggs poached to perfection, served over toasted artisan brioche with mashed avocado, cherry tomatoes, baby herbs, and mild hollandaise sauce.',
    ingredients: 'Farm eggs, brioche, fresh avocado, cherry tomatoes, herb butter, citrus hollandaise',
    badge: 'Healthy Start',
    isVegetarian: true,
    servingTime: '07:00 - 11:30 AM',
    pairing: 'Fresh Green Detox Juice or Americano',
  },

  // ── LUNCH SELECTIONS ────────────────────────────────────────────────────
  {
    id: 'al-risallah-buffet',
    name: 'Al-Risallah Executive Midday Platter',
    category: 'lunch',
    price: 720.00,
    image: '/images/food/al-risallah-restaurant.png',
    description: 'An opulent tasting plate featuring Mediterranean grilled chicken skewers, fragrant basmati pilaf, roasted vegetables, crisp tabbouleh salad, and roasted garlic hummus.',
    ingredients: 'Marinated chicken breast, basmati rice, bell peppers, zucchini, chickpeas, tahini, parsley, pita bread',
    badge: 'Executive Lunch',
    servingTime: '12:00 - 15:30 PM',
    pairing: 'Chilled Hibiscus Cooler or Ambo Soda',
  },
  {
    id: 'chicken-shawarma',
    name: 'Flame-Grilled Chicken Shawarma Platter',
    category: 'lunch',
    price: 580.00,
    image: '/images/food/chicken-shawarma-platter.png',
    description: 'Spit-roasted chicken marinated in Mediterranean spices, sliced thin and served with crispy spiced potato wedges, garlic toum sauce, pickled cucumbers, and warm pita bread.',
    ingredients: 'Marinated chicken thigh, Lebanese spices, garlic toum, potato wedges, pickled turnips, fresh pita',
    badge: 'High Protein',
    servingTime: '11:30 - 16:00 PM',
    pairing: 'Cold Mint Lemonade',
  },
  {
    id: 'falafel-hummus',
    name: 'Golden Falafel Plate with Creamy Tahini',
    category: 'lunch',
    price: 420.00,
    image: '/images/food/falafel-plate.png',
    description: 'Handcrafted golden crispy chickpea fritters infused with cilantro, parsley, and cumin. Served over velvet smooth hummus with pickled red cabbage, kalamata olives, and warm pita.',
    ingredients: 'Chickpeas, fresh herbs, cumin, sesame tahini, olive oil, pickled cabbage, warm flatbread',
    badge: 'Plant-Based',
    isVegetarian: true,
    servingTime: '11:30 - 17:00 PM',
    pairing: 'Iced Cardamom Tea',
  },
  {
    id: 'chef-salad',
    name: "Chef's Garden Crisp Herb Salad",
    category: 'lunch',
    price: 380.00,
    image: '/images/food/chher-slad.png',
    description: 'Crispy garden romaine lettuce, heirloom cherry tomatoes, sliced English cucumbers, kalamata olives, crumbled feta cheese, and toasted sunflower seeds in balsamic herb vinaigrette.',
    ingredients: 'Garden greens, cherry tomatoes, cucumbers, kalamata olives, Greek feta, balsamic vinaigrette',
    badge: 'Fresh & Light',
    isVegetarian: true,
    servingTime: 'All Day Dining',
    pairing: 'Chilled Ambo Mineral Water with lemon',
  },
  {
    id: 'rice-chicken-nooduls',
    name: 'Golden Rice with Sautéed Chicken & Stir-Fry',
    category: 'lunch',
    price: 550.00,
    image: '/images/food/rise-with-chiknes-nooduls.jpg',
    description: 'Fragrant golden saffron rice paired with tender sautéed chicken strips, wok-fried Asian noodles, baby corn, sweet bell peppers, and scallions in light ginger soy reduction.',
    ingredients: 'Long-grain rice, chicken breast, egg noodles, baby corn, bell peppers, soy sauce, sesame oil',
    badge: 'Hearty Lunch',
    servingTime: '12:00 - 16:00 PM',
    pairing: 'Chilled Jasmine Iced Tea',
  },

  // ── DINNER & FINE INTERNATIONAL ─────────────────────────────────────────
  {
    id: 'roasted-chicken',
    name: 'Lemon Herb Roasted Half Chicken',
    category: 'dinner',
    price: 780.00,
    image: '/images/food/lemon-herb-roasted-chicken.png',
    description: 'Juicy oven-roasted half chicken marinated with fresh thyme, rosemary, garlic, and Addis Ababa lemons. Served with buttery mashed potatoes and roasted honey-glazed baby carrots.',
    ingredients: 'Half spring chicken, fresh rosemary, thyme, garlic butter, Yukon gold potatoes, honey-glazed carrots',
    badge: 'Classic Roast',
    servingTime: '17:30 - 22:30 PM',
    pairing: 'Rift Valley Ethiopian Chardonnay',
  },
  {
    id: 'prime-beef-steak',
    name: 'Prime Grilled Beef Medallion & Truffle Butter',
    category: 'dinner',
    price: 980.00,
    image: '/images/food/double-tree.png',
    description: 'Charbroiled Angus beef steak cooked to your preferred temperature, topped with aromatic truffle herb butter. Accompanied by grilled asparagus and garlic roasted potato wedges.',
    ingredients: 'Prime Angus beef, French black truffle butter, green asparagus, roasted baby potatoes, red wine reduction',
    badge: 'Premium Cut',
    servingTime: '18:00 - 23:00 PM',
    pairing: 'Rift Valley Cabernet Sauvignon',
  },
  {
    id: 'spaghetti-bolognese',
    name: 'Slow-Simmered Spaghetti Bolognese',
    category: 'dinner',
    price: 580.00,
    image: '/images/food/spaghetti-bolognese.png',
    description: 'Authentic Italian spaghetti tossed with a slow-braised beef ragù of San Marzano tomatoes, sweet onions, celery, and red wine, finished with shaved Parmigiano-Reggiano and basil.',
    ingredients: 'Italian bronze-cut spaghetti, ground prime beef, San Marzano tomatoes, extra virgin olive oil, parmesan',
    badge: 'Italian Classic',
    servingTime: '17:30 - 22:30 PM',
    pairing: 'Italian Chianti or Merlot',
  },
  {
    id: 'penne-arrabbiata',
    name: "Penne all'Arrabbiata & Creamy Herb Pasta",
    category: 'dinner',
    price: 480.00,
    image: '/images/food/pasta-with-souse.jpg',
    description: 'Al dente penne pasta coated in a spicy tomato garlic sauce with crushed red chilies, extra virgin olive oil, fresh sweet basil, and a dollop of creamy ricotta cheese.',
    ingredients: 'Penne rigate, garlic, crushed red peppers, vine tomatoes, extra virgin olive oil, sweet basil, ricotta',
    badge: 'Vegetarian',
    isVegetarian: true,
    isSpicy: true,
    servingTime: '17:30 - 22:30 PM',
    pairing: 'Chilled Pinot Grigio',
  },
  {
    id: 'pad-thai',
    name: 'Bangkok Tamarind Vegetable Pad Thai',
    category: 'dinner',
    price: 520.00,
    image: '/images/food/vegetable-pad-thai.png',
    description: 'Traditional wok-fried flat rice noodles tossed with crispy tofu, bean sprouts, Chinese chives, crushed roasted peanuts, and tangy tamarind-lime sauce.',
    ingredients: 'Rice noodles, organic firm tofu, bean sprouts, tamarind sauce, peanuts, lime wedges, scallions',
    badge: 'Asian Wok',
    isVegetarian: true,
    servingTime: '17:00 - 22:30 PM',
    pairing: 'Singha or Bedele Cold Beer',
  },
  {
    id: 'asian-noodles',
    name: 'Wok-Tossed Ribbon Noodles with Vegetables',
    category: 'dinner',
    price: 450.00,
    image: '/images/food/nuduls-with-vegitables.jpg',
    description: 'Tender egg ribbon noodles flash-fried with shredded carrots, snow peas, bell peppers, and scallions in an aromatic sesame ginger sauce.',
    ingredients: 'Egg noodles, carrots, snap peas, bell peppers, toasted sesame seeds, garlic, ginger reduction',
    badge: 'Quick & Healthy',
    isVegetarian: true,
    servingTime: 'All Day Dining',
    pairing: 'Iced Lemongrass Tea',
  },

  // ── CASUAL BITES & INTERNATIONAL ────────────────────────────────────────
  {
    id: 'cheeseburger-fries',
    name: 'Artisan Angus Cheeseburger & Golden Fries',
    category: 'lunch',
    price: 520.00,
    image: '/images/food/classic-cheeseburger-and-fries.png',
    description: 'Flame-grilled 200g prime beef patty layered with melted cheddar cheese, crisp lettuce, ripe tomatoes, sweet pickles, and house secret sauce on a toasted brioche bun with crispy fries.',
    ingredients: 'Prime Angus beef patty, aged cheddar, lettuce, beefsteak tomato, pickles, brioche bun, seasoned fries',
    badge: 'Crowd Favorite',
    servingTime: '11:00 - 23:00 PM',
    pairing: 'Craft Beer or Chilled Coca-Cola',
  },
  {
    id: 'crispy-chicken-sandwich',
    name: 'Buttermilk Crispy Chicken Sandwich',
    category: 'lunch',
    price: 480.00,
    image: '/images/food/crispy-chicken-sandwich.png',
    description: 'Double-breaded golden crispy chicken breast topped with creamy honey mustard slaw, dill pickles, and chipotle mayo on a toasted brioche bun with potato wedges.',
    ingredients: 'Chicken breast, buttermilk marinade, cabbage slaw, honey mustard, dill pickles, chipotle mayo, brioche bun',
    badge: 'Crispy & Juicy',
    servingTime: '11:00 - 23:00 PM',
    pairing: 'Freshly Brewed Iced Tea',
  },
  {
    id: 'margherita-pizza',
    name: 'Wood-Fired Margherita Napoletana Pizza',
    category: 'dinner',
    price: 550.00,
    image: '/images/food/margherita-pizza.png',
    description: 'Stone-baked thin crust pizza topped with crushed San Marzano tomato sauce, creamy fresh mozzarella fior di latte, fresh basil leaves, and a drizzle of extra virgin olive oil.',
    ingredients: 'Stone-ground flour, San Marzano tomatoes, fresh mozzarella, sweet basil, cold-pressed olive oil',
    badge: 'Wood-Fired',
    isVegetarian: true,
    servingTime: '12:00 - 23:00 PM',
    pairing: 'Sparkling Italian San Pellegrino',
  },
  {
    id: 'fiesta-burrito',
    name: 'Fiesta Seasoned Beef & Bean Burrito',
    category: 'lunch',
    price: 460.00,
    image: '/images/food/burrito.png',
    description: 'Warm jumbo flour tortilla filled with spiced shredded beef, Mexican rice, seasoned black beans, melted pepper jack cheese, pico de gallo salsa, and creamy guacamole.',
    ingredients: 'Flour tortilla, spiced shredded beef, black beans, Mexican rice, pepper jack, pico de gallo, guacamole',
    badge: 'Mexican Style',
    servingTime: '11:30 - 22:00 PM',
    pairing: 'Fresh Lime Soda or Corona',
  },

  // ── ETHIOPIAN DRINKS & COFFEE ───────────────────────────────────────────
  {
    id: 'coffee-ceremony',
    name: 'Traditional Ethiopian Coffee Ceremony (Buna Tetu)',
    amharicName: 'የቡና ሥነ-ሥርዓት',
    category: 'drinks',
    price: 350.00,
    image: '/images/food/coffee-ceremony.jpg',
    description: 'The world-famous Ethiopian ritual: green Sidamo & Yirgacheffe coffee beans roasted tableside over charcoal, ground by hand, brewed in a black clay Jebena, and poured into delicate Sini cups with smoking frankincense and hot popped corn.',
    ingredients: '100% Ethiopian single-origin Arabica beans, mountain spring water, fresh popcorn, frankincense aroma',
    badge: 'Authentic Experience',
    servingTime: 'Daily: 07:00 - 21:00 PM',
    pairing: 'Traditional Fresh Popcorn & Spiced Bread',
  },
  {
    id: 'ethiopian-tej',
    name: 'Authentic Ethiopian Tej (Honey Wine)',
    amharicName: 'ጠጅ',
    category: 'drinks',
    price: 320.00,
    image: '/images/food/ethiopian-tej.jpg',
    description: 'Ancient royal honey wine crafted from pure high-altitude forest honey and Gesho leaves (Ethiopian buckthorn). Served chilled in a traditional round-bottomed glass flask (Berele). Sweet, aromatic, and gently warming.',
    ingredients: 'Pure mountain forest honey, wild Gesho hops, natural ferment, spring water',
    badge: 'Ancient Royal Drink',
    servingTime: '12:00 - 23:30 PM',
    pairing: 'Perfect accompaniment to Doro Wat & Siga Tibs',
  },
  {
    id: 'spris-juice',
    name: 'Fresh Tropical Fruit Juice Spris (Avocado & Mango)',
    amharicName: 'ስፕሪስ',
    category: 'drinks',
    price: 220.00,
    image: '/images/food/spris-juice.jpg',
    description: 'Addis Ababa’s famous layered fruit drink: thick velvety avocado puree, sweet sunrise papaya, and ripe mango, poured in vibrant layers and served chilled with a fresh lime wedge and sugar cane syrup.',
    ingredients: 'Fresh Ethiopian avocado, ripe Harar mango, sweet rift valley papaya, lime juice',
    badge: '100% Fresh Fruit',
    isVegetarian: true,
    servingTime: '07:00 - 22:00 PM',
    pairing: 'Refreshing morning or afternoon delight',
  },

  // ── DESSERTS & SWEETS ───────────────────────────────────────────────────
  {
    id: 'honey-chechebsa-dessert',
    name: 'Sweet Honey Chechebsa with Clotted Cream',
    amharicName: 'ጣፋጭ ጨጨብሳ',
    category: 'desserts',
    price: 320.00,
    image: '/images/food/chechebsa-ful.jpg',
    description: 'Warm pan-toasted butter bread morsels drizzled with spiced mountain honey, cardamom, and cinnamon, served with a scoop of clotted cream or Madagascar vanilla bean gelato.',
    ingredients: 'Flatbread, mountain honey, niter kibbeh, cinnamon, cardamom, clotted cream',
    badge: 'Warm Dessert',
    isVegetarian: true,
    servingTime: '12:00 - 22:30 PM',
    pairing: 'Hot Spiced Tea or Espresso',
  },
  {
    id: 'baklava-honey',
    name: 'Spiced Honey Pistachio Baklava',
    category: 'desserts',
    price: 350.00,
    image: '/images/food/nice-food.jpg',
    description: 'Crisp, golden layers of delicate filo pastry filled with crushed pistachios and walnuts, saturated in warm honey blossom syrup with a hint of Ethiopian clove.',
    ingredients: 'Filo pastry, pistachios, walnuts, pure honey, orange blossom water, cloves, butter',
    badge: 'Flaky & Sweet',
    isVegetarian: true,
    servingTime: '12:00 - 23:00 PM',
    pairing: 'Traditional Ethiopian Jebena Coffee',
  },
];

export const FoodMenuSection: React.FC = () => {
  const { currency } = useAuth();
  const { openItemDetails, cartCount, setIsCartOpen } = useFoodOrder();
  const { t, language } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAll, setShowAll] = useState(false);

  const categories = [
    { id: 'all', label: t('menu.cat_all', 'All Dishes'), icon: Utensils, count: FOOD_MENU_DATA.length },
    { id: 'traditional', label: t('menu.cat_traditional', 'Ethiopian Traditional Food'), icon: Flame, count: FOOD_MENU_DATA.filter(d => d.category === 'traditional' || d.category === 'cultural').length },
    { id: 'breakfast', label: t('menu.cat_breakfast', 'Breakfast'), icon: Clock, count: FOOD_MENU_DATA.filter(d => d.category === 'breakfast').length },
    { id: 'lunch', label: t('menu.cat_lunch', 'Lunch'), icon: Utensils, count: FOOD_MENU_DATA.filter(d => d.category === 'lunch').length },
    { id: 'dinner', label: t('menu.cat_dinner', 'Dinner'), icon: Award, count: FOOD_MENU_DATA.filter(d => d.category === 'dinner').length },
    { id: 'cultural', label: t('menu.cat_cultural', 'Cultural Dishes'), icon: Flame, count: FOOD_MENU_DATA.filter(d => d.category === 'cultural').length },
    { id: 'drinks', label: t('menu.cat_drinks', 'Drinks & Buna'), icon: Coffee, count: FOOD_MENU_DATA.filter(d => d.category === 'drinks').length },
    { id: 'desserts', label: t('menu.cat_desserts', 'Desserts & Sweets'), icon: Sparkles, count: FOOD_MENU_DATA.filter(d => d.category === 'desserts').length },
  ];

  const filteredDishes = FOOD_MENU_DATA.filter(item => {
    // Category filter
    if (activeCategory === 'traditional') {
      if (item.category !== 'traditional' && item.category !== 'cultural') return false;
    } else if (activeCategory !== 'all' && item.category !== activeCategory) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchAmharic = item.amharicName?.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchIngr = item.ingredients.toLowerCase().includes(q);
      if (!matchName && !matchAmharic && !matchDesc && !matchIngr) return false;
    }
    return true;
  });

  // Limit displayed items initially to keep interface clean
  const initialLimit = 8;
  const displayedDishes = showAll ? filteredDishes : filteredDishes.slice(0, initialLimit);
  const hasMore = filteredDishes.length > initialLimit;

  return (
    <section id="food-menu" className="py-24 bg-slate-950 text-slate-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-widest mb-3 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            <Utensils className="w-3.5 h-3.5" /> {t('menu.badge', 'Authentic Culinary Excellence')}
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
            {t('menu.title', 'Ethiopian & International Food Menu')}
          </h2>
          <p className="text-slate-400 text-sm sm:text-base font-light leading-relaxed">
            {t('menu.subtitle', 'Click any delicious dish to inspect fresh ingredients, customize special requests, and order directly to your room or dining table.')}
          </p>

          {/* Cart Shortcut if items in cart */}
          {cartCount > 0 && (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 text-xs font-bold hover:bg-amber-500 hover:text-slate-950 transition-all cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{cartCount} {t('menu.cart_indicator', 'dish(es) in your order cart • Click to view')}</span>
              </button>
            </div>
          )}

          {/* Search Bar */}
          <div className="relative max-w-md mx-auto mt-6">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('menu.search_placeholder', 'Search dishes, ingredients (e.g., Doro Wat, Kitfo, Shiro)...')}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setShowAll(false);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20 font-bold'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Food Items Grid */}
        {displayedDishes.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800 max-w-md mx-auto">
            <Utensils className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="font-serif text-lg font-bold text-slate-200">{t('menu.no_dishes_found', 'No dishes found')}</h3>
            <p className="text-xs text-slate-400 mt-1">{t('menu.try_search_again', 'Try another search term or select a different category.')}</p>
            <button
              onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}
              className="mt-4 px-4 py-2 bg-amber-500 text-slate-950 text-xs font-bold rounded-lg hover:bg-amber-400 transition-colors"
            >
              {t('menu.reset_filters', 'Reset Filters')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedDishes.map((item) => (
              <div
                key={item.id}
                onClick={() => openItemDetails(item)}
                className="group bg-slate-900/90 rounded-2xl overflow-hidden border border-slate-800/90 hover:border-amber-500/50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 flex flex-col cursor-pointer"
              >
                {/* Image & Badges */}
                <div className="relative h-52 overflow-hidden bg-slate-950">
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/images/food/doro-wat.jpg';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/40" />

                  {/* Top Badge */}
                  {item.badge && (
                    <span className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-bold text-amber-300 border border-amber-500/30">
                      {item.badge}
                    </span>
                  )}

                  {/* Price Tag in authentic ETB */}
                  <div className="absolute bottom-3 right-3 bg-slate-900/95 backdrop-blur-md px-3 py-1 rounded-lg border border-amber-500/40 text-amber-400 font-serif font-bold text-base shadow-lg">
                    {currency}{item.price.toFixed(2)}
                  </div>

                  {/* Amharic Title Badge */}
                  {item.amharicName && language !== 'am' && (
                    <span className="absolute top-3 right-3 bg-slate-950/80 px-2 py-0.5 rounded text-[11px] font-medium text-amber-200/90 border border-amber-500/20 font-serif">
                      {item.amharicName}
                    </span>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-serif text-base font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                      {language === 'am' && item.amharicName ? item.amharicName : item.name}
                    </h3>
                    {language === 'am' && item.amharicName && (
                      <span className="text-[11px] text-amber-400/80 block font-sans line-clamp-1">
                        {item.name}
                      </span>
                    )}
                    <p className="text-slate-400 text-xs font-light leading-relaxed mt-1.5 line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  {/* Highlights / Dietary Indicators & Order CTA */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      {item.isSpicy && (
                        <span className="flex items-center gap-1 text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                          <Flame className="w-3 h-3" /> {t('menu.spicy_berbere', 'Berbere')}
                        </span>
                      )}
                      {item.isVegetarian && (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          <Leaf className="w-3 h-3" /> {t('menu.fasting', 'Fasting')}
                        </span>
                      )}
                      {!item.isSpicy && !item.isVegetarian && (
                        <span className="text-[10px] text-slate-400">
                          {item.servingTime || 'All Day'}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openItemDetails(item);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-400/40 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{t('menu.order_btn', 'Order')}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View More / Show Less Button */}
        {hasMore && (
          <div className="text-center mt-12">
            <button
              onClick={() => setShowAll(!showAll)}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 hover:border-amber-400 text-xs sm:text-sm font-bold tracking-wider transition-all shadow-xl hover:shadow-amber-500/10 cursor-pointer"
            >
              <span>{showAll ? t('menu.show_less', 'Show Fewer Dishes') : (language === 'am' ? `ተጨማሪ ምግቦችን እይ (${filteredDishes.length - initialLimit})` : `View More Dishes (${filteredDishes.length - initialLimit} more)` )}</span>
              {showAll ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
