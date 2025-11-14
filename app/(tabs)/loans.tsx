import { View, Text, StyleSheet, ScrollView } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { FileText, Calendar, DollarSign, TrendingDown, CheckCircle } from 'lucide-react-native';
import { useAppSelector } from '@/store/hooks';
import { useTranslation } from '@/locale/LocaleProvider';
import { useResponsive } from '@/hooks/useResponsive';

const Loans = () => {
  const { loans, totalLoanAmount, totalRemainingAmount } = useAppSelector((state) => state.loans);
  const t = useTranslation();
  const { getFontSize, getSpacing } = useResponsive();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={['#6B46C1', '#4C2F7C', '#2D1B4E', '#1a0b2e']}
        locations={[0, 0.3, 0.6, 1]}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.headerTitle}>{t('loansScreen.title')}</Text>
                <Text style={styles.headerSubtitle}>{t('loansScreen.subtitle')}</Text>
              </View>
            </View>

            {loans.length === 0 ? (
              /* Empty State */
              <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                  <FileText size={48} color="rgba(255, 255, 255, 0.3)" />
                </View>
                <Text style={styles.emptyStateTitle}>{t('loansScreen.emptyTitle')}</Text>
                <Text style={styles.emptyStateDescription}>
                  {t('loansScreen.emptyDescription')}
                </Text>
              </View>
            ) : (
              <>
                {/* Summary Cards */}
                <View style={styles.summaryContainer}>
                  <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>{t('loansScreen.totalLoan')}</Text>
                    <Text style={styles.summaryAmount}>
                      ₹{totalLoanAmount.toLocaleString('en-IN')}
                    </Text>
                  </View>
                  <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>{t('loansScreen.remaining')}</Text>
                    <Text style={[styles.summaryAmount, { color: '#EF4444' }]}>
                      ₹{totalRemainingAmount.toLocaleString('en-IN')}
                    </Text>
                  </View>
                </View>

                {/* Loans List */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>{t('loansScreen.sectionTitle')}</Text>
                  
                  <View style={styles.loansList}>
                    {loans.map((loan) => {
                      const progressPercentage = (loan.paidAmount + loan.remainingAmount) === 0
                        ? 0
                        : (loan.paidAmount / (loan.paidAmount + loan.remainingAmount)) * 100;
                      const nextEMI = loan.emis.find(emi => !emi.isPaid);
                      const statusLabel =
                        loan.status === 'completed'
                          ? t('loansScreen.status.completed')
                          : loan.status === 'overdue'
                          ? t('loansScreen.status.overdue')
                          : t('loansScreen.status.active');
                      
                      return (
                        <View key={loan.id} style={styles.loanCard}>
                          <View style={styles.loanHeader}>
                            <View style={styles.loanTitleContainer}>
                              <View style={[
                                styles.loanTypeIcon,
                                { backgroundColor: loan.status === 'completed' 
                                  ? 'rgba(16, 185, 129, 0.2)' 
                                  : 'rgba(124, 58, 237, 0.2)' 
                                }
                              ]}>
                                {loan.status === 'completed' ? (
                                  <CheckCircle size={20} color="#10B981" />
                                ) : (
                                  <FileText size={20} color="#7C3AED" />
                                )}
                              </View>
                              <View style={styles.loanInfo}>
                                <Text 
                                  style={styles.loanName} 
                                  numberOfLines={1} 
                                  ellipsizeMode="tail"
                                >
                                  {loan.lenderName}
                                </Text>
                                <Text 
                                  style={styles.loanType} 
                                  numberOfLines={1} 
                                  ellipsizeMode="tail"
                                >
                                  {t('loansScreen.loanTypeSuffix', { type: loan.loanType })}
                                </Text>
                              </View>
                            </View>
                            <View style={[
                              styles.statusBadge,
                              { backgroundColor: loan.status === 'completed' 
                                ? 'rgba(16, 185, 129, 0.2)' 
                                : loan.status === 'overdue'
                                ? 'rgba(239, 68, 68, 0.2)'
                                : 'rgba(245, 158, 11, 0.2)' 
                              }
                            ]}>
                              <Text style={[
                                styles.statusText,
                                { color: loan.status === 'completed' 
                                  ? '#10B981' 
                                  : loan.status === 'overdue'
                                  ? '#EF4444'
                                  : '#F59E0B' 
                                }
                              ]}>
                                {statusLabel}
                              </Text>
                            </View>
                          </View>

                          {/* Progress Bar */}
                          <View style={styles.progressContainer}>
                            <View style={styles.progressBar}>
                              <View 
                                style={[
                                  styles.progressFill, 
                                  { width: `${progressPercentage}%` }
                                ]} 
                              />
                            </View>
                            <Text style={styles.progressText}>
                              {t('loansScreen.progress', { percent: progressPercentage.toFixed(0) })}
                            </Text>
                          </View>

                          {/* Loan Details */}
                          <View style={styles.loanDetails}>
                            <View style={styles.detailItem}>
                              <DollarSign size={16} color="rgba(255, 255, 255, 0.5)" />
                              <Text style={styles.detailLabel}>{t('loansScreen.detailEmi')}</Text>
                              <Text style={styles.detailValue}>₹{loan.emiAmount.toLocaleString('en-IN')}</Text>
                            </View>
                            <View style={styles.detailItem}>
                              <TrendingDown size={16} color="rgba(255, 255, 255, 0.5)" />
                              <Text style={styles.detailLabel}>{t('loansScreen.detailRemaining')}</Text>
                              <Text style={styles.detailValue}>₹{loan.remainingAmount.toLocaleString('en-IN')}</Text>
                            </View>
                            {nextEMI && (
                              <View style={styles.detailItem}>
                                <Calendar size={16} color="rgba(255, 255, 255, 0.5)" />
                                <Text style={styles.detailLabel}>{t('loansScreen.detailNextDue')}</Text>
                                <Text style={styles.detailValue}>{nextEMI.dueDate}</Text>
                              </View>
                            )}
                          </View>

                          {/* EMI Count */}
                          <View style={styles.emiCount}>
                            <Text style={styles.emiCountText}>
                              {t('loansScreen.emiCount', {
                                paid: loan.emis.filter(e => e.isPaid).length,
                                total: loan.emis.length,
                              })}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </>
            )}

            {/* Bottom Padding for Tab Bar */}
            <View style={{ height: 100 }} />
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0b2e',
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  summaryContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.3)',
  },
  summaryLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  loansList: {
    gap: 16,
  },
  loanCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  loanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  loanTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  loanTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  loanInfo: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  loanName: {
    flexShrink: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  loanType: {
    flexShrink: 1,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'right',
  },
  loanDetails: {
    gap: 12,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emiCount: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  emiCountText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(124, 58, 237, 0.3)',
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default Loans;
