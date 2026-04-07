'use client'

import { Document, Page, Text, View, StyleSheet, pdf, Font } from '@react-pdf/renderer'

Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/helvetica/v1/Helvetica.ttf' },
    { src: 'https://fonts.gstatic.com/s/helvetica/v1/Helvetica-Bold.ttf', fontWeight: 'bold' },
  ]
})

const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1a1a1a',
    backgroundColor: '#fff'
  },
  header: {
    backgroundColor: '#0a0a0a',
    padding: 40,
    paddingBottom: 30
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00E5FF',
    marginBottom: 4
  },
  companyName: {
    fontSize: 12,
    color: '#a1a1a1',
    marginBottom: 2
  },
  contractTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 2,
    textAlign: 'right'
  },
  contractNumber: {
    fontSize: 12,
    color: '#00E5FF',
    textAlign: 'right',
    marginTop: 4
  },
  body: {
    padding: 40,
    paddingTop: 30
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0a0a0a',
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#00E5FF'
  },
  partiesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  partyBlock: {
    width: '48%'
  },
  partyLabel: {
    fontSize: 9,
    color: '#a1a1a1',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4
  },
  partyName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 2
  },
  partyDetail: {
    fontSize: 10,
    color: '#666',
    marginBottom: 1
  },
  contentText: {
    fontSize: 10,
    color: '#1a1a1a',
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap'
  },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e5e5'
  },
  valueLabel: {
    fontSize: 10,
    color: '#666'
  },
  valueAmount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1a1a1a'
  },
  signatureSection: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5'
  },
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40
  },
  signatureBlock: {
    width: '45%',
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
    paddingTop: 8
  },
  signatureName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 2
  },
  signatureDate: {
    fontSize: 9,
    color: '#666'
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: '#e5e5e5'
  },
  footerText: {
    fontSize: 8,
    color: '#a1a1a1'
  },
  pageNumber: {
    fontSize: 8,
    color: '#a1a1a1'
  }
})

interface ContractPDFProps {
  contractNumber: string
  title: string
  companyName: string
  clientName: string
  clientEmail: string
  clientAddress: string
  clientPhone: string
  startDate: string
  endDate: string
  value: number
  content: string
  notes: string
}

export function ContractPDF({
  contractNumber,
  title,
  companyName,
  clientName,
  clientEmail,
  clientAddress,
  clientPhone,
  startDate,
  endDate,
  value,
  content,
  notes
}: ContractPDFProps) {
  const formatCurrency = (val: number) => {
    return val.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—'
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    } catch {
      return dateStr
    }
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.logo}>echo11</Text>
              <Text style={styles.companyName}>{companyName}</Text>
            </View>
            <View>
              <Text style={styles.contractTitle}>{title}</Text>
              <Text style={styles.contractNumber}>{contractNumber}</Text>
            </View>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Parties</Text>
            <View style={styles.partiesRow}>
              <View style={styles.partyBlock}>
                <Text style={styles.partyLabel}>Service Provider</Text>
                <Text style={styles.partyName}>{companyName}</Text>
              </View>
              <View style={styles.partyBlock}>
                <Text style={styles.partyLabel}>Client</Text>
                <Text style={styles.partyName}>{clientName || '—'}</Text>
                {clientEmail && <Text style={styles.partyDetail}>{clientEmail}</Text>}
                {clientAddress && <Text style={styles.partyDetail}>{clientAddress}</Text>}
                {clientPhone && <Text style={styles.partyDetail}>{clientPhone}</Text>}
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Terms</Text>
            <View style={styles.valueRow}>
              <Text style={styles.valueLabel}>Start Date</Text>
              <Text style={styles.valueAmount}>{formatDate(startDate)}</Text>
            </View>
            <View style={styles.valueRow}>
              <Text style={styles.valueLabel}>End Date</Text>
              <Text style={styles.valueAmount}>{formatDate(endDate)}</Text>
            </View>
            <View style={styles.valueRow}>
              <Text style={styles.valueLabel}>Contract Value</Text>
              <Text style={styles.valueAmount}>{formatCurrency(value)}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Agreement</Text>
            {content.split('\n').map((line, i) => (
              <Text key={i} style={styles.contentText}>{line || ' '}</Text>
            ))}
          </View>

          {notes && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Additional Notes</Text>
              {notes.split('\n').map((line, i) => (
                <Text key={i} style={styles.contentText}>{line || ' '}</Text>
              ))}
            </View>
          )}

          <View style={styles.signatureSection}>
            <Text style={styles.sectionTitle}>Signatures</Text>
            <View style={styles.signatureRow}>
              <View style={styles.signatureBlock}>
                <Text style={styles.signatureName}>{companyName}</Text>
                <Text style={styles.signatureDate}>Date: _______________</Text>
              </View>
              <View style={styles.signatureBlock}>
                <Text style={styles.signatureName}>{clientName || 'Client'}</Text>
                <Text style={styles.signatureDate}>Date: _______________</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Generated by echo11Lab</Text>
          <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
            `${pageNumber} / ${totalPages}`
          )} />
        </View>
      </Page>
    </Document>
  )
}

export async function generateContractPDFBlob(props: ContractPDFProps): Promise<Blob> {
  const blob = await pdf(<ContractPDF {...props} />).toBlob()
  return blob
}

export async function downloadContractPDF(props: ContractPDFProps, filename?: string) {
  const blob = await generateContractPDFBlob(props)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename || `${props.contractNumber}-${props.title.replace(/\s+/g, '-').toLowerCase()}.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
