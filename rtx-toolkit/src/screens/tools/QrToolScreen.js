import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS } from '../../theme/theme';
import AppButton from '../../components/AppButton';

/**
 * QrToolScreen
 * ------------
 * Two clear modes via a segmented toggle - never both on screen at once,
 * so there's no confusion about what the camera view or the code below is
 * for:
 *  - SCAN: opens camera, reads any QR code, shows the decoded text
 *  - GENERATE: type text/URL, shows a QR code for it instantly
 */
export default function QrToolScreen() {
  const [mode, setMode] = useState('scan');
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedValue, setScannedValue] = useState(null);
  const [scanLocked, setScanLocked] = useState(false);
  const [genText, setGenText] = useState('');

  const handleBarcodeScanned = ({ data }) => {
    if (scanLocked) return; // prevent duplicate rapid-fire scans
    setScanLocked(true);
    setScannedValue(data);
  };

  const resetScan = () => {
    setScannedValue(null);
    setScanLocked(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.toggleRow}>
        <ModeButton label="SCAN" icon="scan" active={mode === 'scan'} onPress={() => setMode('scan')} />
        <ModeButton
          label="GENERATE"
          icon="qr-code"
          active={mode === 'generate'}
          onPress={() => setMode('generate')}
        />
      </View>

      {mode === 'scan' ? (
        <View style={styles.scanArea}>
          {!permission?.granted ? (
            <View style={styles.permissionBox}>
              <Ionicons name="camera" size={40} color={COLORS.secondary} />
              <Text style={styles.permissionText}>QR স্ক্যান করতে ক্যামেরা পারমিশন দরকার</Text>
              <AppButton label="পারমিশন দিন" variant="primary" onPress={requestPermission} />
            </View>
          ) : scannedValue ? (
            <View style={styles.resultBox}>
              <Ionicons name="checkmark-circle" size={40} color={COLORS.primary} />
              <Text style={styles.resultLabel}>স্ক্যান হয়েছে:</Text>
              <Text style={styles.resultText} selectable numberOfLines={4}>
                {scannedValue}
              </Text>
              <AppButton label="আবার স্ক্যান করুন" variant="secondary" onPress={resetScan} />
            </View>
          ) : (
            <View style={styles.cameraWrap}>
              <CameraView
                style={styles.camera}
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                onBarcodeScanned={handleBarcodeScanned}
              />
              <View style={styles.scanFrame} pointerEvents="none" />
            </View>
          )}
        </View>
      ) : (
        <View style={styles.genArea}>
          <TextInput
            style={styles.input}
            value={genText}
            onChangeText={setGenText}
            placeholder="টেক্সট বা লিংক লিখুন..."
            placeholderTextColor={COLORS.textMuted}
            multiline
          />
          {!!genText.trim() && (
            <View style={styles.qrBox}>
              <QRCode value={genText.trim()} size={200} color={COLORS.background} backgroundColor={COLORS.primary} />
            </View>
          )}
        </View>
      )}
    </View>
  );
}

function ModeButton({ label, icon, active, onPress }) {
  return (
    <TouchableOpacity style={[styles.modeBtn, active && styles.modeBtnActive]} onPress={onPress}>
      <Ionicons name={icon} size={16} color={active ? COLORS.primary : COLORS.textSecondary} />
      <Text style={[styles.modeText, active && styles.modeTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.lg },
  toggleRow: { flexDirection: 'row', marginBottom: SPACING.lg },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginHorizontal: SPACING.xs,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
  },
  modeBtnActive: { borderColor: COLORS.primary, backgroundColor: COLORS.surfaceAlt },
  modeText: { fontFamily: FONTS.mono, color: COLORS.textSecondary, marginLeft: SPACING.xs },
  modeTextActive: { color: COLORS.primary, fontFamily: FONTS.monoBold },
  scanArea: { flex: 1 },
  permissionBox: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  permissionText: {
    fontFamily: FONTS.mono,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginVertical: SPACING.md,
  },
  cameraWrap: { flex: 1, borderRadius: RADIUS.lg, overflow: 'hidden' },
  camera: { flex: 1 },
  scanFrame: {
    position: 'absolute',
    top: '25%',
    left: '15%',
    right: '15%',
    bottom: '35%',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.md,
  },
  resultBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
  },
  resultLabel: { fontFamily: FONTS.mono, color: COLORS.textSecondary, marginTop: SPACING.sm },
  resultText: {
    fontFamily: FONTS.mono,
    color: COLORS.textPrimary,
    marginVertical: SPACING.md,
    textAlign: 'center',
  },
  genArea: { flex: 1, alignItems: 'center' },
  input: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    color: COLORS.textPrimary,
    fontFamily: FONTS.mono,
    backgroundColor: COLORS.surface,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: SPACING.lg,
  },
  qrBox: {
    padding: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
  },
});
