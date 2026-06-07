const Container = ({
  children,
  className = "",
  size = "default",
}) => {
  const sizes = {
    narrow: "max-w-5xl",
    default: "max-w-7xl",
    wide: "max-w-[1440px]",
  };

  return (
    <div
      className={`
        mx-auto
        w-full
        px-4
        sm:px-6
        lg:px-8
        ${sizes[size]}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Container;