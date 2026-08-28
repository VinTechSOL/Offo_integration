import React, {
  useState,
  useMemo,
  useEffect,
} from "react";

import { MenuItem } from "../types";
import { MenuItemRow } from "./MenuItemRow";
import {
  AddItemModal,
  MenuCategory,
} from "./AddItemModal";

import {
  SearchIcon,
  PlusIcon,
} from "./icons";

import { StatCard } from "./StatCard";
import { VendorMenuApi } from "@/apis/vendorMenu";
import { MenuItemFormData } from "../types";

export const MenuDashboard: React.FC = () => {
  // =========================================================
  // STATE
  // =========================================================

  const [menuItems, setMenuItems] =
    useState<MenuItem[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [itemToEdit, setItemToEdit] =
    useState<MenuItem | null>(null);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [backendCategories, setBackendCategories] =
    useState<MenuCategory[]>([]);

  // =========================================================
  // LOAD MENU
  // =========================================================

  const loadMenu = async () => {
    try {
      setLoading(true);

      const [menu, categories] =
        await Promise.all([
          VendorMenuApi.getMenu(),
          VendorMenuApi.getCategories(),
        ]);

      console.log("menu data:", menu);
      console.log("categories:", categories);

      setMenuItems(menu);
      setBackendCategories(categories);
    } catch (err) {
      console.error("Failed to load menu:", err);
      alert("Failed to load menu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenu();
  }, []);

  // =========================================================
  // SEARCH
  // =========================================================

  const filteredMenuItems = useMemo(() => {
    const search = searchTerm
      .trim()
      .toLowerCase();

    if (!search) {
      return menuItems;
    }

    return menuItems.filter((item) =>
      item.name
        .toLowerCase()
        .includes(search)
    );
  }, [menuItems, searchTerm]);

  // =========================================================
  // GROUP BY CATEGORY
  // =========================================================

  const groupedMenuItems = useMemo(() => {
    return filteredMenuItems.reduce(
      (acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = [];
        }

        acc[item.category].push(item);

        return acc;
      },
      {} as Record<string, MenuItem[]>
    );
  }, [filteredMenuItems]);

  // =========================================================
  // CATEGORIES
  // =========================================================

  const categories = useMemo(() => {
    return [
      ...new Set(
        menuItems.map(
          (item) => item.category
        )
      ),
    ].sort();
  }, [menuItems]);

  // =========================================================
  // OPEN ADD / EDIT SIDEBAR
  // =========================================================

  const handleOpenModal = (
    item: MenuItem | null = null
  ) => {
    setItemToEdit(item);
    setIsModalOpen(true);
  };

  // =========================================================
  // CLOSE SIDEBAR
  // =========================================================

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setItemToEdit(null);
  };

  // =========================================================
  // SAVE ITEM
  // =========================================================

  const handleSaveItem = async (
    data: MenuItemFormData
  ) => {
    try {
      // =====================================================
      // EDIT EXISTING ITEM
      // =====================================================

      if (itemToEdit) {
        // ---------------------------------------------------
        // BRANCH ITEM CHANGES
        // price / category
        // ---------------------------------------------------

        const branchChanges: {
          price?: number;
          category_id?: number;
        } = {};

        if (
          data.price !== itemToEdit.price
        ) {
          branchChanges.price = data.price;
        }

        if (
          data.categoryId !==
          itemToEdit.categoryId
        ) {
          branchChanges.category_id =
            data.categoryId;
        }

        if (
          Object.keys(branchChanges).length > 0
        ) {
          console.log(
            "Updating branch item:",
            branchChanges
          );

          await VendorMenuApi.updateBranchItem(
            itemToEdit.id,
            branchChanges
          );
        }

        // ---------------------------------------------------
        // BASE ITEM CHANGES
        // name / description / food type / image
        // ---------------------------------------------------

        const baseChanges: {
          name?: string;
          description?: string;
          foodType?: "veg" | "non-veg";
          imageFile?: File | null;
        } = {};

        if (
          data.name !== itemToEdit.name
        ) {
          baseChanges.name =
            data.name;
        }

        if (
          data.description !==
          itemToEdit.description
        ) {
          baseChanges.description =
            data.description;
        }

        if (
          data.foodType !==
          itemToEdit.foodType
        ) {
          baseChanges.foodType =
            data.foodType;
        }

        // Only send image when the vendor
        // actually selected a new one.
        if (data.imageFile) {
          baseChanges.imageFile =
            data.imageFile;
        }

        if (
          Object.keys(baseChanges).length > 0
        ) {
          console.log(
            "Updating base item:",
            baseChanges
          );

          await VendorMenuApi.updateMenuItem(
            itemToEdit.baseItemId,
            baseChanges
          );
        }
      }

      // =====================================================
      // ADD NEW ITEM
      // =====================================================

      else {
        if (!data.imageFile) {
          throw new Error(
            "Image is required for a new item"
          );
        }

        console.log(
          "Adding new item:",
          data
        );

        await VendorMenuApi.addItem({
          name: data.name,
          description: data.description,
          category: data.category,
          price: data.price,
          foodType: data.foodType,
          imageFile: data.imageFile,
        });
      }

      // =====================================================
      // REFRESH MENU
      // =====================================================

      const refreshedMenu =
        await VendorMenuApi.getMenu();

      setMenuItems(refreshedMenu);

      // Refresh categories too.
      // This is important when a new category
      // was created during Add Item.
      const refreshedCategories =
        await VendorMenuApi.getCategories();

      setBackendCategories(
        refreshedCategories
      );

      // =====================================================
      // CLOSE SIDEBAR ONLY AFTER SUCCESS
      // =====================================================

      handleCloseModal();

    } catch (err) {
      console.error(
        "Failed to save item:",
        err
      );

      alert(
        "Failed to save item. Please try again."
      );

      // Important:
      // Don't close the sidebar here.
      // Vendor can fix the form and try again.
      throw err;
    }
  };

  // =========================================================
  // TOGGLE AVAILABILITY
  // =========================================================

  const handleToggleAvailability = async (
    id: string,
    available: boolean
  ) => {
    try {
      await VendorMenuApi.updateBranchItem(
        id,
        {
          is_available: available,
        }
      );

      const refreshed =
        await VendorMenuApi.getMenu();

      setMenuItems(refreshed);

    } catch (err) {
      console.error(
        "Failed to update availability:",
        err
      );

      alert(
        "Failed to update availability"
      );
    }
  };

  // =========================================================
  // STATISTICS
  // =========================================================

  const totalMenuItems =
    menuItems.length;

  const availableItemsCount =
    menuItems.filter(
      (item) => item.available
    ).length;

  const unavailableItemsCount =
    menuItems.filter(
      (item) => !item.available
    ).length;

  const totalCategories =
    categories.length;

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="flex justify-center items-center gap-3">
          <div
            className="
              w-5
              h-5
              border-2
              border-offo-orange
              border-t-transparent
              rounded-full
              animate-spin
            "
          />

          <span>
            Loading Menu...
          </span>
        </div>
      </div>
    );
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* =====================================================
          STATISTICS
      ====================================================== */}

      <div
        className="
          bg-gradient-to-r
          from-slate-900
          via-slate-800
          to-gray-800
          p-4
          rounded-lg
          shadow-lg
          grid
          grid-cols-2
          gap-4
          sm:flex
          sm:flex-nowrap
          sm:items-center
          sm:divide-x
          sm:divide-white/10
          text-white
        "
      >
        <StatCard
          title="Total Menu Items"
          value={totalMenuItems}
          titleClassName="text-white"
          valueClassName="text-white"
        />

        <StatCard
          title="Available Items"
          value={availableItemsCount}
          titleClassName="text-white"
          valueClassName="text-white"
        />

        <StatCard
          title="Unavailable Items"
          value={unavailableItemsCount}
          titleClassName="text-white"
          valueClassName="text-white"
        />

        <StatCard
          title="Total Categories"
          value={totalCategories}
          titleClassName="text-white"
          valueClassName="text-white"
        />
      </div>

      {/* =====================================================
          MENU CONTENT
      ====================================================== */}

      <div
        className="
          bg-white
          p-4
          sm:p-6
          rounded-lg
          shadow-sm
          space-y-4
        "
      >

        {/* ===================================================
            SEARCH + ADD
        ==================================================== */}

        <div
          className="
            flex
            flex-col
            sm:flex-row
            justify-between
            items-center
            gap-4
          "
        >
          {/* Search */}

          <div
            className="
              relative
              w-full
              sm:max-w-xs
            "
          >
            <input
              type="text"
              placeholder="Search your items"
              className="
                bg-gray-100
                border-transparent
                rounded-md
                p-2
                pl-10
                pr-4
                w-full
                focus:ring-2
                focus:ring-offo-orange
                focus:border-transparent
                outline-none
              "
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(
                  e.target.value
                )
              }
            />

            <SearchIcon
              className="
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                w-5
                h-5
                text-text-secondary
              "
            />
          </div>

          {/* Add Item */}

          <button
            onClick={() =>
              handleOpenModal()
            }
            className="
              bg-offo-orange
              hover:bg-offo-orange-dark
              text-white
              font-bold
              py-2
              px-4
              rounded-md
              flex
              items-center
              space-x-2
              transition-colors
              w-full
              sm:w-auto
              justify-center
            "
          >
            <PlusIcon className="w-5 h-5" />

            <span>
              Add Item
            </span>
          </button>
        </div>

        {/* ===================================================
            MENU ITEMS
        ==================================================== */}

        <div className="space-y-6">

          {Object.keys(
            groupedMenuItems
          ).length > 0 ? (

            (
              Object.entries(
                groupedMenuItems
              ) as [
                string,
                MenuItem[]
              ][]
            )
              .sort(
                ([catA], [catB]) =>
                  catA.localeCompare(
                    catB
                  )
              )
              .map(
                ([
                  category,
                  items,
                ]) => (
                  <div
                    key={category}
                  >
                    {/* Category Header */}

                    <h3
                      className="
                        text-lg
                        font-bold
                        text-text-primary
                        mb-2
                        pb-1
                        border-b-2
                        border-offo-tan
                      "
                    >
                      {category}
                    </h3>

                    {/* Items */}

                    <div className="space-y-3">
                      {items.map(
                        (item) => (
                          <MenuItemRow
                            key={item.id}
                            item={item}
                            onEdit={
                              handleOpenModal
                            }
                            onToggleAvailability={
                              handleToggleAvailability
                            }
                          />
                        )
                      )}
                    </div>
                  </div>
                )
              )

          ) : (

            <div
              className="
                text-center
                py-10
                text-text-secondary
              "
            >
              <p>
                No menu items found.
              </p>

              <p className="text-sm">
                Try adjusting your
                search.
              </p>
            </div>

          )}

        </div>
      </div>

      {/* =====================================================
          ADD / EDIT SIDEBAR
      ====================================================== */}

      <AddItemModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveItem}
        itemToEdit={itemToEdit}
        categories={backendCategories}
      />
    </div>
  );
};