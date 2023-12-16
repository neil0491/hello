import React, {
  useEffect,
  RefObject,
  useState,
  useRef,
  useCallback,
} from "react";
import Hls, { Level } from "hls.js";

export interface HlsPlayerProps
  extends React.VideoHTMLAttributes<HTMLVideoElement> {
  playerRef: RefObject<HTMLVideoElement>;
  src: string;
}

function ReactHlsPlayer({
  playerRef = React.createRef<HTMLVideoElement>(),
  src,
  autoPlay,
  ...props
}: HlsPlayerProps) {
  const hls = useRef<Hls | null>(null);
  const [levels, setLevels] = useState<Level[]>([]);
  const [_, setCurrentLevel] = useState(false);

  useEffect(() => {
    function _initPlayer() {
      if (hls.current != null) {
        hls.current.destroy();
      }

      const newHls = new Hls({
        enableWorker: false,
      });

      if (playerRef.current != null) {
        newHls.attachMedia(playerRef.current);
      }

      newHls.on(Hls.Events.MEDIA_ATTACHED, () => {
        newHls.loadSource(src);

        newHls.on(Hls.Events.MANIFEST_PARSED, () => {
          setLevels(newHls.levels);

          if (autoPlay) {
            playerRef?.current
              ?.play()
              .catch(() =>
                console.log(
                  "Unable to autoplay prior to user interaction with the dom."
                )
              );
          }
        });
      });

      newHls.on(Hls.Events.ERROR, function (_, data) {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              newHls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              newHls.recoverMediaError();
              break;
            default:
              _initPlayer();
              break;
          }
        }
      });

      hls.current = newHls;
    }

    // Check for Media Source support
    if (Hls.isSupported()) {
      _initPlayer();
    }

    return () => {
      if (hls.current != null) {
        hls.current.destroy();
      }
    };
  }, [autoPlay, playerRef, src]);

  const togglePlay = useCallback(() => {
    if (playerRef.current) {
      playerRef.current?.paused
        ? playerRef.current.play()
        : playerRef.current.pause();
    }
  }, [playerRef.current]);

  const addFullScreen = () => {
    playerRef.current?.requestFullscreen();
  };

  return (
    <div className="relative">
      {Hls.isSupported() ? (
        <video ref={playerRef} {...props} />
      ) : (
        <video
          onError={(e) => {
            console.log(e);
          }}
          ref={playerRef}
          src={src}
          autoPlay={autoPlay}
          {...props}
        />
      )}

      <div className="flex flex-row w-full absolute bottom-0  justify-between text-white px-12 py-4">
        <button onClick={togglePlay}>Play/Pause</button>
        <button onClick={addFullScreen}>FullScreen</button>
        <div>
          {levels.length !== 0 && (
            <button
              className={`text-lg font-semibold px-2 $${
                hls.current?.currentLevel === -1 ? "bg-slate-300" : ""
              }`}
              onClick={() => {
                if (hls.current) {
                  hls.current.currentLevel = -1;
                  setCurrentLevel((prev) => !prev);
                }
              }}
            >
              Auto
            </button>
          )}
          {levels.length !== 0 &&
            levels.map((el, index) => {
              return (
                <button
                  key={index}
                  className={`text-lg font-semibold px-2 text-white ${
                    hls.current?.currentLevel === index ? "bg-slate-300" : ""
                  }`}
                  onClick={() => {
                    if (hls.current) {
                      hls.current.currentLevel = index;
                      if (playerRef.current) {
                        var ctime = playerRef.current.currentTime;
                        playerRef.current.currentTime = 0;
                        playerRef.current.currentTime = ctime;
                        setCurrentLevel((prev) => !prev);
                      }
                    }
                  }}
                >
                  {el.width}
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
}

export default ReactHlsPlayer;
