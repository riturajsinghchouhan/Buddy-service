import { Building2, FileCheck2, UtensilsCrossed } from "lucide-react"

export const ONBOARDING_STEPS = [
  {
    id: 1,
    title: "Restaurant basics",
    subtitle: "Name, owner & location",
    icon: Building2,
  },
  {
    id: 2,
    title: "Menu & timings",
    subtitle: "Photos, hours & delivery",
    icon: UtensilsCrossed,
  },
  {
    id: 3,
    title: "Compliance",
    subtitle: "PAN, FSSAI & bank details",
    icon: FileCheck2,
  },
]

export const CUISINE_OPTIONS = [
  "North Indian",
  "South Indian",
  "Chinese",
  "Italian",
  "Fast Food",
  "Biryani",
  "Pizza",
  "Burger",
  "Desserts",
  "Beverages",
  "Street Food",
  "Healthy",
]
