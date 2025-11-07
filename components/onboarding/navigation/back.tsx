import { Button } from '@/components/v2/ui/button';
import { ArrowLeft } from '@tamagui/lucide-icons';
import { Link, LinkProps } from 'expo-router';
import { Text } from 'tamagui';

export const Back = ({ href }: { href: LinkProps['href'] }) => {
  return (
    <Link href={href} asChild>
      <Button icon={<ArrowLeft />} type="ghost" paddingSize={0}>
        <Text>Back</Text>
      </Button>
    </Link>
  );
};
