import React from 'react';
import type { LogoObject } from '@/types';

interface PrintableQuoteProps {
  productImages: string[];
  logos: LogoObject[];
  activeImageIndex: number;
  quantities: Record<string, number>;
  isUnsureAboutSizes: boolean;
  totalPrice: number;
  totalQty: number;
  hasBasePrice: boolean;
  imageDimensions: Record<number, { width: number; height: number }>;
  canvasRenderedDimensions: Record<number, { width: number; height: number }>;
}

const s: Record<string, React.CSSProperties> = {
  root: {
    backgroundColor: '#ffffff',
    width: '210mm',
    minHeight: '297mm',
    padding: '15mm',
    color: '#0f172a',
    position: 'relative',
    fontFamily: "'Inter', system-ui, sans-serif",
    boxSizing: 'border-box',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '2px solid #0f172a',
    paddingBottom: '24px',
    marginBottom: '32px',
  },
  title: {
    fontSize: '30px',
    lineHeight: '36px',
    fontWeight: 'bold',
    letterSpacing: '-0.025em',
    color: '#0f172a',
    margin: 0,
  },
  subtitle: {
    color: '#64748b',
    fontWeight: 500,
    marginTop: '4px',
    marginBottom: 0,
  },
  datumLabel: {
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: 'bold',
    color: '#94a3b8',
    margin: 0,
  },
  datumValue: {
    fontSize: '18px',
    lineHeight: '28px',
    fontWeight: 'bold',
    margin: 0,
  },
  sectionHeading: {
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: 'bold',
    color: '#64748b',
    marginBottom: '16px',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '8px',
    marginTop: 0,
  },
  grid2Col: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '32px',
  },
  viewCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    pageBreakInside: 'avoid',
  },
  viewLabel: {
    fontSize: '12px',
    lineHeight: '16px',
    fontWeight: 'bold',
    color: '#94a3b8',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
    display: 'block',
    objectFit: 'contain',
  },
  logoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  logoBadge: {
    position: 'absolute',
    top: '-16px',
    left: 0,
    backgroundColor: '#ffffff',
    border: '1px solid #0f172a',
    color: '#0f172a',
    fontSize: '10px',
    lineHeight: 1,
    fontWeight: 'bold',
    paddingLeft: '6px',
    paddingRight: '6px',
    paddingTop: '2px',
    paddingBottom: '2px',
    borderRadius: '4px',
    boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    whiteSpace: 'nowrap',
    zIndex: 50,
  },
  detailsCard: {
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    padding: '24px',
    border: '1px solid #e2e8f0',
  },
  subHeading: {
    fontSize: '12px',
    lineHeight: '16px',
    fontWeight: 'bold',
    color: '#94a3b8',
    marginBottom: '8px',
    marginTop: 0,
  },
  monoText: {
    fontFamily: "'Courier New', Courier, monospace",
    color: '#334155',
    margin: 0,
  },
  list: {
    fontFamily: "'Courier New', Courier, monospace",
    fontSize: '14px',
    lineHeight: '20px',
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  totalSection: {
    marginTop: 'auto',
    borderTop: '2px solid #0f172a',
    paddingTop: '24px',
    pageBreakInside: 'avoid',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    lineHeight: '20px',
  },
  totalPriceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: '8px',
    borderTop: '1px solid #e2e8f0',
  },
  totalPriceValue: {
    fontSize: '24px',
    lineHeight: '32px',
    fontWeight: 'bold',
    color: '#059669',
  },
  priceOnRequest: {
    textAlign: 'right',
    fontSize: '14px',
    lineHeight: '20px',
    color: '#64748b',
    fontStyle: 'italic',
    marginTop: '8px',
  },
  footer: {
    marginTop: '32px',
    fontSize: '10px',
    color: '#94a3b8',
    textAlign: 'center',
    letterSpacing: '0.05em',
  },
};

export const PrintableQuote: React.FC<PrintableQuoteProps> = ({
  productImages,
  logos,
  activeImageIndex,
  quantities,
  isUnsureAboutSizes,
  totalPrice,
  totalQty,
  hasBasePrice,
  imageDimensions,
  canvasRenderedDimensions,
}) => {
  const dateStr = new Date().toLocaleDateString('de-DE', { year: 'numeric', month: '2-digit', day: '2-digit' });
  const viewsWithLogosIndices = Array.from(new Set(logos.map(l => l.viewIndex))).sort();
  const viewsToShow = viewsWithLogosIndices.length > 0 ? viewsWithLogosIndices : [activeImageIndex];

  const listItem = (isLast: boolean): React.CSSProperties => ({
    display: 'flex',
    justifyContent: 'space-between',
    borderBottom: isLast ? 'none' : '1px solid #e2e8f0',
    paddingTop: '4px',
    paddingBottom: '4px',
  });

  return (
    <div id="printable-content" style={s.root}>
      {/* Header */}
      <div style={s.headerRow}>
        <div>
          <h1 style={s.title}>KONFIGURATION</h1>
          <p style={s.subtitle}>Veredelungs-Zusammenfassung</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={s.datumLabel}>DATUM</p>
          <p style={s.datumValue}>{dateStr}</p>
        </div>
      </div>

      {/* Product & Visuals Grid */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={s.sectionHeading}>VISUELLE VORSCHAU</h3>
        <div style={s.grid2Col}>
          {viewsToShow.map(viewIdx => {
            const viewLogos = logos.filter(l => l.viewIndex === viewIdx);
            const viewImage = productImages[viewIdx];
            const dims = imageDimensions[viewIdx] || { width: 1000, height: 1000 };
            const canvasDims = canvasRenderedDimensions[viewIdx] || dims;
            const aspectRatio = dims.width / dims.height;

            return (
              <div key={viewIdx} style={s.viewCard}>
                <span style={s.viewLabel}>ANSICHT {viewIdx + 1}</span>
                <div style={{ ...s.imageContainer, aspectRatio: `${aspectRatio}` }}>
                  <img src={viewImage} style={s.productImage} alt="Preview" />
                  <div style={s.logoOverlay}>
                    {viewLogos.map(logo => (
                      <div
                        key={logo.id + 'print'}
                        style={{
                          left: `${logo.x}%`,
                          top: `${logo.y}%`,
                          transform: `rotate(${logo.rotation}deg)`,
                          width: `${(150 * logo.scale / canvasDims.width) * 100}%`,
                          aspectRatio: '1/1',
                          position: 'absolute',
                          zIndex: 10,
                        }}
                      >
                        <img src={logo.url} style={s.logoImage} alt="logo" />
                        <div style={s.logoBadge}>
                          {logo.refinement}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Details Table */}
      <div style={{ marginBottom: '32px', pageBreakInside: 'avoid' }}>
        <h3 style={s.sectionHeading}>DETAILS & MENGEN</h3>
        <div style={s.detailsCard}>
          <div style={s.grid2Col}>
            <div>
              <p style={s.subHeading}>GRÖSSENAUFTEILUNG</p>
              {isUnsureAboutSizes ? (
                <p style={s.monoText}>Größen noch unklar / gemischt</p>
              ) : (
                <ul style={s.list}>
                  {(() => {
                    const entries = Object.entries(quantities).filter(([, q]) => q > 0);
                    if (entries.length === 0) return <li>Keine Mengen gewählt</li>;
                    return entries.map(([size, qty], idx) => (
                      <li key={size} style={listItem(idx === entries.length - 1)}>
                        <span>{size}</span>
                        <span style={{ fontWeight: 'bold' }}>{qty}</span>
                      </li>
                    ));
                  })()}
                </ul>
              )}
            </div>
            <div>
              <p style={s.subHeading}>VEREDELUNGEN</p>
              <ul style={s.list}>
                {logos.length === 0
                  ? <li>Keine Logos platziert</li>
                  : logos.map((logo, idx) => (
                      <li key={logo.id} style={listItem(idx === logos.length - 1)}>
                        <span>Logo {idx + 1} (Ansicht {logo.viewIndex + 1})</span>
                        <span style={{ fontWeight: 'bold' }}>{logo.refinement}</span>
                      </li>
                    ))
                }
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Total Section */}
      <div style={s.totalSection}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '50%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={s.totalRow}>
              <span style={{ color: '#475569' }}>Gesamtmenge Artikel</span>
              <span style={{ fontWeight: 'bold' }}>{totalQty} Stk.</span>
            </div>
            {hasBasePrice && (
              <div style={s.totalPriceRow}>
                <span style={{ color: '#0f172a', fontWeight: 'bold' }}>Geschätzter Gesamtpreis</span>
                <span style={s.totalPriceValue}>
                  {totalPrice.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                </span>
              </div>
            )}
            {!hasBasePrice && (
              <div style={s.priceOnRequest}>
                Preis auf Anfrage
              </div>
            )}
          </div>
        </div>
        <div style={s.footer}>
          DIESES DOKUMENT WURDE AUTOMATISCH GENERIERT. ALLE PREISE SIND UNVERBINDLICHE SCHÄTZUNGEN ZZGL. MWST.
        </div>
      </div>
    </div>
  );
};
