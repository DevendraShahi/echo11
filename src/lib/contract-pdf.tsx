import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer'
import { parseContractContent } from '@/lib/contract-content'

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#0f172a',
    backgroundColor: '#ffffff'
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#d9e1e8',
    paddingBottom: 16
  },
  brand: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0ea5e9'
  },
  brandSub: {
    marginTop: 3,
    fontSize: 9,
    color: '#64748b',
    letterSpacing: 0.8
  },
  metaBadge: {
    borderWidth: 1,
    borderColor: '#d9e1e8',
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  metaBadgeLabel: {
    fontSize: 8,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1.1
  },
  metaBadgeValue: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0f172a',
    letterSpacing: 0.3
  },
  titleBlock: {
    marginTop: 18,
    marginBottom: 16
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a'
  },
  subtitle: {
    marginTop: 5,
    fontSize: 10,
    color: '#64748b'
  },
  section: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    fontWeight: 'bold',
    color: '#0ea5e9',
    marginBottom: 10
  },
  partiesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  partyCard: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 9
  },
  partyLabel: {
    fontSize: 8,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    marginBottom: 4
  },
  partyName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4
  },
  partyDetail: {
    fontSize: 9,
    color: '#334155',
    marginBottom: 2
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 6
  },
  summaryLabel: {
    fontSize: 9,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.7
  },
  summaryValue: {
    fontSize: 10,
    color: '#0f172a',
    fontWeight: 'bold',
  },
  bodySection: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    padding: 14,
    marginBottom: 12
  },
  blockSpacer: {
    height: 6
  },
  blockHeading: {
    fontSize: 9,
    color: '#0369a1',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: 'bold',
    marginBottom: 5
  },
  blockParagraph: {
    fontSize: 10,
    color: '#0f172a',
    lineHeight: 1.6,
    marginBottom: 4
  },
  clauseRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4
  },
  clauseIndex: {
    width: 28,
    fontSize: 9,
    color: '#0369a1',
    fontWeight: 'bold',
    marginTop: 1
  },
  clauseText: {
    flex: 1,
    fontSize: 10,
    color: '#0f172a',
    lineHeight: 1.6
  },
  subClauseRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginLeft: 18,
    marginBottom: 4
  },
  subClauseIndex: {
    width: 22,
    fontSize: 9,
    color: '#334155',
    fontWeight: 'bold',
    marginTop: 1
  },
  subClauseText: {
    flex: 1,
    fontSize: 9.5,
    color: '#0f172a',
    lineHeight: 1.6
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginLeft: 18,
    marginBottom: 4
  },
  bulletMark: {
    width: 14,
    fontSize: 11,
    color: '#0369a1'
  },
  bulletText: {
    flex: 1,
    fontSize: 9.8,
    color: '#0f172a',
    lineHeight: 1.6
  },
  signatureLine: {
    fontSize: 9,
    color: '#475569',
    letterSpacing: 0.5,
    marginTop: 2
  },
  signaturesSection: {
    borderWidth: 1,
    borderColor: '#d9e1e8',
    padding: 14
  },
  signaturesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12
  },
  signatureBlock: {
    width: '46%',
    paddingTop: 26,
    borderTopWidth: 1,
    borderTopColor: '#0f172a'
  },
  signatureName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 3
  },
  signatureMeta: {
    fontSize: 8.5,
    color: '#64748b'
  },
  footer: {
    position: 'absolute',
    bottom: 22,
    left: 36,
    right: 36,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 6
  },
  footerText: {
    fontSize: 8,
    color: '#64748b'
  },
  pageNumber: {
    fontSize: 8,
    color: '#64748b'
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

  const effectiveDate = startDate || new Date().toISOString().split('T')[0]
  const agreementBlocks = parseContractContent(content)
  const notesBlocks = parseContractContent(notes)
  const displayValue = value > 0 ? formatCurrency(value) : 'TBD'

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.topBar}>
          <View>
            <Text style={styles.brand}>echo11</Text>
            <Text style={styles.brandSub}>{companyName || 'Digital Product Studio'}</Text>
          </View>
          <View style={styles.metaBadge}>
            <Text style={styles.metaBadgeLabel}>Agreement ID</Text>
            <Text style={styles.metaBadgeValue}>{contractNumber}</Text>
          </View>
        </View>

        <View style={styles.titleBlock}>
          <Text style={styles.title}>{title || 'Contract Agreement'}</Text>
          <Text style={styles.subtitle}>Effective Date: {formatDate(effectiveDate)}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Parties</Text>
          <View style={styles.partiesRow}>
            <View style={styles.partyCard}>
              <Text style={styles.partyLabel}>Service Provider</Text>
              <Text style={styles.partyName}>{companyName || 'Echo11'}</Text>
            </View>
            <View style={styles.partyCard}>
              <Text style={styles.partyLabel}>Client</Text>
              <Text style={styles.partyName}>{clientName || 'Client'}</Text>
              {clientEmail && <Text style={styles.partyDetail}>{clientEmail}</Text>}
              {clientAddress && <Text style={styles.partyDetail}>{clientAddress}</Text>}
              {clientPhone && <Text style={styles.partyDetail}>{clientPhone}</Text>}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Commercial Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Start Date</Text>
            <Text style={styles.summaryValue}>{formatDate(startDate)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>End Date</Text>
            <Text style={styles.summaryValue}>{formatDate(endDate)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Contract Value</Text>
            <Text style={styles.summaryValue}>{displayValue}</Text>
          </View>
        </View>

        <View style={styles.bodySection}>
          <Text style={styles.sectionTitle}>Agreement</Text>
          {agreementBlocks.length === 0 && <Text style={styles.blockParagraph}>No agreement content provided.</Text>}
          {agreementBlocks.map((block, idx) => {
            if (block.type === 'spacer') {
              return <View key={`spacer-${idx}`} style={styles.blockSpacer} />
            }

            if (block.type === 'heading') {
              return (
                <Text key={`heading-${idx}`} style={styles.blockHeading}>
                  {block.text}
                </Text>
              )
            }

            if (block.type === 'clause') {
              return (
                <View key={`clause-${idx}`} style={styles.clauseRow}>
                  <Text style={styles.clauseIndex}>{block.index}</Text>
                  <Text style={styles.clauseText}>{block.text}</Text>
                </View>
              )
            }

            if (block.type === 'subclause') {
              return (
                <View key={`subclause-${idx}`} style={styles.subClauseRow}>
                  <Text style={styles.subClauseIndex}>{block.index}</Text>
                  <Text style={styles.subClauseText}>{block.text}</Text>
                </View>
              )
            }

            if (block.type === 'bullet') {
              return (
                <View key={`bullet-${idx}`} style={styles.bulletRow}>
                  <Text style={styles.bulletMark}>•</Text>
                  <Text style={styles.bulletText}>{block.text}</Text>
                </View>
              )
            }

            if (block.type === 'signature') {
              return (
                <Text key={`signature-${idx}`} style={styles.signatureLine}>
                  {block.text}
                </Text>
              )
            }

            return (
              <Text key={`paragraph-${idx}`} style={styles.blockParagraph}>
                {block.text}
              </Text>
            )
          })}
        </View>

        {notesBlocks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Terms</Text>
            {notesBlocks.map((block, idx) => {
              if (block.type === 'spacer') {
                return <View key={`notes-spacer-${idx}`} style={styles.blockSpacer} />
              }

              return (
                <Text key={`notes-paragraph-${idx}`} style={styles.blockParagraph}>
                  {block.text}
                </Text>
              )
            })}
          </View>
        )}

        <View style={styles.signaturesSection}>
          <Text style={styles.sectionTitle}>Signatures</Text>
          <View style={styles.signaturesRow}>
            <View style={styles.signatureBlock}>
              <Text style={styles.signatureName}>{companyName || 'Echo11'}</Text>
              <Text style={styles.signatureMeta}>Authorized Signature</Text>
              <Text style={styles.signatureMeta}>Date: __________________</Text>
            </View>
            <View style={styles.signatureBlock}>
              <Text style={styles.signatureName}>{clientName || 'Client'}</Text>
              <Text style={styles.signatureMeta}>Authorized Signature</Text>
              <Text style={styles.signatureMeta}>Date: __________________</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Generated by echo11 Lab</Text>
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
  if (typeof window === 'undefined') {
    throw new Error('downloadContractPDF can only be called in the browser')
  }

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
