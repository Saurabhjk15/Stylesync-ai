import { useParams, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { motion } from 'framer-motion';

/* ─────────────────────────────────────────────────────────
   Article Data — 4 full editorial articles
───────────────────────────────────────────────────────── */
const ARTICLES = {
    'evolution-smart-fabrics': {
        category: 'Technology',
        title: 'The Evolution of Smart Fabrics',
        subtitle: 'How nanotechnology and haute couture are rewriting the definition of our second skin.',
        author: 'Elena Vance',
        date: 'October 24, 2025',
        readTime: '12 Min Read',
        heroImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDAxm72_13ctr3flTpgerlUULsUNIKqll1UCL5xFuGiopq2mVf3cPtGT8P7zAP51HvM9XIpIe-xv7lhNhJ4EjaxZm7Fq-y6vjcyDhYa1GxWGkHsO7LiCybFUB_gOfEPvn2TBHXC2AmAhDFyPoa3nalHL3Xl3k8wZx6A32zFk8rJCg-ZZtgGv2L4SAfxSOWKjm976wgMX8aCtevGISAGy6An6uC0YjQlo-ptU5_rPWCI8C4jy_tyDix84Wu8czn0Cmfqg9_EQLHjJ0M3',
        content: [
            { type: 'paragraph', dropCap: true, text: 'Innovation in textiles has transcended mere aesthetics. We are entering an era where the fibers we wear are as computationally capable as the devices we carry. The fusion of nanotechnology and haute couture is not just a trend — it is the fundamental redefinition of our second skin.' },
            { type: 'paragraph', text: 'StyleSync AI has tracked a 140% increase in the integration of conductive silver yarns within luxury knitwear over the past quarter. These are not the rigid wearable tech prototypes of a decade ago. Today\'s smart fabrics possess the drape of silk and the breathability of linen, while silently monitoring biometric data and responding to ambient environmental shifts.' },
            { type: 'heading', text: 'Computational Couture' },
            { type: 'paragraph', text: 'Consider the "Liquid Light" series debuting in upcoming Spring/Summer collections. Utilizing photo-reactive polymers, these garments shift opacity and color intensity based on the wearer\'s heart rate — a visual symphony of biological feedback and artistic expression.' },
            { type: 'quote', text: '"The fabric of the future doesn\'t just cover the body; it understands it."' },
            { type: 'image', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTstN1WPxrN9uq8CJoMfJiY-p-Lib-oKefd4MgUhpao5LqDnzlk6Dr8ZboMfWsSsWJiB5K0J4KS_0o8hkAhkTGVNLgaS4JcNBlTJCrOvJhDqj-ma4ld7GT95UufYZdNbhchHj0QSsBmjXtH8eMJEdgwcdRKYQNyx7AtKfaqRI1kGaLf4wVbXQOP4YSxY4qhaQY2qReMalHDpkERAGyN0cGkAlasI90jOecInTZ-HsruE9n_dqf3DKBxJK9x4SLIw8K9swNoiQQXT0F', alt: 'Structured metallic fiber detail' },
            { type: 'heading', text: 'Thermal Intelligence' },
            { type: 'paragraph', text: 'Beyond the visual, the thermal properties of these textiles are revolutionary. Phase-change materials (PCMs) embedded within the micro-structure of the weave can absorb, store, and release heat, maintaining a constant micro-climate against the skin regardless of external temperature fluctuations. Elite athletics brands are adopting this technology at scale, but the luxury sector is where it becomes art.' },
            { type: 'paragraph', text: 'As we look toward 2027, the focus shifts toward sustainability. Bio-digital weaving techniques are allowing us to grow smart interfaces using mycelium and lab-grown silk, ensuring that the high-tech garments of tomorrow leave no trace on the planet of today. The StyleSync AI recommendation engine already accounts for smart fabric weighting in its body-type compatibility scoring — an industry first.' },
        ],
        stats: { adoption: '82%', adoptionW: '82%', durability: '9.4/10', durabilityW: '94%', prediction: 'Smart fabrics will become the standard for 70% of luxury outerwear by 2028, per StyleSync AI forecasts.' },
        related: [
            { slug: 'bio-digital-weaving', title: 'Bio-Digital Weaving Techniques', category: 'Environment', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjb5ZfZc1DpRVRc74LCMdZsNTUJxBQVFbV1vomro4n0qDnnhB1utPZVvYP1m5afMTmLJwRva8KAeLC-XKZSuJb2QuVScTbpoDtLcEaWOStoo2DUdww5tW2wtjMciSkh00vl08WwKfqbS7l5QBAVHwomDKva3l6sg8d_ndHK0dtT9Nsx9OHwkHbRWoTE6P_5V03B-RHTAbeDymPewyPAhdzQnmjcJcwxsIYkz5oxgs8258g2MaqrP_b_JfpYPtpdxUcceiKoHJB759M' },
            { slug: 'quiet-luxury-2026', title: 'Quiet Luxury in 2026', category: 'Editorial', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5LGq8eHXpKkgI_AwOCV3G1Y5Yz90yPEjId75rzpAxD8dwEyY2ONO1veIpiSmUT1fuKl96QEKcuhHdvDZoCWnV-hV_N-S2maVxn8feNiWdw5oFCkXK3C4n-yKxG4oB9TdXyH0fa9J-S8s3JNKve6p9fnWr7v9LzqF3vv6I7J_1zFvl2KrvbNGlgjrvNUe1oSikOGebfDGBhtkou1yO1MunDtZdqseWR-dEhhzG_V3eKp4g_c0OwXtjJLNEKXozaU1UyGrIVcUNtoC1' },
        ],
    },

    'quiet-luxury-2026': {
        category: 'Editorial',
        title: 'Quiet Luxury in 2026',
        subtitle: 'In a world of constant digital noise, silence has become the new luxury.',
        author: 'Julian Thorne',
        date: 'April 02, 2026',
        readTime: '8 Min Read',
        heroImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5LGq8eHXpKkgI_AwOCV3G1Y5Yz90yPEjId75rzpAxD8dwEyY2ONO1veIpiSmUT1fuKl96QEKcuhHdvDZoCWnV-hV_N-S2maVxn8feNiWdw5oFCkXK3C4n-yKxG4oB9TdXyH0fa9J-S8s3JNKve6p9fnWr7v9LzqF3vv6I7J_1zFvl2KrvbNGlgjrvNUe1oSikOGebfDGBhtkou1yO1MunDtZdqseWR-dEhhzG_V3eKp4g_c0OwXtjJLNEKXozaU1UyGrIVcUNtoC1',
        content: [
            { type: 'paragraph', dropCap: true, text: 'In a world of constant digital noise, silence is the new luxury. The dominant trends for 2026 are moving away from logos and maximalist patterns towards impeccable tailoring and premium materials that speak entirely for themselves. The message is clear: those who truly belong, need no announcement.' },
            { type: 'paragraph', text: 'StyleSync\'s style DNA engine has seen a remarkable shift: 68% of profile archetypes now score highest on what we internally call the "Restraint Quotient" — a composite measure of garment simplicity, material quality weighting, and silhouette precision. The hourglass archetype leading this chart, followed closely by the rectangular frame.' },
            { type: 'heading', text: 'The Return of Masterful Tailoring' },
            { type: 'paragraph', text: 'We are witnessing a resurgence of bespoke tailoring with a distinctly modern interpretation. Fits are more relaxed and generous in volume, yet cut with architectural precision that commands authority without effort. The Savile Row influence is undeniable, but filtered through a contemporary ease that makes these pieces feel genuinely new.' },
            { type: 'quote', text: '"True luxury is the absence of the need to prove anything."' },
            { type: 'image', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKp8JByZlBi5B5sDl-_KKnFRkEIWwK-D8N2Ru6Hiy43TMEhZOkjCQJvsSKVNeDpe2eiWeMUOJMswx0OH5onpJswnpWpBDUVv80mBk8YGYbudi5xuG_ikHRdByTnULAYw5pvabdHpN28D9loOn7CuxsC9uRG4qWcF7TmF2ZO9O1qP4igb9gO6LCXbBZldKBghea4tm-PPF9YXSz0z8SQyljz8NSyPNdWz0UO-hAC9c35K3zTiYNELk46d0ISIUtyIJ5yZU3hjtj2U4o', alt: 'Quiet luxury seasonal wardrobe' },
            { type: 'heading', text: 'The Palette of Restraint' },
            { type: 'paragraph', text: 'The quiet luxury palette for 2026 is built on sand, stone, ivory, camel, and the deepest navy. These are colors that age with dignity. StyleSync\'s AI has mapped this shift to a 42% reduction in saturated color selections across our user base in the past six months, with a corresponding surge in "earth neutral" outfit saves.' },
            { type: 'paragraph', text: 'Cashmere, brushed wool, and heavyweight cotton poplin dominate material preferences. The hand-feel test — how a garment drapes over the wrist — is increasingly the deciding factor for our highest-engagement users. This is style at its most intimate and most considered.' },
        ],
        stats: { adoption: '65%', adoptionW: '65%', durability: '9.8/10', durabilityW: '98%', prediction: 'Minimalist aesthetics will dominate 60% of premium collections globally through 2027.' },
        related: [
            { slug: 'evolution-smart-fabrics', title: 'The Evolution of Smart Fabrics', category: 'Technology', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDAxm72_13ctr3flTpgerlUULsUNIKqll1UCL5xFuGiopq2mVf3cPtGT8P7zAP51HvM9XIpIe-xv7lhNhJ4EjaxZm7Fq-y6vjcyDhYa1GxWGkHsO7LiCybFUB_gOfEPvn2TBHXC2AmAhDFyPoa3nalHL3Xl3k8wZx6A32zFk8rJCg-ZZtgGv2L4SAfxSOWKjm976wgMX8aCtevGISAGy6An6uC0YjQlo-ptU5_rPWCI8C4jy_tyDix84Wu8czn0Cmfqg9_EQLHjJ0M3' },
            { slug: 'algorithm-derived-urbanism', title: 'Algorithm-Derived Urbanism', category: 'Street Culture', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA8JQDRiYp7MMMOXeZ-zLQYJw-OEzgTulGRb-g2Oe2SepUvZIT5SHhlZDQmbt6MTvG4Js2pmd_WeIzPZ5TbdIiV2nNzXQVFfvgSaF3UXlSir1hlO4lHAMJPPQ6veiCrnz31Cetpg37_D4It8rLgJTXGWjKtvNLv1kxdysBU_itzcc-YrGXLvOrGCkFa6Dh2Tl88yo3fhsO0KkbtLK8Gyy5tggA-7pXX-jlCIFqTadYY_DF6Gl2fFGb0KgrB1P6QTYo3kPMG6HbtIfY2' },
        ],
    },

    'bio-digital-weaving': {
        category: 'Environment',
        title: 'Bio-Digital Weaving Techniques',
        subtitle: 'Evaluating nature\'s own code to cultivate the luxury textiles of tomorrow.',
        author: 'Dr. Aris Thorne',
        date: 'Janurary 15, 2026',
        readTime: '10 Min Read',
        heroImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjb5ZfZc1DpRVRc74LCMdZsNTUJxBQVFbV1vomro4n0qDnnhB1utPZVvYP1m5afMTmLJwRva8KAeLC-XKZSuJb2QuVScTbpoDtLcEaWOStoo2DUdww5tW2wtjMciSkh00vl08WwKfqbS7l5QBAVHwomDKva3l6sg8d_ndHK0dtT9Nsx9OHwkHbRWoTE6P_5V03B-RHTAbeDymPewyPAhdzQnmjcJcwxsIYkz5oxgs8258g2MaqrP_b_JfpYPtpdxUcceiKoHJB759M',
        content: [
            { type: 'paragraph', dropCap: true, text: 'Nature has always been the ultimate designer. Now, with bio-digital interfaces, we are collaborating with biological systems to grow garments that breathe, adapt, and eventually return to the earth without a trace. This is not sustainability as compromise — it is sustainability as elevation.' },
            { type: 'paragraph', text: 'The laboratory and the atelier have merged. At the Berlin-based Bioform Institute, researchers are weaving mycelium root networks into structural textile frames that possess a tensile strength approaching that of Kevlar, yet decompose completely within 90 days of composting. The implications for fashion — and for the planet — are profound.' },
            { type: 'heading', text: 'Growing the Garment' },
            { type: 'paragraph', text: 'The process begins, as all great things do, with a seed — in this case, a bacterial cellulose culture grown in a nutrient bath shaped by a precision-milled aluminum mold. Over 14 days, the culture knits itself into a continuous, seam-free structure. The result is a garment that required no cutting, no stitching, and no synthetic bonding agents.' },
            { type: 'quote', text: '"We are not manufacturing clothes. We are cultivating them."' },
            { type: 'image', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjb5ZfZc1DpRVRc74LCMdZsNTUJxBQVFbV1vomro4n0qDnnhB1utPZVvYP1m5afMTmLJwRva8KAeLC-XKZSuJb2QuVScTbpoDtLcEaWOStoo2DUdww5tW2wtjMciSkh00vl08WwKfqbS7l5QBAVHwomDKva3l6sg8d_ndHK0dtT9Nsx9OHwkHbRWoTE6P_5V03B-RHTAbeDymPewyPAhdzQnmjcJcwxsIYkz5oxgs8258g2MaqrP_b_JfpYPtpdxUcceiKoHJB759M', alt: 'Bio-digital textile growth process' },
            { type: 'heading', text: 'The StyleSync Integration' },
            { type: 'paragraph', text: 'StyleSync\'s recommendation engine now includes a "sustainability weight" parameter in its AI scoring. When two garments score identically on body-type fit and occasion suitability, the bio-fabricated alternative is surfaced first. This seemingly small algorithmic choice has redirected over 2.1 million outfit recommendations toward sustainable alternatives in the past quarter alone.' },
            { type: 'paragraph', text: 'The challenge remains scale. Growing a single bio-woven jacket currently takes three weeks and requires laboratory conditions. But investment is accelerating. Three of the top five luxury conglomerates have acquired stakes in bio-textile startups in the past eighteen months. The inflection point is not a matter of if, but when.' },
        ],
        stats: { adoption: '15%', adoptionW: '15%', durability: '7.2/10', durabilityW: '72%', prediction: 'Bio-grown textiles will replace 30% of synthetic fibers in the luxury segment by 2030.' },
        related: [
            { slug: 'evolution-smart-fabrics', title: 'The Evolution of Smart Fabrics', category: 'Technology', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDAxm72_13ctr3flTpgerlUULsUNIKqll1UCL5xFuGiopq2mVf3cPtGT8P7zAP51HvM9XIpIe-xv7lhNhJ4EjaxZm7Fq-y6vjcyDhYa1GxWGkHsO7LiCybFUB_gOfEPvn2TBHXC2AmAhDFyPoa3nalHL3Xl3k8wZx6A32zFk8rJCg-ZZtgGv2L4SAfxSOWKjm976wgMX8aCtevGISAGy6An6uC0YjQlo-ptU5_rPWCI8C4jy_tyDix84Wu8czn0Cmfqg9_EQLHjJ0M3' },
            { slug: 'algorithm-derived-urbanism', title: 'Algorithm-Derived Urbanism', category: 'Street Culture', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA8JQDRiYp7MMMOXeZ-zLQYJw-OEzgTulGRb-g2Oe2SepUvZIT5SHhlZDQmbt6MTvG4Js2pmd_WeIzPZ5TbdIiV2nNzXQVFfvgSaF3UXlSir1hlO4lHAMJPPQ6veiCrnz31Cetpg37_D4It8rLgJTXGWjKtvNLv1kxdysBU_itzcc-YrGXLvOrGCkFa6Dh2Tl88yo3fhsO0KkbtLK8Gyy5tggA-7pXX-jlCIFqTadYY_DF6Gl2fFGb0KgrB1P6QTYo3kPMG6HbtIfY2' },
        ],
    },

    'algorithm-derived-urbanism': {
        category: 'Street Culture',
        title: 'Algorithm-Derived Urbanism',
        subtitle: 'What happens when the street becomes a dataset and style is generated by collective intelligence.',
        author: 'Marcus Chen',
        date: 'November 28, 2026',
        readTime: '9 Min Read',
        heroImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA8JQDRiYp7MMMOXeZ-zLQYJw-OEzgTulGRb-g2Oe2SepUvZIT5SHhlZDQmbt6MTvG4Js2pmd_WeIzPZ5TbdIiV2nNzXQVFfvgSaF3UXlSir1hlO4lHAMJPPQ6veiCrnz31Cetpg37_D4It8rLgJTXGWjKtvNLv1kxdysBU_itzcc-YrGXLvOrGCkFa6Dh2Tl88yo3fhsO0KkbtLK8Gyy5tggA-7pXX-jlCIFqTadYY_DF6Gl2fFGb0KgrB1P6QTYo3kPMG6HbtIfY2',
        content: [
            { type: 'paragraph', dropCap: true, text: 'The streets have always been the runway. But what happens when the runway is generated by an algorithm trained on 47 million street style images? We enter a feedback loop of creativity that accelerates trend cycles to the speed of light — and raises profound questions about authorship, identity, and the soul of style.' },
            { type: 'paragraph', text: 'StyleSync\'s trend forecasting engine processes real-time data from social imagery across 34 global cities, mapping garment co-occurrence patterns, color frequency shifts, and silhouette evolution week by week. What emerges is a living portrait of how cities dress — and how those dressing patterns ripple outward to influence global collections six months later.' },
            { type: 'heading', text: 'The Feedback Architecture' },
            { type: 'paragraph', text: 'The most fascinating discovery: algorithm-derived trends don\'t replace human creativity. They amplify it. When a previously obscure silhouette — the asymmetric hem, the deconstructed lapel — begins showing statistical momentum in Seoul or Rotterdam, our system surfaces it to StyleSync users earliest. Those early adopters become the next wave of street style data. The loop reinforces itself.' },
            { type: 'quote', text: '"Style was always collective intelligence. The algorithm just made it visible."' },
            { type: 'image', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA8JQDRiYp7MMMOXeZ-zLQYJw-OEzgTulGRb-g2Oe2SepUvZIT5SHhlZDQmbt6MTvG4Js2pmd_WeIzPZ5TbdIiV2nNzXQVFfvgSaF3UXlSir1hlO4lHAMJPPQ6veiCrnz31Cetpg37_D4It8rLgJTXGWjKtvNLv1kxdysBU_itzcc-YrGXLvOrGCkFa6Dh2Tl88yo3fhsO0KkbtLK8Gyy5tggA-7pXX-jlCIFqTadYY_DF6Gl2fFGb0KgrB1P6QTYo3kPMG6HbtIfY2', alt: 'Urban street style collective' },
            { type: 'heading', text: 'Democratization at Speed' },
            { type: 'paragraph', text: 'The speed is vertiginous. A micro-trend that emerges in Hackney on a Monday can be algorithmically identified by Wednesday, surface in StyleSync recommendations by Thursday, and be available for virtual try-on via our IDM-VTON engine by the following week. The traditional six-month fashion cycle has effectively collapsed into six days for those willing to embrace the new velocity.' },
            { type: 'paragraph', text: 'But speed without context is noise. StyleSync\'s body-type compatibility layer ensures that algorithm-derived trends are always filtered through the lens of individual proportion and personal aesthetic DNA. The algorithm finds the trend; your body scan determines whether it is yours to own. That balance — between collective intelligence and personal sovereignty — is the true future of style.' },
        ],
        stats: { adoption: '95%', adoptionW: '95%', durability: '8.5/10', durabilityW: '85%', prediction: 'AI-curated streetwear drops will outpace traditional release calendars by 400% by end of 2026.' },
        related: [
            { slug: 'quiet-luxury-2026', title: 'Quiet Luxury in 2026', category: 'Editorial', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5LGq8eHXpKkgI_AwOCV3G1Y5Yz90yPEjId75rzpAxD8dwEyY2ONO1veIpiSmUT1fuKl96QEKcuhHdvDZoCWnV-hV_N-S2maVxn8feNiWdw5oFCkXK3C4n-yKxG4oB9TdXyH0fa9J-S8s3JNKve6p9fnWr7v9LzqF3vv6I7J_1zFvl2KrvbNGlgjrvNUe1oSikOGebfDGBhtkou1yO1MunDtZdqseWR-dEhhzG_V3eKp4g_c0OwXtjJLNEKXozaU1UyGrIVcUNtoC1' },
            { slug: 'bio-digital-weaving', title: 'Bio-Digital Weaving Techniques', category: 'Environment', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjb5ZfZc1DpRVRc74LCMdZsNTUJxBQVFbV1vomro4n0qDnnhB1utPZVvYP1m5afMTmLJwRva8KAeLC-XKZSuJb2QuVScTbpoDtLcEaWOStoo2DUdww5tW2wtjMciSkh00vl08WwKfqbS7l5QBAVHwomDKva3l6sg8d_ndHK0dtT9Nsx9OHwkHbRWoTE6P_5V03B-RHTAbeDymPewyPAhdzQnmjcJcwxsIYkz5oxgs8258g2MaqrP_b_JfpYPtpdxUcceiKoHJB759M' },
        ],
    },
};

/* ─────────────────────────────────────────────────────────
   Content Block Renderer
───────────────────────────────────────────────────────── */
function ContentBlock({ block, index }) {
    switch (block.type) {
        case 'paragraph':
            return (
                <p style={{
                    fontSize: 17, lineHeight: 1.85, color: 'var(--color-muted)',
                    margin: '0 0 24px',
                    ...(block.dropCap && {
                        /* pseudo handled via className below */
                    })
                }}
                    className={block.dropCap ? 'drop-cap-para' : ''}
                >
                    {block.text}
                </p>
            );
        case 'heading':
            return (
                <h2 style={{
                    fontFamily: '"Cormorant Garamond", Georgia, serif',
                    fontSize: 'clamp(24px, 3vw, 36px)',
                    fontWeight: 400,
                    color: 'var(--color-text)',
                    margin: '48px 0 16px',
                    lineHeight: 1.2,
                }}>
                    {block.text}
                </h2>
            );
        case 'quote':
            return (
                <motion.blockquote
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    style={{
                        borderLeft: '2px solid var(--color-accent)',
                        paddingLeft: 28,
                        margin: '40px 0',
                        fontFamily: '"Cormorant Garamond", Georgia, serif',
                        fontSize: 'clamp(20px, 2.5vw, 28px)',
                        fontWeight: 300,
                        fontStyle: 'italic',
                        color: 'var(--color-text)',
                        lineHeight: 1.55,
                    }}
                >
                    {block.text}
                </motion.blockquote>
            );
        case 'image':
            return (
                <div style={{ margin: '40px 0', borderRadius: 6, overflow: 'hidden', border: '0.5px solid var(--color-border)' }}>
                    <img
                        src={block.src}
                        alt={block.alt}
                        style={{ width: '100%', height: 420, objectFit: 'cover', display: 'block', filter: 'grayscale(15%)', transition: 'filter 0.6s' }}
                        onMouseEnter={e => e.currentTarget.style.filter = 'grayscale(0%)'}
                        onMouseLeave={e => e.currentTarget.style.filter = 'grayscale(15%)'}
                    />
                </div>
            );
        default:
            return null;
    }
}

/* ─────────────────────────────────────────────────────────
   Main Component
───────────────────────────────────────────────────────── */
export default function ArticleDetail() {
    const { slug } = useParams();
    const article = ARTICLES[slug] || ARTICLES['evolution-smart-fabrics'];

    useEffect(() => { window.scrollTo(0, 0); }, [slug]);

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: '"DM Sans", sans-serif' }}>

            {/* Drop-cap CSS injected inline once */}
            <style>{`.drop-cap-para::first-letter { font-family: "Cormorant Garamond", Georgia, serif; font-size: 72px; font-weight: 400; color: var(--color-accent); float: left; line-height: 0.75; margin: 8px 12px 0 0; }`}</style>

            {/* ── HERO ── full-bleed, transparent navbar overlay */}
            <header style={{ position: 'relative', height: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'flex-end' }}>
                <img
                    src={article.heroImage}
                    alt={article.title}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(22,19,15,1) 0%, rgba(22,19,15,0.6) 50%, rgba(22,19,15,0.1) 100%)' }} />

                <div style={{ position: 'relative', width: '100%', padding: '0 64px 80px' }}>
                    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        {/* Back link */}
                        <Link to="/trends" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: '"DM Sans"', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-muted)', textDecoration: 'none', marginBottom: 28, transition: 'color 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--color-accent)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--color-muted)'}
                        >
                            <span className="material-icons" style={{ fontSize: 14 }}>arrow_back</span>
                            Back to Trends
                        </Link>

                        <span className="label-accent" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                            <span style={{ width: 24, height: '0.5px', background: 'var(--color-accent)', display: 'inline-block' }} />
                            {article.category}
                        </span>

                        <h1 style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: 'clamp(44px, 7vw, 88px)', fontWeight: 300, lineHeight: 0.95, margin: '0 0 20px', color: 'var(--color-text)', maxWidth: 900 }}>
                            {article.title}
                        </h1>

                        <p style={{ fontSize: 17, color: 'var(--color-muted)', maxWidth: 600, lineHeight: 1.65, margin: '0 0 24px' }}>
                            {article.subtitle}
                        </p>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                            <span className="label" style={{ color: 'var(--color-accent)' }}>By {article.author}</span>
                            <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--color-border-light)', display: 'inline-block' }} />
                            <span className="label">{article.date}</span>
                            <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--color-border-light)', display: 'inline-block' }} />
                            <span className="label">{article.readTime}</span>
                        </div>
                    </motion.div>
                </div>
            </header>

            {/* ── BODY ── */}
            <main style={{ padding: '80px 64px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 64, alignItems: 'flex-start' }}>

                    {/* Article content */}
                    <motion.article
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        {article.content.map((block, i) => (
                            <ContentBlock key={i} block={block} index={i} />
                        ))}
                    </motion.article>

                    {/* Sidebar */}
                    <aside style={{ position: 'sticky', top: 'calc(var(--navbar-height) + 32px)', display: 'flex', flexDirection: 'column', gap: 24 }}>

                        {/* AI Insight card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            style={{ background: 'var(--color-card)', border: '0.5px solid var(--color-border)', borderTop: '2px solid var(--color-accent)', borderRadius: 6, padding: 28 }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                                <span className="material-icons" style={{ fontSize: 18, color: 'var(--color-accent)' }}>insights</span>
                                <span className="label" style={{ color: 'var(--color-text)' }}>AI Perspective</span>
                            </div>

                            {/* Market Adoption bar */}
                            <div style={{ marginBottom: 20 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <span className="label">Market Adoption</span>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-accent)' }}>{article.stats.adoption}</span>
                                </div>
                                <div style={{ height: 2, background: 'var(--color-border)', borderRadius: 1, position: 'relative' }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: article.stats.adoptionW }}
                                        transition={{ duration: 1, delay: 0.6, ease: 'easeOut' }}
                                        style={{ position: 'absolute', inset: 0, background: 'var(--color-accent)', borderRadius: 1 }}
                                    />
                                </div>
                            </div>

                            {/* Durability bar */}
                            <div style={{ marginBottom: 24 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <span className="label">Durability Index</span>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-accent)' }}>{article.stats.durability}</span>
                                </div>
                                <div style={{ height: 2, background: 'var(--color-border)', borderRadius: 1, position: 'relative' }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: article.stats.durabilityW }}
                                        transition={{ duration: 1, delay: 0.7, ease: 'easeOut' }}
                                        style={{ position: 'absolute', inset: 0, background: 'var(--color-text)', borderRadius: 1 }}
                                    />
                                </div>
                            </div>

                            <p style={{ fontSize: 13, color: 'var(--color-muted)', lineHeight: 1.7, margin: 0, borderTop: '0.5px solid var(--color-border)', paddingTop: 16 }}>
                                {article.stats.prediction}
                            </p>
                        </motion.div>

                        {/* Related articles */}
                        {article.related.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                style={{ background: 'var(--color-card)', border: '0.5px solid var(--color-border)', borderRadius: 6, padding: 28 }}
                            >
                                <span className="label" style={{ color: 'var(--color-text)', display: 'block', marginBottom: 20 }}>Related Trends</span>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    {article.related.map(rel => (
                                        <Link key={rel.slug} to={`/trends/${rel.slug}`}
                                            style={{ display: 'flex', gap: 14, alignItems: 'center', textDecoration: 'none', transition: 'opacity 0.2s' }}
                                            onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
                                            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                                        >
                                            <div style={{ width: 72, height: 72, borderRadius: 4, overflow: 'hidden', border: '0.5px solid var(--color-border)', flexShrink: 0 }}>
                                                <img src={rel.img} alt={rel.title} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(30%)', transition: 'filter 0.3s' }}
                                                    onMouseEnter={e => e.currentTarget.style.filter = 'grayscale(0%)'}
                                                    onMouseLeave={e => e.currentTarget.style.filter = 'grayscale(30%)'}
                                                />
                                            </div>
                                            <div>
                                                <span className="label" style={{ color: 'var(--color-accent)', display: 'block', marginBottom: 4 }}>{rel.category}</span>
                                                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', margin: 0, lineHeight: 1.4 }}>{rel.title}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* CTA card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            style={{ background: 'var(--color-accent-dim)', border: '0.5px solid var(--color-accent-border)', borderRadius: 6, padding: 28, textAlign: 'center' }}
                        >
                            <span className="material-icons" style={{ fontSize: 28, color: 'var(--color-accent)', display: 'block', marginBottom: 12 }}>sensors</span>
                            <h4 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 22, fontWeight: 400, color: 'var(--color-text)', margin: '0 0 8px' }}>
                                See it on you
                            </h4>
                            <p style={{ fontSize: 13, color: 'var(--color-muted)', lineHeight: 1.65, margin: '0 0 20px' }}>
                                Run a body scan to discover which pieces from this editorial match your silhouette.
                            </p>
                            <Link to="/body-scan" className="btn btn-primary" style={{ fontSize: 11, width: '100%', justifyContent: 'center' }}>
                                Start Body Scan
                            </Link>
                        </motion.div>
                    </aside>
                </div>
            </main>

            {/* ── CTA FOOTER ── */}
            <section style={{ padding: '80px 64px', borderTop: '0.5px solid var(--color-border)', textAlign: 'center' }}>
                <span className="label-accent" style={{ display: 'block', marginBottom: 16 }}>Next</span>
                <h2 style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 300, fontStyle: 'italic', margin: '0 0 16px' }}>
                    Your perfect fit awaits
                </h2>
                <p style={{ fontSize: 15, color: 'var(--color-muted)', marginBottom: 32 }}>
                    StyleSync AI applies editorial intelligence directly to your body type.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                    <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} style={{ display: 'inline-block' }}>
                        <Link to="/body-scan" className="btn btn-primary" style={{ fontSize: 12 }}>
                            <span className="material-icons" style={{ fontSize: 16 }}>sensors</span>
                            Start Body Scan
                        </Link>
                    </motion.div>
                    <Link to="/trends" className="btn btn-ghost" style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        <span className="material-icons" style={{ fontSize: 14 }}>arrow_back</span>
                        Back to Trends
                    </Link>
                </div>
            </section>
        </div>
    );
}
