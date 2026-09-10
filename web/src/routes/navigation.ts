import {
  CircleHelp,
  Database,
  HandCoins,
  House,
  Landmark,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Truck,
  WalletCards,
  ClipboardList,
} from "lucide-react";
import type { NavigationItem } from "../types/navigation";

import dashboardIcon from "../assets/icons/dashboard.png";
import cashierIcon from "../assets/icons/cashier.png";
import cashHandIcon from "../assets/icons/cash-hand.png";
import truckIcon from "../assets/icons/truck.png";
import penIcon from "../assets/icons/pen.png";
import cartonIcon from "../assets/icons/carton.png";
import cashAccountsIcon from "../assets/icons/cash-accounts.png";
import walletIcon from "../assets/icons/wallet.png";
import { ReportsIcon } from "../components/common/ReportsIcon";

export const homeNavigation: NavigationItem = {
  label: "Home",
  path: "/",
  icon: House,
  description: "Application overview and welcome portal",
  isComingSoon: false,
};

export const primaryNavigation: NavigationItem[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    imageIcon: dashboardIcon,
    description: "Business overview and priorities",
  },
  {
    label: "Sales & Receivables",
    path: "/sales",
    icon: ShoppingCart,
    imageIcon: cashierIcon,
    description: "Sales, billing, and customer balances",
  },
  {
    label: "Collections & Receipts",
    path: "/collections",
    icon: HandCoins,
    imageIcon: cashHandIcon,
    description: "Money received and customer collections",
  },
  {
    label: "Purchases & Payables",
    path: "/purchases",
    icon: Truck,
    imageIcon: truckIcon,
    description: "Purchasing and supplier obligations",
  },
  {
    label: "Payments & Disbursements",
    path: "/payments",
    icon: ClipboardList,
    imageIcon: penIcon,
    description: "Outgoing payments and disbursements",
  },
  {
    label: "Inventory",
    path: "/inventory",
    icon: Package,
    imageIcon: cartonIcon,
    description: "Stock availability and movement",
  },
  {
    label: "Cash Accounts",
    path: "/cash-accounts",
    icon: Landmark,
    imageIcon: cashAccountsIcon,
    description: "Cash locations, balances, and movement",
  },
  {
    label: "Expenses",
    path: "/expenses",
    icon: WalletCards,
    imageIcon: walletIcon,
    description: "Operating costs and evidence",
  },
  {
    label: "Reports",
    path: "/reports",
    icon: ReportsIcon,
    description: "Governed reports and analytics",
    isComingSoon: true,
  },
];

export const secondaryNavigation: NavigationItem[] = [
  {
    label: "Master Registries",
    path: "/master-registries",
    icon: Database,
    description: "Shared operational records",
    isComingSoon: false,
  },
  {
    label: "Settings",
    path: "/settings",
    icon: Settings,
    description: "Configuration and administration",
    isComingSoon: false,
  },
  {
    label: "Help",
    path: "/help",
    icon: CircleHelp,
    description: "SimpleBIZ guidance and support",
    isComingSoon: true,
  },
];

export const allNavigationItems = [
  homeNavigation,
  ...primaryNavigation,
  ...secondaryNavigation,
];
