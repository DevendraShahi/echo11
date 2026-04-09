'use client'

import React from 'react'
import { Document, Page, Text, View, StyleSheet, pdf, Image } from '@react-pdf/renderer'
import { format } from 'date-fns'
import { Invoice, Client, Project, InvoiceItem } from '@/types/lab'

const companyInfo = {
  name: 'Echo11Labs',
  phone: '+1 800 123 4567',
  email: 'finance@echo11.tech',
  website: 'echo11labs.com',
  address: 'Kathmandu, Nepal'
}

const styles = StyleSheet.create({
  page: { 
    padding: 60, 
    fontFamily: 'Helvetica', 
    fontSize: 9, 
    color: '#333', 
    backgroundColor: '#fff' 
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 40
  },
  logo: {
    width: 50,
    height: 50,
    objectFit: 'contain'
  },
  datesBlock: {
    alignItems: 'flex-end',
    marginTop: 10
  },
  dateText: {
    fontSize: 8,
    color: '#666',
    marginBottom: 4
  },
  invoiceHeaderBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40
  },
  invoiceNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111',
    letterSpacing: -0.5
  },
  statusBadge: {
    borderWidth: 1,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 20,
    marginLeft: 15,
    marginTop: 6
  },
  statusText: {
    fontSize: 7,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  addressBlock: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginBottom: 60 
  },
  addressSender: { 
    width: '40%' 
  },
  addressReceiver: { 
    width: '40%', 
    alignItems: 'flex-end' 
  },
  addressTitle: { 
    fontSize: 9, 
    fontWeight: 'bold', 
    color: '#111', 
    marginBottom: 6 
  },
  addressText: { 
    fontSize: 8, 
    color: '#666', 
    lineHeight: 1.5 
  },
  arrowContainer: {
    width: '20%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8
  },
  arrowGraphic: { 
    color: '#ccc', 
    fontSize: 10 
  },
  table: { 
    marginBottom: 30 
  },
  tableHeader: { 
    flexDirection: 'row', 
    backgroundColor: '#F9FAFB', 
    paddingVertical: 12, 
    paddingHorizontal: 15, 
    borderRadius: 4, 
    marginBottom: 10 
  },
  thDesc: { width: '40%', fontSize: 6, color: '#999', textTransform: 'uppercase', letterSpacing: 1 },
  thQty: { width: '20%', fontSize: 6, color: '#999', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center' },
  thRate: { width: '20%', fontSize: 6, color: '#999', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'right' },
  thAmount: { width: '20%', fontSize: 6, color: '#999', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'right' },
  tableRow: { 
    flexDirection: 'row', 
    paddingHorizontal: 15, 
    paddingVertical: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F3F4F6' 
  },
  tdDescBlock: { width: '40%' },
  tdDescTitle: { fontSize: 9, color: '#111', fontWeight: 'bold', marginBottom: 2 },
  tdDescSub: { fontSize: 7, color: '#888' },
  tdQty: { width: '20%', fontSize: 8, color: '#333', textAlign: 'center' },
  tdRate: { width: '20%', fontSize: 8, color: '#333', textAlign: 'right' },
  tdAmount: { width: '20%', fontSize: 8, color: '#333', textAlign: 'right' },
  totalsSection: { 
    alignItems: 'flex-end', 
    marginTop: 10 
  },
  summaryRow: { 
    flexDirection: 'row', 
    justifyContent: 'flex-end', 
    paddingVertical: 6, 
    width: 250 
  },
  summaryLabel: { 
    width: '50%', 
    fontSize: 7, 
    color: '#888', 
    textTransform: 'uppercase', 
    textAlign: 'right', 
    paddingRight: 20 
  },
  summaryVal: { 
    width: '50%', 
    fontSize: 8, 
    color: '#333', 
    textAlign: 'right' 
  },
  grandTotalBlock: { 
    backgroundColor: '#111', 
    paddingVertical: 18, 
    paddingHorizontal: 25, 
    marginTop: 15, 
    width: 250, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  grandTotalLabel: { 
    fontSize: 7, 
    color: '#fff', 
    textTransform: 'uppercase', 
    letterSpacing: 1 
  },
  grandTotalVal: { 
    fontSize: 14, 
    color: '#fff', 
    fontWeight: 'bold' 
  },
  footer: { 
    position: 'absolute', 
    bottom: 50, left: 60, right: 60, 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'flex-end'
  },
  footerSection: { 
    width: '45%' 
  },
  footerBold: { 
    fontWeight: 'bold', 
    color: '#111', 
    fontSize: 9, 
    marginBottom: 4 
  },
  footerText: { 
    fontSize: 7, 
    color: '#666', 
    lineHeight: 1.5 
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
    paid: '#10B981',
    overdue: '#EF4444',
    cancelled: '#94a3b8'
  }

  const invoiceItems = invoice.items && invoice.items.length > 0 
    ? invoice.items 
    : [{ description: 'Project Services', quantity: 1, rate: invoice.subtotal || 0, amount: invoice.subtotal || 0, sort_order: 1, id: 'tmp', invoice_id: 'tmp' }]

  const isConverted = !!(invoice.target_currency && invoice.exchange_rate)
  const cRate = invoice.exchange_rate || 1

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Top Header: Logo + Dates */}
        <View style={styles.topSection}>
          <Image src="/echo11-logo.png" style={styles.logo} />
          
          <View style={styles.datesBlock}>
            <Text style={styles.dateText}>
              {invoice.created_at ? format(new Date(invoice.created_at), 'MMMM d, yyyy') : 'No Date Set'}
            </Text>
            <Text style={styles.dateText}>
              Due Date {invoice.due_date ? format(new Date(invoice.due_date), 'MMMM d, yyyy') : '-'}
            </Text>
          </View>
        </View>

        {/* Invoice Number & Dynamic Status Badge */}
        <View style={styles.invoiceHeaderBlock}>
          <Text style={styles.invoiceNumber}>{invoice.invoice_number}</Text>
          <View style={[styles.statusBadge, { borderColor: statusColors[invoice.status] || '#64748b' }]}>
             <Text style={[styles.statusText, { color: statusColors[invoice.status] || '#64748b' }]}>
               {statusLabels[invoice.status] || invoice.status}
             </Text>
          </View>
        </View>

        {/* Recipient & Sender Flow (with minimal arrow) */}
        <View style={styles.addressBlock}>
          <View style={styles.addressSender}>
            <Text style={styles.addressTitle}>{companyInfo.name}</Text>
            <Text style={styles.addressText}>{companyInfo.address}</Text>
            <Text style={styles.addressText}>{companyInfo.email}</Text>
            <Text style={styles.addressText}>{companyInfo.phone}</Text>
          </View>
          
          <View style={styles.arrowContainer}>
             <Text style={styles.arrowGraphic}>→</Text>
          </View>

          <View style={styles.addressReceiver}>
            <Text style={styles.addressTitle}>{invoice.client?.company_name || 'Client Name'}</Text>
            {invoice.client?.contact_name && <Text style={styles.addressText}>{invoice.client.contact_name}</Text>}
            <Text style={styles.addressText}>{invoice.client?.address || 'Address Not Provided'}</Text>
            <Text style={styles.addressText}>{invoice.client?.email}</Text>
          </View>
        </View>

        {/* Minimal Typographic Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.thDesc, isConverted ? { width: '30%' } : {}]}>DESCRIPTION</Text>
            <Text style={[styles.thQty, isConverted ? { width: '15%' } : {}]}>QUANTITY</Text>
            <Text style={[styles.thRate, isConverted ? { width: '15%' } : {}]}>UNIT PRICE</Text>
            <Text style={[styles.thAmount, isConverted ? { width: '20%' } : {}]}>AMOUNT (USD)</Text>
            {isConverted && (
              <Text style={[styles.thAmount, { width: '20%' }]}>AMT ({invoice.target_currency})</Text>
            )}
          </View>

          {invoiceItems.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={[styles.tdDescBlock, isConverted ? { width: '30%' } : {}]}>
                <Text style={styles.tdDescTitle}>{item.description}</Text>
                {invoice.project?.name && (
                   <Text style={styles.tdDescSub}>{invoice.project.name}</Text>
                )}
              </View>
              <Text style={[styles.tdQty, isConverted ? { width: '15%' } : {}]}>{item.quantity}</Text>
              <Text style={[styles.tdRate, isConverted ? { width: '15%' } : {}]}>${item.rate.toFixed(2)}</Text>
              <Text style={[styles.tdAmount, isConverted ? { width: '20%' } : {}]}>${item.amount.toFixed(2)}</Text>
              {isConverted && (
                <Text style={[styles.tdAmount, { width: '20%', fontWeight: 'bold' }]}>
                   {(item.amount * cRate).toFixed(2)}
                </Text>
              )}
            </View>
          ))}
        </View>

        {/* Monolithic Totals Block */}
        <View style={styles.totalsSection}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryVal}>${invoice.subtotal?.toFixed(2) || '0.00'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax ({invoice.tax_rate}%)</Text>
            <Text style={styles.summaryVal}>${invoice.tax_amount?.toFixed(2) || '0.00'}</Text>
          </View>
          
          <View style={[styles.grandTotalBlock, isConverted ? { width: 300 } : {}]}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.grandTotalVal}>${invoice.total?.toFixed(2) || '0.00'}</Text>
              {isConverted && (
                <Text style={[styles.grandTotalVal, { fontSize: 8, marginTop: 4, color: '#ccc' }]}>
                  {invoice.target_currency} {((invoice.total || 0) * cRate).toFixed(2)}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Floating Minimal Footer */}
        <View style={styles.footer}>
          <View style={styles.footerSection}>
            <Text style={styles.footerBold}>Notes & Terms</Text>
            <Text style={styles.footerText}>
              {invoice.notes || 'Payment is due within 14 days of the invoice date. Please make checks payable to Echo11Labs.'}
            </Text>
            {isConverted && invoice.exchange_rate && (
              <View style={{ marginTop: 10 }}>
                <Text style={{ ...styles.footerBold, fontSize: 8 }}>Currency Estimate</Text>
                <Text style={styles.footerText}>
                  Exchange Rate: 1 USD = {invoice.exchange_rate.toFixed(4)} {invoice.target_currency}
                </Text>
                <Text style={styles.footerText}>
                  Conversion Date: {invoice.conversion_date ? format(new Date(invoice.conversion_date), 'MMMM d, yyyy') : '-'}
                </Text>
              </View>
            )}
          </View>

          <View style={[styles.footerSection, { alignItems: 'flex-end' }]}>
            <Text style={styles.footerBold}>Security Check</Text>
            <Text style={styles.footerText}>Authorized Signature Ref.</Text>
            <Text style={styles.footerText}>ECHO-{invoice.id ? invoice.id.substring(0, 8).toUpperCase() : '00000000'}</Text>
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
