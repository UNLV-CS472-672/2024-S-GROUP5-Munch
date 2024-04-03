import { EvilIcons } from '@expo/vector-icons';
import { FC } from 'react';
import { Button, Text, Tooltip } from 'tamagui';
import { IconNames } from './icons';

interface ButtonProps {
  iconName: IconNames;
  onPress: () => void;
}
const ButtonIcon: FC<ButtonProps> = ({ iconName, onPress }) => {
  return (
    <Tooltip delay={{ open: 3000, close: 1000 }}>
      <Tooltip.Trigger>
        <Button
          size={'$4'}
          circular
          icon={<EvilIcons name={iconName} size={30} />}
          display='flex'
          justifyContent='center'
          alignItems='center'
          onPress={onPress}
          unstyled
        />
      </Tooltip.Trigger>
      <Tooltip.Content
        enterStyle={{ x: 0, y: -0.5, opacity: 0, scale: 0.9 }}
        exitStyle={{ x: 0, y: -0.5, opacity: 0, scale: 0.9 }}
        scale={1}
        x={0}
        y={0}
        opacity={1}
        // animation={['quick', { opacity: { overshootClamping: true } }]}
      >
        <Tooltip.Arrow />
        <Text>{'hi'}</Text>
      </Tooltip.Content>
    </Tooltip>
  );
};
export default ButtonIcon;
