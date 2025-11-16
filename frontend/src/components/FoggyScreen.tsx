export default function FoggyScreen() {
  const fogLayers = [
    {
      animation: 'animate-fog-1',
      bgImage: "bg-[url('/fog1.png')]",
    },
    {
      animation: 'animate-fog-2',
      bgImage: "bg-[url('/fog2.png')]",
    },
    {
      animation: 'animate-fog-3',
      bgImage: "bg-[url('/fog2.png')]",
    },
  ];

  return (
    <>
      {fogLayers.map(({ animation, bgImage }, index) => {
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: never change
          <div key={index} className={`absolute h-full w-2/1 ${animation}`}>
            {Array(2)
              .fill(null)
              .map((_, index) => (
                <div
                  key={index}
                  className={`float-left size-full bg-center bg-cover bg-transparent bg-no-repeat md:w-1/2 ${bgImage}`}
                ></div>
              ))}
          </div>
        );
      })}
    </>
  );
}
