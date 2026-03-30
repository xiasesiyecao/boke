"use client";

import { useMemo, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";

type ImageCropDialogProps = {
  imageSrc: string;
  fileName: string;
  onCancel: () => void;
  onConfirm: (args: { croppedAreaPixels: Area; aspect: number }) => void;
};

const aspectOptions = [
  { label: "16:9", value: 16 / 9 },
  { label: "4:3", value: 4 / 3 },
  { label: "1:1", value: 1 },
];

export function ImageCropDialog({
  imageSrc,
  fileName,
  onCancel,
  onConfirm,
}: ImageCropDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState(16 / 9);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const readableName = useMemo(() => fileName.replace(/\.[^.]+$/, ""), [fileName]);

  return (
    <div className="cropper-backdrop">
      <div className="cropper-dialog">
        <div className="cropper-header">
          <div>
            <span className="section-label">Image Crop</span>
            <h2>裁剪后再上传</h2>
            <p>{readableName}</p>
          </div>
          <button type="button" className="ghost-link studio-copy" onClick={onCancel}>
            取消
          </button>
        </div>

        <div className="cropper-stage">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
            objectFit="contain"
            showGrid={false}
          />
        </div>

        <div className="cropper-controls">
          <label className="studio-label">
            <span>比例</span>
            <div className="cropper-aspects">
              {aspectOptions.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  className={
                    option.value === aspect ? "cropper-aspect is-active" : "cropper-aspect"
                  }
                  onClick={() => setAspect(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </label>

          <label className="studio-label">
            <span>缩放</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
            />
          </label>
        </div>

        <div className="studio-action-row">
          <button type="button" className="ghost-link studio-copy" onClick={onCancel}>
            保留原图放弃裁剪
          </button>
          <button
            type="button"
            className="primary-link studio-submit"
            onClick={() => {
              if (croppedAreaPixels) {
                onConfirm({ croppedAreaPixels, aspect });
              }
            }}
            disabled={!croppedAreaPixels}
          >
            确认裁剪并上传
          </button>
        </div>
      </div>
    </div>
  );
}
