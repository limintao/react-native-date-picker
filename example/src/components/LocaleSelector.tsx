import { StyleSheet, View, Text, Pressable } from 'react-native';

const Locales = ['zh-cn', 'en', 'de', 'es'];

type Props = {
  locale: string;
  setLocale: (locale: string) => void;
  mainColor?: string;
  activeTextColor?: string;
};

export default function LocaleSelector({
  locale,
  setLocale,
  mainColor,
  activeTextColor,
}: Props) {
  return (
    <View style={styles.localeContainer}>
      <Text style={{ marginRight: 8 }}>Locale:</Text>
      {Locales.map((item, index) => (
        <Pressable
          key={index}
          style={[
            styles.localeButton,
            item === locale && {
              backgroundColor: mainColor,
            },
          ]}
          onPress={() => setLocale(item)}
          accessibilityRole="button"
          accessibilityLabel={item.toUpperCase()}
        >
          <Text
            style={[
              styles.localeButtonText,
              item === locale && {
                fontWeight: 'bold',
                color: activeTextColor,
              },
            ]}
          >
            {item.split('-')[0]?.toUpperCase()}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  localeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  localeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    borderRadius: 36,
    margin: 2,
  },
  localeButtonText: {
    fontSize: 15,
  },
});
