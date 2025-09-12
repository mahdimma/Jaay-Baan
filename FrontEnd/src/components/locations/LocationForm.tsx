import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, Select, Modal, ImageUpload, ImageGallery } from "../ui";
import { locationTypeLabels } from "../../lib/utils";
import { locationsApi } from "../../services/api";
import toast from "react-hot-toast";
import type { Location, CreateLocationData, LocationType } from "../../types";

const locationFormSchema = z.object({
  name: z.string().min(1, "نام مکان الزامی است"),
  location_type: z.enum(
    ["house", "room", "storage", "shelf", "container", "box", "item", "other"],
    {
      message: "نوع مکان الزامی است",
    }
  ),
  description: z.string().optional(),
  is_container: z.boolean(),
  barcode: z.string().optional(),
  quantity: z.number().min(1, "تعداد باید حداقل 1 باشد").optional(),
  value: z.number().min(0, "ارزش نمی‌تواند منفی باشد").optional(),
  cleaned_duration: z
    .number()
    .min(1, "فاصله زمانی تمیزکاری باید حداقل 1 روز باشد")
    .optional(),
});

type LocationFormData = z.infer<typeof locationFormSchema>;

interface LocationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateLocationData) => void;
  parentId?: number;
  parentLocation?: { id: number; name: string } | null;
  initialData?: Partial<Location>;
  isEdit?: boolean;
  isLoading?: boolean;
}

const LocationForm: React.FC<LocationFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  parentId,
  parentLocation,
  initialData,
  isEdit = false,
  isLoading = false,
}) => {
  const [uploadingImages, setUploadingImages] = useState(false);
  const [images, setImages] = useState(initialData?.images || []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<LocationFormData>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      location_type: initialData?.location_type || "item",
      description: initialData?.description || "",
      is_container: initialData?.is_container || false,
      barcode: initialData?.barcode || "",
      quantity: initialData?.quantity || undefined,
      value: initialData?.value !== undefined ? initialData.value : undefined,
      cleaned_duration: initialData?.cleaned_duration || undefined,
    },
  });

  const watchIsContainer = watch("is_container");
  const watchLocationType = watch("location_type");

  // Auto-set is_container based on location type
  React.useEffect(() => {
    const containerTypes: LocationType[] = [
      "house",
      "room",
      "storage",
      "shelf",
      "container",
      "box",
    ];
    const shouldBeContainer = containerTypes.includes(watchLocationType);
    setValue("is_container", shouldBeContainer);
  }, [watchLocationType, setValue]);

  React.useEffect(() => {
    if (initialData?.images) {
      setImages(initialData.images);
    }

    // Reset form with initialData when editing
    if (isEdit && initialData) {
      reset({
        name: initialData.name || "",
        location_type: initialData.location_type || "item",
        description: initialData.description || "",
        is_container: initialData.is_container || false,
        barcode: initialData.barcode || "",
        quantity: initialData.quantity || undefined,
        value: initialData.value !== undefined ? initialData.value : undefined,
        cleaned_duration: initialData.cleaned_duration || undefined,
      });
    }
  }, [initialData, isEdit, reset]);

  const handleImageUpload = async (files: FileList) => {
    if (!isEdit || !initialData?.id) {
      toast.error("ابتدا مکان را ذخیره کنید، سپس تصاویر را آپلود کنید");
      return;
    }

    setUploadingImages(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("image", file);
        formData.append("description", file.name);
        formData.append("is_primary", images.length === 0 ? "true" : "false");

        await locationsApi.uploadImage(initialData.id, formData);
      }

      // Refresh images - in a real app you'd refetch the location data
      toast.success("تصاویر با موفقیت آپلود شدند");
    } catch (error) {
      toast.error("خطا در آپلود تصاویر");
      console.error("Image upload error:", error);
    } finally {
      setUploadingImages(false);
    }
  };

  const handleImageDelete = async (imageId: number) => {
    if (!initialData?.id) return;

    try {
      await locationsApi.deleteImage(initialData.id, imageId);
      setImages(images.filter((img) => img.id !== imageId));
      toast.success("تصویر حذف شد");
    } catch (error) {
      toast.error("خطا در حذف تصویر");
      console.error("Image delete error:", error);
    }
  };

  const handleFormSubmit = (data: LocationFormData) => {
    const submitData: any = {
      ...data,
      parent_id: parentId,
      quantity: data.quantity || 1,
      cleaned_duration: data.cleaned_duration || 30,
    };

    // Handle null value for empty value field
    if (data.value === undefined) {
      submitData.value = null;
    }

    onSubmit(submitData);

    if (!isEdit) {
      reset();
      setImages([]);
    }
    onClose();
  };

  const locationTypeOptions = Object.entries(locationTypeLabels).map(
    ([value, label]: [string, string]) => ({
      value,
      label,
    })
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "ویرایش مکان" : "ایجاد مکان جدید"}
      size="xl"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            اطلاعات پایه
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Always show parent field */}
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                والد
              </label>
              <div className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  <span className="italic">
                    {parentLocation
                      ? parentLocation.name
                      : "مکان اصلی (بدون والد)"}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                این فیلد قابل تغییر نیست
              </p>
            </div>

            <Input
              label="نام مکان *"
              {...register("name")}
              error={errors.name?.message}
              placeholder="نام مکان را وارد کنید"
            />

            <Select
              label="نوع مکان *"
              {...register("location_type")}
              options={locationTypeOptions}
              error={errors.location_type?.message}
              placeholder="نوع مکان را انتخاب کنید"
            />
          </div>

          <Input
            label="توضیحات"
            {...register("description")}
            error={errors.description?.message}
            placeholder="توضیحات اضافی (اختیاری)"
          />
        </div>

        {/* Additional Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            اطلاعات تکمیلی
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="بارکد"
              {...register("barcode")}
              error={errors.barcode?.message}
              placeholder="بارکد (اختیاری)"
            />

            <Input
              label="تعداد"
              type="number"
              min="1"
              {...register("quantity", {
                setValueAs: (value) =>
                  value === "" ? undefined : parseInt(value) || undefined,
              })}
              error={errors.quantity?.message}
              placeholder="1"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="ارزش (تومان)"
              type="number"
              min="0"
              {...register("value", {
                setValueAs: (value) =>
                  value === "" || value === null
                    ? undefined
                    : parseFloat(value) || undefined,
              })}
              error={errors.value?.message}
              placeholder="ارزش (اختیاری)"
            />

            <Input
              label="فاصله زمانی تمیزکاری (روز)"
              type="number"
              min="1"
              {...register("cleaned_duration", {
                setValueAs: (value) =>
                  value === "" ? 30 : parseInt(value) || 30,
              })}
              error={errors.cleaned_duration?.message}
              placeholder="30"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_container"
              {...register("is_container")}
              className="rounded border-gray-300 dark:border-gray-600 text-primary-600 dark:text-primary-400 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
              disabled={[
                "house",
                "room",
                "storage",
                "shelf",
                "container",
                "box",
              ].includes(watchLocationType)}
            />
            <label
              htmlFor="is_container"
              className="mr-2 text-sm text-gray-700 dark:text-gray-300"
            >
              این مکان می‌تواند شامل مکان‌های دیگر باشد (ظرف)
            </label>
          </div>

          {!watchIsContainer && (
            <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-md p-3">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                توجه: اگر این گزینه انتخاب نشود، نمی‌توانید مکان‌های دیگری در
                داخل این مکان قرار دهید.
              </p>
            </div>
          )}
        </div>

        {/* Images Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            تصاویر
          </h3>

          {isEdit && initialData?.id ? (
            <div className="space-y-4">
              <ImageUpload
                onUpload={handleImageUpload}
                disabled={uploadingImages}
                maxFiles={10}
                maxSizeMB={5}
              />

              {uploadingImages && (
                <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                  در حال آپلود تصاویر...
                </div>
              )}

              <ImageGallery
                images={images}
                onDelete={handleImageDelete}
                editable={true}
                className="mt-4"
              />
            </div>
          ) : (
            <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-md p-3">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                برای آپلود تصاویر، ابتدا مکان را ذخیره کنید.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 space-x-reverse pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            className="ml-2"
            type="button"
            variant="outline"
            onClick={onClose}
            text="انصراف"
          />
          <Button
            type="submit"
            loading={isLoading}
            text={isEdit ? "بروزرسانی" : "ایجاد"}
          />
        </div>
      </form>
    </Modal>
  );
};

export default LocationForm;
