import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as Linking from 'expo-linking';
import * as FileSystem from 'expo-file-system/legacy';
import { ShareIntentSheet } from '@/components/modals/share-intent-sheet';
import { GarmentType, ImageSource, state } from '@/state';

type SharePayload = {
  uri: string;
  mimeType?: string;
  source: ImageSource;
};

type PendingShare = {
  localUri: string;
  source: ImageSource;
};

const cacheRoot = FileSystem.cacheDirectory ?? FileSystem.documentDirectory ?? '';
const SHARE_CACHE_DIR = `${cacheRoot}shared-intents/`;

const ensureCacheDir = async () => {
  const dirInfo = await FileSystem.getInfoAsync(SHARE_CACHE_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(SHARE_CACHE_DIR, { intermediates: true });
  }
};

const safeDecode = (value: string) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const parseIntentUrl = (url: string): SharePayload | null => {
  if (!url.startsWith('intent://')) return null;

  const [, intentBody] = url.split('#Intent;');
  if (!intentBody) return null;

  const segments = intentBody.split(';');
  const extras: Record<string, string> = {};
  let mimeType: string | undefined;

  segments.forEach((segment) => {
    if (segment.startsWith('S.')) {
      const withoutPrefix = segment.slice(2);
      const equalsIndex = withoutPrefix.indexOf('=');
      if (equalsIndex !== -1) {
        const key = withoutPrefix.slice(0, equalsIndex);
        const value = withoutPrefix.slice(equalsIndex + 1);
        extras[key.replace('android.intent.extra.', '')] = safeDecode(value);
      }
    }

    if (segment.startsWith('type=')) {
      mimeType = safeDecode(segment.slice('type='.length));
    }
  });

  const stream = extras.STREAM;
  const text = extras.TEXT;
  const resolved = stream ?? text;
  if (!resolved) return null;

  return {
    uri: resolved,
    mimeType,
    source: resolved.startsWith('http') ? 'url' : 'library',
  };
};

const extractSharePayload = (url: string | null): SharePayload | null => {
  if (!url) return null;
  const fromIntent = parseIntentUrl(url);
  if (fromIntent) return fromIntent;

  if (url.startsWith('content://') || url.startsWith('file://')) {
    return {
      uri: url,
      source: 'library',
    };
  }

  return null;
};

const guessExtension = (uri: string, mimeType?: string) => {
  if (mimeType?.startsWith('image/')) {
    const ext = mimeType.split('/')[1];
    if (ext === 'jpeg') return 'jpg';
    return ext || 'jpg';
  }

  const cleanUri = uri.split('?')[0].toLowerCase();
  const knownExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.heic'];
  const matchedExt = knownExtensions.find((ext) => cleanUri.endsWith(ext));
  return matchedExt ? matchedExt.slice(1) : 'jpg';
};

const persistSharedImage = async (payload: SharePayload) => {
  await ensureCacheDir();

  const extension = guessExtension(payload.uri, payload.mimeType);
  const destination = `${SHARE_CACHE_DIR}${Date.now()}.${extension}`;

  if (payload.uri.startsWith('http')) {
    await FileSystem.downloadAsync(payload.uri, destination);
  } else {
    await FileSystem.copyAsync({
      from: payload.uri,
      to: destination,
    });
  }

  return destination;
};

const deleteCachedShare = async (uri?: string) => {
  if (!uri) return;
  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch (error) {
    console.warn('Unable to clean up shared image cache', error);
  }
};

export const ShareIntentHandler = () => {
  const [pendingShare, setPendingShare] = useState<PendingShare | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const initialUrlHandled = useRef(false);
  const lastHandledUrl = useRef<string | null>(null);

  const handleIncomingUrl = useCallback(
    async (incomingUrl: string | null) => {
      if (!incomingUrl || incomingUrl === lastHandledUrl.current) return;

      const payload = extractSharePayload(incomingUrl);
      if (!payload) return;

      try {
        const localUri = await persistSharedImage(payload);
        lastHandledUrl.current = incomingUrl;

        setPendingShare((current) => {
          if (current?.localUri && current.localUri !== localUri) {
            deleteCachedShare(current.localUri);
          }

          return {
            localUri,
            source: payload.source,
          };
        });
      } catch (error) {
        console.error('Failed to handle shared image intent', error);
      }
    },
    [setPendingShare],
  );

  useEffect(() => {
    if (!initialUrlHandled.current) {
      initialUrlHandled.current = true;
      Linking.getInitialURL().then(handleIncomingUrl).catch(console.error);
    }

    const subscription = Linking.addEventListener('url', ({ url }) => handleIncomingUrl(url));
    return () => {
      subscription.remove();
    };
  }, [handleIncomingUrl]);

  const clearPending = useCallback(async () => {
    if (pendingShare) {
      await deleteCachedShare(pendingShare.localUri);
    }
    setPendingShare(null);
  }, [pendingShare]);

  const handleSelection = useCallback(
    async (selection: GarmentType | 'model') => {
      if (!pendingShare) return;
      setIsProcessing(true);

      try {
        if (selection === 'model') {
          await state.actions.addModel(pendingShare.localUri, pendingShare.source);
        } else {
          await state.actions.addGarment(pendingShare.localUri, selection, pendingShare.source);
        }
      } catch (error) {
        console.error('Failed to save shared image', error);
      } finally {
        await deleteCachedShare(pendingShare.localUri);
        setPendingShare(null);
        setIsProcessing(false);
      }
    },
    [pendingShare],
  );

  return (
    <ShareIntentSheet
      open={!!pendingShare}
      imageUri={pendingShare?.localUri}
      isProcessing={isProcessing}
      onSelect={handleSelection}
      onDismiss={clearPending}
    />
  );
};
