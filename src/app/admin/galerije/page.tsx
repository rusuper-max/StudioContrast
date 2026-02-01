// src/app/admin/galerije/page.tsx
// Admin panel for managing client galleries

import { Metadata } from "next";
import AdminGalleriesClient from "./AdminGalleriesClient";

export const metadata: Metadata = {
  title: "Admin - Galerije | Studio Contrast",
  robots: "noindex, nofollow",
};

export default function AdminGalleriesPage() {
  return <AdminGalleriesClient />;
}
