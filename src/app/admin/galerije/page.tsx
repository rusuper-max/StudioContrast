import { Metadata } from "next";
import AdminGalleriesClient from "./AdminGalleriesClient";

export const metadata: Metadata = {
  title: "Admin - Galerije | Studio Contrast",
  robots: "noindex, nofollow",
};

export default function AdminGalleriesPage() {
  return <AdminGalleriesClient />;
}
