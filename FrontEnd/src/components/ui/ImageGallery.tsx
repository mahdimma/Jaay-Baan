import React, { useState } from "react";
import Icon from "./Icon";
import Button from "./Button";
import Modal from "./Modal";
import { cn } from "../../lib/utils";
import type { LocationImage } from "../../types";

interface ImageGalleryProps {
  images: LocationImage[];
  onDelete?: (imageId: number) => void;
  onSetPrimary?: (imageId: number) => void;
  className?: string;
  editable?: boolean;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  onDelete,
  onSetPrimary,
  className,
  editable = false,
}) => {
  const [selectedImage, setSelectedImage] = useState<LocationImage | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleImageClick = (image: LocationImage) => {
    setSelectedImage(image);
    setIsModalOpen(true);
  };

  const handleDelete = (imageId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(imageId);
    }
  };

  const handleSetPrimary = (imageId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSetPrimary) {
      onSetPrimary(imageId);
    }
  };

  if (!images || images.length === 0) {
    return (
      <div className={cn("text-center py-8", className)}>
        <Icon name="image" size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500 text-sm">تصویری موجود نیست</p>
      </div>
    );
  }

  return (
    <>
      <div
        className={cn(
          "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4",
          className
        )}
      >
        {images.map((image) => (
          <div
            key={image.id}
            className="relative group cursor-pointer bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            onClick={() => handleImageClick(image)}
          >
            <div className="aspect-square">
              <img
                src={image.image}
                alt={image.description || "تصویر مکان"}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
            </div>

            {/* Primary badge */}
            {image.is_primary && (
              <div className="absolute top-2 right-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  <Icon name="star" size={12} className="ml-1" />
                  اصلی
                </span>
              </div>
            )}

            {/* Actions overlay */}
            {editable && (
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2 space-x-reverse">
                {!image.is_primary && onSetPrimary && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => handleSetPrimary(image.id, e)}
                    className="text-xs"
                  >
                    <Icon name="star" size={14} />
                  </Button>
                )}

                {onDelete && (
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={(e) => handleDelete(image.id, e)}
                    className="text-xs"
                  >
                    <Icon name="trash" size={14} />
                  </Button>
                )}
              </div>
            )}

            {/* Description */}
            {image.description && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
                <p className="text-white text-xs truncate">
                  {image.description}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Image Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedImage?.description || "تصویر"}
        size="lg"
      >
        {selectedImage && (
          <div className="space-y-4">
            <div className="aspect-video">
              <img
                src={selectedImage.image}
                alt={selectedImage.description || "تصویر مکان"}
                className="w-full h-full object-contain rounded-lg"
              />
            </div>

            {selectedImage.description && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">توضیحات:</h4>
                <p className="text-gray-600">{selectedImage.description}</p>
              </div>
            )}

            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>
                تاریخ آپلود:{" "}
                {new Date(selectedImage.created_at).toLocaleDateString("fa-IR")}
              </span>
              {selectedImage.is_primary && (
                <span className="inline-flex items-center">
                  <Icon
                    name="star"
                    size={14}
                    className="ml-1 text-yellow-500"
                  />
                  تصویر اصلی
                </span>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default ImageGallery;
