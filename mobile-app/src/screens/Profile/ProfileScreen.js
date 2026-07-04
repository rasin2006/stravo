import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { clearToken } from '../../services/tokenStore';
import { Button, Card } from '../../components';
import { colors, spacing, typography } from '../../theme';

export default function ProfileScreen({ navigation }) {
  function handleLogout() {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => {
          clearToken();
          navigation.navigate('Login');
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Profile</Text>
      <Card>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>S</Text>
        </View>
        <Text style={styles.name}>Trail Explorer</Text>
        <Text style={styles.subtitle}>Contributing paths to the community</Text>
      </Card>
      <Card>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>—</Text>
            <Text style={styles.statLabel}>Paths recorded</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>—</Text>
            <Text style={styles.statLabel}>Km contributed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>—</Text>
            <Text style={styles.statLabel}>Segments rated</Text>
          </View>
        </View>
      </Card>
      <Button title="Sign Out" variant="outline" onPress={handleLogout} style={styles.logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.xl, paddingTop: spacing.xxxl },
  header: { ...typography.h1, marginBottom: spacing.xl },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: { fontSize: 28, fontWeight: '700', color: colors.onPrimary },
  name: { ...typography.h2, marginBottom: spacing.xs },
  subtitle: { ...typography.body },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { ...typography.h2, color: colors.primary },
  statLabel: { ...typography.caption, textAlign: 'center', marginTop: spacing.xs },
  logout: { marginTop: spacing.xl },
});
