interface LogoProps {
  variant?: 'symbol' | 'lockup';
  size?: number;
  mono?: boolean;
  titleAttr?: string;
  className?: string;
}

export function Logo({ 
  variant = 'symbol', 
  size = 32, 
  mono = false, 
  titleAttr = 'Srangam',
  className = ''
}: LogoProps) {
  const getSvgPath = () => {
    if (variant === 'lockup') {
      return '/brand/srangam_logo_horizontal.svg';
    }
    // Use full mark for larger sizes, simple mark for smaller
    return size >= 80 ? '/brand/srangam_mark.svg' : '/brand/srangam_mark_simple.svg';
  };

  const logoStyle = mono ? { filter: 'currentColor' } : {};

  return (
    <img
      src={getSvgPath()}
      alt="Srangam"
      title={titleAttr}
      width={variant === 'lockup' ? size * 3 : size}
      height={size}
      style={logoStyle}
      className={`${mono ? 'opacity-75' : ''} ${className}`}
      loading="eager"
    />
  );
}