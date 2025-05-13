
import { BlockStack, Button, Checkbox, InlineStack, Text, TextField } from "@shopify/polaris"
import { useState, useEffect } from "react"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import {
  TextBoldIcon,
  TextItalicIcon,
  ListBulletedIcon,
  LinkIcon
} from '@shopify/polaris-icons';

function Tab2({ config, setConfig, setHasUnsavedChanges }:any) {
  // Initialize state from config
  const [nameChecked, setNameChecked] = useState(config?.content?.form?.fields?.name || false)
  const [emailChecked, setEmailChecked] = useState(config?.content?.form?.fields?.email || true)
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

  // TipTap editor for footer text
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: footerText,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      setFooterText(html)
      updateConfig("footer", "footerText", html)
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

  // Set editor content when footerText changes from external source
  useEffect(() => {
    if (editor && footerText !== editor.getHTML()) {
      editor.commands.setContent(footerText)
    }
  }, [editor, footerText])

  // Update config when component mounts
  useEffect(() => {
    if (config && setConfig) {
      const updatedContent = {
        Heading: headingText,
        Description: descriptionText,
        form: {
          fields: {
            name: nameChecked,
            email: emailChecked,
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
  }, [])

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
    updateConfig("form", "fields", { ...config?.content?.form?.fields, name: checked })
  }

  const handleEmailCheckedChange = (checked) => {
    setEmailChecked(checked)
    updateConfig("form", "fields", { ...config?.content?.form?.fields, email: checked })
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

  const handleStickyDescriptionChange = (value) => {
    setStickyDescription(value)
    updateConfig("stickydiscountbar", "description", value)
  }

  const handleButtonTextChange = (value) => {
    setButtonText(value)
    updateConfig("sidebarWidget", "btn-text", value)
  }

  const handleFirstNameErrorChange = (value) => {
    setFirstNameError(value)
    updateConfig("errorTexts", "firstName", value)
  }

  const handleLastNameErrorChange = (value) => {
    setLastNameError(value)
    updateConfig("errorTexts", "lastName", value)
  }

  const handleEmailErrorChange = (value) => {
    setEmailError(value)
    updateConfig("errorTexts", "email", value)
  }

  const handlePhoneErrorChange = (value) => {
    setPhoneError(value)
    updateConfig("errorTexts", "phoneNumber", value)
  }

  const handlePolicyErrorChange = (value) => {
    setPolicyError(value)
    updateConfig("errorTexts", "policy", value)
  }

  const handleSubscribedErrorChange = (value) => {
    setSubscribedError(value)
    updateConfig("errorTexts", "alreadySubscribed", value)
  }

  const handleSubmitErrorChange = (value) => {
    setSubmitError(value)
    updateConfig("errorTexts", "submitError", value)
  }

  const handleBirthdayErrorChange = (value) => {
    setBirthdayError(value)
    updateConfig("errorTexts", "birthdayError", value)
  }

  // Edit button component
  const EditButton = () => (
    <Button plain monochrome textDecoration="underline" onClick={() => console.log("Edit clicked")}>
      <Text as="span" color="highlight">
        Edit
      </Text>
    </Button>
  )

  // Row with label and edit button
  const RowWithEdit = ({ label, checked, onChange }:any) => (
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
      <EditButton />
    </div>
  )

  // TipTap toolbar buttons
  const MenuBar = ({ editor }) => {
    if (!editor) {
      return null
    }

    return (
      <InlineStack gap="200">
        <Button size="slim" pressed={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <TextBoldIcon size={16} />
        </Button>
        <Button
          size="slim"
          pressed={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <TextItalicIcon size={16} />
        </Button>
        <Button
          pressed={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          icon={<ListBulletedIcon size={16} />}
        />
        <Button
          pressed={editor.isActive("link")}
          onClick={() => {
            const url = window.prompt("URL")
            if (url) {
              editor.chain().focus().setLink({ href: url }).run()
            } else {
              editor.chain().focus().unsetLink().run()
            }
          }}
          icon={<LinkIcon size={16} />}
        />
      </InlineStack>
    )
  }

  return (
    <BlockStack gap="100">
      {/* Start Status */}
      <Text variant="headingMd" as="h2">
        Start status
      </Text>

      {/* Heading Input */}
      <div style={{ marginTop: "8px" }}>
        <Text as="p" fontWeight="medium" color="subdued" variant="bodyMd">
          Heading
        </Text>
        <div style={{ marginTop: "8px" }}>
          <TextField label="" value={headingText} onChange={handleHeadingChange} autoComplete="off" />
        </div>
      </div>

      {/* Description Input */}
      <div style={{ marginTop: "8px" }}>
        <Text as="p" fontWeight="medium" color="subdued" variant="bodyMd">
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
        <Text as="p" fontWeight="medium" color="subdued" variant="bodyMd">
          Form
        </Text>
        <BlockStack gap="100">
          <RowWithEdit label="Name" checked={nameChecked} onChange={handleNameCheckedChange} />

          <RowWithEdit label="Email address" checked={emailChecked} onChange={handleEmailCheckedChange} />

          <div style={{ marginTop: "16px" }}>
            <Button fullWidth outline icon={<span style={{ marginRight: "4px", fontSize: "18px" }}>+</span>}>
              Add form field
            </Button>
          </div>
        </BlockStack>
      </div>

      {/* Actions */}
      <div style={{ marginTop: "16px" }}>
        <Text as="p" fontWeight="medium" color="subdued" variant="bodyMd">
          Actions
        </Text>
        <BlockStack gap="100">
          <RowWithEdit label="Primary button" checked={primaryButtonChecked} onChange={handlePrimaryButtonChange} />

          <RowWithEdit
            label="Secondary button"
            checked={secondaryButtonChecked}
            onChange={handleSecondaryButtonChange}
          />
        </BlockStack>
      </div>

      {/* Footer Text with TipTap */}
      <div style={{ marginTop: "16px" }}>
        <Text as="p" fontWeight="medium" color="subdued" variant="bodyMd">
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
            {editor && <MenuBar editor={editor} />}
          </div>
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Success status */}
      <div style={{ marginTop: "16px" }}>
        <Text variant="headingMd" as="h2">
          Success status
        </Text>

        {/* Success Heading */}
        <div style={{ marginTop: "16px" }}>
          <Text as="p" fontWeight="medium" color="subdued" variant="bodyMd">
            Heading
          </Text>
          <div style={{ marginTop: "8px" }}>
            <TextField value={successHeading} onChange={handleSuccessHeadingChange} autoComplete="off" />
          </div>
        </div>

        {/* Success Description */}
        <div style={{ marginTop: "16px" }}>
          <Text as="p" fontWeight="medium" color="subdued" variant="bodyMd">
            Description
          </Text>
          <div style={{ marginTop: "8px" }}>
            <TextField
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
            <RowWithEdit label="Button" checked={buttonChecked} onChange={handleButtonCheckedChange} />
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
    </BlockStack>
  )
}

export default Tab2
