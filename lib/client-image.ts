export type CropArea = {
  width: number;
  height: number;
  x: number;
  y: number;
};

function createImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = src;
  });
}

export async function cropImageFile(file: File, cropArea: CropArea) {
  const imageUrl = URL.createObjectURL(file);

  try {
    const image = await createImage(imageUrl);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Canvas context is unavailable.");
    }

    canvas.width = cropArea.width;
    canvas.height = cropArea.height;

    context.drawImage(
      image,
      cropArea.x,
      cropArea.y,
      cropArea.width,
      cropArea.height,
      0,
      0,
      cropArea.width,
      cropArea.height,
    );

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, file.type || "image/png", 0.92),
    );

    if (!blob) {
      throw new Error("Failed to create cropped image blob.");
    }

    return new File([blob], file.name, {
      type: blob.type || file.type || "image/png",
      lastModified: Date.now(),
    });
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}
