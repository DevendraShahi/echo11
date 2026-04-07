'use client'

import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer'
import { format } from 'date-fns'
import { Invoice, Client, Project, InvoiceItem } from '@/types/lab'

const companyInfo = {
  name: 'Echo11Labs',
  email: 'hello@echo11labs.com',
  website: 'echo11labs.com'
}

const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1a1a1a',
    backgroundColor: '#fff'
  },
  header: {
    backgroundColor: '#0f172a',
    padding: 40,
    paddingBottom: 30
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  logoSection: {
    width: 180
  },
  logo: {
    width: 120,
    height: 40,
    marginBottom: 8,
    objectFit: 'contain'
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4
  },
  companyEmail: {
    fontSize: 10,
    color: '#94a3b8',
    marginBottom: 2
  },
  companyWebsite: {
    fontSize: 10,
    color: '#94a3b8'
  },
  invoiceTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 2
  },
  invoiceMeta: {
    alignItems: 'flex-end',
    marginTop: 8
  },
  invoiceNumber: {
    fontSize: 14,
    color: '#e2e8f0',
    fontWeight: 'bold'
  },
  statusBadge: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 8
  },
  statusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  content: {
    padding: 40
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30
  },
  detailsColumn: {
    width: '48%'
  },
  label: {
    fontSize: 8,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6
  },
  value: {
    fontSize: 12,
    color: '#1e293b',
    marginBottom: 12,
    fontWeight: '500'
  },
  table: {
    marginTop: 20,
    marginBottom: 20
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 6
  },
  tableHeaderCell: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  tableRow: {
    flexDirection: 'row',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    alignItems: 'center'
  },
  descriptionCol: { width: '50%' },
  qtyCol: { width: '10%', textAlign: 'center' },
  rateCol: { width: '20%', textAlign: 'right' },
  amountCol: { width: '20%', textAlign: 'right' },
  totalsSection: {
    alignItems: 'flex-end',
    marginTop: 20
  },
  totalsCard: {
    width: 260,
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8
  },
  totalsLabel: {
    color: '#64748b',
    fontSize: 11
  },
  totalsValue: {
    color: '#1e293b',
    fontSize: 11,
    fontWeight: '600'
  },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 2,
    borderTopColor: '#0f172a',
    marginTop: 8
  },
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a'
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a'
  },
  notes: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#0f172a'
  },
  notesTitle: {
    fontSize: 10,
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    fontWeight: 'bold'
  },
  notesText: {
    fontSize: 10,
    color: '#64748b',
    lineHeight: 1.6
  },
  footer: {
    backgroundColor: '#f1f5f9',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  footerText: {
    fontSize: 9,
    color: '#94a3b8'
  },
  footerRight: {
    alignItems: 'flex-end'
  }
})

interface InvoicePDFProps {
  invoice: Invoice & {
    client?: Pick<Client, 'company_name' | 'contact_name' | 'email' | 'address'> | null
    project?: Pick<Project, 'name'> | null
    items?: InvoiceItem[]
  }
}

export function InvoicePDF({ invoice }: InvoicePDFProps) {
  const statusLabels: Record<string, string> = {
    draft: 'Draft',
    sent: 'Sent',
    paid: 'Paid',
    overdue: 'Overdue',
    cancelled: 'Cancelled'
  }

  const statusColors: Record<string, string> = {
    draft: '#64748b',
    sent: '#3b82f6',
    paid: '#22c55e',
    overdue: '#ef4444',
    cancelled: '#94a3b8'
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.logoSection}>
              <Text style={styles.companyName}>{companyInfo.name}</Text>
              <Text style={styles.companyEmail}>{companyInfo.email}</Text>
              <Text style={styles.companyWebsite}>{companyInfo.website}</Text>
            </View>
            <View style={styles.invoiceTitle}>
              <Text style={styles.invoiceTitle}>INVOICE</Text>
              <View style={styles.invoiceMeta}>
                <Text style={styles.invoiceNumber}>{invoice.invoice_number}</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusColors[invoice.status] }]}>
                  <Text style={styles.statusText}>{statusLabels[invoice.status]}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.detailsRow}>
            <View style={styles.detailsColumn}>
              <Text style={styles.label}>Bill To</Text>
              {invoice.client && (
                <>
                  <Text style={styles.value}>{invoice.client.company_name}</Text>
                  {invoice.client.contact_name && (
                    <Text style={styles.value}>{invoice.client.contact_name}</Text>
                  )}
                  {invoice.client.email && (
                    <Text style={styles.value}>{invoice.client.email}</Text>
                  )}
                </>
              )}
            </View>
            <View style={styles.detailsColumn}>
              <View>
                <Text style={styles.label}>Project</Text>
                <Text style={styles.value}>
                  {invoice.project?.name || 'No project'}
                </Text>
              </View>
              <View style={{ marginTop: 12 }}>
                <Text style={styles.label}>Invoice Date</Text>
                <Text style={styles.value}>
                  {invoice.created_at ? format(new Date(invoice.created_at), 'MMMM d, yyyy') : '-'}
                </Text>
              </View>
              <View style={{ marginTop: 12 }}>
                <Text style={styles.label}>Due Date</Text>
                <Text style={styles.value}>
                  {invoice.due_date ? format(new Date(invoice.due_date), 'MMMM d, yyyy') : '-'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.descriptionCol]}>Description</Text>
              <Text style={[styles.tableHeaderCell, styles.qtyCol]}>Qty</Text>
              <Text style={[styles.tableHeaderCell, styles.rateCol]}>Rate</Text>
              <Text style={[styles.tableHeaderCell, styles.amountCol]}>Amount</Text>
            </View>
            {(invoice.items && invoice.items.length > 0) ? invoice.items.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.descriptionCol}>{item.description}</Text>
                <Text style={styles.qtyCol}>{item.quantity}</Text>
                <Text style={styles.rateCol}>${item.rate.toFixed(2)}</Text>
                <Text style={styles.amountCol}>${item.amount.toFixed(2)}</Text>
              </View>
            )) : (
              <View style={styles.tableRow}>
                <Text style={styles.descriptionCol}>Service</Text>
                <Text style={styles.qtyCol}>1</Text>
                <Text style={styles.rateCol}>${invoice.subtotal?.toFixed(2) || 0}</Text>
                <Text style={styles.amountCol}>${invoice.subtotal?.toFixed(2) || 0}</Text>
              </View>
            )}
          </View>

          <View style={styles.totalsSection}>
            <View style={styles.totalsCard}>
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Subtotal</Text>
                <Text style={styles.totalsValue}>${invoice.subtotal?.toFixed(2) || '0.00'}</Text>
              </View>
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Tax ({invoice.tax_rate}%)</Text>
                <Text style={styles.totalsValue}>${invoice.tax_amount?.toFixed(2) || '0.00'}</Text>
              </View>
              <View style={styles.grandTotal}>
                <Text style={styles.grandTotalLabel}>Total Due</Text>
                <Text style={styles.grandTotalValue}>
                  ${invoice.total?.toFixed(2) || '0.00'}
                </Text>
              </View>
            </View>
          </View>

          {invoice.notes && (
            <View style={styles.notes}>
              <Text style={styles.notesTitle}>Notes</Text>
              <Text style={styles.notesText}>{invoice.notes}</Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <View>
            <Text style={styles.footerText}>Thank you for your business!</Text>
          </View>
          <View style={styles.footerRight}>
            <Text style={styles.footerText}>{companyInfo.name}</Text>
            <Text style={styles.footerText}>{companyInfo.email}</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}

export async function generateInvoicePDF(invoice: InvoicePDFProps['invoice']) {
  const blob = await pdf(<InvoicePDF invoice={invoice} />).toBlob()
  return blob
}

export function downloadInvoicePDF(invoice: InvoicePDFProps['invoice']) {
  pdf(<InvoicePDF invoice={invoice} />)
    .toBlob()
    .then((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${invoice.invoice_number}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }
    })
}
