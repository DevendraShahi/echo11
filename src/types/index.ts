export interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  link?: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
}

export interface PricingTier {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  recommended?: boolean;
}

export interface NavItem {
  name: string;
  href: string;
}
