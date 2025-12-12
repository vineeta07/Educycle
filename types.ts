
export type Language = 'en' | 'hi' | 'ta' | 'gu';

export type UserRole = 'buyer' | 'seller';

export interface Review {
  id: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number; // Added for negotiation updates
  image: string;
  category: string;
  sellerName: string;
  buyerName?: string; // Added to track purchase history
  status: 'available' | 'sold';
  reviews: Review[];
  date?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Campaign {
  id: string;
  title: string;
  date: string;
  location: string;
  type: 'cleaning' | 'recycling' | 'planting';
  participants: number;
  image: string;
  description?: string;
  reported?: boolean;
  keywords: string[];
}

export interface NGO {
  id: string;
  name: string;
  focus: string;
  needs: string[];
  verified: boolean;
  image: string;
  description?: string;
}

export interface Transaction {
  id: string;
  itemTitle: string;
  date: string;
  amount: number;
  status: 'Completed' | 'Pending';
  buyerName: string;
  image?: string; 
}

export interface Message {
  id: string;
  sender: string | 'system';
  text: string;
  timestamp: string;
  isMe: boolean;
  read?: boolean;
  // Negotiation fields
  isOffer?: boolean;
  offerAmount?: number;
  offerStatus?: 'pending' | 'accepted' | 'rejected';
  relatedProductId?: string;
  relatedProductTitle?: string;
}

export interface ChatContact {
  id: string;
  name: string;
  lastMessage: string;
  unread: number;
  avatar: string;
  isSystem?: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  bio: string;
  avatar: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'offer' | 'sale' | 'system';
}

export interface Translation {
  app_name: string;
  nav_dashboard: string;
  nav_profile: string;
  nav_settings: string; // Added
  nav_marketplace: string;
  nav_sell: string;
  nav_campaigns: string;
  nav_my_campaigns: string;
  nav_donate: string;
  nav_chat: string;
  nav_notifications: string;
  nav_cart: string; 
  role_switch: string;
  
  hero_title: string;
  hero_subtitle: string;
  
  sell_page_title: string;
  sell_upload_image: string;
  sell_generating: string;
  sell_generate_desc: string;
  sell_voice_hint: string;
  form_title: string;
  form_price: string;
  form_desc: string;
  form_category: string;
  form_submit: string;
  
  dashboard_earnings: string;
  dashboard_transactions: string;
  dashboard_sold: string;
  
  profile_bio: string;
  profile_name: string;
  profile_email: string;
  profile_avatar: string;
  profile_save: string;
  profile_edit: string;
  profile_cancel: string;
  profile_history: string;
  profile_history_empty: string;
  
  settings_title: string; // Added
  settings_save: string; // Added
  settings_saved: string; // Added

  campaign_join: string;
  campaign_register_title: string;
  campaign_register_btn: string;
  campaign_search: string;
  campaign_create: string;
  campaign_report: string;
  campaign_reported: string;
  
  donate_title: string;
  donate_btn: string;
  donate_form_title: string;
  donate_confirm: string;
  donate_item_label: string;
  donate_pickup_label: string;
  donate_thanks: string;
  
  chat_title: string;
  chat_placeholder: string;
  negotiate_offer: string;
  offer_sent: string;
  offer_accept: string;
  offer_reject: string;
  offer_status_accepted: string;
  offer_status_rejected: string;

  // Home & Auth
  home_welcome: string;
  home_sub: string;
  home_btn_start: string;
  home_login: string;
  home_signup: string;
  auth_login_title: string;
  auth_signup_title: string;
  auth_email: string;
  auth_password: string;
  auth_name: string;
  auth_btn_login: string;
  auth_btn_signup: string;
  auth_have_acc: string;
  auth_no_acc: string;

  // Landing Features
  landing_features_title: string;
  landing_feature_market_title: string;
  landing_feature_market_desc: string;
  landing_feature_campaign_title: string;
  landing_feature_campaign_desc: string;
  landing_feature_donate_title: string;
  landing_feature_donate_desc: string;
  landing_footer_about: string;
  landing_footer_contact: string;
  landing_footer_rights: string;

  // Cart & Checkout
  cart_title: string;
  cart_empty: string;
  cart_total: string;
  cart_checkout: string;
  checkout_title: string;
  pay_upi: string;
  pay_card: string;
  pay_cod: string;
  pay_btn: string;
  order_success: string;
  order_cod_msg: string;
  order_online_msg: string;
}
