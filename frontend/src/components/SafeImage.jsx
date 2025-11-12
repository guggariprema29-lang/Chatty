import { useState } from "react";

const SafeImage = ({ src, alt, className, ...props }) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleError = () => {
    setError(true);
    setLoading(false);
  };

  const handleLoad = () => {
    setLoading(false);
  };

  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-base-300`}>
        <span className="text-xs text-gray-500">Image unavailable</span>
      </div>
    );
  }

  return (
    <>
      {loading && (
        <div className={`${className} skeleton`}></div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${loading ? 'hidden' : ''}`}
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
        onError={handleError}
        onLoad={handleLoad}
        {...props}
      />
    </>
  );
};

export default SafeImage;
