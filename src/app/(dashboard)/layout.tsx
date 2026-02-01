import Header from "@/app/components/ui/Header";
import MobileNav from "@/app/components/ui/MobileNav";
import styles from "./layout.module.css";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>{children}</main>
      <MobileNav />
    </div>
  );
}
