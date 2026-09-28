# Invoices Guide

Create and manage invoices for clients. Track payment status and export professional PDFs.

## List View

### Stats Cards
Three key metrics displayed at the top:
- **Total Revenue** - Sum of all paid invoices (lifetime)
- **Paid** - Number of invoices with "paid" status
- **Pending** - Number of invoices with "sent" status (awaiting payment)
- **Overdue** - Number of invoices past due date and not paid

### Invoice Table
Shows invoices in a tabular format with:
- **Invoice Number** - Unique identifier (clickable to detail)
- **Client Name** - Client company name (clickable to client detail)
- **Project** - Associated project name (if linked)
- **Amount** - Total invoice amount (formatted currency)
- **Status Badge** - Colored indicator showing current status
- **Due Date** - Payment deadline (red if overdue)
- **Actions** - View PDF, download PDF, edit, delete (icons)

### Status Filters
Filter invoices by their current status:
- **All** - Every invoice in the system
- **Draft** - Invoices being prepared (not sent to client)
- **Sent** - Sent to client, awaiting payment
- **Paid** - Payment received and recorded
- **Overdue** - Past due date, payment not received
- **Cancelled** - Voided invoice (not deleted for audit trail)

## Create Invoice

Navigate to `/lab/invoices/new` or click the "New Invoice" button.

### Required Fields:
- **Client** - Select from existing clients (required for billing)
- **Invoice Number** - Unique identifier (auto-generated or custom)

### Optional Fields:
- **Project** - Associated project (optional, for tracking and reporting)
- **Due Date** - Payment deadline (defaults to Net 30)
- **Status** - Starting status (default: draft)
- **Notes/Terms** - Terms and conditions, special instructions
- **Purchase Order** - Client purchase order number (if required)

### Line Items
Each invoice line item represents a product or service being billed:

#### Fields:
- **Description** - Clear description of the product/service
- **Quantity** - Number of units (default: 1, can be fractional)
- **Rate** - Price per unit (hourly rate or flat fee)
- **Amount** - Calculated automatically (Quantity × Rate)
- **Tax Rate** - Percentage tax to apply (if applicable)
- **Tax Amount** - Calculated automatically (Amount × Tax Rate/%)

#### Operations:
- **Add Line Item** - Click "+" button to add a new row
- **Remove Line Item** - Click trash icon on a row to delete
- **Reorder** - Drag rows to change sequence (affects PDF layout)
- **Edit Inline** - Click any field to edit directly
- **Clear All** - Remove all line items (confirmation required)

### Calculations
The system automatically calculates:
- **Subtotal** - Sum of all line item amounts
- **Tax Amount** - Subtotal × Tax Rate (if tax enabled)
- **Total** - Subtotal + Tax Amount
- **Amount Due** - Total minus any payments received

## Invoice Detail (`/lab/invoices/[id]`)

Shows comprehensive invoice information and actions.

### Header Section
- Invoice number (prominent display)
- Status badge with color (click to change status)
- Issue date and due date
- Client information (name, contact, email)
- Project information (if linked)
- Edit button (opens edit form)
- Delete button (requires confirmation)
- Action buttons (Send, Mark Paid, Download PDF)

### Information Sections

#### Client Information
- Company name
- Contact person
- Email address
- Phone number
- Billing address
- Clickable to client detail page

#### Project Information (if applicable)
- Project name
- Project description
- Clickable to project detail page

#### Line Items Table
- Description of each product/service
- Quantity
- Rate (per unit)
- Tax rate (if applicable)
- Tax amount
- Total amount (quantity × rate)
- Subtotal, tax, and total displayed below table

#### Notes & Terms
- Terms and conditions
- Special instructions
- Payment instructions
- Late fee policy (if applicable)

#### Payment Information
- Total amount due
- Amount paid (if any)
- Balance remaining
- Payment date (if paid)
- Payment method (if recorded)

### Action Buttons
Available based on current status:

#### Edit
- Opens invoice edit form (available in draft status)
- Allows modification of all fields and line items

#### Send
- Changes status from draft to sent
- Triggers email notification to client (if configured)
- Records sent timestamp
- Only available in draft status

#### Mark as Paid
- Changes status to paid
- Records payment date and amount
- Optionally record payment method and reference
- Available in sent and overdue statuses

#### Mark as Overdue
- Changes status to overdue (if past due date and not paid)
- Usually automatic based on date comparison
- Manual override available

#### Cancel Invoice
- Changes status to cancelled
- Requires confirmation and reason
- Maintains audit trail but removes from active reporting
- Available in any status except paid

#### Download PDF
- Generates and downloads professional PDF invoice
- Uses `@react-pdf/renderer` for vector-quality output
- Includes all branding and formatting
- Available in any status except draft (recommend sending first)

#### View PDF
- Opens PDF preview in browser tab
- Same generation as download but displays inline
- Useful for review before sending

## PDF Export

Professional PDF invoices are generated using `@react-pdf/renderer`:
- Vector-based text (crisp at any zoom level)
- Echo11 branding and styling
- Page numbers and header/footer
- Itemized line items with proper alignment
- Tax calculations clearly displayed
- Notes and terms section
- Payment instructions and due date prominence
- Company logo and contact information
- Available in US Letter and A4 sizes

### PDF Features
- Respects page breaks for long line item lists
- Handles tax calculations correctly
- Includes barcode or QR code for payment reference (if enabled)
- Shows aging status (current, 30 days, 60 days, etc.)
- Print-ready with proper margins and spacing

## Status Workflow

The typical invoice lifecycle follows this path:
```
Draft → Sent → Paid
                ↘ Overdue (if past due date)
                       ↘ Cancelled (if voided)
```

### Status Transitions
- **Draft → Sent**: When invoice is sent to client
- **Sent → Paid**: When payment is received and recorded
- **Sent → Overdue**: Automatically when due date passes without payment
- **Overdue → Paid**: When payment is received after overdue
- **Any → Cancelled**: When invoice is voided (requires reason)
- **Draft → Sent → Draft**: Not allowed (sent invoices cannot return to draft)

### Special Cases
- **Partial Payments**: Record payments against invoice, track balance
- **Overpayment**: System allows overpayment (shows negative balance)
- **Prepayment**: Can mark as paid before sending (uncommon but allowed)
- **Recurring**: Manual recreation required (no automated recurring yet)

## Filters
Available at the top of the invoices list:
- **Status** - Filter by invoice status (multi-select)
- **Client** - Filter by specific client (dropdown)
- **Project** - Filter by associated project (dropdown)
- **Date Range** - Filter by issue date or due date range
- **Amount Range** - Filter by minimum/maximum invoice amount
- **Search** - Search by invoice number, client name, or description
- **Has Project** - Show only invoices linked to projects
- **Overdue Only** - Show only overdue invoices (quick filter)

## Keyboard Shortcuts
- `Esc` - Close modals and dropdowns
- Click outside - Close modals and popovers
- `Tab` / `Shift+Tab` - Navigate between form fields
- `Enter` - Submit forms or save changes
- `Cmd+K` / `Ctrl+K` - Open command palette
- `Cmd+Shift+K` - Focus search bar
- `?` - Show keyboard shortcuts overlay

## Best Practices
1. **Number consistently** - Use a clear numbering scheme (e.g., INV-2026-001)
2. **Itemize clearly** - Break down work into understandable line items
3. **Set clear terms** - Include payment terms, due dates, late policies
4. **Send promptly** - Invoice soon after work completion or milestone
5. **Follow up** - Send reminders before due date and after overdue
6. **Track payments** - Record payments accurately and promptly
7. **Review before sending** - Check amounts, rates, and calculations
8. **Maintain consistency** - Use same descriptions for similar work
9. **Include PO numbers** - If client requires purchase order numbers
10. **Save templates** - Reuse common line item sets for efficiency
11. **Monitor aging** - Regularly review overdue invoices
12. **Provide multiple payment options** - If accepting various methods
13. **Include tax ID** - If required for client accounting purposes
14. **Backup regularly** - Ensure invoice data is backed up
15. **Train team** - Ensure everyone follows same invoicing procedures

## Common Scenarios

### Creating a Simple Invoice
1. Click "New Invoice"
2. Select client
3. Add one line item: "Project Management - 10 hours @ $150/hour"
4. Set due date (Net 30 from today)
5. Add standard terms and conditions
6. Review calculations
7. Click "Send" to email to client
8. Mark as paid when payment received

### Creating a Complex Invoice
1. Click "New Invoice"
2. Select client and associated project
3. Add multiple line items for different services:
   - Design: 20 hours @ $125/hour
   - Development: 50 hours @ $100/hour
   - Licensing: 3 software licenses @ $75 each
   - Expenses: Stock photos, fonts, domain registration
4. Apply appropriate tax rate if required
5. Add detailed notes about deliverables and timeline
6. Review subtotal, tax, and total
7. Send to client
8. Track payments against each line item if needed