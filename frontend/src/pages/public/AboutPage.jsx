/**
 * PUBLIC — SMALL REACT CONNECTOR
 * HTML: src/html/about-page.html
 * CSS:  src/index.css
 * JS:   src/js/aboutPage.js
 */
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { SRI_LANKA_IMAGES } from '../../data/sriLankaImages';

const photos = [
  { src: SRI_LANKA_IMAGES.sigiriya, label: 'Sigiriya' },
  { src: SRI_LANKA_IMAGES.nineArchBridge, label: 'Ella' },
  { src: SRI_LANKA_IMAGES.mirissaBeach, label: 'Mirissa' },
  { src: SRI_LANKA_IMAGES.kandyTemple, label: 'Kandy' },
];

const AboutPage = () => (
  <div className="min-h-screen bg-white">
    <Navbar />

    <section className="relative pt-16">
      <img
        src={SRI_LANKA_IMAGES.hero}
        alt="Sri Lanka"
        className="w-full h-56 sm:h-72 object-cover"
      />
      <div className="absolute inset-0 top-16 bg-black/40 flex items-center justify-center">
        <h1 className="font-display font-bold text-3xl md:text-4xl text-white">About Us</h1>
      </div>
    </section>

    <section className="max-w-3xl mx-auto px-4 py-12 text-center">
      <p className="text-gray-600 text-lg leading-relaxed">
        <strong className="text-gray-900">Smart Travel</strong> helps{' '}
        <strong>locals and visitors</strong> plan trips across Sri Lanka — weekend getaways,
        family holidays, or exploring places you have never been before.
      </p>
      <p className="text-gray-600 mt-4 leading-relaxed">
        Book destinations and activities in rupees, check weather before you travel,
        and get support from our team every step of the way.
      </p>
    </section>

    <section className="max-w-5xl mx-auto px-4 pb-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {photos.map((p) => (
          <div key={p.label} className="relative rounded-xl overflow-hidden aspect-[4/3]">
            <img src={p.src} alt={p.label} className="w-full h-full object-cover" />
            <span className="absolute bottom-2 left-2 text-white text-sm font-semibold drop-shadow">
              {p.label}
            </span>
          </div>
        ))}
      </div>
    </section>

    <section className="about-cta-section bg-primary-50 py-10">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <p className="text-gray-700 mb-6">Ready to plan your next trip?</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/destinations" className="explore-destinations-btn px-6">Explore Destinations</Link>
          <Link to="/register" className="sign-up-free-btn px-6">Sign Up Free</Link>
        </div>
      </div>
    </section>

    <Footer />
  </div>
);

export default AboutPage;
