import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const PrivacyPolicy = () => {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                    activeOpacity={0.7}
                >
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Privacy Policy</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Content */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.content}>
                    <Text style={styles.lastUpdated}>Last updated: December 19, 2025</Text>

                    <Text style={styles.paragraph}>
                        FinPool ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy specifically explains how we collect, use, and safeguard your information when you use our mobile application, FinPool (the "App").
                    </Text>

                    <Text style={styles.sectionTitle}>1. Information We Collect</Text>

                    <Text style={styles.subSectionTitle}>1.1 Personal Information</Text>
                    <Text style={styles.paragraph}>
                        When you register for an account, we may collect personal information that can identify you, such as:
                    </Text>
                    <Text style={styles.bulletPoint}>• Name</Text>
                    <Text style={styles.bulletPoint}>• Email address</Text>
                    <Text style={styles.bulletPoint}>• Phone number</Text>
                    <Text style={styles.bulletPoint}>• Profile picture</Text>

                    <Text style={styles.subSectionTitle}>1.2 Financial Data</Text>
                    <Text style={styles.paragraph}>
                        To provide our financial management services, the App allows you to input and store:
                    </Text>
                    <Text style={styles.bulletPoint}>• Transaction details (income, expenses, categories)</Text>
                    <Text style={styles.bulletPoint}>• Loan details (principal, interest rates, tenure)</Text>
                    <Text style={styles.bulletPoint}>• Payment history and schedules</Text>

                    <Text style={styles.subSectionTitle}>1.3 Device and Usage Information</Text>
                    <Text style={styles.paragraph}>
                        We may automatically collect certain information about your device and how you interact with our App, including:
                    </Text>
                    <Text style={styles.bulletPoint}>• Device model and operating system</Text>
                    <Text style={styles.bulletPoint}>• App usage patterns and analytics</Text>
                    <Text style={styles.bulletPoint}>• Crash reports to improve stability</Text>

                    <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
                    <Text style={styles.paragraph}>
                        We use the collected information for the following purposes:
                    </Text>
                    <Text style={styles.bulletPoint}>
                        <Text style={styles.bold}>Service Provision:</Text> To maintain your account, track your transactions and loans, and calculate financial metrics.
                    </Text>
                    <Text style={styles.bulletPoint}>
                        <Text style={styles.bold}>Communications:</Text> To send you notifications about loan payments, updates, and important service announcements.
                    </Text>
                    <Text style={styles.bulletPoint}>
                        <Text style={styles.bold}>Improvement:</Text> To analyze user behavior and improve the App's functionality and user experience.
                    </Text>
                    <Text style={styles.bulletPoint}>
                        <Text style={styles.bold}>Security:</Text> To detect and prevent fraudulent activities and unauthorized access.
                    </Text>

                    <Text style={styles.sectionTitle}>3. Data Storage and Security</Text>

                    <Text style={styles.subSectionTitle}>3.1 Data Storage</Text>
                    <Text style={styles.paragraph}>
                        Your personal and financial data is stored securely. We use industry-standard encryption protocols to protect your data both in transit and at rest.
                    </Text>
                    <Text style={styles.bulletPoint}>
                        <Text style={styles.bold}>Local Storage:</Text> Some preferences and cached data may be stored locally on your device for performance.
                    </Text>
                    <Text style={styles.bulletPoint}>
                        <Text style={styles.bold}>Cloud Storage:</Text> Your account data is synchronized securely with our servers (via Firebase/Google Cloud) to ensure you can access your data across devices.
                    </Text>

                    <Text style={styles.subSectionTitle}>3.2 Data Retention</Text>
                    <Text style={styles.paragraph}>
                        We retain your information only as long as necessary to provide our services to you or as required by law. You can request the deletion of your account and associated data at any time.
                    </Text>

                    <Text style={styles.sectionTitle}>4. Third-Party Services</Text>
                    <Text style={styles.paragraph}>
                        We may use third-party services to facilitate our App's operations:
                    </Text>
                    <Text style={styles.bulletPoint}>
                        <Text style={styles.bold}>Firebase Auth:</Text> For secure user authentication.
                    </Text>
                    <Text style={styles.bulletPoint}>
                        <Text style={styles.bold}>Analytics Providers:</Text> To understand App usage (anonymized data).
                    </Text>
                    <Text style={styles.paragraph}>
                        These third parties have their own privacy policies addressing how they use such information.
                    </Text>

                    <Text style={styles.sectionTitle}>5. Your Rights</Text>
                    <Text style={styles.paragraph}>You have the right to:</Text>
                    <Text style={styles.bulletPoint}>• Access the personal information we hold about you.</Text>
                    <Text style={styles.bulletPoint}>• Correct any inaccurate or incomplete information.</Text>
                    <Text style={styles.bulletPoint}>• Delete your account and all associated data.</Text>
                    <Text style={styles.bulletPoint}>• Opt-out of non-essential communications.</Text>
                    <Text style={styles.paragraph}>
                        To exercise these rights, please contact us at support@finpool.app.
                    </Text>

                    <Text style={styles.sectionTitle}>6. Updates to This Policy</Text>
                    <Text style={styles.paragraph}>
                        We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
                    </Text>

                    <Text style={styles.sectionTitle}>7. Contact Us</Text>
                    <Text style={styles.paragraph}>
                        If you have any questions or concerns about this Privacy Policy, please contact us at:
                    </Text>
                    <Text style={styles.contactEmail}>Email: support@finpool.app</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F0A1E',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#1a0b2e',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(124, 58, 237, 0.2)',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(124, 58, 237, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
    placeholder: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    content: {
        paddingHorizontal: 24,
        paddingTop: 24,
    },
    lastUpdated: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.6)',
        marginBottom: 20,
        fontStyle: 'italic',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
        marginTop: 28,
        marginBottom: 12,
        letterSpacing: 0.3,
    },
    subSectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        marginTop: 20,
        marginBottom: 10,
        letterSpacing: 0.2,
    },
    paragraph: {
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.85)',
        lineHeight: 24,
        marginBottom: 16,
        letterSpacing: 0.2,
    },
    bulletPoint: {
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.85)',
        lineHeight: 24,
        marginBottom: 8,
        paddingLeft: 8,
        letterSpacing: 0.2,
    },
    bold: {
        fontWeight: '600',
        color: '#FFFFFF',
    },
    contactEmail: {
        fontSize: 15,
        color: '#7C3AED',
        fontWeight: '600',
        marginTop: 8,
        letterSpacing: 0.2,
    },
});

export default PrivacyPolicy;
