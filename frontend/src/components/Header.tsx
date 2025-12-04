type HeaderProps = {
  imageUrl: string;
  imageAlt: string;
  title: string;
};

export default function Header({ imageUrl, imageAlt, title }: HeaderProps) {
  return (
    <header className="relative flex w-full place-content-center items-center justify-center">
      <img
        src={imageUrl}
        alt={imageAlt}
        className="mask-b-from-75% mask-b-to-100% h-[45vh] w-full object-cover lg:h-[55vh]"
      />
      <h1 className='absolute translate-y-1/3 font-medium font-title text-8xl text-background text-shadow-blue-300/70 text-shadow-md tracking-wide transition-all md:scale-100 lg:scale-200'>
        {title}
      </h1>
    </header>
  );
}
