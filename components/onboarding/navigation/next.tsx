import { ArrowRight } from '@tamagui/lucide-icons';
import { LinkProps, Link } from 'expo-router';
import { ReactNode } from 'react';
import { Button } from '@/components/v2/ui/button';
import { Text } from 'tamagui';

type NextProps = {
  children?: ReactNode;
  href: LinkProps['href'];
  onPress?: () => void;
};

export const Next = ({ children = 'Next', onPress, href }: NextProps) => {
  return (
    <Link href={href} asChild>
      <Button iconAfter={<ArrowRight />} type="ghost" onPress={onPress}>
        <Text>{children}</Text>
      </Button>
    </Link>
  );
};
