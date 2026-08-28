"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  Trash2,
  Plus,
  Image as ImageIcon,
  AlertTriangle,
  Lock,
  Unlock,
  Info,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Search
} from "lucide-react";
import ImageUploadDropzone from "@/components/admin/ImageUploadDropzone";
import GalleryImageUploader from "@/components/admin/GalleryImageUploader";

export default function ProductEditorForm({
  initialData = null,
  isEdit = false,
}: {
  initialData?: any;
  isEdit?: boolean;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("basic");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [isSlugLocked, setIsSlugLocked] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    title: initialData?.name || "",
    slug: initialData?.slug || "",
    shortDesc: initialData?.shortDesc || "",
    descriptionBangla: initialData?.descriptionBangla || "",
    descriptionEnglish: initialData?.descriptionEnglish || "",
    categoryId: initialData?.category || "",
    productType: initialData?.productType || "SUBSCRIPTION",
    status: initialData?.status || "DRAFT",
    visibility: initialData?.visibility || "PUBLIC",
    
    // Pricing
    isMultiVariation: initialData?.variations?.length > 0 || false,
    regularPriceBDT: initialData?.regularPriceBDT || "",
    salePriceBDT: initialData?.salePriceBDT || "",
    variations: initialData?.variations || [],
    
    // Fulfillment
    fulfillmentType: initialData?.fulfillmentType || "AUTO_STOCK",
    deliverySla: initialData?.deliverySla || "Instant",
    lowStockThreshold: initialData?.lowStockThreshold || 3,
    allowBackorder: initialData?.allowBackorder ?? true,
    requirements: initialData?.requirements || "",
    
    // Warranty
    warrantyDays: initialData?.warrantyDays ?? 30,
    replacementAllowed: initialData?.replacementAllowed ?? true,
    refundAllowed: initialData?.refundAllowed ?? true,
    
    // Media
    image: initialData?.image || "",
    gallery: initialData?.gallery ? JSON.parse(initialData.gallery) : [],
    
    // SEO
    seoTitle: initialData?.seoTitle || "",
    seoDescription: initialData?.seoDescription || "",
    seoKeywords: initialData?.seoKeywords || "",
  });

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || data))
      .catch((err) => console.error("Failed to load categories", err));
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      
      // Auto-derive slug if locked
      if (field === "title" && isSlugLocked && !isEdit) {
        next.slug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");
      }
      
      return next;
    });
    setHasUnsavedChanges(true);
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleVariationChange = (index: number, field: string, value: any) => {
    setFormData((prev) => {
      const newVariations = [...prev.variations];
      newVariations[index] = { ...newVariations[index], [field]: value };
      return { ...prev, variations: newVariations };
    });
    setHasUnsavedChanges(true);
  };

  const addVariation = () => {
    setFormData((prev) => ({
      ...prev,
      variations: [
        ...prev.variations,
        {
          name: "",
          sku: "",
          regularPriceBDT: "",
          salePriceBDT: "",
          duration: "",
          fulfillmentType: "INHERIT",
          warrantyDays: prev.warrantyDays,
          inStock: true,
        },
      ],
    }));
    setHasUnsavedChanges(true);
  };

  const removeVariation = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      variations: prev.variations.filter((_: any, i: number) => i !== index),
    }));
    setHasUnsavedChanges(true);
  };

  const addGalleryImage = () => {
    setFormData((prev) => ({ ...prev, gallery: [...prev.gallery, ""] }));
    setHasUnsavedChanges(true);
  };

  const updateGalleryImage = (index: number, url: string) => {
    setFormData((prev) => {
      const newGallery = [...prev.gallery];
      newGallery[index] = url;
      return { ...prev, gallery: newGallery };
    });
    setHasUnsavedChanges(true);
  };

  const removeGalleryImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_: any, i: number) => i !== index),
    }));
    setHasUnsavedChanges(true);
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) errors.title = "Title is required";
    if (!formData.slug.trim()) errors.slug = "Slug is required";
    if (!formData.categoryId) errors.categoryId = "Category is required";
    
    if (!formData.isMultiVariation) {
      if (!formData.regularPriceBDT && formData.regularPriceBDT !== 0) errors.regularPriceBDT = "Regular price is required";
    } else {
      if (formData.variations.length === 0) {
        errors.variations = "At least one variation is required";
      } else {
        formData.variations.forEach((v: any, i: number) => {
          if (!v.name) errors[`variation_${i}_name`] = "Variation name is required";
          if (!v.regularPriceBDT && v.regularPriceBDT !== 0) errors[`variation_${i}_price`] = "Price is required";
        });
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (isPublish = false) => {
    if (!validate()) {
      setError("Please fix the validation errors before saving.");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const payload = {
        name: formData.title,
        slug: formData.slug,
        category: formData.categoryId,
        shortDesc: formData.shortDesc,
        descriptionBangla: formData.descriptionBangla,
        descriptionEnglish: formData.descriptionEnglish,
        productType: formData.productType,
        status: isPublish ? "ACTIVE" : "DRAFT",
        visibility: formData.visibility,
        regularPriceBDT: formData.isMultiVariation ? null : Number(formData.regularPriceBDT),
        salePriceBDT: formData.isMultiVariation ? null : (formData.salePriceBDT ? Number(formData.salePriceBDT) : null),
        fulfillmentType: formData.fulfillmentType,
        deliverySla: formData.deliverySla,
        lowStockThreshold: Number(formData.lowStockThreshold),
        allowBackorder: formData.allowBackorder,
        requirements: formData.requirements,
        warrantyDays: Number(formData.warrantyDays),
        replacementAllowed: formData.replacementAllowed,
        refundAllowed: formData.refundAllowed,
        image: formData.image,
        gallery: JSON.stringify(formData.gallery),
        seoTitle: formData.seoTitle,
        seoDescription: formData.seoDescription,
        seoKeywords: formData.seoKeywords,
        variations: formData.isMultiVariation ? formData.variations.map((v: any) => ({
          ...v,
          regularPriceBDT: Number(v.regularPriceBDT),
          salePriceBDT: v.salePriceBDT ? Number(v.salePriceBDT) : null,
          warrantyDays: v.warrantyDays ? Number(v.warrantyDays) : null
        })) : [],
        // Derived fields for min/max price for the schema
        minPriceBDT: formData.isMultiVariation 
          ? Math.min(...formData.variations.map((v: any) => Number(v.salePriceBDT || v.regularPriceBDT)))
          : Number(formData.salePriceBDT || formData.regularPriceBDT),
        maxPriceBDT: formData.isMultiVariation 
          ? Math.max(...formData.variations.map((v: any) => Number(v.salePriceBDT || v.regularPriceBDT)))
          : Number(formData.salePriceBDT || formData.regularPriceBDT),
      };

      const res = await fetch(isEdit ? `/api/admin/products/${initialData.id}` : "/api/admin/products", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to save product");
      }

      setHasUnsavedChanges(false);
      router.push("/admin/products");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "basic", label: "Basic Info" },
    { id: "pricing", label: "Pricing & Variations" },
    { id: "fulfillment", label: "Fulfillment & Inventory" },
    { id: "warranty", label: "Warranty & After-Sales" },
    { id: "media", label: "Media & Gallery" },
    { id: "seo", label: "SEO & Search" },
  ];

  return (
    <div className="max-w-5xl mx-auto pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{isEdit ? "Edit Product" : "Create Product"}</h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow border border-gray-200 mb-6">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
              {Object.keys(validationErrors).length > 0 && tab.id === "basic" && (
                <span className="ml-2 inline-block w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* BASIC INFO TAB */}
          {activeTab === "basic" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Title *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-md"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="e.g. Canva Pro 1 Month"
                  />
                  {validationErrors.title && <p className="text-red-500 text-xs mt-1">{validationErrors.title}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Slug *</label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-l-md bg-gray-50"
                      value={formData.slug}
                      onChange={(e) => handleChange("slug", e.target.value)}
                      readOnly={isSlugLocked}
                    />
                    <button
                      type="button"
                      className="px-3 py-2 border border-l-0 rounded-r-md bg-gray-100 hover:bg-gray-200"
                      onClick={() => setIsSlugLocked(!isSlugLocked)}
                    >
                      {isSlugLocked ? <Lock className="w-5 h-5 text-gray-500" /> : <Unlock className="w-5 h-5 text-gray-700" />}
                    </button>
                  </div>
                  {validationErrors.slug && <p className="text-red-500 text-xs mt-1">{validationErrors.slug}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-md h-20"
                  value={formData.shortDesc}
                  onChange={(e) => handleChange("shortDesc", e.target.value)}
                  placeholder="A brief summary for cards and SEO fallback..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Description (Bangla)</label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-md h-40"
                    value={formData.descriptionBangla}
                    onChange={(e) => handleChange("descriptionBangla", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Description (English)</label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-md h-40"
                    value={formData.descriptionEnglish}
                    onChange={(e) => handleChange("descriptionEnglish", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    className="w-full px-3 py-2 border rounded-md bg-white"
                    value={formData.categoryId}
                    onChange={(e) => handleChange("categoryId", e.target.value)}
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                  {validationErrors.categoryId && <p className="text-red-500 text-xs mt-1">{validationErrors.categoryId}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Type</label>
                  <select
                    className="w-full px-3 py-2 border rounded-md bg-white"
                    value={formData.productType}
                    onChange={(e) => handleChange("productType", e.target.value)}
                  >
                    <option value="SUBSCRIPTION">Subscription</option>
                    <option value="LICENSE_KEY">License Key</option>
                    <option value="ACCOUNT">Account</option>
                    <option value="DIGITAL_CREDIT">Digital Credit</option>
                    <option value="WORKSPACE_ACCESS">Workspace Access</option>
                    <option value="DOWNLOAD">Download</option>
                    <option value="SERVICE">Service</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    className="w-full px-3 py-2 border rounded-md bg-white"
                    value={formData.status}
                    onChange={(e) => handleChange("status", e.target.value)}
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
                  <select
                    className="w-full px-3 py-2 border rounded-md bg-white"
                    value={formData.visibility}
                    onChange={(e) => handleChange("visibility", e.target.value)}
                  >
                    <option value="PUBLIC">Public (Storefront & Search)</option>
                    <option value="HIDDEN">Hidden (Direct Link Only)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* PRICING TAB */}
          {activeTab === "pricing" && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <span className={`text-sm font-medium ${!formData.isMultiVariation ? 'text-blue-600' : 'text-gray-500'}`}>Single Price</span>
                <button
                  type="button"
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.isMultiVariation ? 'bg-blue-600' : 'bg-gray-300'}`}
                  onClick={() => handleChange("isMultiVariation", !formData.isMultiVariation)}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isMultiVariation ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <span className={`text-sm font-medium ${formData.isMultiVariation ? 'text-blue-600' : 'text-gray-500'}`}>Multi-Variation</span>
              </div>

              {!formData.isMultiVariation ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Regular Price (৳) *</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border rounded-md"
                      value={formData.regularPriceBDT}
                      onChange={(e) => handleChange("regularPriceBDT", e.target.value)}
                    />
                    {validationErrors.regularPriceBDT && <p className="text-red-500 text-xs mt-1">{validationErrors.regularPriceBDT}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price (৳)</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border rounded-md"
                      value={formData.salePriceBDT}
                      onChange={(e) => handleChange("salePriceBDT", e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {validationErrors.variations && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">{validationErrors.variations}</div>
                  )}
                  {formData.variations.map((variation: any, index: number) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm relative">
                      <button
                        type="button"
                        className="absolute top-4 right-4 text-red-500 hover:text-red-700 p-1"
                        onClick={() => removeVariation(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <h4 className="font-medium text-gray-900 mb-4">Variation #{index + 1}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="col-span-1 lg:col-span-2">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Name (e.g. 1 Month - Personal) *</label>
                          <input
                            type="text"
                            className="w-full px-2 py-1.5 border rounded-md text-sm"
                            value={variation.name}
                            onChange={(e) => handleVariationChange(index, "name", e.target.value)}
                          />
                          {validationErrors[`variation_${index}_name`] && <p className="text-red-500 text-xs mt-1">{validationErrors[`variation_${index}_name`]}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">SKU</label>
                          <input
                            type="text"
                            className="w-full px-2 py-1.5 border rounded-md text-sm"
                            value={variation.sku || ""}
                            onChange={(e) => handleVariationChange(index, "sku", e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Duration</label>
                          <input
                            type="text"
                            className="w-full px-2 py-1.5 border rounded-md text-sm"
                            value={variation.duration || ""}
                            onChange={(e) => handleVariationChange(index, "duration", e.target.value)}
                            placeholder="e.g. 1 Month"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Regular Price (৳) *</label>
                          <input
                            type="number"
                            className="w-full px-2 py-1.5 border rounded-md text-sm"
                            value={variation.regularPriceBDT}
                            onChange={(e) => handleVariationChange(index, "regularPriceBDT", e.target.value)}
                          />
                          {validationErrors[`variation_${index}_price`] && <p className="text-red-500 text-xs mt-1">{validationErrors[`variation_${index}_price`]}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Sale Price (৳)</label>
                          <input
                            type="number"
                            className="w-full px-2 py-1.5 border rounded-md text-sm"
                            value={variation.salePriceBDT || ""}
                            onChange={(e) => handleVariationChange(index, "salePriceBDT", e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Fulfillment Override</label>
                          <select
                            className="w-full px-2 py-1.5 border rounded-md text-sm bg-white"
                            value={variation.fulfillmentType || "INHERIT"}
                            onChange={(e) => handleVariationChange(index, "fulfillmentType", e.target.value)}
                          >
                            <option value="INHERIT">Inherit (Default)</option>
                            <option value="AUTO_STOCK">Auto Stock</option>
                            <option value="MANUAL">Manual</option>
                            <option value="PROTECTED_DOWNLOAD">Protected Download</option>
                            <option value="WORKSPACE_INVITE">Workspace Invite</option>
                            <option value="EXTERNAL_ACTIVATION">External Activation</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Warranty Days Override</label>
                          <input
                            type="number"
                            className="w-full px-2 py-1.5 border rounded-md text-sm"
                            value={variation.warrantyDays || ""}
                            onChange={(e) => handleVariationChange(index, "warrantyDays", e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center">
                        <label className="flex items-center text-sm font-medium text-gray-700 cursor-pointer">
                          <input
                            type="checkbox"
                            className="mr-2 rounded text-blue-600 focus:ring-blue-500"
                            checked={variation.inStock}
                            onChange={(e) => handleVariationChange(index, "inStock", e.target.checked)}
                          />
                          Stock Active
                        </label>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addVariation}
                    className="flex items-center justify-center w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors bg-gray-50 hover:bg-blue-50"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add New Variation
                  </button>
                </div>
              )}
            </div>
          )}

          {/* FULFILLMENT TAB */}
          {activeTab === "fulfillment" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Default Fulfillment Mode</label>
                  <select
                    className="w-full px-3 py-2 border rounded-md bg-white"
                    value={formData.fulfillmentType}
                    onChange={(e) => handleChange("fulfillmentType", e.target.value)}
                  >
                    <option value="AUTO_STOCK">⚡ Automatic Stock Pool (Digital Vault Instant Delivery)</option>
                    <option value="MANUAL">👤 Manual Fulfillment (Agent Processing)</option>
                    <option value="PROTECTED_DOWNLOAD">🔒 Protected Download (Secure Asset Link)</option>
                    <option value="WORKSPACE_INVITE">✉️ Workspace Invitation</option>
                    <option value="EXTERNAL_ACTIVATION">🌐 External Activation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Delivery SLA</label>
                  <select
                    className="w-full px-3 py-2 border rounded-md bg-white"
                    value={formData.deliverySla}
                    onChange={(e) => handleChange("deliverySla", e.target.value)}
                  >
                    <option value="Instant">Instant</option>
                    <option value="5-15 mins">5-15 mins</option>
                    <option value="15-30 mins">15-30 mins</option>
                    <option value="1-6 hours">1-6 hours</option>
                    <option value="Within 24 hours">Within 24 hours</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Threshold</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border rounded-md"
                    value={formData.lowStockThreshold}
                    onChange={(e) => handleChange("lowStockThreshold", e.target.value)}
                  />
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center text-sm font-medium text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mr-2 rounded text-blue-600 h-4 w-4"
                      checked={formData.allowBackorder}
                      onChange={(e) => handleChange("allowBackorder", e.target.checked)}
                    />
                    Allow Backorder (Selling when out of stock)
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  Customer Delivery Instructions (Post-Purchase)
                  <Info className="w-4 h-4 ml-1 text-gray-400" />
                </label>
                <textarea
                  className="w-full px-3 py-2 border rounded-md h-32"
                  value={formData.requirements}
                  onChange={(e) => handleChange("requirements", e.target.value)}
                  placeholder="e.g. Please login at https://example.com using the credentials provided..."
                />
              </div>
            </div>
          )}

          {/* WARRANTY TAB */}
          {activeTab === "warranty" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Duration (Days)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border rounded-md"
                    value={formData.warrantyDays}
                    onChange={(e) => handleChange("warrantyDays", e.target.value)}
                  />
                </div>
                <div className="flex flex-col space-y-4 pt-6">
                  <label className="flex items-center text-sm font-medium text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mr-2 rounded text-blue-600 h-4 w-4"
                      checked={formData.replacementAllowed}
                      onChange={(e) => handleChange("replacementAllowed", e.target.checked)}
                    />
                    Replacement Allowed
                  </label>
                  <label className="flex items-center text-sm font-medium text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mr-2 rounded text-blue-600 h-4 w-4"
                      checked={formData.refundAllowed}
                      onChange={(e) => handleChange("refundAllowed", e.target.checked)}
                    />
                    Refund Allowed
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* MEDIA TAB */}
          {activeTab === "media" && (
            <div className="space-y-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <ImageUploadDropzone
                  value={formData.image}
                  onChange={(url) => handleChange("image", url)}
                  label="প্রাইমারি থাম্বনেইল ইমেজ (Primary Thumbnail)"
                  hint="JPG, PNG, WebP ইত্যাদি ফাইল আপলোড করুন — স্বয়ংক্রিয়ভাবে সুপার-কম্প্যাক্ট WebP ফরম্যাটে সেভ হবে"
                  options={{ maxWidth: 1200, maxHeight: 1200, quality: 0.82 }}
                />
              </div>

              <div className="pt-6 border-t border-slate-100">
                <GalleryImageUploader
                  images={formData.gallery}
                  onChange={(imgs) => {
                    setFormData((prev) => ({ ...prev, gallery: imgs }));
                    setHasUnsavedChanges(true);
                  }}
                  label="প্রোডাক্ট গ্যালারি ইমেজ (Gallery Images)"
                />
              </div>
            </div>
          )}

          {/* SEO TAB */}
          {activeTab === "seo" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <label className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                      <span>SEO Meta Title</span>
                      <span className={formData.seoTitle.length > 60 ? 'text-red-500' : 'text-gray-500'}>
                        {formData.seoTitle.length}/60
                      </span>
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-md"
                      value={formData.seoTitle}
                      onChange={(e) => handleChange("seoTitle", e.target.value)}
                      placeholder={formData.title}
                    />
                  </div>
                  <div>
                    <label className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                      <span>SEO Meta Description</span>
                      <span className={formData.seoDescription.length > 160 ? 'text-red-500' : 'text-gray-500'}>
                        {formData.seoDescription.length}/160
                      </span>
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border rounded-md h-24"
                      value={formData.seoDescription}
                      onChange={(e) => handleChange("seoDescription", e.target.value)}
                      placeholder={formData.shortDesc}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SEO Keywords (comma separated)</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-md"
                      value={formData.seoKeywords}
                      onChange={(e) => handleChange("seoKeywords", e.target.value)}
                    />
                  </div>
                </div>
                
                {/* SERP PREVIEW */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Search className="w-4 h-4 mr-2" />
                    Google Search Preview
                  </h4>
                  <div className="bg-white border rounded-lg p-4 shadow-sm max-w-[600px]">
                    <div className="text-sm text-gray-700 mb-1 flex items-center">
                      <span className="w-4 h-4 bg-gray-200 rounded-full inline-block mr-2"></span>
                      https://aihaat.shop › product › {formData.slug || "example-product"}
                    </div>
                    <h3 className="text-xl text-[#1a0dab] mb-1 font-medium hover:underline cursor-pointer">
                      {formData.seoTitle || formData.title || "Product Title Example"} - AI Haat
                    </h3>
                    <p className="text-sm text-[#4d5156] line-clamp-2">
                      {formData.seoDescription || formData.shortDesc || "Product description will appear here. Provide a concise summary to help users understand what your product is about."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* STICKY BOTTOM ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] p-4 flex items-center justify-between px-4 sm:px-8 lg:px-24">
        <div className="flex items-center space-x-2">
          {hasUnsavedChanges ? (
            <span className="flex items-center text-sm font-medium text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 bg-amber-500 rounded-full mr-2 animate-pulse"></span>
              Unsaved changes
            </span>
          ) : (
            <span className="flex items-center text-sm font-medium text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              All changes saved
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSave(false)}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Save as Draft
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSave(true)}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
          >
            {loading ? (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isEdit ? "Update Product" : "Publish Product"}
          </button>
        </div>
      </div>
    </div>
  );
}
