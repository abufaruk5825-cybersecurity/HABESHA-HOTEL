import React from 'react';
import { Hero } from '../components/website/Hero';
import { RoomShowcase } from '../components/website/RoomShowcase';
import { ServicesSection } from '../components/website/ServicesSection';
import { FoodMenuSection } from '../components/website/FoodMenuSection';
import { GallerySection } from '../components/website/GallerySection';
import { StaffSection } from '../components/website/StaffSection';
import { ReviewsSection } from '../components/website/ReviewsSection';
import { AboutFaqContact } from '../components/website/AboutFaqContact';
import { Footer } from '../components/common/Footer';

interface PublicWebsiteProps {
  onOpenBookingModal: (roomTypeId?: number) => void;
  onSearchAvailability: (checkIn: string, checkOut: string, guests: number) => void;
  onOpenAboutModal?: () => void;
  onOpenContactModal?: () => void;
}

export const PublicWebsite: React.FC<PublicWebsiteProps> = ({
  onOpenBookingModal,
  onSearchAvailability,
  onOpenAboutModal,
  onOpenContactModal,
}) => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      {/* 1. Hero with Availability Search */}
      <Hero
        onSearchAvailability={onSearchAvailability}
        onOpenBookingModal={() => onOpenBookingModal()}
      />

      {/* 2. Accommodations Showcase (#rooms) */}
      <RoomShowcase
        onSelectRoomType={(typeId) => onOpenBookingModal(typeId)}
      />

      {/* 3. Premier Hotel Amenities & Wellness (#services) */}
      <ServicesSection />

      {/* 4. Categorized Food Menu & Gallery (#food-menu) */}
      <FoodMenuSection />

      {/* 5. Photo Gallery Showcase (#gallery) */}
      <GallerySection />

      {/* 6. Meet Our Ethiopian Hospitality Staff (#staff) */}
      <StaffSection />

      {/* 7. Verified Guest Reviews (#reviews) */}
      <ReviewsSection />

      {/* 8. Heritage Story, FAQ & Concierge Inquiry (#about, #contact) */}
      <AboutFaqContact />

      {/* 9. Global Footer */}
      <Footer
        onOpenAboutModal={onOpenAboutModal}
        onOpenContactModal={onOpenContactModal}
      />
    </div>
  );
};
