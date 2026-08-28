import ProductEditorForm from "@/components/admin/ProductEditorForm";

export const metadata = {
  title: "Create New Product | AI Haat Admin",
};

export default function NewProductPage() {
  return (
    <div className="p-6">
      <ProductEditorForm isEdit={false} />
    </div>
  );
}
