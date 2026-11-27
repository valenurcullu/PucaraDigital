import { useMemo, useState, type ReactNode } from 'react';
import { Animated, PanResponder, View } from 'react-native';
import { color, Label, Tap } from '../../components/handoff-ui';
/** Native responder gestures also work with touch and mouse through React Native Web. */
export function SwipeSeries({
  children,
  onDelete,
  label,
  disabled = false,
}: {
  children: ReactNode;
  onDelete: () => void;
  label: string;
  disabled?: boolean;
}) {
  const [offset] = useState(() => new Animated.Value(0));
  const [open, show] = useState(false);
  const responders = useMemo(() => {
    const settle = (value: number) =>
      Animated.spring(offset, {
        toValue: value,
        useNativeDriver: true,
        overshootClamping: true,
      }).start();
    return PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        !disabled &&
        Math.abs(gesture.dx) > 12 &&
        Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.5,
      onPanResponderGrant: (event) => {
        event.preventDefault();
        offset.stopAnimation();
      },
      onPanResponderMove: (_, gesture) =>
        offset.setValue(
          Math.min(0, Math.max(-96, (open ? -96 : 0) + gesture.dx)),
        ),
      onPanResponderRelease: (_, gesture) => {
        const reveal = (open ? -96 : 0) + gesture.dx < -45;
        show(reveal);
        settle(reveal ? -96 : 0);
      },
      onPanResponderTerminate: () => settle(open ? -96 : 0),
      onPanResponderTerminationRequest: () => false,
    });
  }, [disabled, offset, open]);
  return (
    <View style={{ borderRadius: 12, overflow: 'hidden' }}>
      {!disabled && open && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            width: 96,
          }}
        >
          <Tap
            label={label}
            onPress={() => {
              offset.stopAnimation();
              offset.setValue(0);
              show(false);
              onDelete();
            }}
            style={{
              flex: 1,
              minHeight: 48,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: color.error,
            }}
          >
            <Label role="label" ink="white">
              Eliminar
            </Label>
          </Tap>
        </View>
      )}
      <Animated.View
        {...(disabled ? {} : responders.panHandlers)}
        style={{
          transform: [{ translateX: disabled ? 0 : offset }],
          backgroundColor: color.surface,
        }}
      >
        {children}
      </Animated.View>
    </View>
  );
}
