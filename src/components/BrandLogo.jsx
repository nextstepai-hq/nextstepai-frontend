import { useState } from 'react'

const PRIMARY_LOGO = '/nextsteplogo.png'
const FALLBACK_LOGO = '/NextStep%20AI%20Growth%20Logo%20(1).png'

const BrandLogo = ({ className = '', alt = 'NextStep AI logo', ...props }) => {
  const [source, setSource] = useState(PRIMARY_LOGO)

  return (
    <img
      src={source}
      alt={alt}
      className={className}
      onError={() => setSource(FALLBACK_LOGO)}
      {...props}
    />
  )
}

export default BrandLogo
