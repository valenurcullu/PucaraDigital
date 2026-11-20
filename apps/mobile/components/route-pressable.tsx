import type { ComponentPropsWithRef } from 'react';
import { Pressable, type PressableProps } from 'react-native';
import { Link, type Href } from 'expo-router';

type SurfaceProps = ComponentPropsWithRef<typeof Pressable> & {
  surfaceStyle: PressableProps['style'];
};

// Router's Slot merges "style" as an object. Apply function styles at the native
// leaf so that the background, hit target and pressed state survive the merge.
function LinkSurface({ surfaceStyle, ...props }: SurfaceProps) {
  return <Pressable {...props} style={surfaceStyle} />;
}
export function RoutePressable({
  href,
  style,
  ...props
}: PressableProps & { href: Href }) {
  return (
    <Link href={href} asChild>
      <LinkSurface accessibilityRole="link" {...props} surfaceStyle={style} />
    </Link>
  );
}
