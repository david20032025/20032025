"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "../../../supabase/client";

interface AddAssetFormProps {
  category: string;
  isLiability?: boolean;
  onSuccess?: () => void;
}

export default function AddAssetForm({
  category,
  isLiability = false,
  onSuccess,
}: AddAssetFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    value: "",
    description: "",
    location: "",
    acquisitionDate: "",
    acquisitionValue: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();

      // Get category ID
      const { data: categoryData } = await supabase
        .from("asset_categories")
        .select("id")
        .eq("slug", category)
        .single();

      if (!categoryData) {
        throw new Error("Category not found");
      }

      // Insert the asset
      const { error } = await supabase.from("assets").insert({
        name: formData.name,
        value: parseFloat(formData.value),
        description: formData.description,
        location: formData.location || null,
        acquisition_date: formData.acquisitionDate || null,
        acquisition_value: formData.acquisitionValue
          ? parseFloat(formData.acquisitionValue)
          : null,
        category_id: categoryData.id,
        is_liability: isLiability,
      });

      if (error) throw error;

      // Reset form
      setFormData({
        name: "",
        value: "",
        description: "",
        location: "",
        acquisitionDate: "",
        acquisitionValue: "",
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error adding asset:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFormFields = () => {
    const commonFields = [
      {
        name: "name",
        label: isLiability ? "Liability Name" : "Asset Name",
        type: "text",
        placeholder: isLiability
          ? "Credit Card, Mortgage, etc."
          : "Account name, asset description, etc.",
        required: true,
      },
      {
        name: "value",
        label: isLiability ? "Current Balance" : "Current Value",
        type: "number",
        placeholder: "0.00",
        required: true,
      },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        placeholder: "Add details about this asset",
        required: false,
      },
    ];

    // Add category-specific fields
    switch (category) {
      case "cash":
        return [
          ...commonFields,
          {
            name: "location",
            label: "Bank/Institution",
            type: "text",
            placeholder: "Bank name or institution",
            required: false,
          },
        ];
      case "investments":
        return [
          ...commonFields,
          {
            name: "location",
            label: "Brokerage/Platform",
            type: "text",
            placeholder: "Brokerage or platform name",
            required: false,
          },
          {
            name: "acquisitionDate",
            label: "Purchase Date",
            type: "date",
            required: false,
          },
          {
            name: "acquisitionValue",
            label: "Purchase Value",
            type: "number",
            placeholder: "0.00",
            required: false,
          },
        ];
      case "real-estate":
        return [
          ...commonFields,
          {
            name: "location",
            label: "Property Address",
            type: "text",
            placeholder: "Address of the property",
            required: false,
          },
          {
            name: "acquisitionDate",
            label: "Purchase Date",
            type: "date",
            required: false,
          },
          {
            name: "acquisitionValue",
            label: "Purchase Price",
            type: "number",
            placeholder: "0.00",
            required: false,
          },
        ];
      case "cryptocurrency":
        return [
          ...commonFields,
          {
            name: "location",
            label: "Wallet/Exchange",
            type: "text",
            placeholder: "Wallet or exchange name",
            required: false,
          },
          {
            name: "acquisitionDate",
            label: "Acquisition Date",
            type: "date",
            required: false,
          },
          {
            name: "acquisitionValue",
            label: "Acquisition Value",
            type: "number",
            placeholder: "0.00",
            required: false,
          },
        ];
      case "debt":
        return [
          ...commonFields,
          {
            name: "location",
            label: "Lender/Institution",
            type: "text",
            placeholder: "Lender or institution name",
            required: false,
          },
          {
            name: "acquisitionDate",
            label: "Start Date",
            type: "date",
            required: false,
          },
          {
            name: "acquisitionValue",
            label: "Original Amount",
            type: "number",
            placeholder: "0.00",
            required: false,
          },
        ];
      default:
        return commonFields;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {getFormFields().map((field) => (
        <div key={field.name} className="space-y-2">
          <Label htmlFor={field.name}>
            {field.label}{" "}
            {field.required && <span className="text-red-500">*</span>}
          </Label>

          {field.type === "textarea" ? (
            <Textarea
              id={field.name}
              name={field.name}
              placeholder={field.placeholder}
              value={formData[field.name as keyof typeof formData] || ""}
              onChange={handleChange}
              required={field.required}
            />
          ) : (
            <Input
              id={field.name}
              name={field.name}
              type={field.type}
              placeholder={field.placeholder}
              value={formData[field.name as keyof typeof formData] || ""}
              onChange={handleChange}
              required={field.required}
            />
          )}
        </div>
      ))}

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : isLiability ? "Add Liability" : "Add Asset"}
        </Button>
      </div>
    </form>
  );
}
