import { prisma } from "../lib/prisma.server";
import { Type } from "@prisma/client";

const defaultPopupConfig = {
  rules: {
    popupName: "Test with backend",
    discount: {
      no_discount: { enabled: true },
      discount_code: {
        enabled: false,
        discountType: null,
        discountValue: null,
        expiration: { enabled: false, days: null }
      },
      manual_discount: { enabled: false, manualDiscount: null }
    },
    stickyDiscountBar: { enabled: false },
    sidebarWidget: { enabled: false },
    trigger: {
      type: "TIMER",
      timerOption: { delayType: "AFTER_DELAY", delaySeconds: 3 },
      scrollOption: { percentage: 30 },
      exitOption: { enabled: true }
    },
    frequency: {
      type: "ALWAYS",
      limit: { count: null, per: null }
    },
    page_rules: {
      type: "ANY",
      conditions: [
        { match: "EQUALS", value: "/collections/sale" }
      ]
    },
    location_rules: {
      type: "ANY",
      countries: []
    },
    schedule: {
      type: "ALL_TIME",
      start: null,
      end: null
    }
  },
  content: {},
  style: {}
};

// ✅ CREATE
export async function createPopup({
  storeId,
  type = Type.OPT_IN
}: {
  storeId: string;
  type?: Type;
}) {
  return prisma.popup.create({
    data: {
      storeId,
      type,
      isActive: true,
      config: defaultPopupConfig
    }
  });
}

// ✅ GET all popups for store
export async function getPopupsByStore(storeId: string) {
  return prisma.popup.findMany({
    where: { storeId },
    orderBy: { createdAt: 'desc' }
  });
}

// ✅ GET single popup
export async function getPopupById(id: string) {
  return prisma.popup.findUnique({ where: { id } });
}

// ✅ UPDATE popup
export async function updatePopup({
  id,
  config,
  isActive,
  type
}: {
  id: string;
  config?: any;
  isActive?: boolean;
  type?: Type;
}) {
  return prisma.popup.update({
    where: { id },
    data: {
      ...(config && { config }),
      ...(typeof isActive === 'boolean' && { isActive }),
      ...(type && { type })
    }
  });
}

// ✅ DELETE popup
export async function deletePopup(id: string) {
  return prisma.popup.delete({ where: { id } });
}
