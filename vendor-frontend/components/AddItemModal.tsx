import React, { useEffect, useState } from "react";
import { MenuItem } from "../types";
import { XIcon } from "./icons";
import { MenuItemFormData } from "../types";

const PhotoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect
      x="3"
      y="5"
      width="18"
      height="14"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M8 9L12 13L16 9"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="12"
      cy="12"
      r="2.5"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
);

const VegIndicator: React.FC<{
  foodType: "veg" | "non-veg";
}> = ({ foodType }) => {
  const isVeg = foodType === "veg";

  return (
    <span
      className={`inline-flex items-center justify-center w-4 h-4 border-2 ${
        isVeg
          ? "border-green-600"
          : "border-red-600"
      }`}
    >
      <span
        className={`w-2 h-2 rounded-full ${
          isVeg
            ? "bg-green-600"
            : "bg-red-600"
        }`}
      />
    </span>
  );
};

export interface MenuCategory {
  category_id: number;
  category_name: string;
}

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: MenuItemFormData) => Promise<void>;
  itemToEdit?: MenuItem | null;
  categories: MenuCategory[];
}

export const AddItemModal: React.FC<AddItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  itemToEdit,
  categories,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [category, setCategory] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [newCategory, setNewCategory] = useState("");

  const [price, setPrice] = useState<number | string>("");

  const [foodType, setFoodType] =
    useState<"veg" | "non-veg">("veg");

  const [imageFile, setImageFile] =
    useState<File | null>(null);

  const [imagePreview, setImagePreview] =
    useState<string | null>(null);

  const [imageError, setImageError] =
    useState("");

  const [saving, setSaving] = useState(false);

  const isEditing = Boolean(itemToEdit);

  const isAddingNewCategory =
    category === "ADD_NEW_CATEGORY";

  // =========================================================
  // LOAD DATA
  // =========================================================

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (itemToEdit) {
      setName(itemToEdit.name);

      setDescription(
        itemToEdit.description || ""
      );

      setPrice(itemToEdit.price);

      setFoodType(itemToEdit.foodType);

      setImagePreview(
        itemToEdit.imageUrl || null
      );

      setImageFile(null);

      setImageError("");

      setCategory(itemToEdit.category);

      setCategoryId(
        itemToEdit.categoryId
      );

      setNewCategory("");
    } else {
      setName("");
      setDescription("");

      setCategory("");
      setCategoryId(null);
      setNewCategory("");

      setPrice("");

      setFoodType("veg");

      setImageFile(null);
      setImagePreview(null);

      setImageError("");
    }

    setSaving(false);
  }, [isOpen, itemToEdit]);

  // =========================================================
  // IMAGE
  // =========================================================

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    const maxSize = 400 * 1024;

    if (file.size > maxSize) {
      setImageError(
        "Image should be less than 400 KB"
      );

      setImageFile(null);

      return;
    }

    setImageError("");

    setImageFile(file);

    const reader = new FileReader();

    reader.onloadend = () => {
      setImagePreview(
        reader.result as string
      );
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);

    if (itemToEdit) {
      /*
       * Editing:
       * Removing the newly selected image should
       * restore the original image preview.
       *
       * Backend will NOT receive an image because
       * imageFile remains null.
       */
      setImagePreview(
        itemToEdit.imageUrl || null
      );
    } else {
      setImagePreview(null);
    }

    setImageError("");
  };

  // =========================================================
  // CATEGORY
  // =========================================================

  const handleCategoryChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = e.target.value;

    if (value === "ADD_NEW_CATEGORY") {
      setCategory(
        "ADD_NEW_CATEGORY"
      );

      setCategoryId(null);

      return;
    }

    const selectedCategory =
      categories.find(
        (cat) =>
          String(cat.category_id) === value
      );

    if (!selectedCategory) {
      setCategory("");
      setCategoryId(null);
      return;
    }

    setCategory(
      selectedCategory.category_name
    );

    setCategoryId(
      selectedCategory.category_id
    );

    setNewCategory("");
  };

  // =========================================================
  // SAVE
  // =========================================================

  const handleSave = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const trimmedName =
      name.trim();

    const categoryName =
      isAddingNewCategory
        ? newCategory.trim()
        : category.trim();

    const priceValue =
      typeof price === "string"
        ? parseFloat(price)
        : price;

    if (!trimmedName) {
      return;
    }

    if (!categoryName) {
      return;
    }

    if (!priceValue || priceValue <= 0) {
      return;
    }

    // New item MUST have an image.
    if (!isEditing && !imageFile) {
      setImageError(
        "Please select an image"
      );

      return;
    }

    // Existing category is required
    // when not creating a new category.
    if (
      isEditing &&
      !isAddingNewCategory &&
      categoryId === null
    ) {
      return;
    }

    try {
      setSaving(true);

      await onSave({
        name: trimmedName,

        description,

        category: categoryName,

        categoryId:
          categoryId ?? 0,

        price: priceValue,

        imageFile,

        foodType,
      });
    } catch (error) {
      console.error(
        "Failed to save item:",
        error
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // CLOSE
  // =========================================================

  const handleClose = () => {
    if (saving) {
      return;
    }

    onClose();
  };

  // =========================================================
  // VALIDATION
  // =========================================================

  const parsedPrice =
    typeof price === "string"
      ? parseFloat(price)
      : price;

  const isSaveDisabled =
    saving ||
    !name.trim() ||
    !parsedPrice ||
    parsedPrice <= 0 ||
    (!isEditing && !imageFile) ||
    (isAddingNewCategory
      ? !newCategory.trim()
      : !categoryId);

  // =========================================================
  // SIDEBAR
  // =========================================================

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="menu-item-sidebar-title"
    >
      {/* =====================================================
          BACKDROP
      ====================================================== */}

      <div
        className="absolute inset-0 bg-black/40"
        onClick={handleClose}
      />

      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <div
        className="
          absolute
          right-0
          top-0
          h-full
          w-full
          sm:w-[480px]
          bg-white
          shadow-2xl
          flex
          flex-col
          animate-slideInRight
        "
      >
        {/* ===================================================
            HEADER
        ==================================================== */}

        <div
          className="
            px-6
            py-5
            border-b
            border-gray-200
            flex
            items-center
            justify-between
            flex-shrink-0
          "
        >
          <div>
            <h2
              id="menu-item-sidebar-title"
              className="
                text-xl
                font-bold
                text-gray-800
              "
            >
              {isEditing
                ? "Edit Item"
                : "Add New Item"}
            </h2>

            <p className="text-xs text-gray-500 mt-1">
              {isEditing
                ? "Update only the information you want to change."
                : "Add a new item to your menu."}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="
              p-2
              rounded-lg
              text-gray-400
              hover:text-gray-700
              hover:bg-gray-100
              transition-colors
              disabled:opacity-50
            "
            aria-label="Close"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* ===================================================
            SCROLLABLE BODY
        ==================================================== */}

        <div
          className="
            flex-1
            overflow-y-auto
            px-6
            py-5
          "
        >
          <form
            id="menu-item-form"
            onSubmit={handleSave}
            className="space-y-5"
          >
            {/* =================================================
                ITEM NAME
            ================================================== */}

            <div>
              <label
                htmlFor="name"
                className="
                  block
                  text-xs
                  font-medium
                  text-gray-700
                  mb-1
                "
              >
                Item Name{" "}
                <span className="text-red-500">
                  *
                </span>
              </label>

              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                className="
                  w-full
                  bg-gray-50
                  border
                  border-gray-200
                  rounded-lg
                  py-2.5
                  px-3
                  text-gray-800
                  placeholder-gray-400
                  focus:ring-2
                  focus:ring-orange-500
                  focus:border-transparent
                  outline-none
                  transition-all
                  text-sm
                "
                placeholder="Enter item name"
                required
                disabled={saving}
              />
            </div>

            {/* =================================================
                DESCRIPTION
            ================================================== */}

            <div>
              <label
                htmlFor="description"
                className="
                  block
                  text-xs
                  font-medium
                  text-gray-700
                  mb-1
                "
              >
                Description
              </label>

              <textarea
                id="description"
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
                rows={3}
                className="
                  w-full
                  bg-gray-50
                  border
                  border-gray-200
                  rounded-lg
                  py-2.5
                  px-3
                  text-gray-800
                  placeholder-gray-400
                  focus:ring-2
                  focus:ring-orange-500
                  focus:border-transparent
                  outline-none
                  transition-all
                  resize-none
                  text-sm
                "
                placeholder="A short description for the item..."
                disabled={saving}
              />
            </div>

            {/* =================================================
                CATEGORY
            ================================================== */}

            <div>
              <label
                htmlFor="category"
                className="
                  block
                  text-xs
                  font-medium
                  text-gray-700
                  mb-1
                "
              >
                Category{" "}
                <span className="text-red-500">
                  *
                </span>
              </label>

              <select
                id="category"
                value={
                  isAddingNewCategory
                    ? "ADD_NEW_CATEGORY"
                    : categoryId !== null
                    ? String(categoryId)
                    : ""
                }
                onChange={
                  handleCategoryChange
                }
                className="
                  w-full
                  bg-gray-50
                  border
                  border-gray-200
                  rounded-lg
                  py-2.5
                  px-3
                  text-gray-800
                  focus:ring-2
                  focus:ring-orange-500
                  focus:border-transparent
                  outline-none
                  transition-all
                  text-sm
                "
                required
                disabled={saving}
              >
                <option value="">
                  Select Category
                </option>

                <option value="ADD_NEW_CATEGORY">
                  + Add New Category
                </option>

                {categories.map((cat) => (
                  <option
                    key={
                      cat.category_id
                    }
                    value={String(
                      cat.category_id
                    )}
                  >
                    {cat.category_name}
                  </option>
                ))}
              </select>
            </div>

            {/* =================================================
                NEW CATEGORY
            ================================================== */}

            {isAddingNewCategory && (
              <div className="animate-fadeIn">
                <label
                  htmlFor="new-category"
                  className="
                    block
                    text-xs
                    font-medium
                    text-gray-700
                    mb-1
                  "
                >
                  New Category Name{" "}
                  <span className="text-red-500">
                    *
                  </span>
                </label>

                <input
                  type="text"
                  id="new-category"
                  value={newCategory}
                  onChange={(e) =>
                    setNewCategory(
                      e.target.value
                    )
                  }
                  className="
                    w-full
                    bg-gray-50
                    border
                    border-gray-200
                    rounded-lg
                    py-2.5
                    px-3
                    text-gray-800
                    placeholder-gray-400
                    focus:ring-2
                    focus:ring-orange-500
                    focus:border-transparent
                    outline-none
                    transition-all
                    text-sm
                  "
                  placeholder="e.g. Desserts"
                  required
                  disabled={saving}
                />
              </div>
            )}

            {/* =================================================
                FOOD TYPE
            ================================================== */}

            <div>
              <label
                className="
                  block
                  text-xs
                  font-medium
                  text-gray-700
                  mb-1.5
                "
              >
                Food Type{" "}
                <span className="text-red-500">
                  *
                </span>
              </label>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setFoodType("veg")
                  }
                  disabled={saving}
                  className={`
                    flex-1
                    py-2.5
                    px-4
                    rounded-lg
                    text-sm
                    font-medium
                    transition-all
                    ${
                      foodType === "veg"
                        ? "bg-green-500 text-white shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }
                    disabled:opacity-50
                  `}
                >
                  Veg
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFoodType("non-veg")
                  }
                  disabled={saving}
                  className={`
                    flex-1
                    py-2.5
                    px-4
                    rounded-lg
                    text-sm
                    font-medium
                    ${
                      foodType === "non-veg"
                        ? "bg-red-500 text-white shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }
                    disabled:opacity-50
                  `}
                >
                  Non-Veg
                </button>
              </div>
            </div>

            {/* =================================================
                PRICE
            ================================================== */}

            <div>
              <label
                htmlFor="price"
                className="
                  block
                  text-xs
                  font-medium
                  text-gray-700
                  mb-1
                "
              >
                Price{" "}
                <span className="text-red-500">
                  *
                </span>
              </label>

              <div className="relative">
                <span
                  className="
                    absolute
                    inset-y-0
                    left-0
                    pl-3
                    flex
                    items-center
                    pointer-events-none
                    text-gray-500
                    font-medium
                  "
                >
                  ₹
                </span>

                <input
                  type="number"
                  id="price"
                  value={price}
                  onChange={(e) =>
                    setPrice(
                      e.target.value
                    )
                  }
                  className="
                    w-full
                    bg-gray-50
                    border
                    border-gray-200
                    rounded-lg
                    py-2.5
                    pl-8
                    pr-3
                    text-gray-800
                    placeholder-gray-400
                    focus:ring-2
                    focus:ring-orange-500
                    focus:border-transparent
                    outline-none
                    transition-all
                    text-sm
                  "
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                  disabled={saving}
                />
              </div>
            </div>

            {/* =================================================
                IMAGE
            ================================================== */}

            <div>
              <label
                className="
                  block
                  text-xs
                  font-medium
                  text-gray-700
                  mb-1.5
                "
              >
                Item Image{" "}
                {!isEditing && (
                  <span className="text-red-500">
                    *
                  </span>
                )}
              </label>

              <div className="flex items-center gap-4">
                {imagePreview ? (
                  <div className="relative flex-shrink-0">
                    <img
                      src={imagePreview}
                      alt="Item preview"
                      className="
                        w-20
                        h-20
                        rounded-lg
                        object-cover
                        border-2
                        border-gray-200
                      "
                    />

                    <button
                      type="button"
                      onClick={
                        handleRemoveImage
                      }
                      disabled={saving}
                      className="
                        absolute
                        -top-2
                        -right-2
                        bg-red-500
                        text-white
                        rounded-full
                        w-5
                        h-5
                        flex
                        items-center
                        justify-center
                        text-xs
                        hover:bg-red-600
                        transition
                        disabled:opacity-50
                      "
                      aria-label="Remove image"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div
                    className="
                      w-20
                      h-20
                      rounded-lg
                      bg-gray-100
                      border-2
                      border-dashed
                      border-gray-300
                      flex
                      items-center
                      justify-center
                      flex-shrink-0
                    "
                  >
                    <PhotoIcon className="w-7 h-7 text-gray-400" />
                  </div>
                )}

                <div>
                  <label
                    htmlFor="image-upload"
                    className={`
                      inline-block
                      cursor-pointer
                      bg-gray-100
                      hover:bg-gray-200
                      text-gray-700
                      font-medium
                      py-2
                      px-4
                      rounded-lg
                      transition-colors
                      text-sm
                      ${
                        saving
                          ? "opacity-50 pointer-events-none"
                          : ""
                      }
                    `}
                  >
                    {isEditing
                      ? "Change Image"
                      : "Choose Image"}
                  </label>

                  <input
                    id="image-upload"
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/jpg"
                    className="hidden"
                    onChange={
                      handleImageChange
                    }
                    disabled={saving}
                  />

                  <p className="text-xs text-gray-400 mt-1">
                    PNG, JPG, WEBP (Max 400KB)
                  </p>

                  {imageError && (
                    <p className="text-xs text-red-500 mt-1">
                      {imageError}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* =================================================
                LIVE PREVIEW
            ================================================== */}

            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-sm font-bold text-gray-800">
                    Preview
                  </h3>

                  <p className="text-xs text-gray-400">
                    This is how the item will appear in your menu.
                  </p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                {/* Preview Image */}

                <div className="w-full h-44 bg-gray-100">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Item preview"
                      className="
                        w-full
                        h-full
                        object-cover
                      "
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <PhotoIcon className="w-10 h-10 mx-auto mb-2" />

                        <p className="text-xs">
                          Item image preview
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Preview Details */}

                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <VegIndicator
                          foodType={
                            foodType
                          }
                        />

                        <h4 className="font-bold text-gray-900 truncate">
                          {name.trim() ||
                            "Item Name"}
                        </h4>
                      </div>

                      <p className="text-xs text-gray-500 mt-1 ml-6">
                        {isAddingNewCategory
                          ? newCategory.trim() ||
                            "Category"
                          : category ||
                            "Category"}
                      </p>
                    </div>

                    <div className="flex-shrink-0">
                      <span className="text-base font-bold text-gray-900">
                        ₹
                        {parsedPrice &&
                        parsedPrice > 0
                          ? parsedPrice.toFixed(
                              2
                            )
                          : "0.00"}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 mt-3 line-clamp-2">
                    {description.trim() ||
                      "Item description will appear here."}
                  </p>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-green-600">
                      Available
                    </span>

                    <span
                      className={`
                        text-xs
                        font-medium
                        ${
                          foodType ===
                          "veg"
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      `}
                    >
                      {foodType ===
                      "veg"
                        ? "Vegetarian"
                        : "Non-Vegetarian"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* ===================================================
            STICKY FOOTER
        ==================================================== */}

        <div
          className="
            border-t
            border-gray-200
            px-6
            py-4
            flex
            justify-end
            gap-3
            bg-white
            flex-shrink-0
          "
        >
          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="
              px-5
              py-2.5
              bg-gray-100
              hover:bg-gray-200
              text-gray-700
              font-medium
              rounded-lg
              transition-colors
              text-sm
              disabled:opacity-50
            "
          >
            Cancel
          </button>

          <button
            type="submit"
            form="menu-item-form"
            disabled={isSaveDisabled}
            className="
              px-6
              py-2.5
              bg-orange-500
              hover:bg-orange-600
              text-white
              font-semibold
              rounded-lg
              transition-colors
              text-sm
              disabled:opacity-50
              disabled:cursor-not-allowed
              min-w-[135px]
            "
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <span
                  className="
                    w-4
                    h-4
                    border-2
                    border-white
                    border-t-transparent
                    rounded-full
                    animate-spin
                  "
                />

                Saving...
              </span>
            ) : isEditing ? (
              "Save Changes"
            ) : (
              "Add Item"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};