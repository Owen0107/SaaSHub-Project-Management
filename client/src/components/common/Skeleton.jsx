const Skeleton = ({ variant = 'text', width, height, count = 1, style = {} }) => {
  const getClassName = () => {
    switch (variant) {
      case 'title': return 'skeleton skeleton-title';
      case 'card': return 'skeleton skeleton-card';
      case 'avatar': return 'skeleton skeleton-avatar';
      case 'stat': return 'skeleton skeleton-stat';
      default: return 'skeleton skeleton-text';
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={getClassName()}
          style={{ width, height, ...style }}
        />
      ))}
    </>
  );
};

export default Skeleton;
