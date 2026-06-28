export interface MenuItem {
  group_menu: string;
  title: string;
  url: string;   // API endpoint base url, e.g. /api/units
  method: string;
  access: string;
}

export interface MenuRole {
  user_role: string;
  details: MenuItem[];
}

export interface MenuApiResponse {
  status: string;
  message: string;
  data: MenuRole[];
}

export interface NavItem {
  label: string;
  to: string;       // frontend route, derived from group_menu + title
  icon: string;
  apiUrl: string;   // raw url from API endpoint (e.g. /api/units)
}

export interface NavGroup {
  id: string;
  label: string;
  icon: string;
  items: NavItem[];
}
