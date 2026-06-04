import React from "react";

export default function App() {
  /*
    IMAGE NOTE:
    This uses a working remote placeholder so the site will deploy immediately.
    Later, replace this URL with your sharpened living-room product image URL.
  */
  const heroImageUrl =
    "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=90";

  return (
    <div className="page">
      <style>{`
        :root {
          --cream: #f7f1e8;
          --warm-cream: #efe3d2;
          --ink: #1f1a17;
          --muted: #6f6258;
          --maple: #b88957;
          --maple-dark: #8f6238;
          --white: #ffffff;
          --soft-shadow: 0 24px 70px rgba(31, 26, 23, 0.16);
          --button-shadow: 0 12px 30px rgba(31, 26, 23, 0.22);
        }

        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          font-family: Inter, Arial, sans-serif;
          background: var(--cream);
          color: var(--ink);
        }

        .page {
          min-height: 100vh;
          background: var(--cream);
          color: var(--ink);
          overflow-x: hidden;
        }

        .page a {
          color: inherit;
          text-decoration: none;
        }

        .site-header {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 100;
          padding: 22px 7%;
          background: rgba(247, 241, 232, 0.86);
          backdrop-filter: blur(18px);
          border-bottom: 1px solid rgba(31, 26, 23, 0.06);
        }

        .nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 28px;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 800;
          letter-spacing: -0.04em;
          font-size: 22px;
        }

        .logo-mark {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: var(--ink);
          color: var(--cream);
          display: grid;
          place-items: center;
          font-size: 14px;
          font-weight: 800;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 28px;
          font-size: 15px;
          color: var(--muted);
          font-weight: 600;
        }

        .nav-links a {
          transition: color 0.2s ease;
        }

        .nav-links a:hover {
          color: var(--ink);
        }

        .nav-cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 42px;
          padding: 0 18px;
          border-radius: 999px;
          background: var(--ink);
          color: var(--white) !important;
          font-size: 14px;
          font-weight: 700;
          box-shadow: 0 10px 24px rgba(31, 26, 23, 0.18);
        }

        .hero {
          position: relative;
          min-height: 100vh;
          display: grid;
          grid-template-columns: 0.95fr 1.05fr;
          align-items: center;
          gap: 52px;
          padding: 150px 7% 90px;
          background:
            radial-gradient(circle at 18% 20%, rgba(184, 137, 87, 0.16), transparent 34%),
            linear-gradient(135deg, #f8f1e7 0%, #efe1cf 100%);
          overflow: hidden;
        }

        .hero::after {
          content: "";
          position: absolute;
          right: -180px;
          bottom: -180px;
          width: 560px;
          height: 560px;
          border-radius: 50%;
          background: rgba(184, 137, 87, 0.18);
          filter: blur(8px);
          z-index: 0;
        }

        .hero-content {
          position: relative;
          z-index: 20;
          max-width: 650px;
        }

        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin: 0 0 22px;
          color: var(--maple-dark);
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.13em;
          text-transform: uppercase;
        }

        .eyebrow::before {
          content: "";
          width: 38px;
          height: 1px;
          background: var(--maple-dark);
        }

        .hero h1 {
          margin: 0 0 26px;
          font-size: clamp(46px, 6.4vw, 88px);
          line-height: 0.93;
          letter-spacing: -0.075em;
          color: var(--ink);
        }

        .hero h1 span {
          color: var(--maple-dark);
        }

        .hero-subtext {
          max-width: 560px;
          margin: 0 0 36px;
          color: var(--muted);
          font-size: clamp(18px, 1.45vw, 21px);
          line-height: 1.65;
        }

        .hero-buttons {
          position: relative;
          z-index: 50;
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          align-items: center;
          margin-bottom: 34px;
        }

        .btn {
          position: relative;
          z-index: 60;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 54px;
          padding: 0 28px;
          border-radius: 999px;
          font-size: 16px;
          font-weight: 800;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
          border: none;
          white-space: nowrap;
        }

        .btn:hover {
          transform: translateY(-2px);
        }

        .btn-primary {
          background: var(--ink);
          color: var(--white) !important;
          box-shadow: var(--button-shadow);
        }

        .btn-primary:hover {
          background: #080706;
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.74);
          color: var(--ink) !important;
          border: 1px solid rgba(31, 26, 23, 0.12);
          box-shadow: 0 10px 26px rgba(31, 26, 23, 0.07);
        }

        .trust-row {
          display: flex;
          gap: 22px;
          flex-wrap: wrap;
          color: var(--muted);
          font-size: 14px;
          font-weight: 650;
        }

        .trust-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--maple-dark);
          flex: 0 0 auto;
        }

        .hero-visual {
          position: relative;
          z-index: 10;
          width: 100%;
          pointer-events: none;
        }

        .image-card {
          position: relative;
          width: min(100%, 760px);
          margin-left: auto;
          border-radius: 34px;
          overflow: hidden;
          box-shadow: var(--soft-shadow);
          background: var(--warm-cream);
          pointer-events: none;
        }

        .image-card img {
          display: block;
          width: 100%;
          aspect-ratio: 4 / 3;
          object-fit: cover;
          transform: translateZ(0);
          image-rendering: auto;
          filter: contrast(1.06) saturate(1.04);
          pointer-events: none;
          user-select: none;
        }

        .floating-note {
          position: absolute;
          left: -34px;
          bottom: 48px;
          width: 230px;
          padding: 18px 18px 16px;
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.88);
          backdrop-filter: blur(14px);
          box-shadow: 0 18px 45px rgba(31, 26, 23, 0.14);
          pointer-events: none;
        }

        .floating-note strong {
          display: block;
          margin-bottom: 5px;
          font-size: 15px;
        }

        .floating-note p {
          margin: 0;
          color: var(--muted);
          font-size: 13px;
          line-height: 1.45;
        }

        .section {
          padding: 96px 7%;
        }

        .section-header {
          max-width: 720px;
          margin-bottom: 44px;
        }

        .section-kicker {
          margin: 0 0 12px;
          color: var(--maple-dark);
          font-size: 13px;
          font-weight: 850;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .section h2 {
          font-size: clamp(36px, 4.5vw, 62px);
          line-height: 1;
          letter-spacing: -0.06em;
          margin: 0 0 18px;
        }

        .section-header p {
          color: var(--muted);
          font-size: 18px;
          line-height: 1.65;
          margin: 0;
        }

        .collections {
          background: var(--cream);
        }

        .collection-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 22px;
        }

        .collection-card {
          background: rgba(255, 255, 255, 0.62);
          border: 1px solid rgba(31, 26, 23, 0.08);
          border-radius: 28px;
          padding: 26px;
          min-height: 260px;
          box-shadow: 0 15px 42px rgba(31, 26, 23, 0.06);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          display: block;
        }

        .collection-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 24px 60px rgba(31, 26, 23, 0.11);
        }

        .collection-icon {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: var(--warm-cream);
          display: grid;
          place-items: center;
          margin-bottom: 22px;
          color: var(--maple-dark);
          font-weight: 900;
        }

        .collection-card h3 {
          font-size: 24px;
          letter-spacing: -0.035em;
          margin: 0 0 12px;
        }

        .collection-card p {
          color: var(--muted);
          font-size: 15px;
          line-height: 1.65;
          margin: 0 0 20px;
        }

        .card-link {
          font-weight: 850;
          color: var(--ink);
        }

        .how-it-works {
          background: #fffaf2;
        }

        .steps {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
        }

        .step {
          position: relative;
          padding: 28px 24px;
          border-radius: 26px;
          background: var(--white);
          border: 1px solid rgba(31, 26, 23, 0.08);
          box-shadow: 0 15px 42px rgba(31, 26, 23, 0.055);
        }

        .step-number {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: var(--ink);
          color: var(--white);
          font-weight: 900;
          margin-bottom: 18px;
        }

        .step h3 {
          font-size: 20px;
          margin: 0 0 10px;
          letter-spacing: -0.035em;
        }

        .step p {
          color: var(--muted);
          font-size: 15px;
          line-height: 1.6;
          margin: 0;
        }

        .quality-section {
          background: var(--cream);
        }

        .feature-band {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 44px;
          align-items: center;
          background: var(--ink);
          color: var(--white);
          border-radius: 38px;
          padding: 54px;
          overflow: hidden;
        }

        .feature-band h2 {
          color: var(--white);
        }

        .feature-band p {
          color: rgba(255, 255, 255, 0.72);
          font-size: 18px;
          line-height: 1.7;
          margin: 0;
        }

        .feature-list {
          display: grid;
          gap: 16px;
        }

        .feature-pill {
          padding: 18px 20px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.1);
          font-weight: 750;
        }

        .final-cta {
          text-align: center;
          background:
            radial-gradient(circle at 50% 0%, rgba(184, 137, 87, 0.18), transparent 38%),
            var(--cream);
        }

        .final-cta .section-header {
          margin-left: auto;
          margin-right: auto;
        }

        .final-cta .hero-buttons {
          justify-content: center;
          margin-bottom: 0;
        }

        .site-footer {
          padding: 34px 7%;
          background: var(--ink);
          color: rgba(255, 255, 255, 0.68);
          display: flex;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
          font-size: 14px;
        }

        .site-footer strong {
          color: var(--white);
        }

        @media (max-width: 1050px) {
          .hero {
            grid-template-columns: 1fr;
            padding-top: 135px;
          }

          .hero-content {
            max-width: 760px;
          }

          .hero-visual {
            max-width: 760px;
          }

          .image-card {
            margin-left: 0;
          }

          .floating-note {
            left: 22px;
          }

          .collection-grid,
          .steps,
          .feature-band {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 760px) {
          .site-header {
            padding: 18px 5%;
          }

          .nav-links {
            display: none;
          }

          .hero {
            padding: 125px 5% 70px;
            gap: 38px;
          }

          .hero h1 {
            font-size: clamp(42px, 13vw, 66px);
          }

          .hero-buttons {
            flex-direction: column;
            align-items: stretch;
          }

          .btn {
            width: 100%;
          }

          .trust-row {
            gap: 14px;
          }

          .image-card {
            border-radius: 24px;
          }

          .floating-note {
            display: none;
          }

          .section {
            padding: 74px 5%;
          }

          .collection-grid,
          .steps,
          .feature-band {
            grid-template-columns: 1fr;
          }

          .feature-band {
            padding: 34px 24px;
            border-radius: 28px;
          }

          .site-footer {
            padding: 28px 5%;
          }
        }
      `}</style>

      <header className="site-header">
        <nav className="nav">
          <a href="#" className="logo" aria-label="Milestone Art Studio homepage">
            <span className="logo-mark">M</span>
            <span>Milestone Art Studio</span>
          </a>

          <div className="nav-links">
            <a href="#collections">Collections</a>
            <a href="#how">How It Works</a>
            <a href="#quality">Quality</a>
            <a href="#start" className="nav-cta">
              Start Creating
            </a>
          </div>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="hero-content">
            <p className="eyebrow">Custom milestone artwork</p>

            <h1>
              Turn life’s biggest numbers into{" "}
              <span>timeless wall art.</span>
            </h1>

            <p className="hero-subtext">
              Create personalized artwork from the dates, places, names, and
              milestones that shaped your story. Designed for homes, families,
              anniversaries, weddings, new babies, and unforgettable chapters.
            </p>

            <div className="hero-buttons">
              <a href="#start" className="btn btn-primary">
                Create Your Artwork
              </a>
              <a href="#collections" className="btn btn-secondary">
                View Collections
              </a>
            </div>

            <div className="trust-row">
              <div className="trust-item">
                <span className="dot" />
                <span>Personalized preview</span>
              </div>

              <div className="trust-item">
                <span className="dot" />
                <span>Premium maple framing</span>
              </div>

              <div className="trust-item">
                <span className="dot" />
                <span>Made to order</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="image-card">
              <img
                src={heroImageUrl}
                alt="Custom number-based milestone artwork in a maple shadow box frame displayed in a living room"
              />
            </div>

            <div className="floating-note">
              <strong>Your story, numbered.</strong>
              <p>
                Dates, milestones, places, and memories arranged into clean,
                gallery-worthy artwork.
              </p>
            </div>
          </div>
        </section>

        <section className="section collections" id="collections">
          <div className="section-header">
            <p className="section-kicker">Collections</p>
            <h2>Artwork for every chapter.</h2>
            <p>
              Choose a starting point, then customize the details until it feels
              unmistakably yours.
            </p>
          </div>

          <div className="collection-grid">
            <a href="#start" className="collection-card">
              <div className="collection-icon">01</div>
              <h3>Family Timeline</h3>
              <p>
                Birthdays, anniversaries, homes, moves, and meaningful dates
                arranged into one family story.
              </p>
              <span className="card-link">Create a family piece</span>
            </a>

            <a href="#start" className="collection-card">
              <div className="collection-icon">02</div>
              <h3>Wedding & Anniversary</h3>
              <p>
                Celebrate the date everything changed with elegant number-based
                artwork made for gifting.
              </p>
              <span className="card-link">Design an anniversary piece</span>
            </a>

            <a href="#start" className="collection-card">
              <div className="collection-icon">03</div>
              <h3>New Baby</h3>
              <p>
                Name, birth date, time, weight, location, and first little
                details turned into modern nursery art.
              </p>
              <span className="card-link">Create a baby piece</span>
            </a>
          </div>
        </section>

        <section className="section how-it-works" id="how">
          <div className="section-header">
            <p className="section-kicker">How it works</p>
            <h2>Simple to create. Hard to forget.</h2>
            <p>
              Build your piece step by step, preview the design, then order it
              as a finished artwork.
            </p>
          </div>

          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Pick a collection</h3>
              <p>
                Start with a family, wedding, baby, home, or milestone layout.
              </p>
            </div>

            <div className="step">
              <div className="step-number">2</div>
              <h3>Add your details</h3>
              <p>
                Enter the dates, names, places, and milestones that matter most.
              </p>
            </div>

            <div className="step">
              <div className="step-number">3</div>
              <h3>Preview the artwork</h3>
              <p>
                See the design take shape before ordering. Tiny number sorcery,
                no wand required.
              </p>
            </div>

            <div className="step">
              <div className="step-number">4</div>
              <h3>Order your piece</h3>
              <p>
                Receive a polished, made-to-order artwork ready for display or
                gifting.
              </p>
            </div>
          </div>
        </section>

        <section className="section quality-section" id="quality">
          <div className="feature-band">
            <div>
              <p className="section-kicker">Premium finish</p>
              <h2>Designed to feel personal, not homemade.</h2>
              <p>
                Each piece is created with clean typography, balanced spacing,
                and a gallery-style presentation that fits beautifully into a
                real home.
              </p>
            </div>

            <div className="feature-list">
              <div className="feature-pill">Fine art paper presentation</div>
              <div className="feature-pill">Maple shadow box frame option</div>
              <div className="feature-pill">
                Modern layouts built from real milestones
              </div>
              <div className="feature-pill">
                A meaningful gift without the generic gift-shop fog
              </div>
            </div>
          </div>
        </section>

        <section className="section final-cta" id="start">
          <div className="section-header">
            <p className="section-kicker">Start creating</p>
            <h2>Your dates already mean something. Make them visible.</h2>
            <p>
              Build a custom number-based artwork from the milestones that
              shaped your family, home, relationship, or next big chapter.
            </p>
          </div>

          <div className="hero-buttons">
            <a href="#start" className="btn btn-primary">
              Create Your Artwork
            </a>
            <a href="#collections" className="btn btn-secondary">
              Browse Collections
            </a>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div>
          <strong>Milestone Art Studio</strong> Custom milestone artwork
        </div>
        <div>Made for the dates worth keeping.</div>
      </footer>
    </div>
  );
}
