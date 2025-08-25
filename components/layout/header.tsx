export default function SimpleHeader({ 
  title, 
  breadcrumbs, 
  isCollapsed, 
  onLogout 
}: {
  title: string;
  breadcrumbs: { label: string }[];
  isCollapsed: boolean;
  onLogout: () => void;
}) {
  return <div>Header placeholder</div>;
}