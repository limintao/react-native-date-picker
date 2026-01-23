import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface PeriodProps {
  value: string;
  setValue?: (value: any) => void;
}

const PeriodWeb: React.FC<PeriodProps> = ({ value, setValue = () => {} }) => {
  return (
    <Pressable onPress={() => setValue(value == 'AM' ? 'PM' : 'AM')}>
      <View style={[defaultStyles.period]}>
        <Text>{value}</Text>
      </View>
    </Pressable>
  );
};

const defaultStyles = StyleSheet.create({
  period: {
    width: 65,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const customComparator = (
  prev: Readonly<PeriodProps>,
  next: Readonly<PeriodProps>
) => {
  const areEqual = prev.value === next.value && prev.setValue === next.setValue;

  return areEqual;
};

export default memo(PeriodWeb, customComparator);
