
import { BlockStack, Button, Checkbox, InlineStack, Text, TextField, Select, RadioButton } from "@shopify/polaris"
import { useState, useEffect } from "react"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import { TextBoldIcon, TextItalicIcon, ListBulletedIcon, LinkIcon, XIcon } from "@shopify/polaris-icons"

function Tab2({ config, setConfig, setHasUnsavedChanges }: any) {
  // Initialize state from config
  const [nameChecked, setNameChecked] = useState(config?.content?.form?.fields?.name?.enabled || false)
  const [emailChecked, setEmailChecked] = useState(
    config?.content?.form?.fields?.email?.enabled !== undefined ? config?.content?.form?.fields?.email?.enabled : true,
  )
  const [primaryButtonChecked, setPrimaryButtonChecked] = useState(config?.content?.actions1?.primary || true)
  const [secondaryButtonChecked, setSecondaryButtonChecked] = useState(config?.content?.actions1?.secondary || true)
  const [buttonChecked, setButtonChecked] = useState(config?.content?.actions2?.enabled || true)

  // Text field states
  const [headingText, setHeadingText] = useState(config?.content?.Heading || "Get 10% OFF your order")
  const [descriptionText, setDescriptionText] = useState(
    config?.content?.Description || "Sign up and unlock your instant discount.",
  )
  const [footerText, setFooterText] = useState(
    config?.content?.footer?.footerText ||
      "You are signing up to receive communication via email and can unsubscribe at any time.",
  )
  const [successHeading, setSuccessHeading] = useState(config?.content?.success?.heading || "Discount unlocked 🎉")
  const [successDescription, setSuccessDescription] = useState(
    config?.content?.success?.description ||
      "Thanks for subscribing. Copy your discount code and apply to your next order.",
  )
  const [stickyDescription, setStickyDescription] = useState(
    config?.content?.stickydiscountbar?.description || "Don't forget to use your discount code",
  )
  const [buttonText, setButtonText] = useState(config?.content?.sidebarWidget?.["btn-text"] || "Get 10% OFF")

  // Error text states
  const [firstNameError, setFirstNameError] = useState(
    config?.content?.errorTexts?.firstName || "Please enter your first name!",
  )
  const [lastNameError, setLastNameError] = useState(
    config?.content?.errorTexts?.lastName || "Please enter your last name!",
  )
  const [emailError, setEmailError] = useState(config?.content?.errorTexts?.email || "Please enter your email address!")
  const [phoneError, setPhoneError] = useState(
    config?.content?.errorTexts?.phoneNumber || "Please enter valid phone number!",
  )
  const [policyError, setPolicyError] = useState(config?.content?.errorTexts?.policy || "Please check the policy!")
  const [subscribedError, setSubscribedError] = useState(
    config?.content?.errorTexts?.alreadySubscribed || "You have already subscribed!",
  )
  const [submitError, setSubmitError] = useState(
    config?.content?.errorTexts?.submitError || "Sorry, please try again later!",
  )
  const [birthdayError, setBirthdayError] = useState(
    config?.content?.errorTexts?.birthdayError || "Please enter valid birthday!",
  )

  // Name field configuration
  const [nameFieldType, setNameFieldType] = useState(config?.content?.form?.fields?.name?.field_type || "both")
  const [nameLayout, setNameLayout] = useState(config?.content?.form?.fields?.name?.layout || "horizontal")
  const [firstNameRequired, setFirstNameRequired] = useState(
    config?.content?.form?.fields?.name?.first_name?.required !== undefined
      ? config?.content?.form?.fields?.name?.first_name?.required
      : true,
  )
  const [lastNameRequired, setLastNameRequired] = useState(
    config?.content?.form?.fields?.name?.last_name?.required !== undefined
      ? config?.content?.form?.fields?.name?.last_name?.required
      : true,
  )
  const [firstNamePlaceholder, setFirstNamePlaceholder] = useState(
    config?.content?.form?.fields?.name?.first_name?.placeholder || "First name",
  )
  const [lastNamePlaceholder, setLastNamePlaceholder] = useState(
    config?.content?.form?.fields?.name?.last_name?.placeholder || "Last name",
  )

  // Email field configuration
  const [emailPlaceholder, setEmailPlaceholder] = useState(
    config?.content?.form?.fields?.email?.placeholder || "Email address",
  )
  const [emailRequired, setEmailRequired] = useState(
    config?.content?.form?.fields?.email?.required !== undefined
      ? config?.content?.form?.fields?.email?.required
      : true,
  )

  // Phone field configuration
  const [phoneChecked, setPhoneChecked] = useState(
    config?.content?.form?.fields?.phone?.enabled !== undefined ? config?.content?.form?.fields?.phone?.enabled : false,
  )
  const [phoneCountry, setPhoneCountry] = useState(config?.content?.form?.fields?.phone?.country || "IN")
  const [phoneRequired, setPhoneRequired] = useState(
    config?.content?.form?.fields?.phone?.required !== undefined
      ? config?.content?.form?.fields?.phone?.required
      : true,
  )
  const [phonePlaceholder, setPhonePlaceholder] = useState(
    config?.content?.form?.fields?.phone?.placeholder || "Phone number",
  )

  // Birthday field configuration
  const [birthdayChecked, setBirthdayChecked] = useState(
    config?.content?.form?.fields?.birthday?.enabled !== undefined
      ? config?.content?.form?.fields?.birthday?.enabled
      : false,
  )
  const [birthdayFormat, setBirthdayFormat] = useState(config?.content?.form?.fields?.birthday?.format || "MM/DD/YYYY")
  const [birthdayRequired, setBirthdayRequired] = useState(
    config?.content?.form?.fields?.birthday?.required !== undefined
      ? config?.content?.form?.fields?.birthday?.required
      : true,
  )
  const [birthdayLabel, setBirthdayLabel] = useState(config?.content?.form?.fields?.birthday?.label || "Birthday")
  const [birthdayDayPlaceholder, setBirthdayDayPlaceholder] = useState(
    config?.content?.form?.fields?.birthday?.day?.placeholder || "DD",
  )
  const [birthdayMonthPlaceholder, setBirthdayMonthPlaceholder] = useState(
    config?.content?.form?.fields?.birthday?.month?.placeholder || "MM",
  )
  const [birthdayYearPlaceholder, setBirthdayYearPlaceholder] = useState(
    config?.content?.form?.fields?.birthday?.year?.placeholder || "YYYY",
  )

  // Marketing consent field configuration
  const [marketingConsentChecked, setMarketingConsentChecked] = useState(
    config?.content?.form?.fields?.marketingconsent?.enabled !== undefined
      ? config?.content?.form?.fields?.marketingconsent?.enabled
      : false,
  )
  const [marketingConsentContent, setMarketingConsentContent] = useState(
    config?.content?.form?.fields?.marketingconsent?.content || "<p>I agree to receive marketing emails</p>",
  )

  // SMS consent field configuration
  const [smsConsentChecked, setSmsConsentChecked] = useState(
    config?.content?.form?.fields?.smsconsent?.enabled !== undefined
      ? config?.content?.form?.fields?.smsconsent?.enabled
      : false,
  )
  const [smsConsentContent, setSmsConsentContent] = useState(
    config?.content?.form?.fields?.smsconsent?.content ||
      "<p>By signing up, you agree to receive recurring automated marketing messages at the phone number provided. Consent is not a condition of purchase. Reply STOP to unsubscribe. Msg frequency varies. Msg & data rates may apply. View Privacy Policy & Terms.</p>",
  )

  const [addFieldPopoverActive, setAddFieldPopoverActive] = useState(false)

  // Link modal states
  const [linkModalActive, setLinkModalActive] = useState(false)
  const [linkText, setLinkText] = useState("")
  const [linkUrl, setLinkUrl] = useState("")
  const [openInNewTab, setOpenInNewTab] = useState(false)
  const [selectedRange, setSelectedRange] = useState<{ from: number; to: number } | null>(null)
  const [currentEditor, setCurrentEditor] = useState<"footer" | "marketingConsent" | "smsConsent" | null>(null)

  // Edit mode state
  const [editMode, setEditMode] = useState(false)
  const [currentEditField, setCurrentEditField] = useState("")

  // Custom Link extension with target support
  const CustomLink = Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      class: "text-orange-500 underline",
    },
    // Add support for target attribute
    parseHTML() {
      return [
        {
          tag: 'a[href]:not([href *= "javascript:" i])',
          getAttrs: (node) => {
            if (typeof node === "string") return {}
            const element = node as HTMLElement
            return {
              href: element.getAttribute("href"),
              target: element.getAttribute("target"),
            }
          },
        },
      ]
    },
    renderHTML({ HTMLAttributes }) {
      return ["a", HTMLAttributes, 0]
    },
  })

  // TipTap editors
  const footerEditor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: true,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: true,
        },
      }),
      CustomLink,
    ],
    content: footerText,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      setFooterText(html)
      updateConfig("footer", "footerText", html)
    },
    // Ensure editor properly handles selection
    editorProps: {
      attributes: {
        class: "focus:outline-none",
      },
      handleDOMEvents: {
        mousedown: (view, event) => {
          // This helps with selection handling
          return false
        },
      },
    },
  })

  const marketingConsentEditor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: true,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: true,
        },
      }),
      CustomLink,
    ],
    content: marketingConsentContent,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      setMarketingConsentContent(html)
      updateConfig("form", "fields", {
        ...config?.content?.form?.fields,
        marketingconsent: {
          ...config?.content?.form?.fields?.marketingconsent,
          content: html,
        },
      })
    },
    editorProps: {
      attributes: {
        class: "focus:outline-none",
      },
      handleDOMEvents: {
        mousedown: (view, event) => {
          return false
        },
      },
    },
  })

  const smsConsentEditor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: true,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: true,
        },
      }),
      CustomLink,
    ],
    content: smsConsentContent,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      setSmsConsentContent(html)
      updateConfig("form", "fields", {
        ...config?.content?.form?.fields,
        smsconsent: {
          ...config?.content?.form?.fields?.smsconsent,
          content: html,
        },
      })
    },
    editorProps: {
      attributes: {
        class: "focus:outline-none",
      },
      handleDOMEvents: {
        mousedown: (view, event) => {
          return false
        },
      },
    },
  })

  // Update config when any field changes
  const updateConfig = (section, field, value) => {
    setConfig((prevConfig) => {
      const newConfig = { ...prevConfig }

      if (!newConfig.content) {
        newConfig.content = {}
      }

      if (section && field) {
        if (!newConfig.content[section]) {
          newConfig.content[section] = {}
        }
        newConfig.content[section][field] = value
      } else if (section) {
        newConfig.content[section] = value
      }

      return newConfig
    })

    setHasUnsavedChanges(true)
  }

  // Set editor content when text changes from external source
  useEffect(() => {
    if (footerEditor && footerText !== footerEditor.getHTML()) {
      footerEditor.commands.setContent(footerText)
    }
  }, [footerEditor, footerText])

  useEffect(() => {
    if (marketingConsentEditor && marketingConsentContent !== marketingConsentEditor.getHTML()) {
      marketingConsentEditor.commands.setContent(marketingConsentContent)
    }
  }, [marketingConsentEditor, marketingConsentContent])

  useEffect(() => {
    if (smsConsentEditor && smsConsentContent !== smsConsentEditor.getHTML()) {
      smsConsentEditor.commands.setContent(smsConsentContent)
    }
  }, [smsConsentEditor, smsConsentContent])

  // Update config when component mounts
  useEffect(() => {
    if (config && setConfig) {
      updateFormConfig()
    }
  }, [])

  // Function to update form configuration
  const updateFormConfig = () => {
    const updatedContent = {
      Heading: headingText,
      Description: descriptionText,
      form: {
        fields: {
          name: nameChecked
            ? {
                layout: nameLayout,
                enabled: nameChecked,
                field_type: nameFieldType,
                first_name: {
                  required: firstNameRequired,
                  placeholder: firstNamePlaceholder,
                },
                last_name: {
                  required: lastNameRequired,
                  placeholder: lastNamePlaceholder,
                },
              }
            : {
                enabled: false,
              },
          email: {
            enabled: emailChecked,
            required: emailRequired,
            placeholder: emailPlaceholder,
          },
          phone: phoneChecked
            ? {
                country: phoneCountry,
                enabled: phoneChecked,
                required: phoneRequired,
                placeholder: phonePlaceholder,
              }
            : {
                enabled: false,
              },
          birthday: birthdayChecked
            ? {
                day: { placeholder: birthdayDayPlaceholder },
                year: { placeholder: birthdayYearPlaceholder },
                label: birthdayLabel,
                month: { placeholder: birthdayMonthPlaceholder },
                format: birthdayFormat,
                enabled: birthdayChecked,
                required: birthdayRequired,
              }
            : {
                enabled: false,
              },
          marketingconsent: marketingConsentChecked
            ? {
                content: marketingConsentContent,
                enabled: marketingConsentChecked,
              }
            : {
                enabled: false,
              },
          smsconsent: smsConsentChecked
            ? {
                content: smsConsentContent,
                enabled: smsConsentChecked,
              }
            : {
                enabled: false,
              },
        },
      },
      actions1: {
        primary: primaryButtonChecked,
        secondary: secondaryButtonChecked,
      },
      footer: {
        footerText: footerText,
      },
      success: {
        heading: successHeading,
        description: successDescription,
      },
      actions2: {
        enabled: buttonChecked,
      },
      stickydiscountbar: {
        description: stickyDescription,
      },
      sidebarWidget: {
        "btn-text": buttonText,
      },
      errorTexts: {
        firstName: firstNameError,
        lastName: lastNameError,
        email: emailError,
        phoneNumber: phoneError,
        policy: policyError,
        alreadySubscribed: subscribedError,
        submitError: submitError,
        birthdayError: birthdayError,
      },
    }

    setConfig((prevConfig) => ({
      ...prevConfig,
      content: updatedContent,
    }))
  }

  // Handle field changes
  const handleHeadingChange = (value) => {
    setHeadingText(value)
    updateConfig("Heading", null, value)
  }

  const handleDescriptionChange = (value) => {
    setDescriptionText(value)
    updateConfig("Description", null, value)
  }

  const handleNameCheckedChange = (checked) => {
    setNameChecked(checked)

    if (checked) {
      updateConfig("form", "fields", {
        ...config?.content?.form?.fields,
        name: {
          layout: nameLayout,
          enabled: checked,
          field_type: nameFieldType,
          first_name: {
            required: firstNameRequired,
            placeholder: firstNamePlaceholder,
          },
          last_name: {
            required: lastNameRequired,
            placeholder: lastNamePlaceholder,
          },
        },
      })
    } else {
      updateConfig("form", "fields", {
        ...config?.content?.form?.fields,
        name: {
          enabled: false,
        },
      })
    }
  }

  const handleEmailCheckedChange = (checked) => {
    setEmailChecked(checked)
    updateConfig("form", "fields", {
      ...config?.content?.form?.fields,
      email: {
        enabled: checked,
        required: emailRequired,
        placeholder: emailPlaceholder,
      },
    })
  }

  const handlePrimaryButtonChange = (checked) => {
    setPrimaryButtonChecked(checked)
    updateConfig("actions1", "primary", checked)
  }

  const handleSecondaryButtonChange = (checked) => {
    setSecondaryButtonChecked(checked)
    updateConfig("actions1", "secondary", checked)
  }

  const handleSuccessHeadingChange = (value) => {
    setSuccessHeading(value)
    updateConfig("success", "heading", value)
  }

  const handleSuccessDescriptionChange = (value) => {
    setSuccessDescription(value)
    updateConfig("success", "description", value)
  }

  const handleButtonCheckedChange = (checked) => {
    setButtonChecked(checked)
    updateConfig("actions2", "enabled", checked)
  }

  const handleStickyDescriptionChange = (value: any) => {
    setStickyDescription(value)
    updateConfig("stickydiscountbar", "description", value)
  }

  const handleButtonTextChange = (value: any) => {
    setButtonText(value)
    updateConfig("sidebarWidget", "btn-text", value)
  }

  const handleFirstNameErrorChange = (value: any) => {
    setFirstNameError(value)
    updateConfig("errorTexts", "firstName", value)
  }

  const handleLastNameErrorChange = (value: any) => {
    setLastNameError(value)
    updateConfig("errorTexts", "lastName", value)
  }

  const handleEmailErrorChange = (value: any) => {
    setEmailError(value)
    updateConfig("errorTexts", "email", value)
  }

  const handlePhoneErrorChange = (value: any) => {
    setPhoneError(value)
    updateConfig("errorTexts", "phoneNumber", value)
  }

  const handlePolicyErrorChange = (value: any) => {
    setPolicyError(value)
    updateConfig("errorTexts", "policy", value)
  }

  const handleSubscribedErrorChange = (value: any) => {
    setSubscribedError(value)
    updateConfig("errorTexts", "alreadySubscribed", value)
  }

  const handleSubmitErrorChange = (value: any) => {
    setSubmitError(value)
    updateConfig("errorTexts", "submitError", value)
  }

  const handleBirthdayErrorChange = (value: any) => {
    setBirthdayError(value)
    updateConfig("errorTexts", "birthdayError", value)
  }

  // Name field handlers
  const handleNameFieldTypeChange = (value) => {
    setNameFieldType(value)
    updateConfig("form", "fields", {
      ...config?.content?.form?.fields,
      name: {
        ...config?.content?.form?.fields?.name,
        field_type: value,
      },
    })
  }

  const handleNameLayoutChange = (value) => {
    setNameLayout(value)
    updateConfig("form", "fields", {
      ...config?.content?.form?.fields,
      name: {
        ...config?.content?.form?.fields?.name,
        layout: value,
      },
    })
  }

  const handleFirstNameRequiredChange = (checked) => {
    setFirstNameRequired(checked)
    updateConfig("form", "fields", {
      ...config?.content?.form?.fields,
      name: {
        ...config?.content?.form?.fields?.name,
        first_name: {
          ...config?.content?.form?.fields?.name?.first_name,
          required: checked,
        },
      },
    })
  }

  const handleLastNameRequiredChange = (checked) => {
    setLastNameRequired(checked)
    updateConfig("form", "fields", {
      ...config?.content?.form?.fields,
      name: {
        ...config?.content?.form?.fields?.name,
        last_name: {
          ...config?.content?.form?.fields?.name?.last_name,
          required: checked,
        },
      },
    })
  }

  const handleFirstNamePlaceholderChange = (value) => {
    setFirstNamePlaceholder(value)
    updateConfig("form", "fields", {
      ...config?.content?.form?.fields,
      name: {
        ...config?.content?.form?.fields?.name,
        first_name: {
          ...config?.content?.form?.fields?.name?.first_name,
          placeholder: value,
        },
      },
    })
  }

  const handleLastNamePlaceholderChange = (value) => {
    setLastNamePlaceholder(value)
    updateConfig("form", "fields", {
      ...config?.content?.form?.fields,
      name: {
        ...config?.content?.form?.fields?.name,
        last_name: {
          ...config?.content?.form?.fields?.name?.last_name,
          placeholder: value,
        },
      },
    })
  }

  // Email field handlers
  const handleEmailPlaceholderChange = (value) => {
    setEmailPlaceholder(value)
    updateConfig("form", "fields", {
      ...config?.content?.form?.fields,
      email: {
        ...config?.content?.form?.fields?.email,
        placeholder: value,
      },
    })
  }

  const handleEmailRequiredChange = (checked) => {
    setEmailRequired(checked)
    updateConfig("form", "fields", {
      ...config?.content?.form?.fields,
      email: {
        ...config?.content?.form?.fields?.email,
        required: checked,
      },
    })
  }

  // Phone field handlers
  const handlePhoneCheckedChange = (checked) => {
    setPhoneChecked(checked)

    if (checked) {
      updateConfig("form", "fields", {
        ...config?.content?.form?.fields,
        phone: {
          country: phoneCountry,
          enabled: checked,
          required: phoneRequired,
          placeholder: phonePlaceholder,
        },
      })
    } else {
      updateConfig("form", "fields", {
        ...config?.content?.form?.fields,
        phone: {
          enabled: false,
        },
      })
    }
  }

  const handlePhoneCountryChange = (value) => {
    setPhoneCountry(value)
    updateConfig("form", "fields", {
      ...config?.content?.form?.fields,
      phone: {
        ...config?.content?.form?.fields?.phone,
        country: value,
      },
    })
  }

  const handlePhoneRequiredChange = (checked) => {
    setPhoneRequired(checked)
    updateConfig("form", "fields", {
      ...config?.content?.form?.fields,
      phone: {
        ...config?.content?.form?.fields?.phone,
        required: checked,
      },
    })
  }

  const handlePhonePlaceholderChange = (value) => {
    setPhonePlaceholder(value)
    updateConfig("form", "fields", {
      ...config?.content?.form?.fields,
      phone: {
        ...config?.content?.form?.fields?.phone,
        placeholder: value,
      },
    })
  }

  // Birthday field handlers
  const handleBirthdayCheckedChange = (checked) => {
    setBirthdayChecked(checked)

    if (checked) {
      updateConfig("form", "fields", {
        ...config?.content?.form?.fields,
        birthday: {
          day: { placeholder: birthdayDayPlaceholder },
          year: { placeholder: birthdayYearPlaceholder },
          label: birthdayLabel,
          month: { placeholder: birthdayMonthPlaceholder },
          format: birthdayFormat,
          enabled: checked,
          required: birthdayRequired,
        },
      })
    } else {
      updateConfig("form", "fields", {
        ...config?.content?.form?.fields,
        birthday: {
          enabled: false,
        },
      })
    }
  }

  const handleBirthdayFormatChange = (value) => {
    setBirthdayFormat(value)
    updateConfig("form", "fields", {
      ...config?.content?.form?.fields,
      birthday: {
        ...config?.content?.form?.fields?.birthday,
        format: value,
      },
    })
  }

  const handleBirthdayRequiredChange = (checked) => {
    setBirthdayRequired(checked)
    updateConfig("form", "fields", {
      ...config?.content?.form?.fields,
      birthday: {
        ...config?.content?.form?.fields?.birthday,
        required: checked,
      },
    })
  }

  const handleBirthdayLabelChange = (value) => {
    setBirthdayLabel(value)
    updateConfig("form", "fields", {
      ...config?.content?.form?.fields,
      birthday: {
        ...config?.content?.form?.fields?.birthday,
        label: value,
      },
    })
  }

  const handleBirthdayDayPlaceholderChange = (value) => {
    setBirthdayDayPlaceholder(value)
    updateConfig("form", "fields", {
      ...config?.content?.form?.fields,
      birthday: {
        ...config?.content?.form?.fields?.birthday,
        day: {
          ...config?.content?.form?.fields?.birthday?.day,
          placeholder: value,
        },
      },
    })
  }

  const handleBirthdayMonthPlaceholderChange = (value) => {
    setBirthdayMonthPlaceholder(value)
    updateConfig("form", "fields", {
      ...config?.content?.form?.fields,
      birthday: {
        ...config?.content?.form?.fields?.birthday,
        month: {
          ...config?.content?.form?.fields?.birthday?.month,
          placeholder: value,
        },
      },
    })
  }

  const handleBirthdayYearPlaceholderChange = (value) => {
    setBirthdayYearPlaceholder(value)
    updateConfig("form", "fields", {
      ...config?.content?.form?.fields,
      birthday: {
        ...config?.content?.form?.fields?.birthday,
        year: {
          ...config?.content?.form?.fields?.birthday?.year,
          placeholder: value,
        },
      },
    })
  }

  // Consent field handlers
  const handleMarketingConsentCheckedChange = (checked) => {
    setMarketingConsentChecked(checked)

    if (checked) {
      updateConfig("form", "fields", {
        ...config?.content?.form?.fields,
        marketingconsent: {
          content: marketingConsentContent,
          enabled: checked,
        },
      })
    } else {
      updateConfig("form", "fields", {
        ...config?.content?.form?.fields,
        marketingconsent: {
          enabled: false,
        },
      })
    }
  }

  const handleSmsConsentCheckedChange = (checked) => {
    setSmsConsentChecked(checked)

    if (checked) {
      updateConfig("form", "fields", {
        ...config?.content?.form?.fields,
        smsconsent: {
          content: smsConsentContent,
          enabled: checked,
        },
      })
    } else {
      updateConfig("form", "fields", {
        ...config?.content?.form?.fields,
        smsconsent: {
          enabled: false,
        },
      })
    }
  }

  const toggleAddFieldPopover = () => {
    setAddFieldPopoverActive(!addFieldPopoverActive)
  }

  const handleAddField = (field) => {
    switch (field) {
      case "name":
        setNameChecked(true)
        handleNameCheckedChange(true)
        break
      case "phone":
        setPhoneChecked(true)
        handlePhoneCheckedChange(true)
        break
      case "birthday":
        setBirthdayChecked(true)
        handleBirthdayCheckedChange(true)
        break
      case "marketingconsent":
        setMarketingConsentChecked(true)
        handleMarketingConsentCheckedChange(true)
        break
      case "smsconsent":
        setSmsConsentChecked(true)
        handleSmsConsentCheckedChange(true)
        break
    }
    setAddFieldPopoverActive(false)
  }

  // Link modal handlers
  const handleLinkModalOpen = (editorType: "footer" | "marketingConsent" | "smsConsent") => {
    let editor

    if (editorType === "footer") {
      editor = footerEditor
    } else if (editorType === "marketingConsent") {
      editor = marketingConsentEditor
    } else if (editorType === "smsConsent") {
      editor = smsConsentEditor
    }

    if (!editor) return

    setCurrentEditor(editorType)

    // Make sure editor is focused
    editor.commands.focus()

    const { from, to } = editor.state.selection
    setSelectedRange({ from, to })

    // Check if text is selected
    const selectedText = editor.state.doc.textBetween(from, to, " ")

    // Check if we're editing an existing link
    const linkAttrs = editor.getAttributes("link")

    if (linkAttrs.href) {
      // We're editing an existing link
      setLinkText(selectedText)
      setLinkUrl(linkAttrs.href)
      setOpenInNewTab(linkAttrs.target === "_blank")
    } else if (selectedText) {
      // Text is selected, but no existing link
      setLinkText(selectedText)
      setLinkUrl("")
      setOpenInNewTab(false)
    } else {
      // No text selected, no existing link
      setLinkText("")
      setLinkUrl("")
      setOpenInNewTab(false)
    }

    setLinkModalActive(true)
  }

  const handleLinkModalClose = () => {
    setLinkModalActive(false)
    setLinkText("")
    setLinkUrl("")
    setOpenInNewTab(false)
    setSelectedRange(null)
    setCurrentEditor(null)
  }

  const handleLinkSave = () => {
    let editor

    if (currentEditor === "footer") {
      editor = footerEditor
    } else if (currentEditor === "marketingConsent") {
      editor = marketingConsentEditor
    } else if (currentEditor === "smsConsent") {
      editor = smsConsentEditor
    }

    if (!editor || !selectedRange) return

    // If URL is empty, remove the link
    if (!linkUrl.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      handleLinkModalClose()
      return
    }

    // Prepare link attributes
    const attrs = {
      href: linkUrl,
      target: openInNewTab ? "_blank" : null,
      rel: openInNewTab ? "noopener noreferrer" : null,
    }

    // If text was selected, update the link on that text
    if (selectedRange.from !== selectedRange.to) {
      // If the link text has changed, we need to delete the selection and insert new text
      const selectedText = editor.state.doc.textBetween(selectedRange.from, selectedRange.to, " ")

      if (selectedText !== linkText && linkText.trim()) {
        // Delete the selected text
        editor.chain().focus().deleteRange(selectedRange).run()

        // Insert the new text with link
        editor
          .chain()
          .focus()
          .insertContent({
            type: "text",
            text: linkText,
            marks: [{ type: "link", attrs }],
          })
          .run()
      } else {
        // Just update the link on the selected text
        editor.chain().focus().setTextSelection(selectedRange).extendMarkRange("link").setLink(attrs).run()
      }
    } else {
      // No text was selected, insert new text with link
      editor
        .chain()
        .focus()
        .insertContent({
          type: "text",
          text: linkText,
          marks: [{ type: "link", attrs }],
        })
        .run()
    }

    handleLinkModalClose()
  }

  // Edit mode handlers
  const handleFieldEdit = (field) => {
    setCurrentEditField(field)
    setEditMode(true)
  }

  const handleEditCancel = () => {
    setEditMode(false)
    setCurrentEditField("")
  }

  const handleEditDone = () => {
    setEditMode(false)
    setCurrentEditField("")
    updateFormConfig()
  }

  const handleRemoveField = () => {
    if (!currentEditField) return

    switch (currentEditField) {
      case "name":
        setNameChecked(false)
        handleNameCheckedChange(false)
        break
      case "email":
        // Email is required, so we don't allow removing it
        break
      case "phone":
        setPhoneChecked(false)
        handlePhoneCheckedChange(false)
        break
      case "birthday":
        setBirthdayChecked(false)
        handleBirthdayCheckedChange(false)
        break
      case "marketingconsent":
        setMarketingConsentChecked(false)
        handleMarketingConsentCheckedChange(false)
        break
      case "smsconsent":
        setSmsConsentChecked(false)
        handleSmsConsentCheckedChange(false)
        break
    }

    setEditMode(false)
    setCurrentEditField("")
  }

  // TipTap toolbar buttons
  const MenuBar = ({ editor, onLinkClick }: any) => {
    if (!editor) {
      return null
    }

    // Focus the editor when any button is clicked to ensure single-click operation
    const focusEditorAndRun = (callback) => {
      // If editor is not already focused, focus it first
      if (!editor.isFocused) {
        editor.commands.focus()
      }
      // Then run the callback
      callback()
    }

    return (
      <InlineStack gap="200">
        <Button
          size="slim"
          pressed={editor.isActive("bold")}
          onClick={() => focusEditorAndRun(() => editor.chain().toggleBold().run())}
          icon={TextBoldIcon}
        />
        <Button
          size="slim"
          pressed={editor.isActive("italic")}
          onClick={() => focusEditorAndRun(() => editor.chain().toggleItalic().run())}
          icon={TextItalicIcon}
        />
        <Button
          size="slim"
          pressed={editor.isActive("bulletList")}
          onClick={() => {
            focusEditorAndRun(() => {
              // For bullet lists, we need to handle selection differently
              // First check if we have a selection
              const { empty } = editor.state.selection

              if (!empty) {
                // If text is selected, we need to preserve that selection when toggling
                const { from, to } = editor.state.selection
                editor.chain().toggleBulletList().run()
                // Ensure selection is maintained after toggling
                editor.commands.setTextSelection({ from, to })
              } else {
                // No selection, just toggle the bullet list
                editor.chain().toggleBulletList().run()
              }
            })
          }}
          icon={ListBulletedIcon}
        />
        <Button size="slim" pressed={editor.isActive("link")} onClick={onLinkClick} icon={LinkIcon} />
      </InlineStack>
    )
  }

  // Add this near the other useEffect hooks
  useEffect(() => {
    if (addFieldPopoverActive) {
      const handleClickOutside = (event) => {
        // Check if the click is outside the popover
        if (event.target.closest("[data-add-field-popover]") === null) {
          setAddFieldPopoverActive(false)
        }
      }

      document.addEventListener("mousedown", handleClickOutside)
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }
  }, [addFieldPopoverActive])

  // Row with label and edit button
  const RowWithEdit = ({ label, checked, onChange, onEdit }: any) => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        padding: "4px 0",
      }}
    >
      <Checkbox label={label} checked={checked} onChange={onChange} />
      <Button plain monochrome textDecoration="underline" onClick={onEdit}>
        <Text as="span" color="highlight">
          Edit
        </Text>
      </Button>
    </div>
  )

  // Render edit mode for different field types
  const renderEditMode = () => {
    switch (currentEditField) {
      case "name":
        return (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Text variant="headingMd" as="h2">
                Name
              </Text>
              <Button plain icon={XIcon} onClick={handleEditCancel} accessibilityLabel="Close" />
            </div>

            <div style={{ marginTop: "16px" }}>
              <Text as="p" fontWeight="medium" variant="bodyMd">
                Field type
              </Text>
              <div style={{ marginTop: "8px" }}>
                <Select
                  label=""
                  labelHidden
                  options={[
                    { label: "First name and last name", value: "both" },
                    { label: "First name only", value: "first_name_only" },
                    { label: "Last name only", value: "last_name_only" },
                  ]}
                  value={nameFieldType}
                  onChange={handleNameFieldTypeChange}
                />
              </div>
            </div>

            <div style={{ marginTop: "16px" }}>
              <Text as="p" fontWeight="medium" variant="bodyMd">
                Layout
              </Text>
              <div style={{ marginTop: "8px", display: "flex", gap: "16px" }}>
                <RadioButton
                  label="Vertical"
                  checked={nameLayout === "vertical"}
                  id="vertical-layout"
                  name="layout"
                  onChange={() => handleNameLayoutChange("vertical")}
                />
                <RadioButton
                  label="Horizontal"
                  checked={nameLayout === "horizontal"}
                  id="horizontal-layout"
                  name="layout"
                  onChange={() => handleNameLayoutChange("horizontal")}
                />
              </div>
            </div>

            {(nameFieldType === "both" || nameFieldType === "first_name_only") && (
              <div style={{ marginTop: "16px" }}>
                <Text as="p" fontWeight="medium" variant="bodyMd">
                  First name placeholder
                </Text>
                <div style={{ marginTop: "8px" }}>
                  <TextField
                    label=""
                    value={firstNamePlaceholder}
                    onChange={handleFirstNamePlaceholderChange}
                    autoComplete="off"
                  />
                </div>
                <div style={{ marginTop: "8px" }}>
                  <Checkbox
                    label="First name field is required"
                    checked={firstNameRequired}
                    onChange={handleFirstNameRequiredChange}
                  />
                </div>
              </div>
            )}

            {(nameFieldType === "both" || nameFieldType === "last_name_only") && (
              <div style={{ marginTop: "16px" }}>
                <Text as="p" fontWeight="medium" variant="bodyMd">
                  Last name placeholder
                </Text>
                <div style={{ marginTop: "8px" }}>
                  <TextField
                    label=""
                    value={lastNamePlaceholder}
                    onChange={handleLastNamePlaceholderChange}
                    autoComplete="off"
                  />
                </div>
                <div style={{ marginTop: "8px" }}>
                  <Checkbox
                    label="Last name field is required"
                    checked={lastNameRequired}
                    onChange={handleLastNameRequiredChange}
                  />
                </div>
              </div>
            )}

            <div style={{ marginTop: "16px" }}>
              <Button outline destructive onClick={handleRemoveField}>
                Remove this field
              </Button>
            </div>

            <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <Button onClick={handleEditCancel}>Cancel</Button>
              <Button primary onClick={handleEditDone}>
                Done
              </Button>
            </div>
          </div>
        )

      case "email":
        return (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Text variant="headingMd" as="h2">
                Email address
              </Text>
              <Button plain icon={XIcon} onClick={handleEditCancel} accessibilityLabel="Close" />
            </div>

            <div style={{ marginTop: "16px" }}>
              <Text as="p" fontWeight="medium" variant="bodyMd">
                Placeholder
              </Text>
              <div style={{ marginTop: "8px" }}>
                <TextField
                  label=""
                  value={emailPlaceholder}
                  onChange={handleEmailPlaceholderChange}
                  autoComplete="off"
                />
              </div>
            </div>

            <div style={{ marginTop: "16px" }}>
              <Checkbox
                label="This field is required"
                checked={emailRequired}
                onChange={handleEmailRequiredChange}
                disabled={true} // Email is always required
              />
            </div>

            <div style={{ marginTop: "16px" }}>
              <Button outline destructive onClick={handleRemoveField} disabled={true}>
                Remove this field
              </Button>
              <div style={{ marginTop: "8px" }}>
                <Text as="p" tone="subdued" variant="bodySm">
                  Email field cannot be removed as it is required for the popup to function.
                </Text>
              </div>
            </div>

            <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <Button onClick={handleEditCancel}>Cancel</Button>
              <Button primary onClick={handleEditDone}>
                Done
              </Button>
            </div>
          </div>
        )

      case "phone":
        return (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Text variant="headingMd" as="h2">
                Phone
              </Text>
              <Button plain icon={XIcon} onClick={handleEditCancel} accessibilityLabel="Close" />
            </div>

            <div style={{ marginTop: "16px" }}>
              <Text as="p" fontWeight="medium" variant="bodyMd">
                Country
              </Text>
              <div style={{ marginTop: "8px" }}>
                <Select
                  label=""
                  labelHidden
                  options={[
                    { label: "India (+91)", value: "IN" },
                    { label: "United States (+1)", value: "US" },
                    { label: "United Kingdom (+44)", value: "GB" },
                    // Add more countries as needed
                  ]}
                  value={phoneCountry}
                  onChange={handlePhoneCountryChange}
                />
              </div>
            </div>

            <div style={{ marginTop: "16px" }}>
              <Text as="p" fontWeight="medium" variant="bodyMd">
                Placeholder
              </Text>
              <div style={{ marginTop: "8px" }}>
                <TextField
                  label=""
                  value={phonePlaceholder}
                  onChange={handlePhonePlaceholderChange}
                  autoComplete="off"
                />
              </div>
            </div>

            <div style={{ marginTop: "16px" }}>
              <Checkbox label="This field is required" checked={phoneRequired} onChange={handlePhoneRequiredChange} />
            </div>

            <div style={{ marginTop: "16px" }}>
              <Button outline destructive onClick={handleRemoveField}>
                Remove this field
              </Button>
            </div>

            <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <Button onClick={handleEditCancel}>Cancel</Button>
              <Button primary onClick={handleEditDone}>
                Done
              </Button>
            </div>
          </div>
        )

      case "birthday":
        return (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Text variant="headingMd" as="h2">
                Birthday
              </Text>
              <Button plain icon={XIcon} onClick={handleEditCancel} accessibilityLabel="Close" />
            </div>

            <div style={{ marginTop: "16px" }}>
              <Text as="p" fontWeight="medium" variant="bodyMd">
                Format
              </Text>
              <div style={{ marginTop: "8px" }}>
                <Select
                  label=""
                  labelHidden
                  options={[
                    { label: "MM/DD/YYYY", value: "MM/DD/YYYY" },
                    { label: "DD/MM/YYYY", value: "DD/MM/YYYY" },
                    { label: "YYYY/MM/DD", value: "YYYY/MM/DD" },
                  ]}
                  value={birthdayFormat}
                  onChange={handleBirthdayFormatChange}
                />
              </div>
            </div>

            <div style={{ marginTop: "16px" }}>
              <Text as="p" fontWeight="medium" variant="bodyMd">
                Label
              </Text>
              <div style={{ marginTop: "8px" }}>
                <TextField label="" value={birthdayLabel} onChange={handleBirthdayLabelChange} autoComplete="off" />
              </div>
            </div>

            <div style={{ marginTop: "16px" }}>
              <Text as="p" fontWeight="medium" variant="bodyMd">
                Day placeholder
              </Text>
              <div style={{ marginTop: "8px" }}>
                <TextField
                  label=""
                  value={birthdayDayPlaceholder}
                  onChange={handleBirthdayDayPlaceholderChange}
                  autoComplete="off"
                />
              </div>
            </div>

            <div style={{ marginTop: "16px" }}>
              <Text as="p" fontWeight="medium" variant="bodyMd">
                Month placeholder
              </Text>
              <div style={{ marginTop: "8px" }}>
                <TextField
                  label=""
                  value={birthdayMonthPlaceholder}
                  onChange={handleBirthdayMonthPlaceholderChange}
                  autoComplete="off"
                />
              </div>
            </div>

            <div style={{ marginTop: "16px" }}>
              <Text as="p" fontWeight="medium" variant="bodyMd">
                Year placeholder
              </Text>
              <div style={{ marginTop: "8px" }}>
                <TextField
                  label=""
                  value={birthdayYearPlaceholder}
                  onChange={handleBirthdayYearPlaceholderChange}
                  autoComplete="off"
                />
              </div>
            </div>

            <div style={{ marginTop: "16px" }}>
              <Checkbox
                label="This field is required"
                checked={birthdayRequired}
                onChange={handleBirthdayRequiredChange}
              />
            </div>

            <div style={{ marginTop: "16px" }}>
              <Button outline destructive onClick={handleRemoveField}>
                Remove this field
              </Button>
            </div>

            <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <Button onClick={handleEditCancel}>Cancel</Button>
              <Button primary onClick={handleEditDone}>
                Done
              </Button>
            </div>
          </div>
        )

      case "marketingconsent":
        return (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Text variant="headingMd" as="h2">
                Marketing consent (GDPR)
              </Text>
              <Button plain icon={XIcon} onClick={handleEditCancel} accessibilityLabel="Close" />
            </div>

            <div style={{ marginTop: "16px" }}>
              <Text as="p" fontWeight="medium" variant="bodyMd">
                Consent text
              </Text>
              <div
                style={{
                  border: "1px solid #dde0e4",
                  borderRadius: "8px",
                  padding: "12px",
                  marginTop: "8px",
                }}
              >
                <div
                  style={{
                    borderBottom: "1px solid #dde0e4",
                    paddingBottom: "8px",
                    marginBottom: "8px",
                  }}
                >
                  {marketingConsentEditor && (
                    <MenuBar
                      editor={marketingConsentEditor}
                      onLinkClick={() => handleLinkModalOpen("marketingConsent")}
                    />
                  )}
                </div>
                <div style={{ height: "100px", overflow: "auto" }}>
                  <EditorContent
                    editor={marketingConsentEditor}
                    onClick={() => {
                      if (marketingConsentEditor && !marketingConsentEditor.isFocused) {
                        marketingConsentEditor.commands.focus()
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            <div style={{ marginTop: "16px" }}>
              <Button outline destructive onClick={handleRemoveField}>
                Remove this field
              </Button>
            </div>

            <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <Button onClick={handleEditCancel}>Cancel</Button>
              <Button primary onClick={handleEditDone}>
                Done
              </Button>
            </div>
          </div>
        )

      case "smsconsent":
        return (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Text variant="headingMd" as="h2">
                SMS consent (TCPA)
              </Text>
              <Button plain icon={XIcon} onClick={handleEditCancel} accessibilityLabel="Close" />
            </div>

            <div style={{ marginTop: "16px" }}>
              <Text as="p" fontWeight="medium" variant="bodyMd">
                Consent text
              </Text>
              <div
                style={{
                  border: "1px solid #dde0e4",
                  borderRadius: "8px",
                  padding: "12px",
                  marginTop: "8px",
                }}
              >
                <div
                  style={{
                    borderBottom: "1px solid #dde0e4",
                    paddingBottom: "8px",
                    marginBottom: "8px",
                  }}
                >
                  {smsConsentEditor && (
                    <MenuBar editor={smsConsentEditor} onLinkClick={() => handleLinkModalOpen("smsConsent")} />
                  )}
                </div>
                <div style={{ height: "100px", overflow: "auto" }}>
                  <EditorContent
                    editor={smsConsentEditor}
                    onClick={() => {
                      if (smsConsentEditor && !smsConsentEditor.isFocused) {
                        smsConsentEditor.commands.focus()
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            <div style={{ marginTop: "16px" }}>
              <Button outline destructive onClick={handleRemoveField}>
                Remove this field
              </Button>
            </div>

            <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <Button onClick={handleEditCancel}>Cancel</Button>
              <Button primary onClick={handleEditDone}>
                Done
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // If in edit mode, show the edit interface
  if (editMode) {
    return <div style={{ padding: "16px" }}>{renderEditMode()}</div>
  }

  // Otherwise show the normal interface
  return (
    <BlockStack gap="100">
      {/* Start Status */}
      <Text variant="headingMd" as="h2">
        Start status
      </Text>

      {/* Heading Input */}
      <div style={{ marginTop: "8px" }}>
        <Text as="p" fontWeight="medium" tone="subdued" variant="bodyMd">
          Heading
        </Text>
        <div style={{ marginTop: "8px" }}>
          <TextField label="" value={headingText} onChange={handleHeadingChange} autoComplete="off" />
        </div>
      </div>

      {/* Description Input */}
      <div style={{ marginTop: "8px" }}>
        <Text as="p" fontWeight="medium" tone="subdued" variant="bodyMd">
          Description
        </Text>
        <div style={{ marginTop: "8px" }}>
          <TextField
            label=""
            value={descriptionText}
            onChange={handleDescriptionChange}
            multiline={3}
            autoComplete="off"
          />
        </div>
      </div>

      {/* Form Fields */}
      <div style={{ marginTop: "16px" }}>
        <Text as="p" fontWeight="medium" tone="subdued" variant="bodyMd">
          Form
        </Text>
        <BlockStack gap="100">
          {nameChecked && (
            <RowWithEdit
              label="Name"
              checked={nameChecked}
              onChange={handleNameCheckedChange}
              onEdit={() => handleFieldEdit("name")}
            />
          )}

          <RowWithEdit
            label="Email address"
            checked={emailChecked}
            onChange={handleEmailCheckedChange}
            onEdit={() => handleFieldEdit("email")}
          />

          {phoneChecked && (
            <RowWithEdit
              label="Phone"
              checked={phoneChecked}
              onChange={handlePhoneCheckedChange}
              onEdit={() => handleFieldEdit("phone")}
            />
          )}

          {birthdayChecked && (
            <RowWithEdit
              label="Birthday"
              checked={birthdayChecked}
              onChange={handleBirthdayCheckedChange}
              onEdit={() => handleFieldEdit("birthday")}
            />
          )}

          {marketingConsentChecked && (
            <RowWithEdit
              label="Marketing Consent"
              checked={marketingConsentChecked}
              onChange={handleMarketingConsentCheckedChange}
              onEdit={() => handleFieldEdit("marketingconsent")}
            />
          )}

          {smsConsentChecked && (
            <RowWithEdit
              label="SMS Consent"
              checked={smsConsentChecked}
              onChange={handleSmsConsentCheckedChange}
              onEdit={() => handleFieldEdit("smsconsent")}
            />
          )}

          <div style={{ marginTop: "16px", position: "relative" }}>
            <Button
              fullWidth
              outline
              icon={<span style={{ marginRight: "4px", fontSize: "18px" }}>+</span>}
              onClick={toggleAddFieldPopover}
            >
              Add form field
            </Button>

            {addFieldPopoverActive && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  width: "100%",
                  backgroundColor: "white",
                  borderRadius: "4px",
                  boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
                  zIndex: 9999,
                  marginTop: "4px",
                  border: "1px solid #dde0e4",
                }}
                data-add-field-popover
              >
                <div style={{ padding: "8px" }}>
                  <BlockStack gap="100">
                    {!nameChecked && (
                      <Button fullWidth monochrome plain onClick={() => handleAddField("name")}>
                        Name
                      </Button>
                    )}
                    {!phoneChecked && (
                      <Button fullWidth monochrome plain onClick={() => handleAddField("phone")}>
                        Phone
                      </Button>
                    )}
                    {!birthdayChecked && (
                      <Button fullWidth monochrome plain onClick={() => handleAddField("birthday")}>
                        Birthday
                      </Button>
                    )}
                    {!marketingConsentChecked && (
                      <Button fullWidth monochrome plain onClick={() => handleAddField("marketingconsent")}>
                        Marketing Consent
                      </Button>
                    )}
                    {!smsConsentChecked && (
                      <Button fullWidth monochrome plain onClick={() => handleAddField("smsconsent")}>
                        SMS Consent
                      </Button>
                    )}
                  </BlockStack>
                </div>
              </div>
            )}
          </div>
        </BlockStack>
      </div>

      {/* Actions */}
      <div style={{ marginTop: "16px" }}>
        <Text as="p" fontWeight="medium" tone="subdued" variant="bodyMd">
          Actions
        </Text>
        <BlockStack gap="100">
          <RowWithEdit
            label="Primary button"
            checked={primaryButtonChecked}
            onChange={handlePrimaryButtonChange}
            onEdit={() => {}}
          />

          <RowWithEdit
            label="Secondary button"
            checked={secondaryButtonChecked}
            onChange={handleSecondaryButtonChange}
            onEdit={() => {}}
          />
        </BlockStack>
      </div>

      {/* Footer Text with TipTap */}
      <div style={{ marginTop: "16px" }}>
        <Text as="p" fontWeight="medium" tone="subdued" variant="bodyMd">
          Footer text
        </Text>
        <div
          style={{
            border: "1px solid #dde0e4",
            borderRadius: "8px",
            padding: "12px",
            marginTop: "8px",
          }}
        >
          <div
            style={{
              borderBottom: "1px solid #dde0e4",
              paddingBottom: "8px",
              marginBottom: "8px",
            }}
          >
            {footerEditor && <MenuBar editor={footerEditor} onLinkClick={() => handleLinkModalOpen("footer")} />}
          </div>
          <div style={{ height: "100px", overflow: "auto" }}>
            <EditorContent
              editor={footerEditor}
              onClick={() => {
                if (footerEditor && !footerEditor.isFocused) {
                  footerEditor.commands.focus()
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Link Modal */}
      {linkModalActive && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "24px",
              width: "400px",
              maxWidth: "90%",
            }}
          >
            <div style={{ marginBottom: "16px" }}>
              <Text variant="headingMd" as="h2">
                Insert Link
              </Text>
            </div>
            <BlockStack gap="400">
              <TextField
                label="Text"
                value={linkText}
                onChange={setLinkText}
                autoComplete="off"
                placeholder="Link text to display"
              />
              <TextField
                label="URL"
                value={linkUrl}
                onChange={setLinkUrl}
                autoComplete="off"
                placeholder="https://example.com"
              />
              <Checkbox label="Open link in new tab" checked={openInNewTab} onChange={setOpenInNewTab} />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "16px" }}>
                <Button onClick={handleLinkModalClose}>Cancel</Button>
                <Button primary onClick={handleLinkSave} disabled={!linkUrl.trim() || !linkText.trim()}>
                  Save
                </Button>
              </div>
            </BlockStack>
          </div>
        </div>
      )}

      {/* Success status */}
      <div style={{ marginTop: "16px" }}>
        <Text variant="headingMd" as="h2">
          Success status
        </Text>

        {/* Success Heading */}
        <div style={{ marginTop: "16px" }}>
          <Text as="p" fontWeight="medium" tone="subdued" variant="bodyMd">
            Heading
          </Text>
          <div style={{ marginTop: "8px" }}>
            <TextField label="" value={successHeading} onChange={handleSuccessHeadingChange} autoComplete="off" />
          </div>
        </div>

        {/* Success Description */}
        <div style={{ marginTop: "16px" }}>
          <Text as="p" fontWeight="medium" tone="subdued" variant="bodyMd">
            Description
          </Text>
          <div style={{ marginTop: "8px" }}>
            <TextField
              label=""
              value={successDescription}
              onChange={handleSuccessDescriptionChange}
              multiline={3}
              autoComplete="off"
            />
          </div>
        </div>

        {/* Success Actions */}
        <div style={{ marginTop: "16px" }}>
          <Text as="p" fontWeight="medium" color="subdued" variant="bodyMd">
            Actions
          </Text>
          <div style={{ marginTop: "8px" }}>
            <RowWithEdit
              label="Button"
              checked={buttonChecked}
              onChange={handleButtonCheckedChange}
              onEdit={() => {}}
            />
          </div>
        </div>
      </div>

      {/* Sticky discount bar */}
      <div style={{ marginTop: "16px" }}>
        <Text variant="headingMd" as="h2">
          Sticky discount bar
        </Text>

        {/* Sticky Description */}
        <div style={{ marginTop: "16px" }}>
          <Text as="p" fontWeight="medium" color="subdued" variant="bodyMd">
            Description
          </Text>
          <div style={{ marginTop: "8px" }}>
            <TextField label="" value={stickyDescription} onChange={handleStickyDescriptionChange} autoComplete="off" />
          </div>
        </div>
      </div>

      {/* Sidebar widget */}
      <div style={{ marginTop: "16px" }}>
        <Text variant="headingMd" as="h2">
          Sidebar widget
        </Text>

        {/* Button Text */}
        <div style={{ marginTop: "16px" }}>
          <Text as="p" fontWeight="medium" color="subdued" variant="bodyMd">
            Button text
          </Text>
          <div style={{ marginTop: "8px" }}>
            <TextField value={buttonText} onChange={handleButtonTextChange} autoComplete="off" />
          </div>
        </div>
      </div>

      {/* Error text */}
      <div style={{ marginTop: "16px" }}>
        <Text variant="headingMd" as="h2">
          Error text
        </Text>

        {/* Error Text Fields */}
        <div style={{ marginTop: "16px" }}>
          <div style={{ marginTop: "8px" }}>
            <BlockStack gap="400">
              <TextField
                label="Invalid first name"
                value={firstNameError}
                onChange={handleFirstNameErrorChange}
                autoComplete="off"
              />
              <TextField
                label="Invalid last name"
                value={lastNameError}
                onChange={handleLastNameErrorChange}
                autoComplete="off"
              />
              <TextField
                label="Invalid email"
                value={emailError}
                onChange={handleEmailErrorChange}
                autoComplete="off"
              />
              <TextField
                label="Invalid phone number"
                value={phoneError}
                onChange={handlePhoneErrorChange}
                autoComplete="off"
              />
              <TextField
                label="Policy not checked"
                value={policyError}
                onChange={handlePolicyErrorChange}
                autoComplete="off"
              />
              <TextField
                label="Already subscribed"
                value={subscribedError}
                onChange={handleSubscribedErrorChange}
                autoComplete="off"
              />
              <TextField
                label="Submit error"
                value={submitError}
                onChange={handleSubmitErrorChange}
                autoComplete="off"
              />
              <TextField
                label="Birthday error"
                value={birthdayError}
                onChange={handleBirthdayErrorChange}
                autoComplete="off"
              />
            </BlockStack>
          </div>
        </div>
      </div>
      <style>
        {`
    .ProseMirror {
      height: 100%;
      min-height: 100px;
      overflow: auto;
      padding: 8px;
      box-sizing: border-box;
    }
  `}
      </style>
    </BlockStack>
  )
}

export default Tab2
