export enum AutomationService {
  WHATSAPP = 'WhatsApp Automation',
  CRM = 'CRM Setup',
  RESTAURANT = 'Restaurant Automation',
  INVENTORY = 'Inventory Management',
  WORKFLOW = 'Workflow Automation',
  CUSTOM = 'Custom Automation'
}

export interface ClientInquiry {
  name: string;
  phone: string;
  email?: string;
  service: string;
  message?: string;
}

export interface NavItem {
  label: string;
  path: string;
}

export interface ServiceDetail {
  id: string;
  title: string;
  description: string;
  icon: string;
}
