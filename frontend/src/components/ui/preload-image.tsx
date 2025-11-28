import { useEffect, useState, type ReactEventHandler } from "react";

type PreloadImageProps = {
  src: string;
  alt: string;
  className?: string;
  onError?: ReactEventHandler<HTMLImageElement>;
};

export const PreloadImage = ({
  src,
  alt,
  className,
  onError,
  ...props
}: PreloadImageProps) => {
  const [isDecoded, setIsDecoded] = useState(false);

  useEffect(() => {
    if (!src) return;
    setIsDecoded(false);
    const img = new Image();

    img.src = src;
    img.onload = () => {
      setIsDecoded(true);
    };
    img.onerror = (err) => {
      console.error(`Failed to load image: ${src}`, err);
      setIsDecoded(true);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  if (!isDecoded) {
    return null;
  }

  return (
    <img
      src={src}
      loading="eager"
      alt={alt}
      className={className}
      onError={onError}
      {...props}
    />
  );
};
