import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

const FESTIVAL_ART: Record<string, number> = {
  '🐘': require('@/assets/festival-icons/ganesha.png'),
  '🪔': require('@/assets/festival-icons/diwali-diya.png'),
  '🎨': require('@/assets/festival-icons/holi-colors.png'),
  '🎄': require('@/assets/festival-icons/christmas-tree.png'),
  '🇮🇳': require('@/assets/festival-icons/india-flag.png'),
  '☸️': require('@/assets/festival-icons/ashoka-chakra.png'),
  '🧵': require('@/assets/festival-icons/rakhi.png'),
  '🌙': require('@/assets/festival-icons/eid-moon.png'),
  '🪷': require('@/assets/festival-icons/navratri-dandiya.png'),
  '🏹': require('@/assets/festival-icons/dussehra-bow.png'),
  '🌼': require('@/assets/festival-icons/onam-pookalam.png'),
  '🍚': require('@/assets/festival-icons/pongal-pot.png'),
  '🦚': require('@/assets/festival-icons/janmashtami-flute.png'),
  '🌾': require('@/assets/festival-icons/baisakhi-dhol.png'),
  '🎆': require('@/assets/festival-icons/new-year-fireworks.png'),
  '🏠': require('@/assets/festival-icons/family-holiday.png'),
  '✨': require('@/assets/festival-icons/2728.png'),
};

type FestivalIconProps = {
  icon: string;
  size: number;
};

export function FestivalIcon({ icon, size }: FestivalIconProps) {
  const source = FESTIVAL_ART[icon];
  if (source) {
    return (
      <Image
        contentFit="contain"
        source={source}
        style={{ height: size, width: size }}
      />
    );
  }
  return (
    <View style={[styles.fallback, { height: size, width: size }]}>
      <Text style={{ fontSize: size * 0.8, lineHeight: size }}>{icon}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { alignItems: 'center', justifyContent: 'center' },
});
