import React, { useState } from 'react';
import {
  Utensils,
  Sparkles,
  Car,
  Shirt,
  Wine,
  Users,
  Coffee,
  CheckCircle2,
  Clock,
  Flame,
  Award,
  Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFoodOrder } from '../../context/FoodOrderContext';
import { useLanguage } from '../../context/LanguageContext';
import { FoodMenuItem } from '../../types/food';

export const ServicesSection: React.FC = () => {
  const { currency } = useAuth();
  const { openItemDetails } = useFoodOrder();
  const { t, language } = useLanguage();
  const [activeMenuCategory, setActiveMenuCategory] = useState<'all' | 'food' | 'coffee_breakfast' | 'drinks'>('all');

  // Core Hotel Experiences
  const hotelServices = [
    {
      icon: Utensils,
      title: t('services.dining_title', 'Habesha Cultural Restaurant & Dining'),
      desc: t('services.dining_desc', 'Enjoy authentic Ethiopian dishes like Doro Wat, sizzling Siga Tibs, Kitfo, and Shiro, alongside continental meals. Open every day for breakfast, lunch, and dinner.'),
      highlight: t('services.dining_tag', 'Open Daily 06:30 - 23:00'),
      image: '/images/services/restaurant-dining.jpg',
    },
    {
      icon: Coffee,
      title: language === 'am' ? 'የኢትዮጵያ ባህላዊ የቡና ሥነ-ሥርዓት (ቡና ጠጡ)' : 'Traditional Ethiopian Coffee Ceremony (Buna Tetu)',
      desc: language === 'am' ? 'በየቀኑ የሚዘጋጅ ባህላዊ የቡና ሥነ-ሥርዓት። ትኩስ የሀገር ቡና ከፊትዎ ተቆልቶ በጀበና ተፈልቶ ከፈንድሻ ጋር ይቀርባል።' : 'Experience our daily traditional coffee ceremony. Fresh coffee beans roasted right in front of you, brewed in a clay Jebena pot, and served with popcorn.',
      highlight: language === 'am' ? 'በየቀኑ በ10:00 እና 16:00' : 'Daily at 10:00 & 16:00',
      image: '/images/services/coffee-ceremony.jpg',
    },
    {
      icon: Car,
      title: t('services.shuttle_title', 'Bole Airport Pickup & Transfer Shuttle'),
      desc: t('services.shuttle_desc', 'Comfortable, safe, and air-conditioned shuttle between the hotel and Addis Ababa Bole International Airport (Terminals 1 & 2), just 5 minutes away.'),
      highlight: t('services.shuttle_tag', '5 Min to Bole Airport'),
      image: '/images/services/airport-shuttle.jpg',
    },
    {
      icon: Sparkles,
      title: t('services.spa_title', 'Eucalyptus Steam, Sauna & Massage Spa'),
      desc: t('services.spa_desc', 'Relax and unwind with natural eucalyptus herbal steam baths, hot Finnish sauna, and soothing full-body Swedish massages by friendly therapists.'),
      highlight: t('services.spa_tag', 'Steam, Sauna & Massage'),
      image: '/images/services/spa-massage.jpg',
    },
    {
      icon: Users,
      title: t('services.conf_title', 'Meeting Halls & Wedding Center'),
      desc: t('services.conf_desc', 'Modern air-conditioned event halls with fast Wi-Fi, audio projector, sound system, and catering for business conferences, workshops, and weddings.'),
      highlight: t('services.conf_tag', 'Full Catering Available'),
      image: '/images/services/conference-hall.jpg',
    },
    {
      icon: Shirt,
      title: t('services.laundry_title', 'Express Laundry & Traditional Dress Care'),
      desc: t('services.laundry_desc', 'Fast same-day washing, dry cleaning, and gentle fabric steam pressing for suits, shirts, and traditional Ethiopian dresses (Habesha Kemis).'),
      highlight: t('services.laundry_tag', 'Same-Day Service'),
      image: '/images/services/laundry-service.jpg',
    },
  ];

  // Specific Ethiopian Food & Drink Menu Items with authentic ETB prices
  const menuItems: (FoodMenuItem & { desc: string; tag: string })[] = [
    {
      id: 'coffee-ceremony',
      category: 'drinks',
      name: 'Traditional Ethiopian Coffee Ceremony (Buna Tetu)',
      amharicName: 'የቡና ሥነ-ሥርዓት',
      price: 350.0,
      badge: 'Cultural Experience',
      image: '/images/food/coffee-ceremony.jpg',
      description: 'Fresh highland coffee beans roasted over charcoal, brewed three times (Abol, Tona, Bereka) in a clay Jebena pot, served with hot popcorn and sweet frankincense aroma.',
      desc: 'Fresh highland coffee beans roasted over charcoal, brewed three times (Abol, Tona, Bereka) in a clay Jebena pot, served with hot popcorn and sweet frankincense aroma.',
      tag: 'Fresh Roasted Highland Beans',
      ingredients: '100% Ethiopian single-origin Arabica beans, mountain spring water, fresh popcorn, frankincense aroma',
      servingTime: 'Daily: 07:00 - 21:00 PM',
      pairing: 'Traditional Fresh Popcorn & Spiced Bread',
    },
    {
      id: 'siga-tibs',
      category: 'traditional',
      name: 'Special Habesha Siga Tibs with Injera',
      amharicName: 'የበሬ ሥጋ ጥብስ',
      price: 650.0,
      badge: 'Guest Favorite',
      image: '/images/food/siga-tibs.jpg',
      description: 'Tender beef cubes sautéed with sliced red onions, garlic, fresh rosemary sprigs, and green jalapeño peppers. Served sizzling hot on a clay burner with soft injera and spicy awaze dip.',
      desc: 'Tender beef cubes sautéed with sliced red onions, garlic, fresh rosemary sprigs, and green jalapeño peppers. Served sizzling hot on a clay burner with soft injera and spicy awaze dip.',
      tag: 'Served Sizzling Hot',
      ingredients: 'Prime cubed beef, rosemary, garlic, red onions, jalapeños, niter kibbeh, awaze dip, warm injera',
      isSpicy: true,
      servingTime: 'Lunch & Dinner',
      pairing: 'Fresh Tej or St. George Lager',
    },
    {
      id: 'doro-wat',
      category: 'cultural',
      name: 'Classic Doro Wat with Boiled Egg & Ayib',
      amharicName: 'ዶሮ ወጥ',
      price: 750.0,
      badge: 'Ethiopian National Dish',
      image: '/images/food/doro-wat.jpg',
      description: 'Slow-simmered chicken drumsticks in a rich, flavorful red berbere sauce, seasoned with spiced clarified butter (Niter Kibbeh). Served with a hard-boiled egg, fresh Ayib (cottage cheese), and warm injera.',
      desc: 'Slow-simmered chicken drumsticks in a rich, flavorful red berbere sauce, seasoned with spiced clarified butter (Niter Kibbeh). Served with a hard-boiled egg, fresh Ayib (cottage cheese), and warm injera.',
      tag: 'Rich Berbere Stew',
      ingredients: 'Free-range chicken, Ethiopian berbere, caramelized red onions, niter kibbeh, garlic, ginger, boiled eggs, fresh injera',
      isSpicy: true,
      servingTime: 'Lunch & Dinner',
      pairing: 'Chilled Tej Honey Wine or Ambo Mineral Water',
    },
    {
      id: 'kitfo',
      category: 'cultural',
      name: 'Special Ethiopian Kitfo with Ayib & Gomen',
      amharicName: 'ክትፎ',
      price: 700.0,
      badge: 'House Specialty',
      image: '/images/food/kitfo.jpg',
      description: 'Freshly minced prime lean beef seasoned with warm golden Niter Kibbeh (herbal spiced butter) and fiery mitmita spice. Served with seasoned collard greens (Gomen), fresh Ayib cottage cheese, and soft teff injera.',
      desc: 'Freshly minced prime lean beef seasoned with warm golden Niter Kibbeh (herbal spiced butter) and fiery mitmita spice. Served with seasoned collard greens (Gomen), fresh Ayib cottage cheese, and soft teff injera.',
      tag: 'Prime Lean Beef',
      ingredients: 'Prime tenderloin beef, niter kibbeh, mitmita chili, ayib cheese, seasoned collard greens, injera/kocho',
      isSpicy: true,
      servingTime: 'Lunch & Dinner',
      pairing: 'Pure Ethiopian Tej or Bedele Special Beer',
    },
    {
      id: 'shiro-tegabino',
      category: 'traditional',
      name: 'Clay Pot Shiro Tegabino with Salad',
      amharicName: 'ሽሮ ተጋቢኖ',
      price: 380.0,
      badge: 'Popular Vegetarian / Fasting',
      image: '/images/food/shiro-tegabino.jpg',
      description: 'A comforting, velvety stew of roasted chickpea and lentil flour gently simmered with garlic, ginger, and Ethiopian spices. Served bubbling hot in an earthen pot with fresh injera and green chili tomato salad.',
      desc: 'A comforting, velvety stew of roasted chickpea and lentil flour gently simmered with garlic, ginger, and Ethiopian spices. Served bubbling hot in an earthen pot with fresh injera and green chili tomato salad.',
      tag: 'Vegetarian Friendly',
      ingredients: 'Organic chickpea flour, berbere, garlic, onions, cardamom, virgin sunflower oil, fresh tomato salad, teff injera',
      isVegetarian: true,
      servingTime: 'All Day Dining',
      pairing: 'Fresh Tropical Spris or Hot Spiced Tea',
    },
    {
      id: 'chechebsa-ful',
      category: 'breakfast',
      name: 'Habesha Morning Breakfast (Chechebsa & Ful)',
      amharicName: 'ጨጨብሳ እና ፉል',
      price: 550.0,
      badge: 'Morning Special',
      image: '/images/food/chechebsa-ful.jpg',
      description: 'Warm Chechebsa (soft shredded flatbread cooked with spiced butter and honey) served alongside a hot bowl of Ful Mudammas (fava beans with olive oil, egg, and fresh bread) and spiced tea.',
      desc: 'Warm Chechebsa (soft shredded flatbread cooked with spiced butter and honey) served alongside a hot bowl of Ful Mudammas (fava beans with olive oil, egg, and fresh bread) and spiced tea.',
      tag: 'Served 06:30 - 11:00 AM',
      ingredients: 'Handmade flatbread, pure honey, niter kibbeh, fava beans, olive oil, organic eggs, fresh bread',
      isVegetarian: true,
      servingTime: '06:30 - 11:30 AM',
      pairing: 'Freshly Roasted Ethiopian Buna Coffee',
    },
    {
      id: 'spris-juice',
      category: 'drinks',
      name: 'Fresh Tropical Fruit Juice "Spris" (Avocado & Mango)',
      amharicName: 'ስፕሪስ',
      price: 220.0,
      badge: 'Fresh Daily',
      image: '/images/food/spris-juice.jpg',
      description: 'Freshly blended layers of thick Ethiopian avocado, ripe mango, and sweet papaya juice served in a tall chilled glass with fresh lime. 100% natural and freshly squeezed.',
      desc: 'Freshly blended layers of thick Ethiopian avocado, ripe mango, and sweet papaya juice served in a tall chilled glass with fresh lime. 100% natural and freshly squeezed.',
      tag: 'No Added Sugar',
      ingredients: 'Fresh Ethiopian avocado, ripe Harar mango, sweet rift valley papaya, lime juice',
      isVegetarian: true,
      servingTime: '07:00 - 22:00 PM',
      pairing: 'Refreshing morning or afternoon delight',
    },
    {
      id: 'ethiopian-tej',
      category: 'drinks',
      name: 'Authentic Ethiopian Tej (Honey Wine) & Cold Drinks',
      amharicName: 'ጠጅ',
      price: 320.0,
      badge: 'Traditional Drink',
      image: '/images/food/ethiopian-tej.jpg',
      description: 'Naturally fermented Ethiopian honey wine (Tej) served in a traditional round Berele glass flask. Also available: cold St. George beer, Habesha beer, and sparkling Ambo mineral water.',
      desc: 'Naturally fermented Ethiopian honey wine (Tej) served in a traditional round Berele glass flask. Also available: cold St. George beer, Habesha beer, and sparkling Ambo mineral water.',
      tag: 'Served in Berele Flask',
      ingredients: 'Pure mountain forest honey, wild Gesho hops, natural ferment, spring water',
      servingTime: '12:00 - 23:30 PM',
      pairing: 'Perfect accompaniment to Doro Wat & Siga Tibs',
    },
  ];

  const filteredMenu = menuItems.filter(item => {
    if (activeMenuCategory === 'food') return item.category === 'traditional' || item.category === 'cultural';
    if (activeMenuCategory === 'coffee_breakfast') return item.category === 'breakfast' || item.id === 'coffee-ceremony';
    if (activeMenuCategory === 'drinks') return item.category === 'drinks';
    return true;
  });

  return (
    <section id="services" className="py-24 bg-slate-950 text-slate-100 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 relative z-10 space-y-20">
        
        {/* PART 1: CORE HOTEL SERVICES */}
        <div>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-3">
              {t('services.badge', 'Hotel Amenities & Experiences')}
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4">
              {t('services.title', 'Everything You Need for a Comfortable Stay')}
            </h2>
            <p className="text-slate-400 text-sm max-w-2xl mx-auto">
              {t('services.subtitle', 'From delicious dining and 24-hour room service to private airport shuttles and rejuvenating spa baths, experience 5-star hospitality in Bole.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotelServices.map((svc, idx) => {
              const Icon = svc.icon;
              return (
                <div
                  key={idx}
                  className="group relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all duration-300 shadow-xl flex flex-col justify-end min-h-[340px]"
                >
                  {/* Background Image with Gradient Overlay */}
                  <div className="absolute inset-0">
                    <img
                      src={svc.image}
                      alt={svc.title}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/images/services/restaurant-dining.jpg';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-50"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
                  </div>

                  {/* Content Overlay */}
                  <div className="relative p-6 z-10 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-semibold text-amber-300 bg-slate-950/80 px-2.5 py-1 rounded-full border border-amber-500/30">
                        {svc.highlight}
                      </span>
                    </div>

                    <h3 className="font-serif text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                      {svc.title}
                    </h3>

                    <p className="text-slate-300 text-xs sm:text-sm font-light leading-relaxed">
                      {svc.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PART 2: ETHIOPIAN FOOD, DRINKS & COFFEE SHOWCASE */}
        <div className="pt-12 border-t border-slate-900">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-3">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('services.food_showcase_badge', 'Authentic Ethiopian Dining & Room Service')}</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
              {t('services.food_showcase_title', 'Delicious Food, Coffee & Fresh Drinks')}
            </h2>

            {/* Filter Pills */}
            <div className="inline-flex p-1 bg-slate-900 rounded-xl border border-slate-800 mt-6 text-xs font-semibold">
              <button
                onClick={() => setActiveMenuCategory('all')}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeMenuCategory === 'all'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t('services.filter_all_menu', 'All Menu Items')} ({menuItems.length})
              </button>
              <button
                onClick={() => setActiveMenuCategory('food')}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeMenuCategory === 'food'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t('services.filter_trad_dishes', 'Traditional Dishes')}
              </button>
              <button
                onClick={() => setActiveMenuCategory('coffee_breakfast')}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeMenuCategory === 'coffee_breakfast'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t('services.filter_coffee_brk', 'Coffee & Breakfast')}
              </button>
              <button
                onClick={() => setActiveMenuCategory('drinks')}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeMenuCategory === 'drinks'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t('services.filter_juices_tej', 'Juices & Tej Wine')}
              </button>
            </div>
          </div>

          {/* Food Menu Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMenu.map(item => (
              <div
                key={item.id}
                onClick={() => openItemDetails(item)}
                className="group bg-slate-900/80 rounded-2xl overflow-hidden border border-slate-800 hover:border-amber-500/50 transition-all duration-300 shadow-xl flex flex-col cursor-pointer hover:shadow-2xl hover:shadow-amber-500/10"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/images/food/doro-wat.jpg';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30" />

                  {/* Badge */}
                  <span className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-bold text-amber-300 border border-amber-500/30">
                    {item.badge}
                  </span>

                  {/* Price */}
                  <div className="absolute bottom-3 right-3 bg-slate-900/95 backdrop-blur-md px-3 py-1 rounded-lg border border-amber-500/30 text-amber-400 font-serif font-bold text-base shadow-lg">
                    {currency}{item.price.toFixed(2)}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                      {language === 'am' && item.amharicName ? item.amharicName : item.name}
                    </h3>
                    {language === 'am' && item.amharicName && (
                      <span className="text-[11px] text-amber-400/80 block font-sans">
                        {item.name}
                      </span>
                    )}
                    <p className="text-slate-400 text-xs font-light leading-relaxed mt-1.5">
                      {item.desc}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 text-amber-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {language === 'am' ? t('services.room_delivery_avail', 'ወደ ክፍል ይደርሳል') : item.tag}
                    </span>
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

          {/* Quick Note Strip & Full Menu CTA */}
          <div className="mt-8 p-5 bg-gradient-to-r from-amber-500/10 via-slate-900 to-amber-500/5 rounded-2xl border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <span className="text-amber-400 font-bold block text-sm">{t('services.explore_menu_title', 'Explore Our Full Ethiopian & International Food Menu')}</span>
              <span className="text-xs text-slate-400">{t('services.explore_menu_desc', 'Discover all traditional dishes, breakfast spreads, lunches, dinners, sweet desserts, and cultural beverages with ingredients and recipes.')}</span>
            </div>
            <a
              href="#food-menu"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs whitespace-nowrap transition-colors shadow-lg shadow-amber-500/20"
            >
              {t('services.view_full_menu_btn', 'View Full Food Menu & Gallery')}
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
