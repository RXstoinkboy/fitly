import {
  Text,
  YStack,
  Square,
  Image,
  Tabs,
  type TabsContentProps,
  AddImage,
} from "@/components/ui";
import {
  BOTTOM_IMAGE_STORAGE_KEY,
  TOP_IMAGE_STORAGE_KEY,
  useModelImage,
} from "@/hooks/use-model-image";

const TabsContent = (props: TabsContentProps) => {
  return (
    <Tabs.Content
      bg="$background"
      key="tab3"
      p="$2"
      items="center"
      justify="center"
      flex={1}
      borderColor="$background"
      rounded="$2"
      borderTopLeftRadius={0}
      borderTopRightRadius={0}
      borderWidth="$2"
      {...props}
    >
      {props.children}
    </Tabs.Content>
  );
};

export default function GarmentsPicker() {
  const top = useModelImage(TOP_IMAGE_STORAGE_KEY);
  const bottom = useModelImage(BOTTOM_IMAGE_STORAGE_KEY);

  return (
    <Tabs
      defaultValue="top"
      orientation="horizontal"
      flexDirection="column"
      borderWidth="$0.25"
      overflow="hidden"
      borderColor="$borderColor"
      height={"100%"}
    >
      <Tabs.List aria-label="Manage your account">
        <Tabs.Tab
          focusStyle={{
            borderWidth: 2,
            borderColor: "$color8",
          }}
          flex={1}
          value="top"
          p="$2"
          height={"min-content"}
        >
          <YStack items={"center"} gap="$2">
            {top.modelImage ? (
              <Image
                source={{ uri: top.modelImage, height: 100, width: 100 }}
              />
            ) : (
              <Square
                rounded={"$4"}
                bordered
                borderWidth={"$1"}
                height={100}
                width={100}
              ></Square>
            )}

            <Text>Top</Text>
          </YStack>
        </Tabs.Tab>

        <Tabs.Tab
          focusStyle={{
            borderWidth: 2,
            borderColor: "$color8",
          }}
          flex={1}
          p="$2"
          value="bottom"
          height={"min-content"}
        >
          <YStack items={"center"} gap="$2">
            {bottom.modelImage ? (
              <Image
                source={{ uri: bottom.modelImage, height: 100, width: 100 }}
              />
            ) : (
              <Square
                rounded={"$4"}
                bordered
                borderWidth={"$1"}
                height={100}
                width={100}
              ></Square>
            )}

            <Text>Bottom</Text>
          </YStack>
        </Tabs.Tab>
      </Tabs.List>

      <TabsContent value="top">
        <AddImage onSuccess={top.saveModelImage} />
      </TabsContent>

      <TabsContent value="bottom">
        <AddImage onSuccess={bottom.saveModelImage} />
      </TabsContent>
    </Tabs>
  );
}
