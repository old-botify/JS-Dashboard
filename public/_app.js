import '../styles/index.css'
import 'rc-slider/assets/index.css'

function MyApp({ Component, pageProps }) {
  return (
    <div className="font-sans">
      <Component {...pageProps} />
    </div>
  )
}

export default MyApp