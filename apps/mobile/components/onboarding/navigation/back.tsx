import { Button } from '@/components/v2/ui/button';
import { ArrowLeft } from '@/icons';
import { Link, LinkProps } from 'expo-router';
import { Text } from 'tamagui';

export const Back = ({ href }: { href: LinkProps['href'] }) => {
  return (
    <Link href={href} asChild>
      <Button icon={<ArrowLeft />} type="ghost">
        <Text>Back</Text>
      </Button>
    </Link>
  );
};
