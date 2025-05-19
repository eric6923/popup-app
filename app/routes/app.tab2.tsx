"use client"

import { BlockStack, Button, Checkbox, InlineStack, Text, TextField, Modal } from "@shopify/polaris"
import { useState, useEffect } from "react"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import { TextBoldIcon, TextItalicIcon, ListBulletedIcon, LinkIcon } from "@shopify/polaris-icons"

function Tab2({ config, setConfig, setHasUnsavedChanges }: any) {
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

  // Link modal states
  const [linkModalActive, setLinkModalActive] = useState(false)
  const [linkText, setLinkText] = useState("")
  const [linkUrl, setLinkUrl] = useState("")
  const [openInNewTab, setOpenInNewTab] = useState(false)
  const [selectedRange, setSelectedRange] = useState<{ from: number; to: number } | null>(null)

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
            if (typeof node === 'string') return {}
            const element = node as HTMLElement
            return { 
              href: element.getAttribute('href'),
              target: element.getAttribute('target')
            }
          }
        }
      ]
    },
    renderHTML({ HTMLAttributes }) {
      return ['a', HTMLAttributes, 0]
    },
  })

  // TipTap editor for footer text
  const editor = useEditor({
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

  // Link modal handlers
  const handleLinkModalOpen = () => {
    if (!editor) return

    // Make sure editor is focused
    editor.commands.focus()

    const { from, to } = editor.state.selection
    setSelectedRange({ from, to })

    // Check if text is selected
    const selectedText = editor.state.doc.textBetween(from, to, ' ')
    
    // Check if we're editing an existing link
    const linkAttrs = editor.getAttributes('link')
    
    if (linkAttrs.href) {
      // We're editing an existing link
      setLinkText(selectedText)
      setLinkUrl(linkAttrs.href)
      setOpenInNewTab(linkAttrs.target === '_blank')
    } else if (selectedText) {
      // Text is selected, but no existing link
      setLinkText(selectedText)
      setLinkUrl('')
      setOpenInNewTab(false)
    } else {
      // No text selected, no existing link
      setLinkText('')
      setLinkUrl('')
      setOpenInNewTab(false)
    }

    setLinkModalActive(true)
  }

  const handleLinkModalClose = () => {
    setLinkModalActive(false)
    setLinkText('')
    setLinkUrl('')
    setOpenInNewTab(false)
    setSelectedRange(null)
  }

  const handleLinkSave = () => {
    if (!editor || !selectedRange) return

    // If URL is empty, remove the link
    if (!linkUrl.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      handleLinkModalClose()
      return
    }

    // Prepare link attributes
    const attrs = { 
      href: linkUrl,
      target: openInNewTab ? '_blank' : null,
      rel: openInNewTab ? 'noopener noreferrer' : null
    }

    // If text was selected, update the link on that text
    if (selectedRange.from !== selectedRange.to) {
      // If the link text has changed, we need to delete the selection and insert new text
      const selectedText = editor.state.doc.textBetween(selectedRange.from, selectedRange.to, ' ')
      
      if (selectedText !== linkText && linkText.trim()) {
        // Delete the selected text
        editor.chain().focus().deleteRange(selectedRange).run()
        
        // Insert the new text with link
        editor.chain().focus()
          .insertContent({
            type: 'text',
            text: linkText,
            marks: [{ type: 'link', attrs }]
          })
          .run()
      } else {
        // Just update the link on the selected text
        editor.chain().focus()
          .setTextSelection(selectedRange)
          .extendMarkRange('link')
          .setLink(attrs)
          .run()
      }
    } else {
      // No text was selected, insert new text with link
      editor.chain().focus()
        .insertContent({
          type: 'text',
          text: linkText,
          marks: [{ type: 'link', attrs }]
        })
        .run()
    }

    handleLinkModalClose()
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
  const RowWithEdit = ({ label, checked, onChange }: any) => (
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
  const MenuBar = ({ editor }: any) => {
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
        <Button
          size="slim"
          pressed={editor.isActive("link")}
          onClick={handleLinkModalOpen}
          icon={LinkIcon}
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
        <Text as="p" fontWeight="medium" tone="subdued" variant="bodyMd">
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
            {editor && <MenuBar editor={editor} />}
          </div>
          <div style={{ height: "100px", overflow: "auto" }}>
            <EditorContent
              editor={editor}
              onClick={() => {
                if (editor && !editor.isFocused) {
                  editor.commands.focus()
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Link Modal */}
      <Modal
        open={linkModalActive}
        onClose={handleLinkModalClose}
        title="Insert Link"
        primaryAction={{
          content: 'Save',
          onAction: handleLinkSave,
          disabled: !linkUrl.trim() || !linkText.trim(),
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: handleLinkModalClose,
          },
        ]}
      >
        <Modal.Section>
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
            <Checkbox
              label="Open link in new tab"
              checked={openInNewTab}
              onChange={setOpenInNewTab}
            />
          </BlockStack>
        </Modal.Section>
      </Modal>

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
