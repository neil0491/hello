import { useEffect, useRef, useState } from "react";
import ReactHlsPlayer from "./components/ReactHlsPlayer/ReactHlsPlayer";
//@ts-ignore
import { ParseM3U } from "https://cdn.jsdelivr.net/gh/MarketingPipeline/IPTV-Parser.js/dist/iptv-parser.min.js";
import { Playlist, PlaylistItem } from "iptv-playlist-parser";
import ChannelImage from "./components/ChannelImage/ChannelImage";

function App() {
  const playerRef = useRef<HTMLVideoElement>(null);
  const [url, seturl] = useState<string>("");
  const [channels, setChannels] = useState<Playlist>();

  useEffect(() => {
    async function Fetch_IPTV_Links() {
      try {
        let iptv_res = await ParseM3U(
          "mylist.m3u", //работа
          "URL"
        );

        if (iptv_res?.items[0]) {
          seturl(iptv_res.items[0].url);
        }
        setChannels(iptv_res);
      } catch (err) {
        console.error(err);
      }
    }
    Fetch_IPTV_Links();
    return () => {};
  }, []);

  const changeChannel = (url: string) => {
    seturl(url);
  };

  return (
    <div className="flex justify-between">
      <div className="w-1/3 md:w-1/5 bg-gray-900 md:bg-gray-900 text-center md:pt-8 md:top-0 md:left-0 md:h-screen md:border-r-4 md:border-gray-600 h-screen overflow-y-auto no-scrollbar">
        <div className="md:relative mx-auto">
          <ul className="list-reset flex flex-row md:flex-col text-center md:text-left ">
            {channels?.items &&
              channels.items.map((ch: PlaylistItem, index) => {
                return (
                  <li
                    onClick={() => {
                      changeChannel(ch.url);
                    }}
                    key={index}
                    className="mr-3 flex-1 flex items-center p-5 md:p-2 cursor-pointer hover:bg-slate-200"
                  >
                    <div className="w-20 h-20 md:w-14 md:h-14 flex justify-center items-center">
                      <ChannelImage src={ch.tvg.logo} alt={ch.name} />
                    </div>
                    <div className="px-4 text-xl md:text-base text-gray-50 font-medium">
                      {ch.name}
                    </div>
                  </li>
                );
              })}
          </ul>
        </div>
      </div>
      <div className="relative flex-1 w-full bg-black">
        <ReactHlsPlayer
          autoPlay
          className="w-full h-screen"
          playerRef={playerRef}
          src={url}
        />
      </div>
    </div>
  );
}

export default App;
