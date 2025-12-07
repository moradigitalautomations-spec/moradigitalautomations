import { AutomationService, NavItem, ServiceDetail } from './types';

export const WEBHOOK_URL = 'https://webhook.site/uuid-placeholder';

export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', path: '/' },
  { label: 'Services', path: '/services' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
];

export const SERVICES_LIST: ServiceDetail[] = [
  {
    id: 'whatsapp',
    title: 'WhatsApp Automation',
    description: 'Engage customers instantly with automated responses, order updates, and marketing campaigns directly on WhatsApp.',
    icon: 'message-circle'
  },
  {
    id: 'crm',
    title: 'CRM Setup',
    description: 'Centralize your customer data. We implement and customize CRM solutions to track leads and close more deals.',
    icon: 'users'
  },
  {
    id: 'restaurant',
    title: 'Restaurant Automation',
    description: 'Streamline orders, kitchen workflows, and reservations to enhance the dining experience and operational efficiency.',
    icon: 'coffee'
  },
  {
    id: 'inventory',
    title: 'Inventory Management',
    description: 'Real-time tracking of stock levels with automated reordering alerts to prevent stockouts and overstocking.',
    icon: 'box'
  },
  {
    id: 'workflow',
    title: 'Workflow Automation',
    description: 'Connect your favorite apps (Google Sheets, Notion, Slack) to eliminate repetitive manual tasks forever.',
    icon: 'zap'
  },
  {
    id: 'custom',
    title: 'Custom Automation',
    description: 'Tailored solutions designed specifically for your unique business processes and challenges.',
    icon: 'settings'
  }
];

export const SERVICE_OPTIONS = Object.values(AutomationService);
