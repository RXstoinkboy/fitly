import { useState } from "react";
import { Sheet, Text, XStack, Image, YStack } from "tamagui";
import { Image as ImageIcon } from "@tamagui/lucide-icons";
import { Pressable } from "react-native";

export const GarmentsChooser = () => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"top" | "bottom">("top");
  const [bottom, setBottom] = useState<string | null>(null);
  const [top, setTop] = useState<string | null>(null);

  const openDrawer = (mode: "top" | "bottom") => {
    setOpen(true);
    setMode(mode);
  };

  return (
    <>
      <XStack>
        <Pressable onPress={() => openDrawer("bottom")}></Pressable>

        <Pressable onPress={() => openDrawer("top")}>
          {top && (
            <Image
              source={{ uri: top, width: 100, height: 100 }}
              aspectRatio={1}
            />
          )}
          {bottom && (
            <Image
              source={{ uri: bottom, width: 100, height: 100 }}
              aspectRatio={1}
            />
          )}
          {/*{(top || bottom) && (
            <YStack items="center">
              <ImageIcon size={80} />
              <Text>Clear</Text>
            </YStack>
          )}*/}
          {!top && !bottom && (
            <YStack items="center">
              <ImageIcon size={80} />
              <Text>No clothes selected</Text>
            </YStack>
          )}
        </Pressable>
      </XStack>
      <Sheet
        snapPoints={[80]}
        forceRemoveScrollEnabled={open}
        open={open}
        dismissOnSnapToBottom
        zIndex={100_000}
        animation="quick"
        onOpenChange={setOpen}
      >
        <Sheet.Overlay
          animation="lazy"
          bg="$shadow6"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <Sheet.Handle />
        <Sheet.Frame p="$4">
          <XStack>
            <Pressable
              onPress={() => {
                setMode("top");
              }}
            >
              <YStack
                items="center"
                // {...(mode === "top" ? { borderColor: "$accent" } : {})}
              >
                <ImageIcon size={80} />
                <Text>Top</Text>
              </YStack>
            </Pressable>
            <Pressable
              onPress={() => {
                setMode("bottom");
              }}
            >
              <YStack items="center">
                <ImageIcon size={80} />
                <Text>Bottom</Text>
              </YStack>
            </Pressable>
          </XStack>

          {/*<AddImage onSuccess={} />
          <AddImage onSuccess={} />*/}
        </Sheet.Frame>
      </Sheet>
    </>
  );
};
