import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Image, Linking, Platform, Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT, GRADIENTS, RADII } from '../src/constants/theme';
import { FontAwesome6 } from '@expo/vector-icons';
import { useTheme } from '../src/context/ThemeContext';

const { width } = Dimensions.get('window');

export default function InfoScreen() {
    const { theme, mode } = useTheme();
    // Par défaut sur la section Développeur
    const [activeTab, setActiveTab] = useState<'app' | 'dev'>('dev');

    const socialLinks = [
        { id: 'whatsapp', name: 'WhatsApp', url: 'https://wa.me/237652481643', icon: 'whatsapp', color: '#25D366' },
        { id: 'github', name: 'GitHub', url: 'https://github.com/AndySIWA/', icon: 'github', color: mode === 'dark' ? '#FFFFFF' : '#000000' },
        { id: 'linkedin', name: 'LinkedIn', url: 'https://www.linkedin.com/in/andy-siwa-180283199/', icon: 'linkedin', color: '#0077B5' },
        { id: 'email', name: 'Email', url: 'mailto:blendy03ing@gmail.com', icon: 'envelope', color: '#EA4335' },
    ];

    const openLink = (url: string) => {
        Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            {/* Background Decor avec plus de présence */}
            <View style={[styles.bgCircle, { backgroundColor: theme.accent + '25' }]} />
            <View style={[styles.bgCircle2, { backgroundColor: theme.accentSecondary + '15' }]} />

            {/* Sticky Header Glassmorphism */}
            <LinearGradient
                colors={mode === 'dark' ? ['rgba(15, 17, 21, 0.95)', 'rgba(15, 17, 21, 0.7)', 'transparent'] : ['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.7)', 'transparent']}
                style={styles.header}
            >
                <TouchableOpacity onPress={() => {
                    try {
                        router.back();
                    } catch (e) {
                        router.replace('/(tabs)');
                    }
                }} style={styles.backBtn}>
                    <View style={[styles.backIconCircle, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        <Text style={[styles.backIcon, { color: theme.accent }]}>←</Text>
                    </View>
                    <Text style={[styles.backText, { color: theme.accent }]}>Boutique</Text>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Créé par Andy</Text>
            </LinearGradient>

            {/* Custom Tab Switcher Premium */}
            <View style={styles.tabWrapper}>
                <View style={[styles.tabContent, { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 2 }]}>
                    <TouchableOpacity
                        style={[styles.tabItem, activeTab === 'app' && { backgroundColor: theme.surface2, elevation: 6 }]}
                        onPress={() => setActiveTab('app')}
                    >
                        <Text style={[styles.tabText, { color: theme.textSecondary }, activeTab === 'app' && { color: theme.text, fontFamily: FONT.bold }]}>
                            🚀 Application
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tabItem, activeTab === 'dev' && { backgroundColor: theme.surface2, elevation: 6 }]}
                        onPress={() => setActiveTab('dev')}
                    >
                        <Text style={[styles.tabText, { color: theme.textSecondary }, activeTab === 'dev' && { color: theme.text, fontFamily: FONT.bold }]}>
                            👨‍💻 Développeur
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {activeTab === 'app' ? (
                    <View style={styles.sectionFade}>
                        {/* App Presentation Card Premium */}
                        <View style={[styles.mainCard, {
                            backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.85)',
                            borderColor: theme.border,
                            borderWidth: 2.5
                        }]}>
                            <Image
                                source={require('../assets/Logo_CombiStore.png')}
                                style={styles.appLogoLarge}
                                resizeMode="contain"
                            />
                            <Text style={[styles.appName, { color: theme.text }]}>CombiStore</Text>
                            <Text style={[styles.appTagline, { color: theme.accent }]}>"Vos apps à votre aise"</Text>

                            <Text style={[styles.description, { color: theme.textSecondary }]}>
                                CombiStore est une plateforme d'agrégation de mini-applications web.
                                Elle transforme sites et fichiers HTML en expériences natives fluides.
                            </Text>
                        </View>

                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Atouts Clés</Text>
                        <View style={styles.featureGrid}>
                            {[
                                { title: 'Import URL', desc: 'Sites web en un clic.', icon: '🌐' },
                                { title: 'Local HTML', desc: 'Vos créations locales.', icon: '📁' },
                                { title: 'Catégories', desc: 'Organisation sur mesure.', icon: '🏷️' },
                                { title: 'Mode Sombre', desc: 'Design premium doux.', icon: '🌙' },
                            ].map((item, i) => (
                                <View key={i} style={[styles.miniFeatureCard, { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 2 }]}>
                                    <Text style={styles.miniIcon}>{item.icon}</Text>
                                    <View>
                                        <Text style={[styles.miniTitle, { color: theme.text }]}>{item.title}</Text>
                                        <Text style={[styles.miniDesc, { color: theme.textSecondary }]}>{item.desc}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                ) : (
                    <View style={styles.sectionFade}>
                        {/* Developer Card Premium Glassmorphism */}
                        <View style={[styles.mainCard, {
                            backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)',
                            borderColor: theme.border,
                            borderWidth: 2.5
                        }]}>
                            <View style={[styles.profileImageContainer, { borderColor: theme.accent, borderWidth: 3 }]}>
                                <Image
                                    source={require('../assets/image_2.jpg')}
                                    style={styles.profileImage}
                                />
                                <View style={[styles.devStatusDot, { backgroundColor: '#4CAF50', borderColor: theme.surface }]} />
                            </View>
                            <Text style={[styles.devName, { color: theme.text }]}>Andy SIWA</Text>
                            <Text style={[styles.devCategory, { color: theme.accent }]}>Ingénieur Électricien Innovant</Text>

                            <Text style={[styles.bio, { color: theme.textSecondary }]}>
                                Expert en convergence <Text style={{ color: theme.text, fontWeight: 'bold' }}>Électrotechnique</Text>,
                                <Text style={{ color: theme.text, fontWeight: 'bold' }}> Électronique</Text> et <Text style={{ color: theme.text, fontWeight: 'bold' }}> Informatique</Text>.
                            </Text>

                            <View style={styles.socialGrid}>
                                {socialLinks.map(link => (
                                    <TouchableOpacity
                                        key={link.id}
                                        style={styles.socialIconBtnPlain}
                                        onPress={() => openLink(link.url)}
                                    >
                                        <FontAwesome6 name={link.icon} size={28} color={link.color} />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Expertises</Text>
                        <View style={styles.serviceList}>
                            {[
                                { title: 'Électricité Bâtiment', icon: '🔌' },
                                { title: 'Énergie Solaire', icon: '☀️' },
                                { title: 'Programmation', icon: '💻' },
                                { title: 'Design Graphique', icon: '🎨' },
                            ].map((s, i) => (
                                <View key={i} style={[styles.serviceItem, { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 2 }]}>
                                    <Text style={styles.serviceEmoji}>{s.icon}</Text>
                                    <Text style={[styles.serviceLabel, { color: theme.text }]}>{s.title}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Footer Premium */}
                <View style={styles.footer}>
                    <View style={[styles.footerLine, { backgroundColor: theme.accent }]} />
                    <Text style={[styles.footerText, { color: theme.text }]}>CombiStore v1.0.0</Text>
                    <Text style={[styles.footerMotto, { color: theme.textSecondary }]}>Propulsé par VoltiSmart Engineering ⚡</Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    bgCircle: {
        position: 'absolute',
        top: -100,
        right: -80,
        width: 350,
        height: 350,
        borderRadius: 175,
        opacity: 0.6,
    },
    bgCircle2: {
        position: 'absolute',
        bottom: -50,
        left: -80,
        width: 300,
        height: 300,
        borderRadius: 150,
        opacity: 0.4,
    },
    header: {
        paddingTop: Platform.OS === 'ios' ? 60 : 50,
        paddingHorizontal: 24,
        paddingBottom: 20,
        zIndex: 10,
    },
    backBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 8,
    },
    backIconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backIcon: { fontSize: 18, fontFamily: FONT.bold },
    backText: { fontSize: 13, fontFamily: FONT.bold, textTransform: 'uppercase', letterSpacing: 1.5 },
    headerTitle: { fontSize: 30, fontFamily: FONT.bold, letterSpacing: -0.5 },

    tabWrapper: {
        paddingHorizontal: 24,
        marginBottom: 24,
        zIndex: 10,
    },
    tabContent: {
        flexDirection: 'row',
        borderRadius: 20,
        padding: 6,
        borderWidth: 2,
    },
    tabItem: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    tabText: { fontSize: 13, fontFamily: FONT.bold },

    scrollContent: {
        paddingBottom: 100,
    },
    sectionFade: {
        paddingHorizontal: 24,
    },
    mainCard: {
        borderRadius: 30,
        padding: 30,
        alignItems: 'center',
        marginBottom: 35,
        elevation: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.15,
        shadowRadius: 25,
    },
    appLogoLarge: {
        width: 120,
        height: 120,
        marginBottom: 20,
    },
    appName: { fontSize: 28, fontFamily: FONT.bold, marginBottom: 6 },
    appTagline: { fontSize: 15, fontFamily: FONT.semiBold, marginBottom: 20 },
    description: { fontSize: 16, fontFamily: FONT.regular, textAlign: 'center', lineHeight: 24 },

    sectionTitle: { fontSize: 22, fontFamily: FONT.bold, marginBottom: 20, letterSpacing: -0.5 },
    featureGrid: {
        gap: 15,
    },
    miniFeatureCard: {
        flexDirection: 'row',
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
        gap: 15,
    },
    miniIcon: { fontSize: 28 },
    miniTitle: { fontSize: 16, fontFamily: FONT.bold, marginBottom: 2 },
    miniDesc: { fontSize: 13, fontFamily: FONT.regular, opacity: 0.8 },

    // Developer Styles
    profileImageContainer: {
        width: 140,
        height: 140,
        borderRadius: 70,
        padding: 5,
        marginBottom: 20,
        position: 'relative',
    },
    profileImage: {
        width: '100%',
        height: '100%',
        borderRadius: 65,
    },
    devStatusDot: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 4,
    },
    devName: { fontSize: 28, fontFamily: FONT.bold, marginBottom: 6 },
    devCategory: { fontSize: 16, fontFamily: FONT.semiBold, marginBottom: 20 },
    bio: { fontSize: 16, fontFamily: FONT.regular, textAlign: 'center', lineHeight: 24, marginBottom: 25 },

    socialGrid: { flexDirection: 'row', gap: 20, marginTop: 10 },
    socialIconBtnPlain: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },

    serviceList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    serviceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 18,
        gap: 10,
    },
    serviceEmoji: { fontSize: 20 },
    serviceLabel: { fontSize: 14, fontFamily: FONT.bold },

    footer: {
        marginTop: 50,
        alignItems: 'center',
    },
    footerLine: {
        width: 60,
        height: 4,
        borderRadius: 2,
        marginBottom: 15,
        opacity: 0.5,
    },
    footerText: { fontSize: 14, fontFamily: FONT.bold },
    footerMotto: { fontSize: 11, fontFamily: FONT.medium, marginTop: 6, opacity: 0.7 },
});
