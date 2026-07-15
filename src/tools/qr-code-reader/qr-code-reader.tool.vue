<script setup lang="ts">
import jsQR from 'jsqr';
import { useCopy } from '@/composable/copy';

const imagePreview = ref<string | null>(null);
const decodedText = ref('');
const error = ref('');
const isProcessing = ref(false);

const { copy } = useCopy({ source: decodedText, text: 'QR code content copied to clipboard' });

async function decodeImageFile(file: File) {
  if (!file.type.startsWith('image/')) {
    error.value = 'Please upload an image file';
    return;
  }

  error.value = '';
  decodedText.value = '';
  isProcessing.value = true;

  if (imagePreview.value) {
    URL.revokeObjectURL(imagePreview.value);
  }
  imagePreview.value = URL.createObjectURL(file);

  try {
    const img = await loadImage(imagePreview.value);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas not supported');
    }
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const result = jsQR(imageData.data, imageData.width, imageData.height);
    if (result) {
      decodedText.value = result.data;
    }
    else {
      error.value = 'No QR code found in the image';
    }
  }
  catch (e) {
    error.value = `Failed to decode image: ${(e as Error).message}`;
  }
  finally {
    isProcessing.value = false;
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
}

async function pasteFromClipboard() {
  try {
    const items = await navigator.clipboard.read();
    for (const item of items) {
      const imageType = item.types.find(t => t.startsWith('image/'));
      if (imageType) {
        const blob = await item.getType(imageType);
        await decodeImageFile(new File([blob], 'pasted-image', { type: imageType }));
        return;
      }
    }
    error.value = 'No image found in clipboard';
  }
  catch {
    error.value = 'Clipboard access denied or not supported';
  }
}

function reset() {
  if (imagePreview.value) {
    URL.revokeObjectURL(imagePreview.value);
  }
  imagePreview.value = null;
  decodedText.value = '';
  error.value = '';
}

const isUrl = computed(() => {
  try {
    return decodedText.value.startsWith('http://') || decodedText.value.startsWith('https://');
  }
  catch {
    return false;
  }
});

onUnmounted(() => {
  if (imagePreview.value) {
    URL.revokeObjectURL(imagePreview.value);
  }
});
</script>

<template>
  <c-card>
    <div v-if="!imagePreview" flex flex-col gap-4>
      <c-file-upload
        accept="image/*"
        title="Drag and drop a QR code image here, or click to select"
        @file-upload="decodeImageFile"
      />
      <div flex justify-center>
        <c-button @click="pasteFromClipboard">
          <icon-mdi-clipboard-outline mr-2 />
          Paste from clipboard
        </c-button>
      </div>
    </div>

    <div v-else flex flex-col gap-4>
      <div flex items-start gap-4>
        <img
          :src="imagePreview"
          alt="QR code preview"
          max-h-48
          max-w-48
          rounded
          border="1 solid op-20"
          object-contain
        >

        <div flex flex-1 flex-col gap-3>
          <div v-if="isProcessing" flex items-center gap-2 op-60>
            <n-spin size="small" />
            Decoding…
          </div>

          <template v-else-if="decodedText">
            <div text-sm op-60>
              Decoded content:
            </div>
            <c-input-text
              :value="decodedText"
              multiline
              readonly
              rows="4"
              autosize
            />
            <div flex gap-2>
              <c-button @click="copy()">
                <icon-mdi-content-copy mr-2 />
                Copy
              </c-button>
              <c-button v-if="isUrl" tag="a" :href="decodedText" target="_blank" rel="noopener noreferrer">
                <icon-mdi-open-in-new mr-2 />
                Open URL
              </c-button>
            </div>
          </template>

          <c-alert v-else-if="error" type="error">
            {{ error }}
          </c-alert>
        </div>
      </div>

      <div flex justify-center>
        <c-button @click="reset">
          <icon-mdi-refresh mr-2 />
          Scan another
        </c-button>
      </div>
    </div>
  </c-card>
</template>
