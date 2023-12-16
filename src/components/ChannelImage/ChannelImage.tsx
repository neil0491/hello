import { useEffect, useRef, useState } from "react";

function ChannelImage({
  src,
  alt,
  ...props
}: {
  src: string;
  alt: string;
  props?: any;
}) {
  const image = useRef<HTMLImageElement>(null);
  const [state, setState] = useState({
    isLoading: true,
    imgSrc: "",
  });
  useEffect(() => {
    const onLoad = (e?: string) => {
      if (image.current) {
        setState({
          imgSrc: image.current.src,
          isLoading: e === "error" ? true : false,
        });
      }
    };

    const loadImage = (url: string) => {
      const currentImage = new Image();
      //@ts-ignore
      image.current = currentImage;
      currentImage.src = url;
      currentImage.decode !== undefined
        ? currentImage
            .decode()
            .then(() => onLoad())
            .catch(() => onLoad("error"))
        : onLoad("error");
    };
    loadImage(src);

    return () => {
      if (image.current) {
        image.current.onload = null;
        image.current.onerror = null;
      }
    };
  }, [src]);

  return (
    <>
      {state.isLoading || !state?.imgSrc ? (
        <div className="w-full flex justify-center items-center h-full bg-slate-400 text-4xl uppercase">
          {alt[0]}
        </div>
      ) : (
        <img
          ref={image}
          className="w-full"
          src={
            state.imgSrc ??
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mO8Ww8AAj8BXkQ+xPEAAAAASUVORK5CYII="
          }
          alt={alt}
          {...props}
        />
      )}
    </>
  );
}

export default ChannelImage;
