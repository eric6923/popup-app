import { prisma } from "../lib/prisma.server";
import { Type } from "@prisma/client";

const defaultPopupConfig = {
  rules: {
    popupName: "Opt-in popup",
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
      match_type: "ANY",
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
  content: {
    Heading: "Get 10% OFF your order",
    Description: "Sign up and unlock your instant discount.",
    form: {
      fields: {
        name: false,
        email: true
      }
    },
    actions1: {
      primary: true,
      secondary: true
    },
    footer: {
      footerText: "You are signing up to receive communication via email and can unsubscribe at any time."
    },
    success: {
      heading: "Discount unlocked 🎉",
      description: "Thanks for subscribing. Copy your discount code and apply to your next order."
    },
    actions2: {
      enabled: true
    },
    stickydiscountbar: {
      description: "Don't forget to use your discount code"
    },
    sidebarWidget: {
      "btn-text": "Get 10% OFF"
    },
    errorTexts: {
      firstName: "Please enter your first name!",
      lastName: "Please enter your last name!",
      email: "Please enter your email address!",
      phoneNumber: "Please enter valid phone number!",
      policy: "Please check the policy!",
      alreadySubscribed: "You have already subscribed!",
      submitError: "Sorry, please try again later!",
      birthdayError: "Please enter valid birthday!"
    }
  },
  style: {
    logo: {
      url: "",
      width: "40"
    },
    display: {
      size: "Standard",
      alignment: "Left",
      cornor_Radius: "Large"
    },
    layout: "Left",
    image: "",
    colors: {
      popup: {
        backgroud: "FFFFFF"
      },
      text: {
        heading: "121212",
        description: "454545",
        input: "121212",
        consent: "454545",
        error: "D72C0D",
        footerText: "454545",
        label: "121212"
      },
      primaryButton: {
        background: "121212",
        text: "FFFFFF"
      },
      secondaryButton: {
        text: "334FB4"
      },
      stickyDiscountBar: {
        background: "F3F3F3",
        text: "121212"
      },
      sidebarWidget: {
        background: "333333",
        text: "FFFFFF"
      }
    },
    customCss: ""
  }
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